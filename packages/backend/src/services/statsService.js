import { prisma } from '../server.js';

/**
 * Get system statistics for admin dashboard
 */
export async function getSystemStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalMessages,
    totalGroups,
    totalChats,
    onlineUsers,
    messagesToday,
    newUsersToday,
    activeUsersToday,
    messagesThisWeek,
    newUsersThisWeek,
    messagesThisMonth,
    newUsersThisMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.message.count(),
    prisma.group.count(),
    prisma.chat.count(),
    prisma.user.count({
      where: {
        lastSeen: { gte: new Date(now.getTime() - 5 * 60 * 1000) }
      }
    }),
    prisma.message.count({
      where: { createdAt: { gte: today } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: today } }
    }),
    prisma.user.count({
      where: { lastSeen: { gte: today } }
    }),
    prisma.message.count({
      where: { createdAt: { gte: weekAgo } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: weekAgo } }
    }),
    prisma.message.count({
      where: { createdAt: { gte: monthAgo } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: monthAgo } }
    })
  ]);

  return {
    totalUsers,
    totalMessages,
    totalGroups,
    totalChats,
    onlineUsers,
    messagesToday,
    newUsersToday,
    activeUsersToday,
    messagesThisWeek,
    newUsersThisWeek,
    messagesThisMonth,
    newUsersThisMonth
  };
}

/**
 * Get daily statistics for charts
 */
export async function getDailyStats(days = 30) {
  const stats = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const [messages, newUsers, activeUsers] = await Promise.all([
      prisma.message.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      }),
      prisma.user.count({
        where: {
          lastSeen: {
            gte: date,
            lt: nextDate
          }
        }
      })
    ]);
    
    stats.push({
      date: date.toISOString().split('T')[0],
      messages,
      newUsers,
      activeUsers
    });
  }
  
  return stats;
}

/**
 * Get hourly activity for today
 */
export async function getHourlyActivity() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const hourlyStats = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const start = new Date(today);
    start.setHours(hour, 0, 0, 0);
    
    const end = new Date(today);
    end.setHours(hour + 1, 0, 0, 0);
    
    const messages = await prisma.message.count({
      where: {
        createdAt: {
          gte: start,
          lt: end
        }
      }
    });
    
    hourlyStats.push({
      hour,
      messages
    });
  }
  
  return hourlyStats;
}

/**
 * Get top users by activity
 */
export async function getTopUsers(limit = 10) {
  const topUsers = await prisma.message.groupBy({
    by: ['senderId'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: limit
  });
  
  // Get user details
  const usersWithDetails = await Promise.all(
    topUsers.map(async (item) => {
      const user = await prisma.user.findUnique({
        where: { id: item.senderId },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          createdAt: true
        }
      });
      
      return {
        ...user,
        messageCount: item._count.id
      };
    })
  );
  
  return usersWithDetails;
}

/**
 * Get top chats by activity
 */
export async function getTopChats(limit = 10) {
  const topChats = await prisma.message.groupBy({
    by: ['chatId'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: limit
  });
  
  // Get chat details
  const chatsWithDetails = await Promise.all(
    topChats.map(async (item) => {
      const chat = await prisma.chat.findUnique({
        where: { id: item.chatId },
        include: {
          group: true,
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            },
            take: 5
          }
        }
      });
      
      const name = chat.type === 'GROUP'
        ? chat.group?.name
        : chat.users.map(u => u.user.username).join(', ');
      
      return {
        id: chat.id,
        type: chat.type,
        name,
        messageCount: item._count.id,
        memberCount: chat.users.length
      };
    })
  );
  
  return chatsWithDetails;
}

/**
 * Get file storage statistics
 */
export async function getFileStats() {
  // Get counts of messages with files
  const [images, files, voice] = await Promise.all([
    prisma.message.count({
      where: { fileType: 'image' }
    }),
    prisma.message.count({
      where: { fileType: 'file' }
    }),
    prisma.message.count({
      where: { fileType: 'voice' }
    })
  ]);
  
  // Get top file senders
  const topSenders = await prisma.message.groupBy({
    by: ['senderId'],
    where: {
      fileUrl: { not: null }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  });
  
  const sendersWithDetails = await Promise.all(
    topSenders.map(async (item) => {
      const user = await prisma.user.findUnique({
        where: { id: item.senderId },
        select: { username: true }
      });
      
      return {
        userId: item.senderId,
        username: user?.username || 'Unknown',
        fileCount: item._count.id
      };
    })
  );
  
  return {
    totalFiles: images + files + voice,
    byType: { images, files, voice },
    topSenders: sendersWithDetails
  };
}

/**
 * Get user growth data
 */
export async function getUserGrowth(days = 30) {
  const growth = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });
    
    const totalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: nextDate
        }
      }
    });
    
    growth.push({
      date: date.toISOString().split('T')[0],
      newUsers,
      totalUsers
    });
  }
  
  return growth;
}

/**
 * Get message trends
 */
export async function getMessageTrends() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [lastWeek, previousWeek, lastMonth, previousMonth] = await Promise.all([
    prisma.message.count({
      where: { createdAt: { gte: weekAgo } }
    }),
    prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: weekAgo
        }
      }
    }),
    prisma.message.count({
      where: { createdAt: { gte: monthAgo } }
    }),
    prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: monthAgo
        }
      }
    })
  ]);
  
  const weekChange = previousWeek === 0 
    ? 100 
    : ((lastWeek - previousWeek) / previousWeek) * 100;
  
  const monthChange = previousMonth === 0
    ? 100
    : ((lastMonth - previousMonth) / previousMonth) * 100;
  
  return {
    lastWeek,
    previousWeek,
    weekChange: Math.round(weekChange),
    lastMonth,
    previousMonth,
    monthChange: Math.round(monthChange)
  };
}

/**
 * Get admin activity stats
 */
export async function getAdminStats() {
  const [totalActions, actionsByType, recentActions] = await Promise.all([
    prisma.adminLog.count(),
    prisma.adminLog.groupBy({
      by: ['action'],
      _count: true
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        admin: {
          select: { username: true }
        }
      }
    })
  ]);
  
  const actionCounts = {};
  actionsByType.forEach(item => {
    actionCounts[item.action] = item._count;
  });
  
  return {
    totalActions,
    actionCounts,
    recentActions
  };
}