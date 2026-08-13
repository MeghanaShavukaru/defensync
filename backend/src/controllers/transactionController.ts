import { z } from 'zod';
import { Request, Response } from 'express';
import pool, { withTransaction } from '../config/db';
import { AuthRequest } from '../middleware/auth';

const createPurchaseSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  supplierId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitCost: z.number().positive(),
  purchaseDate: z.string().transform((s) => new Date(s)),
  expectedDelivery: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

const updatePurchaseSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
  expectedDelivery: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  receivedDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  notes: z.string().optional(),
});

const createTransferSchema = z.object({
  sourceBaseId: z.string().uuid(),
  destinationBaseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().min(1),
  reason: z.string().min(5),
  priority: z.string().min(1),
  notes: z.string().optional(),
});

const updateTransferSchema = z.object({
  status: z.enum(['DRAFT', 'REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED', 'CANCELLED']).optional(),
  approvedById: z.string().uuid().optional(),
  approvedAt: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  dispatchedAt: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  receivedAt: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  notes: z.string().optional(),
});

const createAssignmentSchema = z.object({
  assetId: z.string().uuid(),
  baseId: z.string().uuid(),
  quantity: z.number().int().min(1),
  assigneeName: z.string().min(1),
  unit: z.string().min(1),
  purpose: z.string().min(1),
  assignedDate: z.string().transform((s) => new Date(s)),
  expectedReturn: z.string().transform((s) => new Date(s)),
  notes: z.string().optional(),
});

const updateAssignmentSchema = z.object({
  status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST_OR_DAMAGED', 'CANCELLED']).optional(),
  actualReturn: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  notes: z.string().optional(),
});

const createExpenditureSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().min(1),
  category: z.string().min(1),
  activityReference: z.string().optional(),
  expenditureDate: z.string().transform((s) => new Date(s)),
  notes: z.string().optional(),
});

const approveExpenditureSchema = z.object({
  approvedById: z.string().uuid(),
});

const createMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  maintenanceType: z.string().min(1),
  issue: z.string().min(1),
  description: z.string().optional(),
  technician: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  expectedCompletion: z.string().transform((s) => new Date(s)),
  cost: z.number().positive().optional(),
  partsNotes: z.string().optional(),
  nextServiceDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  notes: z.string().optional(),
});

const updateMaintenanceSchema = z.object({
  status: z.enum(['SCHEDULED', 'DUE', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
  completedDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  cost: z.number().positive().optional(),
  partsNotes: z.string().optional(),
  nextServiceDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  notes: z.string().optional(),
});

const generateNumber = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const listPurchases = async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT p.*, b.name AS "base_name", et.name AS "equipmentType_name", s.name AS "supplier_name", u.username AS "createdBy_username" FROM "Purchase" p LEFT JOIN "Base" b ON p."baseId" = b.id LEFT JOIN "EquipmentType" et ON p."equipmentTypeId" = et.id LEFT JOIN "Supplier" s ON p."supplierId" = s.id LEFT JOIN "User" u ON p."createdById" = u.id ORDER BY p."createdAt" DESC'
  );
  res.json({ success: true, data: { purchases: rows } });
};

export const getPurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT p.*, b.name AS "base_name", et.name AS "equipmentType_name", s.name AS "supplier_name", u.username AS "createdBy_username" FROM "Purchase" p LEFT JOIN "Base" b ON p."baseId" = b.id LEFT JOIN "EquipmentType" et ON p."equipmentTypeId" = et.id LEFT JOIN "Supplier" s ON p."supplierId" = s.id LEFT JOIN "User" u ON p."createdById" = u.id WHERE p.id = $1',
    [id]
  );
  const purchase = rows[0];
  if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
  res.json({ success: true, data: { purchase } });
};

export const createPurchase = async (req: AuthRequest, res: Response) => {
  const parsed = createPurchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { baseId, equipmentTypeId, supplierId, quantity, unitCost, purchaseDate, expectedDelivery, referenceNumber, notes } = parsed.data;
  const result = await pool.query(
    'INSERT INTO "Purchase"("purchaseNumber","baseId","equipmentTypeId","supplierId",quantity,"unitCost","totalCost","purchaseDate","expectedDelivery","referenceNumber",notes,status,"createdById") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
    [generateNumber('PUR'), baseId, equipmentTypeId, supplierId, quantity, unitCost, quantity * unitCost, purchaseDate, expectedDelivery ?? null, referenceNumber ?? null, notes ?? null, 'PENDING_APPROVAL', req.user?.userId || '']
  );
  const purchase = result.rows[0];
  res.status(201).json({ success: true, data: { purchase }, message: 'Purchase request created' });
};

export const updatePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updatePurchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "Purchase" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const purchase = rows[0];
  res.json({ success: true, data: { purchase }, message: 'Purchase updated' });
};

export const deletePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Purchase" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Purchase deleted' });
};

export const listTransfers = async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT t.*, sb.name AS "sourceBase_name", db.name AS "destinationBase_name", et.name AS "equipmentType_name", rq.username AS "requestedBy_username", ap.username AS "approvedBy_username" FROM "Transfer" t LEFT JOIN "Base" sb ON t."sourceBaseId" = sb.id LEFT JOIN "Base" db ON t."destinationBaseId" = db.id LEFT JOIN "EquipmentType" et ON t."equipmentTypeId" = et.id LEFT JOIN "User" rq ON t."requestedById" = rq.id LEFT JOIN "User" ap ON t."approvedById" = ap.id ORDER BY t."createdAt" DESC'
  );
  res.json({ success: true, data: { transfers: rows } });
};

export const getTransfer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT t.*, sb.name AS "sourceBase_name", db.name AS "destinationBase_name", et.name AS "equipmentType_name", rq.username AS "requestedBy_username", ap.username AS "approvedBy_username" FROM "Transfer" t LEFT JOIN "Base" sb ON t."sourceBaseId" = sb.id LEFT JOIN "Base" db ON t."destinationBaseId" = db.id LEFT JOIN "EquipmentType" et ON t."equipmentTypeId" = et.id LEFT JOIN "User" rq ON t."requestedById" = rq.id LEFT JOIN "User" ap ON t."approvedById" = ap.id WHERE t.id = $1',
    [id]
  );
  const transfer = rows[0];
  if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
  res.json({ success: true, data: { transfer } });
};

export const createTransfer = async (req: AuthRequest, res: Response) => {
  const parsed = createTransferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, reason, priority, notes } = parsed.data;
  const { rows } = await pool.query(
    'INSERT INTO "Transfer"("transferNumber","sourceBaseId","destinationBaseId","equipmentTypeId",quantity,reason,priority,notes,status,"requestedById") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [generateNumber('TRF'), sourceBaseId, destinationBaseId, equipmentTypeId, quantity, reason, priority, notes ?? null, 'REQUESTED', req.user?.userId || '']
  );
  const transfer = rows[0];
  res.status(201).json({ success: true, data: { transfer }, message: 'Transfer request created' });
};

export const updateTransfer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateTransferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "Transfer" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const transfer = rows[0];
  res.json({ success: true, data: { transfer }, message: 'Transfer updated' });
};

export const deleteTransfer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Transfer" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Transfer deleted' });
};

export const listAssignments = async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT a.*, asst."assetCode" AS "asset_code", b.name AS "base_name", u.username AS "assignedBy_username" FROM "Assignment" a LEFT JOIN "Asset" asst ON a."assetId" = asst.id LEFT JOIN "Base" b ON a."baseId" = b.id LEFT JOIN "User" u ON a."assignedById" = u.id ORDER BY a."createdAt" DESC');
  res.json({ success: true, data: { assignments: rows } });
};

export const getAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT a.*, asst."assetCode" AS "asset_code", b.name AS "base_name", u.username AS "assignedBy_username" FROM "Assignment" a LEFT JOIN "Asset" asst ON a."assetId" = asst.id LEFT JOIN "Base" b ON a."baseId" = b.id LEFT JOIN "User" u ON a."assignedById" = u.id WHERE a.id = $1', [id]);
  const assignment = rows[0];
  if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
  res.json({ success: true, data: { assignment } });
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { assetId, baseId, quantity, assigneeName, unit, purpose, assignedDate, expectedReturn, notes } = parsed.data;
  const assignment = await withTransaction(async (client) => {
    const { rows: ins } = await client.query(
      'INSERT INTO "Assignment"("assignmentNumber","assetId","quantity","baseId","assigneeName",unit,purpose,"assignedDate","expectedReturn",notes,"assignedById") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [generateNumber('ASN'), assetId, quantity, baseId, assigneeName, unit, purpose, assignedDate, expectedReturn, notes ?? null, req.user?.userId || '']
    );
    const created = ins[0];
    await client.query('UPDATE "Asset" SET "assigned" = "assigned" + $1, "available" = "available" - $1 WHERE id = $2', [quantity, assetId]);
    return created;
  });
  res.status(201).json({ success: true, data: { assignment }, message: 'Assignment created' });
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateAssignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "Assignment" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const assignment = rows[0];
  res.json({ success: true, data: { assignment }, message: 'Assignment updated' });
};

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Assignment" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Assignment deleted' });
};

export const listExpenditures = async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT e.*, b.name AS "base_name", et.name AS "equipmentType_name", cb.username AS "createdBy_username", ap.username AS "approvedBy_username" FROM "Expenditure" e LEFT JOIN "Base" b ON e."baseId" = b.id LEFT JOIN "EquipmentType" et ON e."equipmentTypeId" = et.id LEFT JOIN "User" cb ON e."createdById" = cb.id LEFT JOIN "User" ap ON e."approvedById" = ap.id ORDER BY e."createdAt" DESC');
  res.json({ success: true, data: { expenditures: rows } });
};

export const getExpenditure = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT e.*, b.name AS "base_name", et.name AS "equipmentType_name", cb.username AS "createdBy_username", ap.username AS "approvedBy_username" FROM "Expenditure" e LEFT JOIN "Base" b ON e."baseId" = b.id LEFT JOIN "EquipmentType" et ON e."equipmentTypeId" = et.id LEFT JOIN "User" cb ON e."createdById" = cb.id LEFT JOIN "User" ap ON e."approvedById" = ap.id WHERE e.id = $1', [id]);
  const expenditure = rows[0];
  if (!expenditure) return res.status(404).json({ success: false, message: 'Expenditure not found' });
  res.json({ success: true, data: { expenditure } });
};

export const createExpenditure = async (req: AuthRequest, res: Response) => {
  const parsed = createExpenditureSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { baseId, equipmentTypeId, quantity, category, activityReference, expenditureDate, notes } = parsed.data;

  const { rows } = await pool.query(
    'INSERT INTO "Expenditure"("expenditureNumber","baseId","equipmentTypeId",quantity,category,"activityReference","expenditureDate",notes,"createdById") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [generateNumber('EXP'), baseId, equipmentTypeId, quantity, category, activityReference ?? null, expenditureDate, notes ?? null, req.user?.userId || '']
  );
  const expenditure = rows[0];
  res.status(201).json({ success: true, data: { expenditure }, message: 'Expenditure created' });
};

export const approveExpenditure = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = approveExpenditureSchema.safeParse({ approvedById: req.user?.userId });
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { rows } = await pool.query('UPDATE "Expenditure" SET "approvedById" = $2 WHERE id = $1 RETURNING *', [id, parsed.data.approvedById]);
  const expenditure = rows[0];
  res.json({ success: true, data: { expenditure }, message: 'Expenditure approved' });
};

export const deleteExpenditure = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "Expenditure" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Expenditure deleted' });
};

export const listMaintenanceRecords = async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT m.*, a."assetCode" AS "asset_code" FROM "MaintenanceRecord" m LEFT JOIN "Asset" a ON m."assetId" = a.id ORDER BY m."createdAt" DESC');
  res.json({ success: true, data: { records: rows } });
};

export const getMaintenanceRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT m.*, a."assetCode" AS "asset_code" FROM "MaintenanceRecord" m LEFT JOIN "Asset" a ON m."assetId" = a.id WHERE m.id = $1', [id]);
  const record = rows[0];
  if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
  res.json({ success: true, data: { record } });
};

export const createMaintenanceRecord = async (req: AuthRequest, res: Response) => {
  const parsed = createMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { assetId, maintenanceType, issue, description, technician, startDate, expectedCompletion, cost, partsNotes, nextServiceDate, notes } = parsed.data;

  const record = await withTransaction(async (client) => {
    const { rows: ins } = await client.query(
      'INSERT INTO "MaintenanceRecord"("maintenanceId","assetId","maintenanceType",issue,description,technician,"startDate","expectedCompletion",cost,"partsNotes","nextServiceDate",notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [generateNumber('MTN'), assetId, maintenanceType, issue, description ?? null, technician ?? null, startDate, expectedCompletion, cost ?? null, partsNotes ?? null, nextServiceDate ?? null, notes ?? null]
    );
    const created = ins[0];
    await client.query('UPDATE "Asset" SET maintenance = maintenance + 1 WHERE id = $1', [assetId]);
    return created;
  });
  res.status(201).json({ success: true, data: { record }, message: 'Maintenance record created' });
};

export const updateMaintenanceRecord = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const data: any = parsed.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const values = keys.map((k) => data[k]);
  const query = `UPDATE "MaintenanceRecord" SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, ...values]);
  const record = rows[0];
  res.json({ success: true, data: { record }, message: 'Maintenance record updated' });
};

export const deleteMaintenanceRecord = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "MaintenanceRecord" WHERE id = $1', [id]);
  res.json({ success: true, message: 'Maintenance record deleted' });
};

export default {};
