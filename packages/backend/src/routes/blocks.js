import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated, getUserById } from '../auth.js';

const router = express.Router();

/**
 * @route POST /api/blocks/:userId
 * @desc Block a user
 */
router.post('/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.session.userId;
    
    if (userId === blockerId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }
    
    // Check if user exists
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already blocked
    const existing = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: userId
        }
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'User already blocked' });
    }
    
    // Create block
    const block = await prisma.userBlock.create({
      data: {
        blockerId,
        blockedId: userId
      }
    });
    
    // Delete any existing private chat between users
    const chat = await prisma.chat.findFirst({
      where: {
        type: 'PRIVATE',
        users: {
          every: {
            userId: { in: [blockerId, userId] }
          }
        }
      },
      include: {
        users: true
      }
    });
    
    if (chat) {
      // Remove both users from chat
      await prisma.chatUser.deleteMany({
        where: {
          chatId: chat.id,
          userId: { in: [blockerId, userId] }
        }
      });
      
      // If chat is empty, delete it
      const remaining = await prisma.chatUser.count({
        where: { chatId: chat.id }
      });
      
      if (remaining === 0) {
        await prisma.chat.delete({ where: { id: chat.id } });
      }
    }
    
    res.json({ success: true, block });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

/**
 * @route DELETE /api/blocks/:userId
 * @desc Unblock a user
 */
router.delete('/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.session.userId;
    
    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: userId
        }
      }
    });
    
    if (!block) {
      return res.status(404).json({ error: 'User not blocked' });
    }
    
    await prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: userId
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

/**
 * @route GET /api/blocks
 * @desc Get list of blocked users
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const blockerId = req.session.userId;
    
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const blockedUsers = blocks.map(block => ({
      id: block.blocked.id,
      username: block.blocked.username,
      avatarUrl: block.blocked.avatarUrl,
      bio: block.blocked.bio,
      blockedAt: block.createdAt
    }));
    
    res.json(blockedUsers);
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
});

/**
 * @route GET /api/blocks/check/:userId
 * @desc Check if user is blocked
 */
router.get('/check/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.session.userId;
    
    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: userId
        }
      }
    });
    
    res.json({ isBlocked: !!block });
  } catch (error) {
    console.error('Error checking block:', error);
    res.status(500).json({ error: 'Failed to check block' });
  }
});

/**
 * @route GET /api/blocks/blocked-by
 * @desc Get users who blocked current user
 */
router.get('/blocked-by', isAuthenticated, async (req, res) => {
  try {
    const blockedId = req.session.userId;
    
    const blocks = await prisma.userBlock.findMany({
      where: { blockedId },
      include: {
        blocker: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });
    
    const blockers = blocks.map(block => ({
      id: block.blocker.id,
      username: block.blocker.username,
      avatarUrl: block.blocker.avatarUrl,
      blockedAt: block.createdAt
    }));
    
    res.json(blockers);
  } catch (error) {
    console.error('Error getting blockers:', error);
    res.status(500).json({ error: 'Failed to get blockers' });
  }
});

export default router;