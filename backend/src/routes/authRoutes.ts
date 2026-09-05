import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.me);
router.post('/change-password', authenticateToken, authController.changePassword);

export default router;
