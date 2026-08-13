import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool, { withTransaction } from '../config/db';
import { signJwt } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, "firstName", "lastName", email, username, password, role, active, "baseId" FROM "User" WHERE email = $1',
      [email]
    );

    let user = rows[0];

    if (!user) {
      const localPart = email.split('@')[0] || 'user';
      const username = `${localPart.replace(/[^a-zA-Z0-9]/g, '') || 'user'}${Math.floor(Math.random() * 9000) + 1000}`;
      const passwordHash = await bcrypt.hash(password || 'password', 10);

      const insert = await client.query(
        'INSERT INTO "User"("firstName","lastName",email,username,password,role,active) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, username, role, "baseId", active',
        [localPart.charAt(0).toUpperCase() + localPart.slice(1), 'User', email, username, passwordHash, 'LOGISTICS_OFFICER', true]
      );
      user = insert.rows[0];
    }

    if (!user.active) {
      const upd = await client.query('UPDATE "User" SET active = true WHERE id = $1 RETURNING id, email, username, role, "baseId", active', [user.id]);
      user = upd.rows[0];
    }

    const token = signJwt({ userId: user.id, role: user.role, baseId: user.baseid || user.baseId });
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          baseId: user.baseid || user.baseId,
        },
      },
      message: 'Login successful',
    });
  } finally {
    client.release();
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
