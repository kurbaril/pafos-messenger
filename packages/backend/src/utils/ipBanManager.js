import { prisma } from '../server.js';

/**
 * Check if IP is banned
 */
export async function isIPBanned(ip) {
  if (!ip) return false;

  const banned = await prisma.bannedIP.findUnique({
    where: { ip }
  });

  if (!banned) return false;

  // Check if ban has expired
  if (banned.expiresAt && new Date() > banned.expiresAt) {
    await prisma.bannedIP.delete({ where: { ip } });
    return false;
  }

  return true;
}

/**
 * Log failed login attempt
 */
export async function logFailedAttempt(ip, username = null) {
  if (!ip) return;

  const existing = await prisma.bannedIP.findUnique({
    where: { ip }
  });

  const now = new Date();
  const attempts = (existing?.attempts || 0) + 1;

  // Ban after 5 failed attempts
  if (attempts >= 5 && (!existing || !existing.expiresAt)) {
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    if (existing) {
      await prisma.bannedIP.update({
        where: { ip },
        data: {
          attempts,
          expiresAt,
          reason: `Too many failed attempts (${attempts})${username ? ` for user: ${username}` : ''}`
        }
      });
    } else {
      await prisma.bannedIP.create({
        data: {
          ip,
          attempts,
          expiresAt,
          reason: `Too many failed attempts (${attempts})${username ? ` for user: ${username}` : ''}`
        }
      });
    }
  } else if (existing) {
    await prisma.bannedIP.update({
      where: { ip },
      data: { attempts }
    });
  } else {
    await prisma.bannedIP.create({
      data: {
        ip,
        attempts: 1,
        expiresAt: null
      }
    });
  }
}

/**
 * Reset failed attempts for IP (on successful login)
 */
export async function resetFailedAttempts(ip) {
  if (!ip) return;

  await prisma.bannedIP.deleteMany({
    where: { ip }
  });
}

/**
 * Ban IP manually
 */
export async function banIP(ip, reason = 'Manual ban', durationMinutes = 60) {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  const existing = await prisma.bannedIP.findUnique({
    where: { ip }
  });

  if (existing) {
    await prisma.bannedIP.update({
      where: { ip },
      data: {
        attempts: existing.attempts + 1,
        expiresAt,
        reason
      }
    });
  } else {
    await prisma.bannedIP.create({
      data: {
        ip,
        attempts: 1,
        expiresAt,
        reason
      }
    });
  }
}

/**
 * Unban IP
 */
export async function unbanIP(ip) {
  await prisma.bannedIP.deleteMany({
    where: { ip }
  });
}

/**
 * Get list of banned IPs
 */
export async function getBannedIPs() {
  const bannedIPs = await prisma.bannedIP.findMany({
    orderBy: { bannedAt: 'desc' }
  });

  return bannedIPs.map(ip => ({
    ...ip,
    expiresIn: ip.expiresAt ? Math.max(0, Math.floor((ip.expiresAt - new Date()) / 1000)) : null
  }));
}

/**
 * Clean expired bans
 */
export async function cleanExpiredBans() {
  const result = await prisma.bannedIP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  return result.count;
}

/**
 * Get ban statistics
 */
export async function getBanStats() {
  const [totalBanned, activeBans, expiredBans, bansLast24h] = await Promise.all([
    prisma.bannedIP.count(),
    prisma.bannedIP.count({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    }),
    prisma.bannedIP.count({
      where: {
        expiresAt: { lt: new Date() }
      }
    }),
    prisma.bannedIP.count({
      where: {
        bannedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  return {
    totalBanned,
    activeBans,
    expiredBans,
    bansLast24h
  };
}

/**
 * Check if IP has exceeded rate limit (custom)
 */
export function isRateLimited(attempts, maxAttempts = 5, windowMs = 60000) {
  // This is a simple check - actual rate limiting should use Redis
  return attempts >= maxAttempts;
}

/**
 * Get remaining attempts for IP
 */
export async function getRemainingAttempts(ip) {
  const banned = await prisma.bannedIP.findUnique({
    where: { ip }
  });

  if (!banned) return 5;
  if (banned.expiresAt && new Date() > banned.expiresAt) return 5;

  return Math.max(0, 5 - (banned?.attempts || 0));
}