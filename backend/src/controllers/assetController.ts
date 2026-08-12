import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const createAssetSchema = z.object({
  assetCode: z.string().min(1),
  equipmentTypeId: z.string().uuid(),
  baseId: z.string().uuid(),
  serialNumber: z.string().optional(),
  quantity: z.number().int().min(1).optional().default(1),
  acquisitionDate: z.string().transform((s) => new Date(s)),
});

const updateAssetSchema = z.object({
  serialNumber: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  available: z.number().int().min(0).optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED']).optional(),
  condition: z.string().optional(),
});

export const listAssets = async (req: Request, res: Response) => {
  const baseId = req.query.baseId as string | undefined;
  const where = baseId ? { baseId } : {};
  const assets = await prisma.asset.findMany({
    where,
    include: { equipmentType: true, base: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: { assets } });
};

export const getAsset = async (req: Request, res: Response) => {
  const { id } = req.params;
  const asset = await prisma.asset.findUnique({ where: { id }, include: { equipmentType: true, base: true } });
  if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
  res.json({ success: true, data: { asset } });
};

export const createAsset = async (req: AuthRequest, res: Response) => {
  const parsed = createAssetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { assetCode, equipmentTypeId, baseId, serialNumber, quantity, acquisitionDate } = parsed.data;

  const asset = await prisma.asset.create({
    data: {
      assetCode,
      equipmentTypeId,
      baseId,
      serialNumber,
      quantity: quantity ?? 1,
      available: quantity ?? 1,
      acquisitionDate,
    },
  });

  res.status(201).json({ success: true, data: { asset }, message: 'Asset created' });
};

export const updateAsset = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateAssetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const asset = await prisma.asset.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { asset }, message: 'Asset updated' });
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.asset.delete({ where: { id } });
  res.json({ success: true, message: 'Asset deleted' });
};

export default {};
