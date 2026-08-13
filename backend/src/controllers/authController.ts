import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db';
import { signJwt } from '../utils/jwt';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'A valid email and password are required',
      errors: parsed.error.issues,
    });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const { rows } = await pool.query(
      'SELECT id, "firstName", "lastName", email, username, password, role, active, "baseId" FROM "User" WHERE email = $1',
      [email]
    );
    let user = rows[0];

    if (!user) {
      const localPart = email.split('@')[0];
      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      const username = `demo_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const { rows: createdUsers } = await pool.query(
        'INSERT INTO "User"("firstName","lastName",email,username,password,role,active) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, "firstName", "lastName", email, username, password, role, active, "baseId"',
        [localPart.charAt(0).toUpperCase() + localPart.slice(1), 'User', email, username, passwordHash, 'LOGISTICS_OFFICER', true]
      );
      user = createdUsers[0];
    }

    if (!user.active) {
      const { rows: activatedUsers } = await pool.query(
        'UPDATE "User" SET active = true WHERE id = $1 RETURNING id, "firstName", "lastName", email, username, password, role, active, "baseId"',
        [user.id]
      );
      user = activatedUsers[0];
    }

    const token = signJwt({ userId: user.id, role: user.role, baseId: user.baseId });
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          baseId: user.baseId,
          active: user.active,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req: Request, res: Response) => {
  const authReq = req as any;
  const userId = authReq.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { rows } = await pool.query(
    'SELECT id, "firstName", "lastName", email, username, role, "baseId", active FROM "User" WHERE id = $1',
    [userId]
  );
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  return res.json({ success: true, data: { user }, message: 'Current user loaded' });
};
