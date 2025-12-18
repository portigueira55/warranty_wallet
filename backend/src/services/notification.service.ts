import cron from 'node-cron';
import { dbRun, dbAll } from '../config/database';

export class NotificationService {
  static async createNotification(
    userId: number,
    warrantyId: number | null,
    type: string,
    title: string,
    message: string
  ) {
    try {
      await dbRun(
        `INSERT INTO notifications (user_id, warranty_id, type, title, message)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, warrantyId, type, title, message]
      );
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }

  static async checkExpiringWarranties() {
    try {
      const warranties: any[] = await dbAll(`
        SELECT w.*, u.email 
        FROM warranties w
        JOIN users u ON w.user_id = u.id
        WHERE w.status = 'active'
        AND (
          date(w.expiry_date) = date('now', '+30 days') OR
          date(w.expiry_date) = date('now', '+7 days') OR
          date(w.expiry_date) = date('now', '+1 day')
        )
      `);

      for (const warranty of warranties) {
        const daysUntilExpiry = Math.ceil(
          (new Date(warranty.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        let message = '';
        if (daysUntilExpiry === 30) {
          message = `Your warranty for ${warranty.product_name} expires in 30 days`;
        } else if (daysUntilExpiry === 7) {
          message = `Your warranty for ${warranty.product_name} expires in 7 days`;
        } else if (daysUntilExpiry === 1) {
          message = `⚠️ Your warranty for ${warranty.product_name} expires tomorrow!`;
        }

        await this.createNotification(
          warranty.user_id,
          warranty.id,
          'expiry_warning',
          'Warranty Expiring Soon',
          message
        );
      }

      console.log(`✅ Checked expiring warranties: ${warranties.length} notifications`);
    } catch (error) {
      console.error('Check expiring warranties error:', error);
    }
  }

  static async markExpiredWarranties() {
    try {
      await dbRun(`
        UPDATE warranties 
        SET status = 'expired', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'active' AND date(expiry_date) < date('now')
      `);

      console.log('✅ Marked expired warranties');
    } catch (error) {
      console.error('Mark expired warranties error:', error);
    }
  }
}

export function startNotificationScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('�� Running daily notification check...');
    await NotificationService.checkExpiringWarranties();
    await NotificationService.markExpiredWarranties();
  });

  console.log('✅ Notification scheduler started');
}
