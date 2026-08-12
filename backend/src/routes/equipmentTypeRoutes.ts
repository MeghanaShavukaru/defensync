import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listEquipmentTypes, getEquipmentType, createEquipmentType, updateEquipmentType, deleteEquipmentType } from '../controllers/equipmentTypeController';

const router = express.Router();

router.get('/', listEquipmentTypes);
router.get('/:id', getEquipmentType);
router.post('/', authenticate, authorize(['ADMIN']), createEquipmentType);
router.put('/:id', authenticate, authorize(['ADMIN']), updateEquipmentType);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteEquipmentType);

export default router;
