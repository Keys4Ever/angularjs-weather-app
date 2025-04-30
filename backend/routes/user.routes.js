import express from 'express';
import { getAllUsers, getUserById } from '../controllers/user.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);

export default router;