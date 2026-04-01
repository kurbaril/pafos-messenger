import { prisma } from '../server.js';

/**
 * Middleware to protect admin routes with secret URL
 * Only allows access if the request path matches the secret admin URL
 */
export const adminUrlGuard = (req, res, next) => {
  const secretUrl = process.env.ADMIN_SECRET_URL || '/admin/super-secret-pafos-2024';
  
  // Check if the request is for the admin panel
  if (req.path.startsWith('/admin') && !req.path.startsWith(secretUrl)) {
    // Return 404 to hide existence of admin panel
    return res.status(404).json({ error: 'Not found' });
  }
  
  next();
};

/**
 * Middleware to check if user is admin
 * Also logs admin actions
 */
export const adminAuthGuard = async (req, res, next) => {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, username: true }
  });
  
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Store admin info for logging
  req.admin = {
    id: userId,
    username: user.username
  };
  
  next();
};

/**
 * Log admin action to database
 */
export const logAdminAction = async (req, action, targetId = null, metadata = null) => {
  try {
    if (!req.admin) return;
    
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action,
        targetId,
        metadata
      }
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

/**
 * Middleware that logs admin actions automatically
 */
export const adminLogger = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log after response is sent
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAdminAction(req, action, req.params.id || req.body?.targetId, {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query
        });
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Combined admin guard for admin routes
 * Use this for all admin API endpoints
 */
export const adminGuard = [adminAuthGuard];