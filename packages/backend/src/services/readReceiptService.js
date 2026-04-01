import { prisma } from '../server.js';

/**
 * Mark a message as read by a user
 */
export async function markMessageAsRead(messageId, userId) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, chatId: true }
  });
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Don't mark own messages as read
  if (message.senderId === userId) {
    return null;
  }
  
  const readReceipt = await prisma.messageRead.upsert({
    where: {
      messageId_userId: {
        messageId,
        userId
      }
    },
    update: {
      readAt: new Date()
    },
    create: {
      messageId,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true
        }
      }
    }
  });
  
  return readReceipt;
}

/**
 * Mark all messages in a chat as read
 */
export async function markChatAsRead(chatId, userId) {
  // Get all unread messages in chat (not sent by user, not already read)
  const unreadMessages = await prisma.message.findMany({
    where: {
      chatId,
      senderId: { not: userId },
      isDeletedForUsers: false,
      readBy: {
        none: { userId }
      }
    },
    select: { id: true }
  });
  
  if (unreadMessages.length === 0) return 0;
  
  // Create read receipts for all unread messages
  const readReceipts = await prisma.messageRead.createMany({
    data: unreadMessages.map(msg => ({
      messageId: msg.id,
      userId,
      readAt: new Date()
    })),
    skipDuplicates: true
  });
  
  return readReceipts.count;
}

/**
 * Get read receipts for a message
 */
export async function getMessageReadReceipts(messageId, currentUserId) {
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
    throw new Error('Message not found');
  }
  
  // Check if user is in chat
  const isInChat = message.chat.users.some(u => u.userId === currentUserId);
  if (!isInChat) {
    throw new Error('Not authorized');
  }
  
  const readBy = message.readBy.map(r => ({
    userId: r.userId,
    username: r.user.username,
    avatarUrl: r.user.avatarUrl,
    readAt: r.readAt
  }));
  
  const totalMembers = message.chat.users.length;
  const readCount = readBy.length;
  
  return {
    readBy,
    readCount,
    totalMembers,
    isFullyRead: readCount === totalMembers - 1 // Subtract sender
  };
}

/**
 * Get delivery status for a message (sent vs delivered vs read)
 */
export async function getMessageStatus(messageId, currentUserId) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      chat: {
        include: {
          users: {
            include: {
              user: {
                select: { id: true, username: true }
              }
            }
          }
        }
      },
      readBy: true
    }
  });
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  const isSender = message.senderId === currentUserId;
  if (!isSender) {
    throw new Error('Only sender can view delivery status');
  }
  
  const otherUsers = message.chat.users.filter(u => u.userId !== message.senderId);
  const readUserIds = new Set(message.readBy.map(r => r.userId));
  
  const statuses = otherUsers.map(user => ({
    userId: user.userId,
    username: user.user.username,
    status: readUserIds.has(user.userId) ? 'read' : 'delivered'
  }));
  
  const allRead = statuses.every(s => s.status === 'read');
  const deliveredCount = statuses.filter(s => s.status === 'delivered').length;
  const readCount = statuses.filter(s => s.status === 'read').length;
  
  return {
    messageId,
    status: allRead ? 'read' : (deliveredCount > 0 ? 'delivered' : 'sent'),
    deliveredCount,
    readCount,
    totalRecipients: otherUsers.length,
    recipients: statuses
  };
}

/**
 * Check if user has read a message
 */
export async function hasUserReadMessage(messageId, userId) {
  const readReceipt = await prisma.messageRead.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId
      }
    }
  });
  
  return !!readReceipt;
}

/**
 * Get last read message in chat for a user
 */
export async function getLastReadMessage(chatId, userId) {
  const lastRead = await prisma.messageRead.findFirst({
    where: {
      userId,
      message: {
        chatId
      }
    },
    orderBy: {
      readAt: 'desc'
    },
    include: {
      message: true
    }
  });
  
  return lastRead?.message || null;
}

/**
 * Get unread messages count for a user
 */
export async function getUnreadCount(userId, chatId = null) {
  const where = {
    senderId: { not: userId },
    isDeletedForUsers: false,
    readBy: {
      none: { userId }
    }
  };
  
  if (chatId) {
    where.chatId = chatId;
  } else {
    where.chat = {
      users: { some: { userId } }
    };
  }
  
  return await prisma.message.count({ where });
}

/**
 * Get unread counts per chat
 */
export async function getUnreadCountsPerChat(userId) {
  // Get all chats the user is in
  const userChats = await prisma.chatUser.findMany({
    where: { userId },
    select: { chatId: true }
  });
  
  const chatIds = userChats.map(uc => uc.chatId);
  
  if (chatIds.length === 0) return {};
  
  // Get read message IDs
  const readMessages = await prisma.messageRead.findMany({
    where: { userId },
    select: { messageId: true }
  });
  
  const readMessageIds = readMessages.map(r => r.messageId);
  
  // Count unread messages per chat
  const unreadCounts = await prisma.message.groupBy({
    by: ['chatId'],
    where: {
      chatId: { in: chatIds },
      senderId: { not: userId },
      isDeletedForUsers: false,
      id: { notIn: readMessageIds }
    },
    _count: {
      id: true
    }
  });
  
  const result = {};
  unreadCounts.forEach(count => {
    result[count.chatId] = count._count.id;
  });
  
  return result;
}