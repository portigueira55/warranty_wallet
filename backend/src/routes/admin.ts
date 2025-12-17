import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, requireUserType } from '../middleware/auth';
import {
  getDashboard,
  getUsers,
  updateUserStatus,
  getManufacturers,
  createManufacturer,
  updateManufacturer,
  getAllWarranties,
} from '../controllers/adminController';

const router = Router();

// Todas las rutas requieren autenticación de admin
router.use(authenticateToken);
router.use(requireUserType('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Usuarios
router.get('/users', getUsers);
router.put(
  '/users/:id/status',
  [body('isActive').isBoolean().withMessage('isActive must be boolean'), validateRequest],
  updateUserStatus
);

// Fabricantes
router.get('/manufacturers', getManufacturers);
router.post(
  '/manufacturers',
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  createManufacturer
);
router.put('/manufacturers/:id', updateManufacturer);

// Garantías
router.get('/warranties', getAllWarranties);

export default router;
