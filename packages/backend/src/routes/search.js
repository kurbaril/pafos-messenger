import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated } from '../auth.js';

const router = express.Router();

/**
 * @route GET /api/search/messages
 * @desc Search messages across user's chats
 */
router.get('/messages', isAuthenticated, async (req, res) => {
  try {
    const { q, chatId, limit = 50, offset = 0 } = req.query;
    const userId = req.session.userId;
    
    if (!q || q.length < 2) {
      return res.json({ messages: [], total: 0 });
    }
    
    // Get user's chats
    const userChats = await prisma.chatUser.findMany({
      where: { userId },
      select: { chatId: true }
    });
    
    const chatIds = userChats.map(c => c.chatId);
    
    if (chatIds.length === 0) {
      return res.json({ messages: [], total: 0 });
    }
    
    // Filter by specific chat if provided
    const whereChatId = chatId ? { chatId, chatId: { in: chatIds } } : { chatId: { in: chatIds } };
    
    // Search messages
    const messages = await prisma.message.findMany({
      where: {
        ...whereChatId,
        content: {
          contains: q,
          mode: 'insensitive'
        },
        isDeletedForUsers: false
      },
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
        },
        reactions: {
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    const total = await prisma.message.count({
      where: {
        ...whereChatId,
        content: {
          contains: q,
          mode: 'insensitive'
        },
        isDeletedForUsers: false
      }
    });
    
    // Format results
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: msg.sender,
      chat: {
        id: msg.chat.id,
        name: msg.chat.group?.name || msg.chat.users[0]?.user?.username || 'Chat',
        type: msg.chat.type
      },
      reactionsCount: msg.reactions.length
    }));
    
    res.json({
      messages: formattedMessages,
      total,
      hasMore: total > parseInt(offset) + parseInt(limit)
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

/**
 * @route GET /api/search/chats
 * @desc Search user's chats by name
 */
router.get('/chats', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.session.userId;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const userChats = await prisma.chat.findMany({
      where: {
        users: { some: { userId } },
        OR: [
          // Search group names
          {
            group: {
              name: {
                contains: q,
                mode: 'insensitive'
              }
            }
          },
          // Search private chat usernames
          {
            type: 'PRIVATE',
            users: {
              some: {
                user: {
                  username: {
                    contains: q,
                    mode: 'insensitive'
                  }
                },
                NOT: { userId }
              }
            }
          }
        ]
      },
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
        },
        group: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      take: 20
    });
    
    const formattedChats = userChats.map(chat => {
      const otherUser = chat.type === 'PRIVATE'
        ? chat.users.find(u => u.userId !== userId)?.user
        : null;
      
      return {
        id: chat.id,
        type: chat.type,
        name: chat.type === 'PRIVATE' ? otherUser?.username : chat.group?.name,
        avatar: chat.type === 'PRIVATE' ? otherUser?.avatarUrl : chat.group?.avatarUrl,
        lastMessage: chat.messages[0]?.content,
        updatedAt: chat.updatedAt
      };
    });
    
    res.json(formattedChats);
  } catch (error) {
    console.error('Error searching chats:', error);
    res.status(500).json({ error: 'Failed to search chats' });
  }
});

/**
 * @route GET /api/search/users
 * @desc Search users (global)
 */
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.session.userId;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    // Get blocked users
    const blocked = await prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true }
    });
    
    const blockedIds = blocked.map(b => b.blockedId);
    
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive'
        },
        id: { not: userId },
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
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * @route GET /api/search/global
 * @desc Global search (messages + chats + users)
 */
router.get('/global', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.session.userId;
    
    if (!q || q.length < 2) {
      return res.json({ messages: [], chats: [], users: [] });
    }
    
    const [messages, chats, users] = await Promise.all([
      // Search messages
      (async () => {
        const userChats = await prisma.chatUser.findMany({
          where: { userId },
          select: { chatId: true }
        });
        
        const chatIds = userChats.map(c => c.chatId);
        
        if (chatIds.length === 0) return [];
        
        return await prisma.message.findMany({
          where: {
            chatId: { in: chatIds },
            content: {
              contains: q,
              mode: 'insensitive'
            },
            isDeletedForUsers: false
          },
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
                group: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });
      })(),
      
      // Search chats
      (async () => {
        return await prisma.chat.findMany({
          where: {
            users: { some: { userId } },
            OR: [
              { group: { name: { contains: q, mode: 'insensitive' } } },
              {
                type: 'PRIVATE',
                users: {
                  some: {
                    user: {
                      username: { contains: q, mode: 'insensitive' }
                    },
                    NOT: { userId }
                  }
                }
              }
            ]
          },
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
            },
            group: true
          },
          take: 10
        });
      })(),
      
      // Search users
      (async () => {
        const blocked = await prisma.userBlock.findMany({
          where: { blockerId: userId },
          select: { blockedId: true }
        });
        
        const blockedIds = blocked.map(b => b.blockedId);
        
        return await prisma.user.findMany({
          where: {
            username: {
              contains: q,
              mode: 'insensitive'
            },
            id: { not: userId },
            isBanned: false,
            ...(blockedIds.length > 0 && { id: { notIn: blockedIds } })
          },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true
          },
          take: 10
        });
      })()
    ]);
    
    // Format results
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: msg.sender,
      chat: {
        id: msg.chat.id,
        name: msg.chat.group?.name || 'Private Chat',
        type: msg.chat.type
      }
    }));
    
    const formattedChats = chats.map(chat => {
      const otherUser = chat.type === 'PRIVATE'
        ? chat.users.find(u => u.userId !== userId)?.user
        : null;
      
      return {
        id: chat.id,
        type: chat.type,
        name: chat.type === 'PRIVATE' ? otherUser?.username : chat.group?.name,
        avatar: chat.type === 'PRIVATE' ? otherUser?.avatarUrl : chat.group?.avatarUrl
      };
    });
    
    res.json({
      messages: formattedMessages,
      chats: formattedChats,
      users
    });
  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;