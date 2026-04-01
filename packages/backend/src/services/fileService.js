import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directories
const uploadDirs = {
  avatars: path.join(__dirname, '../uploads/avatars'),
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

/**
 * Save avatar image
 */
export async function saveAvatar(buffer, userId) {
  const filename = `avatar-${userId}-${Date.now()}.webp`;
  const filepath = path.join(uploadDirs.avatars, filename);
  
  await sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(filepath);
  
  return `/uploads/avatars/${filename}`;
}

/**
 * Save image message
 */
export async function saveImage(buffer, originalName) {
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(uploadDirs.images, filename);
  
  await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);
  
  return {
    url: `/uploads/images/${filename}`,
    name: originalName,
    size: buffer.length,
    type: 'image'
  };
}

/**
 * Save generic file
 */
export async function saveFile(buffer, originalName, mimeType) {
  const ext = path.extname(originalName);
  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(uploadDirs.files, filename);
  
  fs.writeFileSync(filepath, buffer);
  
  return {
    url: `/uploads/files/${filename}`,
    name: originalName,
    size: buffer.length,
    type: 'file',
    mimeType
  };
}

/**
 * Save voice message
 */
export async function saveVoiceMessage(buffer, duration = null) {
  const filename = `${uuidv4()}.webm`;
  const filepath = path.join(uploadDirs.voice, filename);
  
  fs.writeFileSync(filepath, buffer);
  
  // Get duration if not provided
  let actualDuration = duration;
  if (!actualDuration) {
    try {
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filepath, (err, metadata) => {
          if (err) reject(err);
          else resolve(metadata);
        });
      });
      actualDuration = Math.round(metadata.format.duration || 0);
    } catch (err) {
      console.error('Error getting audio duration:', err);
      actualDuration = 0;
    }
  }
  
  return {
    url: `/uploads/voice/${filename}`,
    name: filename,
    size: buffer.length,
    type: 'voice',
    duration: actualDuration
  };
}

/**
 * Delete file by URL
 */
export async function deleteFileByUrl(fileUrl) {
  if (!fileUrl) return false;
  
  try {
    // Extract relative path from URL
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const parts = relativePath.split('/');
    const type = parts[0]; // avatars, images, files, voice
    const filename = parts[1];
    
    if (!uploadDirs[type]) return false;
    
    const filepath = path.join(uploadDirs[type], filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  
  return false;
}

/**
 * Get file info by URL
 */
export async function getFileInfo(fileUrl) {
  if (!fileUrl) return null;
  
  try {
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const parts = relativePath.split('/');
    const type = parts[0];
    const filename = parts[1];
    
    if (!uploadDirs[type]) return null;
    
    const filepath = path.join(uploadDirs[type], filename);
    
    if (!fs.existsSync(filepath)) return null;
    
    const stats = fs.statSync(filepath);
    
    return {
      url: fileUrl,
      type,
      filename,
      size: stats.size,
      modified: stats.mtime
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

/**
 * Check if file exists
 */
export async function fileExists(fileUrl) {
  const info = await getFileInfo(fileUrl);
  return info !== null;
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  const stats = {
    avatars: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    files: { count: 0, size: 0 },
    voice: { count: 0, size: 0 },
    total: { count: 0, size: 0 }
  };
  
  for (const [type, dir] of Object.entries(uploadDirs)) {
    try {
      const files = fs.readdirSync(dir);
      let totalSize = 0;
      
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isFile()) {
          totalSize += stat.size;
          stats[type].count++;
          stats[type].size += stat.size;
        }
      }
      
      stats.total.count += stats[type].count;
      stats.total.size += stats[type].size;
    } catch (error) {
      console.error(`Error reading ${type} directory:`, error);
    }
  }
  
  // Convert sizes to MB
  const toMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
  
  return {
    avatars: { count: stats.avatars.count, sizeMB: toMB(stats.avatars.size) },
    images: { count: stats.images.count, sizeMB: toMB(stats.images.size) },
    files: { count: stats.files.count, sizeMB: toMB(stats.files.size) },
    voice: { count: stats.voice.count, sizeMB: toMB(stats.voice.size) },
    total: { count: stats.total.count, sizeMB: toMB(stats.total.size) }
  };
}

/**
 * Clean old files (older than days)
 */
export async function cleanOldFiles(days = 30) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  const deleted = { avatars: 0, images: 0, files: 0, voice: 0 };
  
  for (const [type, dir] of Object.entries(uploadDirs)) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        
        if (stat.isFile() && stat.mtimeMs < cutoff) {
          fs.unlinkSync(filepath);
          deleted[type]++;
        }
      }
    } catch (error) {
      console.error(`Error cleaning ${type} directory:`, error);
    }
  }
  
  return deleted;
}