import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listAssets, getAsset, createAsset, updateAsset, deleteAsset } from '../controllers/assetController';

const router = express.Router();

// Public read
router.get('/', listAssets);
router.get('/:id', getAsset);

// Protected write
router.post('/', authenticate, authorize(['ADMIN','LOGISTICS_OFFICER','BASE_COMMANDER']), createAsset);
router.put('/:id', authenticate, authorize(['ADMIN','LOGISTICS_OFFICER','BASE_COMMANDER']), updateAsset);
router.delete('/:id', authenticate, authorize(['ADMIN','LOGISTICS_OFFICER']), deleteAsset);

export default router;
