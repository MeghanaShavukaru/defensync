import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db';

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER', 'AUDITOR']),
  active: z.boolean().default(true),
  baseId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER', 'AUDITOR']).optional(),
  active: z.boolean().optional(),
  baseId: z.string().uuid().nullable().optional(),
});

export const listUsers = async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT u.id, u."firstName", u."lastName", u.email, u.username, u.role, u.active, u."baseId", b.id AS "base_id", b.name AS "base_name" FROM "User" u LEFT JOIN "Base" b ON u."baseId" = b.id ORDER BY u."lastName" ASC'
  );

  const users = rows.map((r: any) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    username: r.username,
    role: r.role,
    active: r.active,
    base: r.base_id ? { id: r.base_id, name: r.base_name } : null,
  }));

  res.json({ success: true, data: { users } });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT u.id, u."firstName", u."lastName", u.email, u.username, u.role, u.active, u."baseId", b.id AS "base_id", b.name AS "base_name" FROM "User" u LEFT JOIN "Base" b ON u."baseId" = b.id WHERE u.id = $1',
    [id]
  );
  const r = rows[0];
  if (!r) return res.status(404).json({ success: false, message: 'User not found' });
  const user = {
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    username: r.username,
    role: r.role,
    active: r.active,
    base: r.base_id ? { id: r.base_id, name: r.base_name } : null,
  };
  res.json({ success: true, data: { user } });
};

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const { rows } = await pool.query(
    'INSERT INTO "User"("firstName","lastName",email,username,password,role,active,"baseId") VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, "firstName", "lastName", email, username, role, active, "baseId"',
    [parsed.data.firstName, parsed.data.lastName, parsed.data.email, parsed.data.username, passwordHash, parsed.data.role, parsed.data.active ?? true, parsed.data.baseId ?? null]
  );
  const user = rows[0];
  res.status(201).json({ success: true, data: { user }, message: 'User created' });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = { ...parsed.data };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  // Build dynamic SET clause
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "User" SET ${sets.join(', ')} WHERE id = $1 RETURNING id, "firstName", "lastName", email, username, role, active, "baseId"`;
  const { rows } = await pool.query(query, [id, ...values]);
  const user = rows[0];
  res.json({ success: true, data: { user }, message: 'User updated' });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "User" WHERE id = $1', [id]);
  res.json({ success: true, message: 'User deleted' });
};
