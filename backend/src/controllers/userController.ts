import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../config/prisma';

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
  const users = await prisma.user.findMany({
    include: { base: { select: { id: true, name: true } } },
    orderBy: { lastName: 'asc' },
  });
  res.json({ success: true, data: { users } });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { base: { select: { id: true, name: true } } },
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user } });
};

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      password: passwordHash,
    },
  });

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

  const user = await prisma.user.update({ where: { id }, data });
  res.json({ success: true, data: { user }, message: 'User updated' });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted' });
};
