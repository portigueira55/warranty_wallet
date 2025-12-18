/**
 * Rutas para OCR
 */

import { Router } from 'express';
import multer from 'multer';
import { OCRController } from '../controllers/ocrController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configurar multer para subida de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

/**
 * @route   POST /api/ocr/process
 * @desc    Procesa una imagen de ticket y extrae datos estructurados
 * @access  Private
 */
router.post(
  '/process',
  authenticateToken,
  upload.single('image'),
  OCRController.processReceipt
);

/**
 * @route   POST /api/ocr/extract-text
 * @desc    Extrae solo texto de una imagen
 * @access  Private
 */
router.post(
  '/extract-text',
  authenticateToken,
  upload.single('image'),
  OCRController.extractText
);

export default router;
