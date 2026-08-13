import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../config/db';

const createBaseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  status: z.string().default('ACTIVE'),
  commanderId: z.string().uuid().optional(),
});

const updateBaseSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  commanderId: z.string().uuid().nullable().optional(),
});

export const listBases = async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT b.*, u.id AS "commander_id", u."firstName" AS "commander_firstName", u."lastName" AS "commander_lastName", u.email AS "commander_email" FROM "Base" b LEFT JOIN "User" u ON b."commanderId" = u.id ORDER BY b.name ASC'
  );
  const bases = rows.map((r: any) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    location: r.location,
    description: r.description,
    status: r.status,
    commander: r.commander_id ? { id: r.commander_id, firstName: r.commander_firstName, lastName: r.commander_lastName, email: r.commander_email } : null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  res.json({ success: true, data: { bases } });
};

export const getBase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT b.*, u.id AS "commander_id", u."firstName" AS "commander_firstName", u."lastName" AS "commander_lastName", u.email AS "commander_email" FROM "Base" b LEFT JOIN "User" u ON b."commanderId" = u.id WHERE b.id = $1',
    [id]
  );
  const r = rows[0];
  if (!r) return res.status(404).json({ success: false, message: 'Base not found' });
  const base = {
    id: r.id,
    code: r.code,
    name: r.name,
    location: r.location,
    description: r.description,
    status: r.status,
    commander: r.commander_id ? { id: r.commander_id, firstName: r.commander_firstName, lastName: r.commander_lastName, email: r.commander_email } : null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
  res.json({ success: true, data: { base } });
};

export const createBase = async (req: Request, res: Response) => {
  const parsed = createBaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { rows } = await pool.query(
    'INSERT INTO "Base"(code,name,location,description,status,"commanderId") VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [parsed.data.code, parsed.data.name, parsed.data.location, parsed.data.description ?? null, parsed.data.status ?? 'ACTIVE', parsed.data.commanderId ?? null]
  );
  const base = rows[0];
  res.status(201).json({ success: true, data: { base }, message: 'Base created' });
};

export const updateBase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateBaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "Base" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const base = rows[0];
  res.json({ success: true, data: { base }, message: 'Base updated' });
};

export const deleteBase = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Base" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Base deleted' });
};
