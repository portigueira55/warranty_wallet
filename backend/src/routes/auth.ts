import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import {
  registerUser,
  loginUser,
  loginManufacturer,
  loginAdmin,
} from '../controllers/authController';

const router = Router();

// Validaciones
const registerValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').notEmpty().withMessage('Username required'),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validateRequest,
];

// Rutas públicas
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/manufacturer/login', loginValidation, loginManufacturer);
router.post('/admin/login', loginValidation, loginAdmin);

export default router;
