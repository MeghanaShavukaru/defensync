import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  listPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  listTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listExpenditures,
  getExpenditure,
  createExpenditure,
  approveExpenditure,
  deleteExpenditure,
  listMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../controllers/transactionController';

const router = express.Router();

// Purchases
router.get('/purchases', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), listPurchases);
router.get('/purchases/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), getPurchase);
router.post('/purchases', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), createPurchase);
router.put('/purchases/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), updatePurchase);
router.delete('/purchases/:id', authenticate, authorize(['ADMIN']), deletePurchase);

// Transfers
router.get('/transfers', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), listTransfers);
router.get('/transfers/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), getTransfer);
router.post('/transfers', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), createTransfer);
router.put('/transfers/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), updateTransfer);
router.delete('/transfers/:id', authenticate, authorize(['ADMIN']), deleteTransfer);

// Assignments
router.get('/assignments', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), listAssignments);
router.get('/assignments/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), getAssignment);
router.post('/assignments', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), createAssignment);
router.put('/assignments/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), updateAssignment);
router.delete('/assignments/:id', authenticate, authorize(['ADMIN']), deleteAssignment);

// Expenditures
router.get('/expenditures', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), listExpenditures);
router.get('/expenditures/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), getExpenditure);
router.post('/expenditures', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), createExpenditure);
router.post('/expenditures/:id/approve', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER']), approveExpenditure);
router.delete('/expenditures/:id', authenticate, authorize(['ADMIN']), deleteExpenditure);

// Maintenance
router.get('/maintenance', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), listMaintenanceRecords);
router.get('/maintenance/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER', 'AUDITOR']), getMaintenanceRecord);
router.post('/maintenance', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), createMaintenanceRecord);
router.put('/maintenance/:id', authenticate, authorize(['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']), updateMaintenanceRecord);
router.delete('/maintenance/:id', authenticate, authorize(['ADMIN']), deleteMaintenanceRecord);

export default router;
