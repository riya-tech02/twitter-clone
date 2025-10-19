import { Router } from 'express';
import { signup, login, logout, getMe, refreshToken } from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.post('/refresh-token', refreshToken);

export default router;