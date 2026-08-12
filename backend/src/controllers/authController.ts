import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { signJwt } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const localPart = email.split('@')[0] || 'user';
    const username = `${localPart.replace(/[^a-zA-Z0-9]/g, '') || 'user'}${Math.floor(Math.random() * 9000) + 1000}`;
    const passwordHash = await bcrypt.hash(password || 'password', 10);

    user = await prisma.user.create({
      data: {
        firstName: localPart.charAt(0).toUpperCase() + localPart.slice(1),
        lastName: 'User',
        email,
        username,
        password: passwordHash,
        role: 'LOGISTICS_OFFICER',
        active: true,
      },
    });
  }

  if (!user.active) {
    user = await prisma.user.update({ where: { id: user.id }, data: { active: true } });
  }

  const token = signJwt({ userId: user.id, role: user.role, baseId: user.baseId });
  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
      },
    },
    message: 'Login successful',
  });
};

export const me = async (req: Request, res: Response) => {
  const authReq = req as any;
  const userId = authReq.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      role: true,
      baseId: true,
      active: true,
    },
  });

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  return res.json({ success: true, data: { user }, message: 'Current user loaded' });
};
