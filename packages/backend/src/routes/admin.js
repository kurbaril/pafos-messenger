import express from 'express';
import { prisma } from '../server.js';
import { isAuthenticated, isAdmin, getUserById } from '../auth.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(isAuthenticated, isAdmin);

/**
 * @route GET /api/admin/stats
 * @desc Get system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalMessages,
      totalGroups,
      totalChats,
      totalFiles,
      onlineCount,
      messagesToday,
      messagesWeek,
      activeUsersToday,
      activeUsersWeek,
      storageStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.group.count(),
      prisma.chat.count(),
      prisma.message.count({ where: { fileUrl: { not: null } } }),
      prisma.user.count({
        where: {
          lastSeen: { gte: new Date(Date.now() - 5 * 60 * 1000) }
        }
      }),
      prisma.message.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.message.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.user.count({
        where: {
          lastSeen: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.user.count({
        where: {
          lastSeen: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      // Approximate storage usage (simplified)
      { images: 0, files: 0, voice: 0 }
    ]);
    
    // Get messages per day for last 7 days
    const messagesPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await prisma.message.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      messagesPerDay.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }
    
    // Get users per day for last 7 days
    const usersPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      usersPerDay.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }
    
    res.json({
      totalUsers,
      totalMessages,
      totalGroups,
      totalChats,
      totalFiles,
      onlineUsers: onlineCount,
      messagesToday,
      messagesWeek,
      activeUsersToday,
      activeUsersWeek,
      messagesPerDay,
      usersPerDay,
      storage: storageStats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * @route GET /api/admin/users
 * @desc Get all users with details
 */
router.get('/users', async (req, res) => {
  try {
    const { limit = 100, offset = 0, search } = req.query;
    
    const where = search ? {
      username: { contains: search, mode: 'insensitive' }
    } : {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          role: true,
          isBanned: true,
          banReason: true,
          lastSeen: true,
          createdAt: true,
          _count: {
            select: {
              sentMessages: true,
              groups: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({ users, total });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * @route GET /api/admin/users/:userId
 * @desc Get detailed user info
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            chat: {
              include: {
                group: true
              }
            }
          }
        },
        groups: {
          include: {
            group: true
          }
        },
        chats: {
          include: {
            chat: {
              include: {
                users: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true
                      }
                    }
                  }
                }
              }
            }
          },
          take: 10
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

/**
 * @route POST /api/admin/users/:userId/ban
 * @desc Ban user
 */
router.post('/users/:userId/ban', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.session.userId;
    
    if (userId === adminId) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason || 'No reason provided'
      }
    });
    
    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'BAN_USER',
        targetId: userId,
        metadata: { reason }
      }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

/**
 * @route POST /api/admin/users/:userId/unban
 * @desc Unban user
 */
router.post('/users/:userId/unban', async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.session.userId;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'UNBAN_USER',
        targetId: userId
      }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

/**
 * @route GET /api/admin/chats
 * @desc Get all chats
 */
router.get('/chats', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const chats = await prisma.chat.findMany({
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
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    const total = await prisma.chat.count();
    
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      type: chat.type,
      name: chat.type === 'PRIVATE'
        ? chat.users.map(u => u.user.username).join(', ')
        : chat.group?.name || 'Group',
      memberCount: chat.users.length,
      messageCount: chat._count.messages,
      lastMessageAt: chat.updatedAt,
      lastMessage: chat.messages[0]?.content,
      createdAt: chat.createdAt
    }));
    
    res.json({ chats: formattedChats, total });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ error: 'Failed to get chats' });
  }
});

/**
 * @route GET /api/admin/chats/:chatId/messages
 * @desc Get all messages in a chat (admin view)
 */
router.get('/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
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
                  username: true
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
                  username: true
                }
              }
            }
          },
          editHistory: {
            orderBy: { editedAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.message.count({ where: { chatId } })
    ]);
    
    res.json({
      messages: messages.reverse(),
      total,
      hasMore: total > parseInt(offset) + parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * @route GET /api/admin/deleted-messages
 * @desc Get deleted messages log
 */
router.get('/deleted-messages', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const [logs, total] = await Promise.all([
      prisma.deletedMessageLog.findMany({
        orderBy: { deletedAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.deletedMessageLog.count()
    ]);
    
    // Get user info for each log
    const logsWithUsers = await Promise.all(logs.map(async log => {
      const [deleter, messageSender] = await Promise.all([
        prisma.user.findUnique({
          where: { id: log.deletedBy },
          select: { id: true, username: true }
        }),
        prisma.user.findUnique({
          where: { id: log.messageData.senderId },
          select: { id: true, username: true }
        })
      ]);
      
      return {
        ...log,
        deleter,
        messageSender
      };
    }));
    
    res.json({ logs: logsWithUsers, total });
  } catch (error) {
    console.error('Error getting deleted messages:', error);
    res.status(500).json({ error: 'Failed to get deleted messages' });
  }
});

/**
 * @route POST /api/admin/deleted-messages/:logId/restore
 * @desc Restore a deleted message
 */
router.post('/deleted-messages/:logId/restore', async (req, res) => {
  try {
    const { logId } = req.params;
    const adminId = req.session.userId;
    
    const log = await prisma.deletedMessageLog.findUnique({
      where: { id: logId }
    });
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    // Restore message
    const restored = await prisma.message.update({
      where: { id: log.messageId },
      data: {
        isDeletedForUsers: false,
        deletedAt: null,
        deletedBy: null
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'RESTORE_MESSAGE',
        targetId: log.messageId,
        metadata: { logId }
      }
    });
    
    res.json({ success: true, message: restored });
  } catch (error) {
    console.error('Error restoring message:', error);
    res.status(500).json({ error: 'Failed to restore message' });
  }
});

/**
 * @route GET /api/admin/banned-ips
 * @desc Get list of banned IPs
 */
router.get('/banned-ips', async (req, res) => {
  try {
    const bannedIPs = await prisma.bannedIP.findMany({
      orderBy: { bannedAt: 'desc' }
    });
    
    res.json(bannedIPs);
  } catch (error) {
    console.error('Error getting banned IPs:', error);
    res.status(500).json({ error: 'Failed to get banned IPs' });
  }
});

/**
 * @route DELETE /api/admin/banned-ips/:ip
 * @desc Unban IP
 */
router.delete('/banned-ips/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const adminId = req.session.userId;
    
    await prisma.bannedIP.delete({ where: { ip } });
    
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'UNBAN_IP',
        targetId: ip
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unbanning IP:', error);
    res.status(500).json({ error: 'Failed to unban IP' });
  }
});

/**
 * @route GET /api/admin/logs
 * @desc Get admin action logs
 */
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0, action } = req.query;
    
    const where = action ? { action } : {};
    
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.adminLog.count({ where })
    ]);
    
    // Get admin usernames
    const logsWithAdmins = await Promise.all(logs.map(async log => {
      const admin = await prisma.user.findUnique({
        where: { id: log.adminId },
        select: { username: true }
      });
      
      return {
        ...log,
        adminUsername: admin?.username
      };
    }));
    
    res.json({ logs: logsWithAdmins, total });
  } catch (error) {
    console.error('Error getting admin logs:', error);
    res.status(500).json({ error: 'Failed to get admin logs' });
  }
});

export default router;