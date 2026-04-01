import rateLimit from 'express-rate-limit';
import { isIPBanned } from '../auth.js';
import { prisma } from '../server.js';

/**
 * General rate limiter for all requests
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: async (req) => {
    // Skip for authenticated users? Maybe not
    return false;
  }
});

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * Rate limiter for message sending
 */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 messages per minute
  message: { error: 'Too many messages, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.session?.userId || req.ip;
  },
  skip: (req) => {
    // Skip for admin users
    return req.session?.userRole === 'ADMIN';
  }
});

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 uploads per minute
  message: { error: 'Too many uploads, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.session?.userId || req.ip;
  }
});

/**
 * Middleware to check if IP is banned
 */
export const checkIPBan = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  const isBanned = await isIPBanned(ip);
  
  if (isBanned) {
    return res.status(429).json({ 
      error: 'Your IP has been temporarily banned due to too many failed attempts. Please try again later.' 
    });
  }
  
  next();
};

/**
 * Combined rate limit middleware
 */
export const rateLimitMiddleware = async (req, res, next) => {
  // First check IP ban
  await checkIPBan(req, res, async () => {
    // Then apply general rate limit
    generalLimiter(req, res, next);
  });
};

/**
 * Special middleware for auth routes
 */
export const authRateLimitMiddleware = async (req, res, next) => {
  await checkIPBan(req, res, async () => {
    authLimiter(req, res, next);
  });
};

/**
 * Log failed attempt to database (for IP tracking)
 */
export const logFailedAttempt = async (ip, username) => {
  try {
    const existing = await prisma.bannedIP.findUnique({
      where: { ip }
    });
    
    if (existing) {
      const attempts = existing.attempts + 1;
      
      // Ban IP after 5 attempts
      if (attempts >= 5 && !existing.expiresAt) {
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
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
  } catch (error) {
    console.error('Error logging failed attempt:', error);
  }
};