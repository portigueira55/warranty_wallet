import { Router } from 'express';
import { WarrantyController } from '../controllers/warranty.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', WarrantyController.create);
router.get('/', WarrantyController.getAll);
router.get('/stats', WarrantyController.getStats);
router.get('/:id', WarrantyController.getById);
router.put('/:id', WarrantyController.update);
router.delete('/:id', WarrantyController.delete);

export default router;
