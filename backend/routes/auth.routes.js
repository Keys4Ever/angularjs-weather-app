import express from 'express';
import { login, register, validateToken, refreshToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/validateToken', validateToken);
router.post('/refreshToken', refreshToken);

export default router;