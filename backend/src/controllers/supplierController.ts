import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';

const createSupplierSchema = z.object({
  supplierCode: z.string().min(1),
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string().default('ACTIVE'),
  notes: z.string().optional(),
});

const updateSupplierSchema = createSupplierSchema.partial();

export const listSuppliers = async (req: Request, res: Response) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: { suppliers } });
};

export const getSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
  res.json({ success: true, data: { supplier } });
};

export const createSupplier = async (req: Request, res: Response) => {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const supplier = await prisma.supplier.create({ data: parsed.data });
  res.status(201).json({ success: true, data: { supplier }, message: 'Supplier created' });
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateSupplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const supplier = await prisma.supplier.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { supplier }, message: 'Supplier updated' });
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.supplier.delete({ where: { id } });
  res.json({ success: true, message: 'Supplier deleted' });
};
