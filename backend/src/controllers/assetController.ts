import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../config/db';
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
  const params: any[] = [];
  let sql = 'SELECT a.id, a."assetCode", a."equipmentTypeId", a."baseId", a."serialNumber", a.quantity, a.available, a.assigned, a."inTransit", a.maintenance, a.status, a.condition, a."acquisitionDate", et.id AS "et_id", et.name AS "et_name", b.id AS "base_id", b.name AS "base_name" FROM "Asset" a LEFT JOIN "EquipmentType" et ON a."equipmentTypeId" = et.id LEFT JOIN "Base" b ON a."baseId" = b.id';
  if (baseId) {
    params.push(baseId);
    sql += ` WHERE a."baseId" = $${params.length}`;
  }
  sql += ' ORDER BY a."createdAt" DESC';
  const { rows } = await pool.query(sql, params);
  const assets = rows.map((r: any) => ({
    id: r.id,
    assetCode: r.assetCode,
    equipmentType: r.et_id ? { id: r.et_id, name: r.et_name } : null,
    base: r.base_id ? { id: r.base_id, name: r.base_name } : null,
    serialNumber: r.serialNumber,
    quantity: r.quantity,
    available: r.available,
    assigned: r.assigned,
    inTransit: r.inTransit,
    maintenance: r.maintenance,
    status: r.status,
    condition: r.condition,
    acquisitionDate: r.acquisitionDate,
  }));
  res.json({ success: true, data: { assets } });
};

export const getAsset = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT a.*, et.id AS "et_id", et.name AS "et_name", b.id AS "base_id", b.name AS "base_name" FROM "Asset" a LEFT JOIN "EquipmentType" et ON a."equipmentTypeId" = et.id LEFT JOIN "Base" b ON a."baseId" = b.id WHERE a.id = $1',
    [id]
  );
  const r = rows[0];
  if (!r) return res.status(404).json({ success: false, message: 'Asset not found' });
  const asset = {
    id: r.id,
    assetCode: r.assetCode,
    equipmentType: r.et_id ? { id: r.et_id, name: r.et_name } : null,
    base: r.base_id ? { id: r.base_id, name: r.base_name } : null,
    serialNumber: r.serialNumber,
    quantity: r.quantity,
    available: r.available,
    assigned: r.assigned,
    inTransit: r.inTransit,
    maintenance: r.maintenance,
    status: r.status,
    condition: r.condition,
    acquisitionDate: r.acquisitionDate,
  };
  res.json({ success: true, data: { asset } });
};

export const createAsset = async (req: AuthRequest, res: Response) => {
  const parsed = createAssetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { assetCode, equipmentTypeId, baseId, serialNumber, quantity, acquisitionDate } = parsed.data;
  const { rows } = await pool.query(
    'INSERT INTO "Asset"("assetCode","equipmentTypeId","baseId","serialNumber",quantity,available,"acquisitionDate") VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [assetCode, equipmentTypeId, baseId, serialNumber ?? null, quantity ?? 1, quantity ?? 1, acquisitionDate]
  );
  const asset = rows[0];
  res.status(201).json({ success: true, data: { asset }, message: 'Asset created' });
};

export const updateAsset = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateAssetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "Asset" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const asset = rows[0];
  res.json({ success: true, data: { asset }, message: 'Asset updated' });
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Asset" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Asset deleted' });
};

export default {};
