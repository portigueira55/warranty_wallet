import { dbRun, dbGet, dbAll } from '../config/database';

export interface Warranty {
  id?: number;
  user_id: number;
  product_name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date: string;
  warranty_duration: number;
  expiry_date: string;
  category?: string;
  store?: string;
  price?: number;
  receipt_image?: string;
  product_image?: string;
  notes?: string;
  status: 'active' | 'expired' | 'claimed';
  created_at?: string;
  updated_at?: string;
}

export class WarrantyModel {
  static async create(warranty: Omit<Warranty, 'id'>): Promise<Warranty> {
    const result: any = await dbRun(
      `INSERT INTO warranties (
        user_id, product_name, brand, model, serial_number, 
        purchase_date, warranty_duration, expiry_date, category, 
        store, price, receipt_image, product_image, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        warranty.user_id, warranty.product_name, warranty.brand || null,
        warranty.model || null, warranty.serial_number || null,
        warranty.purchase_date, warranty.warranty_duration, warranty.expiry_date,
        warranty.category || null, warranty.store || null, warranty.price || null,
        warranty.receipt_image || null, warranty.product_image || null,
        warranty.notes || null, warranty.status || 'active'
      ]
    );

    return { id: result.lastID, ...warranty };
  }

  static async findById(id: number): Promise<Warranty | undefined> {
    return await dbGet('SELECT * FROM warranties WHERE id = ?', [id]) as Warranty;
  }

  static async findByUserId(userId: number): Promise<Warranty[]> {
    return await dbAll(
      'SELECT * FROM warranties WHERE user_id = ? ORDER BY expiry_date ASC',
      [userId]
    ) as Warranty[];
  }

  static async update(id: number, updates: Partial<Warranty>): Promise<void> {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'user_id')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'user_id')
      .map(key => (updates as any)[key]);

    await dbRun(
      `UPDATE warranties SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
  }

  static async delete(id: number): Promise<void> {
    await dbRun('DELETE FROM warranties WHERE id = ?', [id]);
  }

  static async getStats(userId: number) {
    return await dbGet(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN date(expiry_date) <= date('now', '+30 days') AND status = 'active' THEN 1 ELSE 0 END) as expiring_soon,
        SUM(COALESCE(price, 0)) as total_value
       FROM warranties 
       WHERE user_id = ?`,
      [userId]
    );
  }

  static async transferOwnership(warrantyId: number, newUserId: number): Promise<void> {
    await dbRun(
      'UPDATE warranties SET user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newUserId, warrantyId]
    );
  }
}
