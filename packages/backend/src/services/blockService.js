import { prisma } from '../server.js';

/**
 * Block a user
 */
export async function blockUser(blockerId, blockedId) {
  if (blockerId === blockedId) {
    throw new Error('Cannot block yourself');
  }
  
  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true, isBanned: true }
  });
  
  if (!targetUser || targetUser.isBanned) {
    throw new Error('User not found or banned');
  }
  
  // Check if already blocked
  const existing = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId,
        blockedId
      }
    }
  });
  
  if (existing) {
    throw new Error('User already blocked');
  }
  
  // Create block
  const block = await prisma.userBlock.create({
    data: {
      blockerId,
      blockedId
    }
  });
  
  // Delete any existing private chat
  const chat = await prisma.chat.findFirst({
    where: {
      type: 'PRIVATE',
      users: {
        every: {
          userId: { in: [blockerId, blockedId] }
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
        userId: { in: [blockerId, blockedId] }
      }
    });
    
    // Check if chat is empty
    const remaining = await prisma.chatUser.count({
      where: { chatId: chat.id }
    });
    
    if (remaining === 0) {
      await prisma.chat.delete({ where: { id: chat.id } });
    }
  }
  
  return block;
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerId, blockedId) {
  const block = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId,
        blockedId
      }
    }
  });
  
  if (!block) {
    throw new Error('User not blocked');
  }
  
  await prisma.userBlock.delete({
    where: {
      blockerId_blockedId: {
        blockerId,
        blockedId
      }
    }
  });
  
  return true;
}

/**
 * Check if user is blocked by another user
 */
export async function isBlocked(userId, targetId) {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: targetId },
        { blockerId: targetId, blockedId: userId }
      ]
    }
  });
  
  return !!block;
}

/**
 * Get blocked users for a user
 */
export async function getBlockedUsers(userId) {
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: userId },
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
  
  return blocks.map(block => ({
    id: block.blocked.id,
    username: block.blocked.username,
    avatarUrl: block.blocked.avatarUrl,
    bio: block.blocked.bio,
    blockedAt: block.createdAt
  }));
}

/**
 * Get users who blocked the current user
 */
export async function getBlockers(userId) {
  const blocks = await prisma.userBlock.findMany({
    where: { blockedId: userId },
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
  
  return blocks.map(block => ({
    id: block.blocker.id,
    username: block.blocker.username,
    avatarUrl: block.blocker.avatarUrl,
    blockedAt: block.createdAt
  }));
}

/**
 * Filter users to exclude blocked ones
 */
export async function filterBlockedUsers(userId, userIds) {
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [
        { blockerId: userId, blockedId: { in: userIds } },
        { blockedId: userId, blockerId: { in: userIds } }
      ]
    }
  });
  
  const blockedIds = new Set();
  blocks.forEach(block => {
    blockedIds.add(block.blockerId);
    blockedIds.add(block.blockedId);
  });
  
  return userIds.filter(id => !blockedIds.has(id) && id !== userId);
}

/**
 * Check if users can communicate (no blocks between them)
 */
export async function canCommunicate(userId1, userId2) {
  const isBlocked = await isBlocked(userId1, userId2);
  return !isBlocked;
}