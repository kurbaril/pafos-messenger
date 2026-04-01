import { prisma } from '../server.js';

/**
 * Delete message for everyone (soft delete with logging)
 */
export async function deleteMessageForEveryone(messageId, userId, userRole) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: { id: true, username: true }
      },
      chat: true
    }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check authorization
  if (message.senderId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to delete this message');
  }

  // Save deleted message log for admin
  await prisma.deletedMessageLog.create({
    data: {
      messageId,
      deletedBy: userId,
      messageData: {
        content: message.content,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileType: message.fileType,
        fileSize: message.fileSize,
        duration: message.duration,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderUsername: message.sender.username,
        chatId: message.chatId
      }
    }
  });

  // Soft delete the message
  const deleted = await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeletedForUsers: true,
      deletedAt: new Date(),
      deletedBy: userId
    }
  });

  return deleted;
}

/**
 * Restore deleted message (admin only)
 */
export async function restoreMessage(messageId, adminId) {
  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  if (!message.isDeletedForUsers) {
    throw new Error('Message is not deleted');
  }

  const restored = await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeletedForUsers: false,
      deletedAt: null,
      deletedBy: null
    }
  });

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId,
      action: 'RESTORE_MESSAGE',
      targetId: messageId,
      metadata: { originalDeletedBy: message.deletedBy }
    }
  });

  return restored;
}

/**
 * Get deleted messages log (admin only)
 */
export async function getDeletedMessagesLog(limit = 100, offset = 0) {
  const [logs, total] = await Promise.all([
    prisma.deletedMessageLog.findMany({
      orderBy: { deletedAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.deletedMessageLog.count()
  ]);

  // Enrich logs with user info
  const enrichedLogs = await Promise.all(logs.map(async log => {
    const [deleter, originalSender] = await Promise.all([
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
      deleter: deleter || { id: log.deletedBy, username: 'Unknown' },
      originalSender: originalSender || { id: log.messageData.senderId, username: 'Unknown' }
    };
  }));

  return { logs: enrichedLogs, total };
}

/**
 * Clean old deleted messages logs (keep for 30 days)
 */
export async function cleanOldDeletedLogs(daysToKeep = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);

  const deleted = await prisma.deletedMessageLog.deleteMany({
    where: {
      deletedAt: {
        lt: cutoff
      }
    }
  });

  return deleted.count;
}

/**
 * Get deletion stats
 */
export async function getDeletionStats() {
  const [totalDeleted, last24h, byUser] = await Promise.all([
    prisma.deletedMessageLog.count(),
    prisma.deletedMessageLog.count({
      where: {
        deletedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.deletedMessageLog.groupBy({
      by: ['deletedBy'],
      _count: true,
      orderBy: { _count: { deletedBy: 'desc' } },
      take: 10
    })
  ]);

  // Get usernames for top deleters
  const topDeleters = await Promise.all(
    byUser.map(async item => {
      const user = await prisma.user.findUnique({
        where: { id: item.deletedBy },
        select: { username: true }
      });
      return {
        userId: item.deletedBy,
        username: user?.username || 'Unknown',
        count: item._count
      };
    })
  );

  return {
    totalDeleted,
    deletedLast24h: last24h,
    topDeleters
  };
}

/**
 * Permanently delete old soft-deleted messages (cleanup)
 * Removes messages that were deleted more than X days ago
 */
export async function cleanupOldDeletedMessages(daysToKeep = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);

  // Find messages that have been deleted for a long time
  const oldDeletedMessages = await prisma.message.findMany({
    where: {
      isDeletedForUsers: true,
      deletedAt: {
        lt: cutoff
      }
    },
    select: { id: true }
  });

  if (oldDeletedMessages.length === 0) return 0;

  // Permanently delete them
  const result = await prisma.message.deleteMany({
    where: {
      id: {
        in: oldDeletedMessages.map(m => m.id)
      }
    }
  });

  return result.count;
}