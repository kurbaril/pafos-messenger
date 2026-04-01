import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated } from '../auth.js';

const router = express.Router();

/**
 * @route POST /api/pinned/:chatId
 * @desc Pin a message in chat
 */
router.post('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageId } = req.body;
    const userId = req.session.userId;
    
    // Check if user is in chat
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId
        }
      }
    });
    
    if (!chatUser) {
      return res.status(403).json({ error: 'Not a member of this chat' });
    }
    
    // Check if message exists and belongs to chat
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    });
    
    if (!message || message.chatId !== chatId) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if already pinned
    const existing = await prisma.pinnedMessage.findUnique({
      where: { chatId }
    });
    
    if (existing) {
      // Update existing pin
      const updated = await prisma.pinnedMessage.update({
        where: { chatId },
        data: {
          messageId,
          pinnedBy: userId,
          pinnedAt: new Date()
        },
        include: {
          message: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      });
      
      res.json(updated);
    } else {
      // Create new pin
      const pinned = await prisma.pinnedMessage.create({
        data: {
          messageId,
          chatId,
          pinnedBy: userId
        },
        include: {
          message: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      });
      
      res.json(pinned);
    }
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ error: 'Failed to pin message' });
  }
});

/**
 * @route DELETE /api/pinned/:chatId
 * @desc Unpin message from chat
 */
router.delete('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId;
    
    // Check if user is in chat
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId
        }
      }
    });
    
    if (!chatUser) {
      return res.status(403).json({ error: 'Not a member of this chat' });
    }
    
    await prisma.pinnedMessage.delete({
      where: { chatId }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unpinning message:', error);
    res.status(500).json({ error: 'Failed to unpin message' });
  }
});

/**
 * @route GET /api/pinned/:chatId
 * @desc Get pinned message for chat
 */
router.get('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId;
    
    // Check if user is in chat
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId
        }
      }
    });
    
    if (!chatUser) {
      return res.status(403).json({ error: 'Not a member of this chat' });
    }
    
    const pinned = await prisma.pinnedMessage.findUnique({
      where: { chatId },
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
            quoted: {
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    res.json(pinned || null);
  } catch (error) {
    console.error('Error getting pinned message:', error);
    res.status(500).json({ error: 'Failed to get pinned message' });
  }
});

export default router;