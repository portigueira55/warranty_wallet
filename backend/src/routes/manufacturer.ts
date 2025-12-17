import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, requireUserType } from '../middleware/auth';
import {
  getDashboard,
  getProducts,
  createProduct,
  getClaims,
  updateClaim,
} from '../controllers/manufacturerController';

const router = Router();

// Todas las rutas requieren autenticación de fabricante
router.use(authenticateToken);
router.use(requireUserType('manufacturer'));

// Dashboard
router.get('/dashboard', getDashboard);

// Productos
router.get('/products', getProducts);
router.post(
  '/products',
  [
    body('sku').notEmpty().withMessage('SKU required'),
    body('name').notEmpty().withMessage('Product name required'),
    validateRequest,
  ],
  createProduct
);

// Reclamos
router.get('/claims', getClaims);
router.put(
  '/claims/:id',
  [
    body('status').optional().isIn(['pending', 'in_progress', 'resolved', 'rejected']),
    validateRequest,
  ],
  updateClaim
);

export default router;
