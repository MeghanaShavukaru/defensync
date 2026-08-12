import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';

const createEquipmentTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.enum(['VEHICLE', 'WEAPON', 'AMMUNITION', 'COMMUNICATION', 'MEDICAL', 'ENGINEERING', 'OTHER']),
  description: z.string().optional(),
  unitOfMeasure: z.string().min(1),
  minimumStock: z.number().int().min(0).default(0),
  criticalStock: z.number().int().min(0).default(0),
  individuallyTracked: z.boolean().default(false),
  active: z.boolean().default(true),
});

const updateEquipmentTypeSchema = createEquipmentTypeSchema.partial();

export const listEquipmentTypes = async (req: Request, res: Response) => {
  const equipmentTypes = await prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: { equipmentTypes } });
};

export const getEquipmentType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const equipmentType = await prisma.equipmentType.findUnique({ where: { id } });
  if (!equipmentType) return res.status(404).json({ success: false, message: 'Equipment type not found' });
  res.json({ success: true, data: { equipmentType } });
};

export const createEquipmentType = async (req: Request, res: Response) => {
  const parsed = createEquipmentTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const equipmentType = await prisma.equipmentType.create({ data: parsed.data });
  res.status(201).json({ success: true, data: { equipmentType }, message: 'Equipment type created' });
};

export const updateEquipmentType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateEquipmentTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const equipmentType = await prisma.equipmentType.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { equipmentType }, message: 'Equipment type updated' });
};

export const deleteEquipmentType = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.equipmentType.delete({ where: { id } });
  res.json({ success: true, message: 'Equipment type deleted' });
};
