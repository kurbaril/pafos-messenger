import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../server.js';
import { isAuthenticated } from '../auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

/**
 * @route POST /api/groups
 * @desc Create a new group
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;
    const userId = req.session.userId;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name required' });
    }
    
    if (name.length > 50) {
      return res.status(400).json({ error: 'Group name too long (max 50 chars)' });
    }
    
    // Check if all members exist and are not banned
    const memberIdsSet = [...new Set([userId, ...memberIds])];
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: memberIdsSet },
        isBanned: false
      },
      select: { id: true }
    });
    
    if (existingUsers.length !== memberIdsSet.length) {
      return res.status(400).json({ error: 'Some users do not exist or are banned' });
    }
    
    // Create chat first
    const chat = await prisma.chat.create({
      data: {
        type: 'GROUP'
      }
    });
    
    // Create group
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        ownerId: userId,
        chatId: chat.id
      }
    });
    
    // Add members to chat
    await prisma.chatUser.createMany({
      data: memberIdsSet.map(memberId => ({
        userId: memberId,
        chatId: chat.id
      }))
    });
    
    // Add group members with roles
    await prisma.groupMember.createMany({
      data: [
        { userId, groupId: group.id, role: 'OWNER' },
        ...memberIds.map(memberId => ({
          userId: memberId,
          groupId: group.id,
          role: 'MEMBER'
        }))
      ]
    });
    
    // Create notifications for new members
    for (const memberId of memberIds) {
      await prisma.notification.create({
        data: {
          userId: memberId,
          type: 'group_invite',
          content: `${req.session.username || 'Someone'} added you to group "${name}"`,
          data: {
            groupId: group.id,
            chatId: chat.id,
            groupName: name
          }
        }
      });
    }
    
    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      chatId: chat.id,
      ownerId: group.ownerId,
      memberCount: memberIdsSet.length
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

/**
 * @route GET /api/groups/:groupId
 * @desc Get group info
 */
router.get('/:groupId', isAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                bio: true
              }
            }
          }
        },
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
        }
      }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if user is member
    const isMember = group.members.some(m => m.userId === req.session.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }
    
    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      avatarUrl: group.avatarUrl,
      ownerId: group.ownerId,
      createdAt: group.createdAt,
      members: group.members.map(m => ({
        id: m.user.id,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      chatId: group.chatId
    });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

/**
 * @route PUT /api/groups/:groupId
 * @desc Update group info
 */
router.put('/:groupId', isAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (group.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Only group owner can edit group' });
    }
    
    if (name && name.length > 50) {
      return res.status(400).json({ error: 'Group name too long (max 50 chars)' });
    }
    
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: name?.trim() || undefined,
        description: description?.trim() || undefined
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

/**
 * @route POST /api/groups/:groupId/avatar
 * @desc Upload group avatar
 */
router.post('/:groupId/avatar', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (group.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Only group owner can change avatar' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filename = `group-${groupId}-${Date.now()}.webp`;
    const filepath = path.join(uploadDir, filename);
    
    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);
    
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    // Delete old avatar
    if (group.avatarUrl) {
      const oldPath = path.join(__dirname, '..', group.avatarUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { avatarUrl }
    });
    
    res.json({ success: true, avatarUrl: updated.avatarUrl });
  } catch (error) {
    console.error('Error uploading group avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

/**
 * @route POST /api/groups/:groupId/members
 * @desc Add member to group
 */
router.post('/:groupId/members', isAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { chat: true, members: true }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (group.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Only group owner can add members' });
    }
    
    // Check if user is already a member
    const existingMember = group.members.find(m => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    // Check if user exists and is not banned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBanned: true }
    });
    
    if (!user || user.isBanned) {
      return res.status(404).json({ error: 'User not found or banned' });
    }
    
    // Add to chat users
    await prisma.chatUser.create({
      data: {
        userId,
        chatId: group.chatId
      }
    });
    
    // Add to group members
    const member = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: 'MEMBER'
      }
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'group_invite',
        content: `You were added to group "${group.name}"`,
        data: {
          groupId: group.id,
          chatId: group.chatId,
          groupName: group.name
        }
      }
    });
    
    res.json(member);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

/**
 * @route DELETE /api/groups/:groupId/members/:userId
 * @desc Remove member from group
 */
router.delete('/:groupId/members/:userId', isAuthenticated, async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true, chat: true }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const isOwner = group.ownerId === req.session.userId;
    const isSelf = userId === req.session.userId;
    
    if (!isOwner && !isSelf) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Cannot remove owner if there are other members
    if (userId === group.ownerId && group.members.length > 1) {
      return res.status(400).json({ error: 'Transfer ownership before leaving' });
    }
    
    // Remove from chat users
    await prisma.chatUser.deleteMany({
      where: {
        userId,
        chatId: group.chatId
      }
    });
    
    // Remove from group members
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId
      }
    });
    
    // If group becomes empty, delete it
    const remainingMembers = await prisma.groupMember.count({
      where: { groupId }
    });
    
    if (remainingMembers === 0) {
      await prisma.chat.delete({ where: { id: group.chatId } });
      await prisma.group.delete({ where: { id: groupId } });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

/**
 * @route POST /api/groups/:groupId/transfer
 * @desc Transfer group ownership
 */
router.post('/:groupId/transfer', isAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newOwnerId } = req.body;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (group.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Only group owner can transfer ownership' });
    }
    
    // Check if new owner is a member
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: newOwnerId,
          groupId
        }
      }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'User is not a member' });
    }
    
    await prisma.group.update({
      where: { id: groupId },
      data: { ownerId: newOwnerId }
    });
    
    await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId: newOwnerId,
          groupId
        }
      },
      data: { role: 'OWNER' }
    });
    
    await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId: req.session.userId,
          groupId
        }
      },
      data: { role: 'MEMBER' }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
});

export default router;