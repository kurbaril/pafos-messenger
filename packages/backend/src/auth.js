import bcrypt from 'bcrypt';
import { prisma } from './server.js';

const SALT_ROUNDS = 12;

/**
 * Хеширование пароля
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверка пароля
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Создание нового пользователя
 */
export async function createUser(username, password) {
  // Проверяем существование
  const existing = await prisma.user.findUnique({
    where: { username }
  });

  if (existing) {
    throw new Error('Username already exists');
  }

  // Проверяем длину пароля
  if (password.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }

  // Проверяем имя пользователя
  if (username.length < 2 || username.length > 20) {
    throw new Error('Username must be between 2 and 20 characters');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers and underscore');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: hashedPassword,
      role: 'USER'
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      role: true,
      createdAt: true
    }
  });

  return user;
}

/**
 * Аутентификация пользователя
 */
export async function authenticateUser(username, password, ip) {
  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    await logFailedAttempt(ip, username);
    return null;
  }

  // Проверка бана
  if (user.isBanned) {
    throw new Error(`Account is banned${user.banReason ? `: ${user.banReason}` : ''}`);
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    await logFailedAttempt(ip, username);
    return null;
  }

  // Успешный вход - сбрасываем попытки
  await resetFailedAttempts(ip);

  // Обновляем время последнего входа
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeen: new Date() }
  });

  // Создаём запись о сессии (не храним в БД, только в express-session)
  await prisma.userPresence.upsert({
    where: { userId: user.id },
    update: { lastSeen: new Date(), status: 'online' },
    create: {
      userId: user.id,
      status: 'online',
      lastSeen: new Date()
    }
  });

  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    role: user.role
  };
}

/**
 * Логирование неудачной попытки входа
 */
async function logFailedAttempt(ip, username) {
  if (!ip) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут

  const existing = await prisma.bannedIP.findUnique({
    where: { ip }
  });

  if (existing) {
    const attempts = existing.attempts + 1;

    if (attempts >= 5 && !existing.expiresAt) {
      // Блокируем IP на 30 минут
      await prisma.bannedIP.update({
        where: { ip },
        data: {
          attempts,
          expiresAt,
          reason: `Too many failed attempts (${attempts})`
        }
      });
    } else {
      await prisma.bannedIP.update({
        where: { ip },
        data: { attempts }
      });
    }
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
 * Сброс неудачных попыток после успешного входа
 */
async function resetFailedAttempts(ip) {
  if (!ip) return;

  await prisma.bannedIP.deleteMany({
    where: { ip }
  });
}

/**
 * Проверка, забанен ли IP
 */
export async function isIPBanned(ip) {
  if (!ip) return false;

  const banned = await prisma.bannedIP.findUnique({
    where: { ip }
  });

  if (!banned) return false;

  // Проверяем истекла ли блокировка
  if (banned.expiresAt && new Date() > banned.expiresAt) {
    await prisma.bannedIP.delete({ where: { ip } });
    return false;
  }

  return banned.attempts >= 5;
}

/**
 * Middleware для проверки аутентификации
 */
export function isAuthenticated(req, res, next) {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Middleware для проверки прав администратора
 */
export function isAdmin(req, res, next) {
  if (req.session?.userRole === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      role: true,
      isBanned: true,
      lastSeen: true
    }
  });
}

/**
 * Получить пользователя по имени
 */
export async function getUserByUsername(username) {
  return await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      role: true,
      isBanned: true
    }
  });
}

/**
 * Поиск пользователей
 */
export async function searchUsers(query, excludeUserId, limit = 20) {
  if (!query || query.length < 2) return [];

  return await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive'
      },
      NOT: { id: excludeUserId },
      isBanned: false
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true
    },
    take: limit
  });
}

/**
 * Обновление статуса присутствия
 */
export async function updateUserPresence(userId, status) {
  await prisma.userPresence.upsert({
    where: { userId },
    update: {
      status,
      lastSeen: new Date()
    },
    create: {
      userId,
      status,
      lastSeen: new Date()
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastSeen: new Date() }
  });
}

/**
 * Получить статус пользователя
 */
export async function getUserPresence(userId) {
  const presence = await prisma.userPresence.findUnique({
    where: { userId }
  });

  if (!presence) {
    return { status: 'offline', lastSeen: null };
  }

  const isOnline = presence.status === 'online' && 
    (new Date() - new Date(presence.lastSeen)) < 5 * 60 * 1000;

  return {
    status: isOnline ? 'online' : presence.status,
    lastSeen: presence.lastSeen
  };
}