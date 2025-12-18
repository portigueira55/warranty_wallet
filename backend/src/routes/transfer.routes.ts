import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/initiate', TransferController.initiateTransfer);
router.post('/accept', TransferController.acceptTransfer);
router.get('/pending', TransferController.getPendingTransfers);
router.delete('/:id', TransferController.cancelTransfer);

export default router;
