import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, requireUserType } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  getWarranties,
  createWarranty,
  getWarrantyDetail,
  deleteWarranty,
  createClaim,
  getNotifications,
  markNotificationRead,
} from '../controllers/userController';

const router = Router();

// Todas las rutas requieren autenticación de usuario
router.use(authenticateToken);
router.use(requireUserType('user'));

// Perfil
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Garantías
router.get('/warranties', getWarranties);
router.post(
  '/warranties',
  [
    body('purchaseDate').isISO8601().withMessage('Valid purchase date required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    validateRequest,
  ],
  createWarranty
);
router.get('/warranties/:id', getWarrantyDetail);
router.delete('/warranties/:id', deleteWarranty);

// Reclamos
router.post(
  '/warranties/:id/claim',
  [
    body('warrantyItemId').notEmpty().withMessage('Warranty item ID required'),
    body('issueDescription').notEmpty().withMessage('Issue description required'),
    validateRequest,
  ],
  createClaim
);

// Notificaciones
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
