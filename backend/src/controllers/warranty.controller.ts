import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { WarrantyModel, Warranty } from '../models/warranty.model';

export class WarrantyController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const warrantyData: Omit<Warranty, 'id'> = {
        user_id: req.userId!,
        product_name: req.body.product_name,
        brand: req.body.brand,
        model: req.body.model,
        serial_number: req.body.serial_number,
        purchase_date: req.body.purchase_date,
        warranty_duration: req.body.warranty_duration || 36,
        expiry_date: req.body.expiry_date,
        category: req.body.category,
        store: req.body.store,
        price: req.body.price,
        receipt_image: req.body.receipt_image,
        product_image: req.body.product_image,
        notes: req.body.notes,
        status: 'active'
      };

      const warranty = await WarrantyModel.create(warrantyData);

      res.status(201).json({
        message: 'Warranty created successfully',
        warranty
      });
    } catch (error) {
      console.error('Create warranty error:', error);
      res.status(500).json({ error: 'Failed to create warranty' });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const warranties = await WarrantyModel.findByUserId(req.userId!);
      res.json({ warranties });
    } catch (error) {
      console.error('Get warranties error:', error);
      res.status(500).json({ error: 'Failed to get warranties' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const warranty = await WarrantyModel.findById(parseInt(id));

      if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
      }

      if (warranty.user_id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ warranty });
    } catch (error) {
      console.error('Get warranty error:', error);
      res.status(500).json({ error: 'Failed to get warranty' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const warranty = await WarrantyModel.findById(parseInt(id));

      if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
      }

      if (warranty.user_id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await WarrantyModel.update(parseInt(id), req.body);
      const updatedWarranty = await WarrantyModel.findById(parseInt(id));

      res.json({
        message: 'Warranty updated successfully',
        warranty: updatedWarranty
      });
    } catch (error) {
      console.error('Update warranty error:', error);
      res.status(500).json({ error: 'Failed to update warranty' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const warranty = await WarrantyModel.findById(parseInt(id));

      if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
      }

      if (warranty.user_id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await WarrantyModel.delete(parseInt(id));

      res.json({ message: 'Warranty deleted successfully' });
    } catch (error) {
      console.error('Delete warranty error:', error);
      res.status(500).json({ error: 'Failed to delete warranty' });
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await WarrantyModel.getStats(req.userId!);
      res.json({ stats });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }
}
