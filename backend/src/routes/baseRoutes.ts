import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listBases, getBase, createBase, updateBase, deleteBase } from '../controllers/baseController';

const router = express.Router();

router.get('/', listBases);
router.get('/:id', getBase);
router.post('/', authenticate, authorize(['ADMIN']), createBase);
router.put('/:id', authenticate, authorize(['ADMIN']), updateBase);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteBase);

export default router;
