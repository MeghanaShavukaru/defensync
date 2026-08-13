import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../config/db';

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
  const { rows } = await pool.query('SELECT * FROM "EquipmentType" ORDER BY name ASC');
  res.json({ success: true, data: { equipmentTypes: rows } });
};

export const getEquipmentType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM "EquipmentType" WHERE id = $1', [id]);
  const equipmentType = rows[0];
  if (!equipmentType) return res.status(404).json({ success: false, message: 'Equipment type not found' });
  res.json({ success: true, data: { equipmentType } });
};

export const createEquipmentType = async (req: Request, res: Response) => {
  const parsed = createEquipmentTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { rows } = await pool.query(
    'INSERT INTO "EquipmentType"(name, code, category, description, "unitOfMeasure", "minimumStock", "criticalStock", "individuallyTracked", active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [parsed.data.name, parsed.data.code, parsed.data.category, parsed.data.description ?? null, parsed.data.unitOfMeasure, parsed.data.minimumStock ?? 0, parsed.data.criticalStock ?? 0, parsed.data.individuallyTracked ?? false, parsed.data.active ?? true]
  );
  const equipmentType = rows[0];
  res.status(201).json({ success: true, data: { equipmentType }, message: 'Equipment type created' });
};

export const updateEquipmentType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateEquipmentTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "EquipmentType" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const equipmentType = rows[0];
  res.json({ success: true, data: { equipmentType }, message: 'Equipment type updated' });
};

export const deleteEquipmentType = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "EquipmentType" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Equipment type deleted' });
};
