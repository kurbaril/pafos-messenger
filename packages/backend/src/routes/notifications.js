import express from 'express';
import { isAuthenticated } from '../auth.js';
import { prisma } from '../server.js';

const router = express.Router();

// Get notifications
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const unreadCount = await prisma.notification.count({
      where: { userId: req.session.userId, isRead: false }
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// Get unread count
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.session.userId, isRead: false }
    });
    res.json({ count });
  } catch (error) {
    res.json({ count: 0 });
  }
});

// Mark as read
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.session.userId },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all as read
router.put('/read-all', isAuthenticated, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.session.userId, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;