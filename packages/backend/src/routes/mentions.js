import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated } from '../auth.js';

const router = express.Router();

/**
 * @route GET /api/mentions
 * @desc Get mentions for current user
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    
    const where = {
      userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };
    
    const mentions = await prisma.mention.findMany({
      where,
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            },
            chat: {
              include: {
                group: true,
                users: {
                  where: { userId },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    const total = await prisma.mention.count({ where });
    const unreadCount = await prisma.mention.count({
      where: { userId, isRead: false }
    });
    
    const formattedMentions = mentions.map(mention => ({
      id: mention.id,
      messageId: mention.messageId,
      content: mention.message.content,
      createdAt: mention.createdAt,
      isRead: mention.isRead,
      sender: mention.message.sender,
      chat: {
        id: mention.message.chat.id,
        name: mention.message.chat.group?.name || 'Private Chat',
        type: mention.message.chat.type
      }
    }));
    
    res.json({
      mentions: formattedMentions,
      total,
      unreadCount,
      hasMore: total > parseInt(offset) + parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting mentions:', error);
    res.status(500).json({ error: 'Failed to get mentions' });
  }
});

/**
 * @route PUT /api/mentions/:mentionId/read
 * @desc Mark mention as read
 */
router.put('/:mentionId/read', isAuthenticated, async (req, res) => {
  try {
    const { mentionId } = req.params;
    const userId = req.session.userId;
    
    const mention = await prisma.mention.findUnique({
      where: { id: mentionId }
    });
    
    if (!mention || mention.userId !== userId) {
      return res.status(404).json({ error: 'Mention not found' });
    }
    
    await prisma.mention.update({
      where: { id: mentionId },
      data: { isRead: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking mention as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

/**
 * @route PUT /api/mentions/read-all
 * @desc Mark all mentions as read
 */
router.put('/read-all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    await prisma.mention.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all mentions as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

/**
 * @route GET /api/mentions/unread/count
 * @desc Get unread mentions count
 */
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const count = await prisma.mention.count({
      where: { userId, isRead: false }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread mentions count:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

export default router;