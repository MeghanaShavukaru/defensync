import { z } from 'zod';
import { Request, Response } from 'express';
import prisma from '../config/prisma';
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
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' },
    include: { base: true, equipmentType: true, supplier: true, createdBy: true },
  });
  res.json({ success: true, data: { purchases } });
};

export const getPurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { base: true, equipmentType: true, supplier: true, createdBy: true },
  });
  if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
  res.json({ success: true, data: { purchase } });
};

export const createPurchase = async (req: AuthRequest, res: Response) => {
  const parsed = createPurchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { baseId, equipmentTypeId, supplierId, quantity, unitCost, purchaseDate, expectedDelivery, referenceNumber, notes } = parsed.data;

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber: generateNumber('PUR'),
      baseId,
      equipmentTypeId,
      supplierId,
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      purchaseDate,
      expectedDelivery,
      referenceNumber,
      notes,
      status: 'PENDING_APPROVAL',
      createdById: req.user?.userId || '',
    },
  });

  res.status(201).json({ success: true, data: { purchase }, message: 'Purchase request created' });
};

export const updatePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updatePurchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const purchase = await prisma.purchase.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { purchase }, message: 'Purchase updated' });
};

export const deletePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.purchase.delete({ where: { id } });
  res.json({ success: true, message: 'Purchase deleted' });
};

export const listTransfers = async (req: Request, res: Response) => {
  const transfers = await prisma.transfer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { sourceBase: true, destinationBase: true, equipmentType: true, requestedBy: true, approvedBy: true },
  });
  res.json({ success: true, data: { transfers } });
};

export const getTransfer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transfer = await prisma.transfer.findUnique({
    where: { id },
    include: { sourceBase: true, destinationBase: true, equipmentType: true, requestedBy: true, approvedBy: true },
  });
  if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
  res.json({ success: true, data: { transfer } });
};

export const createTransfer = async (req: AuthRequest, res: Response) => {
  const parsed = createTransferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, reason, priority, notes } = parsed.data;

  const transfer = await prisma.transfer.create({
    data: {
      transferNumber: generateNumber('TRF'),
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity,
      reason,
      priority,
      notes,
      status: 'REQUESTED',
      requestedById: req.user?.userId || '',
    },
  });

  res.status(201).json({ success: true, data: { transfer }, message: 'Transfer request created' });
};

export const updateTransfer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateTransferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const transfer = await prisma.transfer.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { transfer }, message: 'Transfer updated' });
};

export const deleteTransfer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.transfer.delete({ where: { id } });
  res.json({ success: true, message: 'Transfer deleted' });
};

export const listAssignments = async (req: Request, res: Response) => {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { asset: true, base: true, assignedBy: true },
  });
  res.json({ success: true, data: { assignments } });
};

export const getAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { asset: true, base: true, assignedBy: true },
  });
  if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
  res.json({ success: true, data: { assignment } });
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { assetId, baseId, quantity, assigneeName, unit, purpose, assignedDate, expectedReturn, notes } = parsed.data;

  const assignment = await prisma.assignment.create({
    data: {
      assignmentNumber: generateNumber('ASN'),
      assetId,
      baseId,
      quantity,
      assigneeName,
      unit,
      purpose,
      assignedDate,
      expectedReturn,
      notes,
      assignedById: req.user?.userId || '',
    },
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: { assigned: { increment: quantity }, available: { decrement: quantity } },
  });

  res.status(201).json({ success: true, data: { assignment }, message: 'Assignment created' });
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateAssignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const assignment = await prisma.assignment.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { assignment }, message: 'Assignment updated' });
};

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.assignment.delete({ where: { id } });
  res.json({ success: true, message: 'Assignment deleted' });
};

export const listExpenditures = async (req: Request, res: Response) => {
  const expenditures = await prisma.expenditure.findMany({
    orderBy: { createdAt: 'desc' },
    include: { base: true, equipmentType: true, createdBy: true, approvedBy: true },
  });
  res.json({ success: true, data: { expenditures } });
};

export const getExpenditure = async (req: Request, res: Response) => {
  const { id } = req.params;
  const expenditure = await prisma.expenditure.findUnique({
    where: { id },
    include: { base: true, equipmentType: true, createdBy: true, approvedBy: true },
  });
  if (!expenditure) return res.status(404).json({ success: false, message: 'Expenditure not found' });
  res.json({ success: true, data: { expenditure } });
};

export const createExpenditure = async (req: AuthRequest, res: Response) => {
  const parsed = createExpenditureSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { baseId, equipmentTypeId, quantity, category, activityReference, expenditureDate, notes } = parsed.data;

  const expenditure = await prisma.expenditure.create({
    data: {
      expenditureNumber: generateNumber('EXP'),
      baseId,
      equipmentTypeId,
      quantity,
      category,
      activityReference,
      expenditureDate,
      notes,
      createdById: req.user?.userId || '',
    },
  });

  res.status(201).json({ success: true, data: { expenditure }, message: 'Expenditure created' });
};

export const approveExpenditure = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = approveExpenditureSchema.safeParse({ approvedById: req.user?.userId });
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const expenditure = await prisma.expenditure.update({
    where: { id },
    data: {
      approvedById: parsed.data.approvedById,
    },
  });

  res.json({ success: true, data: { expenditure }, message: 'Expenditure approved' });
};

export const deleteExpenditure = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.expenditure.delete({ where: { id } });
  res.json({ success: true, message: 'Expenditure deleted' });
};

export const listMaintenanceRecords = async (req: Request, res: Response) => {
  const records = await prisma.maintenanceRecord.findMany({
    orderBy: { createdAt: 'desc' },
    include: { asset: true },
  });
  res.json({ success: true, data: { records } });
};

export const getMaintenanceRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await prisma.maintenanceRecord.findUnique({
    where: { id },
    include: { asset: true },
  });
  if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
  res.json({ success: true, data: { record } });
};

export const createMaintenanceRecord = async (req: AuthRequest, res: Response) => {
  const parsed = createMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const { assetId, maintenanceType, issue, description, technician, startDate, expectedCompletion, cost, partsNotes, nextServiceDate, notes } = parsed.data;

  const record = await prisma.maintenanceRecord.create({
    data: {
      maintenanceId: generateNumber('MTN'),
      assetId,
      maintenanceType,
      issue,
      description,
      technician,
      startDate,
      expectedCompletion,
      cost,
      partsNotes,
      nextServiceDate,
      notes,
    },
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: { maintenance: { increment: 1 }, inTransit: { decrement: 0 } },
  });

  res.status(201).json({ success: true, data: { record }, message: 'Maintenance record created' });
};

export const updateMaintenanceRecord = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors });

  const record = await prisma.maintenanceRecord.update({ where: { id }, data: parsed.data });
  res.json({ success: true, data: { record }, message: 'Maintenance record updated' });
};

export const deleteMaintenanceRecord = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.maintenanceRecord.delete({ where: { id } });
  res.json({ success: true, message: 'Maintenance record deleted' });
};

export default {};
