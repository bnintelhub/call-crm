import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import { loginRateLimiter, passwordChangeRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public routes (protected by Rate Limiter against brute-force)
router.post('/login', loginRateLimiter, authController.login);

// Protected routes (guarded by real-time account deactivation & session revocation)
router.get('/me', authenticateToken, authController.me);
router.post('/change-password', authenticateToken, passwordChangeRateLimiter, authController.changePassword);

export default router;
