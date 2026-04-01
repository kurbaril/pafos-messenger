import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from '../auth.js';
import { prisma } from '../server.js';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directories
const uploadDirs = {
  images: path.join(__dirname, '../uploads/images'),
  files: path.join(__dirname, '../uploads/files'),
  voice: path.join(__dirname, '../uploads/voice')
};

// Ensure directories exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

/**
 * @route POST /api/upload/image
 * @desc Upload image
 */
router.post('/image', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDirs.images, filename);

    // Optimize image
    await sharp(req.file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    const fileUrl = `/uploads/images/${filename}`;

    res.json({
      success: true,
      url: fileUrl,
      type: 'image',
      name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

/**
 * @route POST /api/upload/file
 * @desc Upload generic file
 */
router.post('/file', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDirs.files, filename);

    fs.writeFileSync(filepath, req.file.buffer);

    const fileUrl = `/uploads/files/${filename}`;

    res.json({
      success: true,
      url: fileUrl,
      type: 'file',
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * @route POST /api/upload/voice
 * @desc Upload voice message
 */
router.post('/voice', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `${uuidv4()}.webm`;
    const filepath = path.join(uploadDirs.voice, filename);

    fs.writeFileSync(filepath, req.file.buffer);

    // Get duration using ffmpeg
    let duration = 0;
    try {
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filepath, (err, metadata) => {
          if (err) reject(err);
          else resolve(metadata);
        });
      });
      duration = Math.round(metadata.format.duration || 0);
    } catch (err) {
      console.error('Error getting audio duration:', err);
    }

    const fileUrl = `/uploads/voice/${filename}`;

    res.json({
      success: true,
      url: fileUrl,
      type: 'voice',
      name: filename,
      size: req.file.size,
      duration
    });
  } catch (error) {
    console.error('Error uploading voice:', error);
    res.status(500).json({ error: 'Failed to upload voice message' });
  }
});

/**
 * @route DELETE /api/upload/:type/:filename
 * @desc Delete uploaded file
 */
router.delete('/:type/:filename', isAuthenticated, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    const validTypes = ['images', 'files', 'voice'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    const filepath = path.join(uploadDirs[type], filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * @route GET /api/upload/check/:type/:filename
 * @desc Check if file exists
 */
router.get('/check/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    const validTypes = ['images', 'files', 'voice'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    const filepath = path.join(uploadDirs[type], filename);
    const exists = fs.existsSync(filepath);
    
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check file' });
  }
});

export default router;