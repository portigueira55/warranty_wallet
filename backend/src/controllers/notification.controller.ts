import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbAll, dbRun, dbGet } from '../config/database';

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const notifications = await dbAll(
        `SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [req.userId]
      );

      res.json({ notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  static async getUnread(req: AuthRequest, res: Response) {
    try {
      const notifications = await dbAll(
        `SELECT * FROM notifications 
         WHERE user_id = ? AND read = 0 
         ORDER BY created_at DESC`,
        [req.userId]
      );

      const count = await dbGet(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
        [req.userId]
      );

      res.json({
        notifications,
        unread_count: (count as any).count
      });
    } catch (error) {
      console.error('Get unread notifications error:', error);
      res.status(500).json({ error: 'Failed to get unread notifications' });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const notification: any = await dbGet(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.user_id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [id]);

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await dbRun('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.userId]);

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const notification: any = await dbGet(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.user_id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await dbRun('DELETE FROM notifications WHERE id = ?', [id]);

      res.json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}
