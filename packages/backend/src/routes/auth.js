import express from 'express';
import { createUser, authenticateUser, isIPBanned, getUserById } from '../auth.js';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 2 and 20 characters' });
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers and underscore' });
    }
    
    const user = await createUser(username, password);
    
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check if IP is banned
    const isBanned = await isIPBanned(ip);
    if (isBanned) {
      return res.status(429).json({ error: 'Too many failed attempts. Try again later.' });
    }
    
    const user = await authenticateUser(username, password, ip);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 */
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const user = await getUserById(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.isBanned) {
      req.session.destroy();
      return res.status(403).json({ error: 'Account is banned' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * @route GET /api/auth/check-username/:username
 * @desc Check if username is available
 */
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });
    
    res.json({ 
      available: !existing,
      username
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check username' });
  }
});

export default router;