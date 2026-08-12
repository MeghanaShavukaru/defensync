import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController';

const router = express.Router();

router.get('/', listSuppliers);
router.get('/:id', getSupplier);
router.post('/', authenticate, authorize(['ADMIN']), createSupplier);
router.put('/:id', authenticate, authorize(['ADMIN']), updateSupplier);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteSupplier);

export default router;
