import { prisma } from '../server.js';

// Store online users with their socket IDs
const onlineUsers = new Map(); // userId -> { socketId, lastActive, status }

// Check interval for stale connections (5 minutes)
const STALE_TIMEOUT = 5 * 60 * 1000;

/**
 * Update user presence
 */
export async function updatePresence(userId, socketId, status = 'online') {
  const now = new Date();
  
  onlineUsers.set(userId, {
    socketId,
    lastActive: now,
    status
  });
  
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeen: now }
  });
  
  await prisma.userPresence.upsert({
    where: { userId },
    update: {
      status,
      lastSeen: now
    },
    create: {
      userId,
      status,
      lastSeen: now
    }
  });
}

/**
 * Remove user presence (offline)
 */
export async function removePresence(userId) {
  onlineUsers.delete(userId);
  
  await prisma.userPresence.update({
    where: { userId },
    data: {
      status: 'offline',
      lastSeen: new Date()
    }
  });
  
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeen: new Date() }
  });
}

/**
 * Get user presence status
 */
export async function getUserPresence(userId) {
  // Check online users first
  const online = onlineUsers.get(userId);
  if (online && (Date.now() - online.lastActive.getTime()) < STALE_TIMEOUT) {
    return {
      status: online.status,
      lastSeen: online.lastActive,
      isOnline: true
    };
  }
  
  // Check database
  const presence = await prisma.userPresence.findUnique({
    where: { userId }
  });
  
  if (!presence) {
    return {
      status: 'offline',
      lastSeen: null,
      isOnline: false
    };
  }
  
  const lastSeen = presence.lastSeen;
  const isOnline = presence.status === 'online' && 
    (Date.now() - lastSeen.getTime()) < STALE_TIMEOUT;
  
  return {
    status: isOnline ? 'online' : presence.status,
    lastSeen,
    isOnline
  };
}

/**
 * Get multiple users presence
 */
export async function getUsersPresence(userIds) {
  const results = {};
  
  for (const userId of userIds) {
    results[userId] = await getUserPresence(userId);
  }
  
  return results;
}

/**
 * Get formatted last seen string
 */
export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'never';
  
  const now = new Date();
  const diff = now - lastSeen;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return lastSeen.toLocaleDateString();
  }
}

/**
 * Check if user is online
 */
export function isUserOnline(userId) {
  const user = onlineUsers.get(userId);
  if (!user) return false;
  
  return (Date.now() - user.lastActive.getTime()) < STALE_TIMEOUT;
}

/**
 * Get all online users
 */
export function getOnlineUsers() {
  const online = [];
  const now = Date.now();
  
  for (const [userId, data] of onlineUsers.entries()) {
    if ((now - data.lastActive.getTime()) < STALE_TIMEOUT) {
      online.push({
        userId,
        status: data.status,
        lastActive: data.lastActive
      });
    }
  }
  
  return online;
}

/**
 * Update user activity (ping)
 */
export async function updateUserActivity(userId) {
  const user = onlineUsers.get(userId);
  if (user) {
    user.lastActive = new Date();
    onlineUsers.set(userId, user);
  }
}

/**
 * Set user status (online, away, busy, offline)
 */
export async function setUserStatus(userId, status) {
  const user = onlineUsers.get(userId);
  if (user) {
    user.status = status;
    onlineUsers.set(userId, user);
  }
  
  await prisma.userPresence.upsert({
    where: { userId },
    update: { status },
    create: {
      userId,
      status,
      lastSeen: new Date()
    }
  });
}

/**
 * Clean stale connections (run periodically)
 */
export async function cleanStaleConnections() {
  const now = Date.now();
  const staleUsers = [];
  
  for (const [userId, data] of onlineUsers.entries()) {
    if ((now - data.lastActive.getTime()) >= STALE_TIMEOUT) {
      staleUsers.push(userId);
    }
  }
  
  for (const userId of staleUsers) {
    await removePresence(userId);
  }
  
  return staleUsers.length;
}

// Start cleanup interval (every 5 minutes)
setInterval(async () => {
  const cleaned = await cleanStaleConnections();
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} stale presence connections`);
  }
}, STALE_TIMEOUT);