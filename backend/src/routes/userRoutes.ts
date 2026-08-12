import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';

const router = express.Router();

router.get('/', authenticate, authorize(['ADMIN']), listUsers);
router.get('/:id', authenticate, authorize(['ADMIN']), getUser);
router.post('/', authenticate, authorize(['ADMIN']), createUser);
router.put('/:id', authenticate, authorize(['ADMIN']), updateUser);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteUser);

export default router;
