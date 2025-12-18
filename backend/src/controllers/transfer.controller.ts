import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbRun, dbGet } from '../config/database';
import { WarrantyModel } from '../models/warranty.model';
import crypto from 'crypto';

export class TransferController {
  static async initiateTransfer(req: AuthRequest, res: Response) {
    try {
      const { warranty_id, to_user_email } = req.body;

      if (!warranty_id || !to_user_email) {
        return res.status(400).json({ error: 'Warranty ID and recipient email are required' });
      }

      const warranty = await WarrantyModel.findById(warranty_id);
      if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
      }

      if (warranty.user_id !== req.userId) {
        return res.status(403).json({ error: 'You do not own this warranty' });
      }

      if (to_user_email === req.userEmail) {
        return res.status(400).json({ error: 'Cannot transfer to yourself' });
      }

      const transferCode = crypto.randomBytes(6).toString('hex').toUpperCase();

      const result: any = await dbRun(
        `INSERT INTO transfers (warranty_id, from_user_id, to_user_email, transfer_code, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [warranty_id, req.userId, to_user_email, transferCode]
      );

      res.status(201).json({
        message: 'Transfer initiated successfully',
        transfer: {
          id: result.lastID,
          warranty_id,
          to_user_email,
          transfer_code: transferCode,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Initiate transfer error:', error);
      res.status(500).json({ error: 'Failed to initiate transfer' });
    }
  }

  static async acceptTransfer(req: AuthRequest, res: Response) {
    try {
      const { transfer_code } = req.body;

      if (!transfer_code) {
        return res.status(400).json({ error: 'Transfer code is required' });
      }

      const transfer: any = await dbGet(
        'SELECT * FROM transfers WHERE transfer_code = ? AND status = ?',
        [transfer_code, 'pending']
      );

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found or already completed' });
      }

      if (transfer.to_user_email !== req.userEmail) {
        return res.status(403).json({ error: 'This transfer is not for you' });
      }

      await WarrantyModel.transferOwnership(transfer.warranty_id, req.userId!);

      await dbRun(
        `UPDATE transfers 
         SET status = 'completed', to_user_id = ?, completed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [req.userId, transfer.id]
      );

      res.json({
        message: 'Transfer accepted successfully',
        warranty_id: transfer.warranty_id
      });
    } catch (error) {
      console.error('Accept transfer error:', error);
      res.status(500).json({ error: 'Failed to accept transfer' });
    }
  }

  static async getPendingTransfers(req: AuthRequest, res: Response) {
    try {
      const transfers: any = await dbGet(
        `SELECT t.*, w.product_name, w.brand, w.model 
         FROM transfers t
         JOIN warranties w ON t.warranty_id = w.id
         WHERE t.to_user_email = ? AND t.status = 'pending'`,
        [req.userEmail]
      );

      res.json({ transfers: transfers || [] });
    } catch (error) {
      console.error('Get pending transfers error:', error);
      res.status(500).json({ error: 'Failed to get pending transfers' });
    }
  }

  static async cancelTransfer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const transfer: any = await dbGet('SELECT * FROM transfers WHERE id = ?', [id]);

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.from_user_id !== req.userId) {
        return res.status(403).json({ error: 'You can only cancel your own transfers' });
      }

      if (transfer.status !== 'pending') {
        return res.status(400).json({ error: 'Can only cancel pending transfers' });
      }

      await dbRun("UPDATE transfers SET status = 'cancelled' WHERE id = ?", [id]);

      res.json({ message: 'Transfer cancelled successfully' });
    } catch (error) {
      console.error('Cancel transfer error:', error);
      res.status(500).json({ error: 'Failed to cancel transfer' });
    }
  }
}
