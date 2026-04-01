import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated, getUserById } from '../auth.js';
import { getUserChats, getChatMessages, getOrCreatePrivateChat } from '../database.js';

const router = express.Router();

/**
 * @route GET /api/chats
 * @desc Get all user chats
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const chats = await getUserChats(req.session.userId);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

/**
 * @route GET /api/chats/:chatId/messages
 * @desc Get chat messages with pagination
 */
router.get('/:chatId/messages', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, cursor } = req.query;
    
    // Verify user is in chat
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: {
          userId: req.session.userId,
          chatId
        }
      }
    });
    
    if (!chatUser) {
      return res.status(403).json({ error: 'Not a member of this chat' });
    }
    
    const result = await getChatMessages(
      chatId, 
      req.session.userId, 
      parseInt(limit), 
      cursor
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * @route POST /api/chats/private/:userId
 * @desc Create or get private chat with user
 */
router.post('/private/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.session.userId;
    
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot create chat with yourself' });
    }
    
    // Check if target user exists
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if target user is banned
    if (targetUser.isBanned) {
      return res.status(403).json({ error: 'User is banned' });
    }
    
    // Check blocks
    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: currentUserId, blockedId: userId },
          { blockerId: userId, blockedId: currentUserId }
        ]
      }
    });
    
    if (block) {
      return res.status(403).json({ error: 'User is blocked' });
    }
    
    const chat = await getOrCreatePrivateChat(currentUserId, userId);
    
    res.json(chat);
  } catch (error) {
    console.error('Error creating private chat:', error);
    res.status(500).json({ error: error.message || 'Failed to create chat' });
  }
});

/**
 * @route GET /api/chats/search/users
 * @desc Search users by username
 */
router.get('/search/users', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    // Get blocked users
    const blocked = await prisma.userBlock.findMany({
      where: { blockerId: req.session.userId },
      select: { blockedId: true }
    });
    
    const blockedIds = blocked.map(b => b.blockedId);
    
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive'
        },
        id: { not: req.session.userId },
        isBanned: false,
        ...(blockedIds.length > 0 && { id: { notIn: blockedIds } })
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true
      },
      take: 20
    });
    
    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * @route DELETE /api/chats/:chatId
 * @desc Delete/leave chat
 */
router.delete('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId;
    
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { group: true, users: true }
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const isMember = chat.users.some(u => u.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this chat' });
    }
    
    if (chat.type === 'PRIVATE') {
      // For private chats, just remove the user
      await prisma.chatUser.delete({
        where: {
          userId_chatId: {
            userId,
            chatId
          }
        }
      });
    } else {
      // For groups, check if user is owner
      const isOwner = chat.group?.ownerId === userId;
      
      if (isOwner && chat.users.length > 1) {
        // Transfer ownership to another member
        const otherMember = chat.users.find(u => u.userId !== userId);
        if (otherMember) {
          await prisma.group.update({
            where: { id: chat.group.id },
            data: { ownerId: otherMember.userId }
          });
        }
      }
      
      // Remove user from chat
      await prisma.chatUser.delete({
        where: {
          userId_chatId: {
            userId,
            chatId
          }
        }
      });
      
      // Remove from group members
      if (chat.group) {
        await prisma.groupMember.deleteMany({
          where: {
            groupId: chat.group.id,
            userId
          }
        });
      }
      
      // If chat is empty, delete it
      const remainingUsers = await prisma.chatUser.count({
        where: { chatId }
      });
      
      if (remainingUsers === 0) {
        await prisma.chat.delete({ where: { id: chatId } });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

/**
 * @route GET /api/chats/unread/count
 * @desc Get total unread count
 */
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get all message IDs that user has read
    const readMessages = await prisma.messageRead.findMany({
      where: { userId },
      select: { messageId: true }
    });
    
    const readMessageIds = readMessages.map(r => r.messageId);
    
    // Count unread messages
    const unreadCount = await prisma.message.count({
      where: {
        chat: {
          users: { some: { userId } }
        },
        senderId: { not: userId },
        isDeletedForUsers: false,
        id: { notIn: readMessageIds }
      }
    });
    
    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;