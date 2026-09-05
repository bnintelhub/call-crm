import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// All user management routes require valid authentication & account active guard
router.use(authenticateToken);

// Telecallers list for allocation / supervisors
router.get('/telecallers', userController.getTelecallers);

// Supervisors & Admins management routes
router.get('/', requireRoles(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD']), userController.list);
router.post('/', requireRoles(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD']), userController.create);
router.put('/:id', requireRoles(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD']), userController.update);
router.delete('/:id', requireRoles(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD']), userController.delete);

export default router;
