import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';

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
  const bases = await prisma.base.findMany({
    include: { commander: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: { bases } });
};

export const getBase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const base = await prisma.base.findUnique({
    where: { id },
    include: { commander: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!base) return res.status(404).json({ success: false, message: 'Base not found' });
  res.json({ success: true, data: { base } });
};

export const createBase = async (req: Request, res: Response) => {
  const parsed = createBaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const base = await prisma.base.create({ data: parsed.data });
  res.status(201).json({ success: true, data: { base }, message: 'Base created' });
};

export const updateBase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateBaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const base = await prisma.base.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { base }, message: 'Base updated' });
};

export const deleteBase = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.base.delete({ where: { id } });
  res.json({ success: true, message: 'Base deleted' });
};
