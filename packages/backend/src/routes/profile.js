import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../server.js';
import { isAuthenticated, getUserById } from '../auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

/**
 * @route GET /api/profile
 * @desc Get current user profile
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await getUserById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * @route PUT /api/profile
 * @desc Update user profile
 */
router.put('/', isAuthenticated, async (req, res) => {
  try {
    const { username, bio, phone, email } = req.body;
    const userId = req.session.userId;
    
    // Check username uniqueness
    if (username) {
      const existing = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      });
      
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      if (username.length < 2 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be between 2 and 20 characters' });
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers and underscore' });
      }
    }
    
    // Check email uniqueness
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });
      
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || undefined,
        bio: bio || undefined,
        phone: phone || undefined,
        email: email || undefined
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        email: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @route POST /api/profile/avatar
 * @desc Upload avatar
 */
router.post('/avatar', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filename = `avatar-${userId}-${Date.now()}.webp`;
    const filepath = path.join(uploadDir, filename);
    
    // Optimize and save image
    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);
    
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    // Delete old avatar if exists
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    });
    
    if (oldUser?.avatarUrl) {
      const oldPath = path.join(__dirname, '..', oldUser.avatarUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });
    
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

/**
 * @route DELETE /api/profile/avatar
 * @desc Delete avatar
 */
router.delete('/avatar', isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { avatarUrl: true }
    });
    
    if (user?.avatarUrl) {
      const filepath = path.join(__dirname, '..', user.avatarUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    await prisma.user.update({
      where: { id: req.session.userId },
      data: { avatarUrl: null }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

/**
 * @route GET /api/profile/:userId
 * @desc Get user profile by ID
 */
router.get('/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        lastSeen: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if current user has blocked this user
    const isBlocked = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: req.session.userId,
          blockedId: userId
        }
      }
    });
    
    res.json({
      ...user,
      isBlocked: !!isBlocked
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;