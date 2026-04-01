import { prisma } from '../server.js';

/**
 * Parse mentions from message content
 * Finds all @username patterns in text
 */
export function parseMentions(content) {
  if (!content) return [];
  
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      username: match[1],
      position: match.index,
      length: match[0].length
    });
  }
  
  return mentions;
}

/**
 * Process mentions in a message
 * Creates mention records and notifications for mentioned users
 */
export async function processMentions(messageId, chatId, senderId, content) {
  const mentions = parseMentions(content);
  
  if (mentions.length === 0) return [];
  
  // Get mentioned users
  const usernames = mentions.map(m => m.username);
  const mentionedUsers = await prisma.user.findMany({
    where: {
      username: { in: usernames },
      isBanned: false
    },
    select: {
      id: true,
      username: true
    }
  });
  
  if (mentionedUsers.length === 0) return [];
  
  // Get chat participants to filter only those in the chat
  const chatUsers = await prisma.chatUser.findMany({
    where: { chatId },
    select: { userId: true }
  });
  
  const chatUserIds = new Set(chatUsers.map(cu => cu.userId));
  
  // Filter only users who are in the chat
  const validMentions = mentionedUsers.filter(user => 
    chatUserIds.has(user.id) && user.id !== senderId
  );
  
  if (validMentions.length === 0) return [];
  
  // Create mention records
  const mentionRecords = [];
  for (const user of validMentions) {
    const mention = await prisma.mention.create({
      data: {
        messageId,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
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
                group: true
              }
            }
          }
        }
      }
    });
    
    mentionRecords.push(mention);
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'mention',
        content: `${mention.message.sender.username} mentioned you: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        data: {
          messageId,
          chatId,
          senderId,
          chatName: mention.message.chat.group?.name || 'Private Chat'
        }
      }
    });
  }
  
  return mentionRecords;
}

/**
 * Get mentions for a user
 */
export async function getUserMentions(userId, limit = 50, offset = 0, unreadOnly = false) {
  const where = {
    userId,
    ...(unreadOnly && { isRead: false })
  };
  
  const [mentions, total] = await Promise.all([
    prisma.mention.findMany({
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
                group: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.mention.count({ where })
  ]);
  
  const unreadCount = await prisma.mention.count({
    where: { userId, isRead: false }
  });
  
  return {
    mentions,
    total,
    unreadCount,
    hasMore: total > offset + limit
  };
}

/**
 * Mark mention as read
 */
export async function markMentionAsRead(mentionId, userId) {
  const mention = await prisma.mention.findUnique({
    where: { id: mentionId }
  });
  
  if (!mention || mention.userId !== userId) {
    throw new Error('Mention not found');
  }
  
  await prisma.mention.update({
    where: { id: mentionId },
    data: { isRead: true }
  });
  
  return true;
}

/**
 * Mark all mentions as read for a user
 */
export async function markAllMentionsAsRead(userId) {
  await prisma.mention.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
  
  return true;
}

/**
 * Get unread mentions count
 */
export async function getUnreadMentionsCount(userId) {
  return await prisma.mention.count({
    where: { userId, isRead: false }
  });
}

/**
 * Get mentions in a specific chat
 */
export async function getChatMentions(chatId, userId, limit = 50) {
  const mentions = await prisma.mention.findMany({
    where: {
      userId,
      message: {
        chatId
      }
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
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  
  return mentions;
}

/**
 * Delete mentions for a message (when message is deleted)
 */
export async function deleteMentionsForMessage(messageId) {
  await prisma.mention.deleteMany({
    where: { messageId }
  });
}

/**
 * Get mention statistics for admin
 */
export async function getMentionStats() {
  const [totalMentions, mentionsLast24h, topMentioned] = await Promise.all([
    prisma.mention.count(),
    prisma.mention.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.mention.groupBy({
      by: ['userId'],
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    })
  ]);
  
  // Get usernames for top mentioned
  const topMentionedUsers = await Promise.all(
    topMentioned.map(async item => {
      const user = await prisma.user.findUnique({
        where: { id: item.userId },
        select: { username: true }
      });
      return {
        userId: item.userId,
        username: user?.username || 'Unknown',
        count: item._count
      };
    })
  );
  
  return {
    totalMentions,
    mentionsLast24h,
    topMentioned: topMentionedUsers
  };
}

/**
 * Highlight mentions in text (for frontend)
 * Returns HTML with highlighted mentions
 */
export function highlightMentions(text, currentUserId, mentionedUsers = []) {
  if (!text) return text;
  
  const mentionedUsernames = mentionedUsers.map(u => u.username);
  
  return text.replace(/@(\w+)/g, (match, username) => {
    const isCurrentUser = username === currentUserId;
    const isMentioned = mentionedUsernames.includes(username);
    
    if (isCurrentUser) {
      return `<span class="mention mention-self">@${username}</span>`;
    } else if (isMentioned) {
      return `<span class="mention mention-other">@${username}</span>`;
    }
    return match;
  });
}