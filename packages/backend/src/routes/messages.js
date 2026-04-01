import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated } from '../auth.js';
import { editMessage, deleteMessageForEveryone } from '../database.js';

const router = express.Router();

/**
 * @route GET /api/messages/:messageId
 * @desc Get message details
 */
router.get('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;
    
    const message = await prisma.message.findUnique({
      where: { id: messageId },
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
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        },
        editHistory: {
          orderBy: { editedAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is in the chat
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId: message.chatId
        }
      }
    });
    
    if (!chatUser) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({
      id: message.id,
      content: message.isDeletedForUsers ? null : message.content,
      isDeleted: message.isDeletedForUsers,
      fileUrl: message.isDeletedForUsers ? null : message.fileUrl,
      fileType: message.isDeletedForUsers ? null : message.fileType,
      fileName: message.isDeletedForUsers ? null : message.fileName,
      fileSize: message.isDeletedForUsers ? null : message.fileSize,
      duration: message.isDeletedForUsers ? null : message.duration,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      sender: message.sender,
      quoted: message.quoted,
      reactions: message.reactions.map(r => ({
        emoji: r.emoji,
        userId: r.userId,
        username: r.user.username
      })),
      readBy: message.readBy.map(r => ({
        userId: r.userId,
        username: r.user.username,
        avatarUrl: r.user.avatarUrl,
        readAt: r.readAt
      })),
      editHistory: message.editHistory
    });
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

/**
 * @route PUT /api/messages/:messageId
 * @desc Edit message
 */
router.put('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.session.userId;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content required' });
    }
    
    const updated = await editMessage(messageId, userId, content.trim());
    
    res.json(updated);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(403).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/messages/:messageId
 * @desc Delete message for everyone
 */
router.delete('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    const deleted = await deleteMessageForEveryone(messageId, userId, userRole);
    
    res.json({ success: true, message: deleted });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(403).json({ error: error.message });
  }
});

/**
 * @route POST /api/messages/:messageId/reactions
 * @desc Add reaction to message
 */
router.post('/:messageId/reactions', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.session.userId;
    
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji required' });
    }
    
    // Check if message exists and user is in chat
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId: message.chatId
        }
      }
    });
    
    if (!chatUser) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const reaction = await prisma.reaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji
        }
      },
      update: {},
      create: {
        messageId,
        userId,
        emoji
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    res.json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

/**
 * @route DELETE /api/messages/:messageId/reactions/:emoji
 * @desc Remove reaction from message
 */
router.delete('/:messageId/reactions/:emoji', isAuthenticated, async (req, res) => {
  try {
    const { messageId, emoji } = req.params;
    const userId = req.session.userId;
    
    await prisma.reaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

/**
 * @route GET /api/messages/:messageId/read-receipts
 * @desc Get read receipts for message
 */
router.get('/:messageId/read-receipts', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;
    
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            users: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        readBy: {
          include: {
            user: {
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
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is in chat
    const isMember = message.chat.users.some(u => u.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const readBy = message.readBy.map(r => ({
      userId: r.userId,
      username: r.user.username,
      avatarUrl: r.user.avatarUrl,
      readAt: r.readAt
    }));
    
    const totalMembers = message.chat.users.length;
    const readCount = readBy.length;
    
    res.json({
      readBy,
      readCount,
      totalMembers,
      isFullyRead: readCount === totalMembers
    });
  } catch (error) {
    console.error('Error getting read receipts:', error);
    res.status(500).json({ error: 'Failed to get read receipts' });
  }
});

/**
 * @route GET /api/messages/:messageId/history
 * @desc Get edit history of message
 */
router.get('/:messageId/history', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;
    
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            users: {
              where: { userId },
              take: 1
            }
          }
        },
        editHistory: {
          orderBy: { editedAt: 'desc' },
          include: {
            message: false
          }
        }
      }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is in chat
    if (message.chat.users.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({
      messageId: message.id,
      originalContent: message.editHistory[message.editHistory.length - 1]?.oldContent || message.content,
      edits: message.editHistory.map(edit => ({
        oldContent: edit.oldContent,
        newContent: edit.newContent,
        editedAt: edit.editedAt
      }))
    });
  } catch (error) {
    console.error('Error getting edit history:', error);
    res.status(500).json({ error: 'Failed to get edit history' });
  }
});

/**
 * @route POST /api/messages/:messageId/read
 * @desc Mark message as read
 */
router.post('/:messageId/read', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;
    
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      },
      update: { readAt: new Date() },
      create: {
        messageId,
        userId
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;