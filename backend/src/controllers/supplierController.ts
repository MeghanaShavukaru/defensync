import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../config/db';

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
  const { rows } = await pool.query('SELECT * FROM "Supplier" ORDER BY name ASC');
  res.json({ success: true, data: { suppliers: rows } });
};

export const getSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM "Supplier" WHERE id = $1', [id]);
  const supplier = rows[0];
  if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
  res.json({ success: true, data: { supplier } });
};

export const createSupplier = async (req: Request, res: Response) => {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { rows } = await pool.query(
    'INSERT INTO "Supplier"("supplierCode",name,"contactPerson",email,phone,address,status,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [parsed.data.supplierCode, parsed.data.name, parsed.data.contactPerson ?? null, parsed.data.email ?? null, parsed.data.phone ?? null, parsed.data.address ?? null, parsed.data.status ?? 'ACTIVE', parsed.data.notes ?? null]
  );
  const supplier = rows[0];
  res.status(201).json({ success: true, data: { supplier }, message: 'Supplier created' });
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateSupplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "Supplier" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const supplier = rows[0];
  res.json({ success: true, data: { supplier }, message: 'Supplier updated' });
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Supplier" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Supplier deleted' });
};
