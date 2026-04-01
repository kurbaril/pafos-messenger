import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure ffmpeg path (adjust for your system)
// For Windows, you may need to set ffmpeg path
// ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');

const uploadDirs = {
  images: path.join(__dirname, '../uploads/images'),
  voice: path.join(__dirname, '../uploads/voice'),
  avatars: path.join(__dirname, '../uploads/avatars')
};

// Ensure directories exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Process and optimize image
 */
export async function processImage(buffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp'
  } = options;

  let sharpInstance = sharp(buffer);
  
  // Get metadata
  const metadata = await sharpInstance.metadata();
  
  // Resize if needed
  if (metadata.width > maxWidth || metadata.height > maxHeight) {
    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  // Convert to desired format
  if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ quality });
  } else if (format === 'jpeg' || format === 'jpg') {
    sharpInstance = sharpInstance.jpeg({ quality });
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ quality });
  }
  
  const processedBuffer = await sharpInstance.toBuffer();
  const filename = `${uuidv4()}.${format === 'webp' ? 'webp' : format}`;
  const filepath = path.join(uploadDirs.images, filename);
  
  await fs.promises.writeFile(filepath, processedBuffer);
  
  return {
    url: `/uploads/images/${filename}`,
    filename,
    size: processedBuffer.length,
    originalSize: buffer.length,
    width: metadata.width,
    height: metadata.height,
    format
  };
}

/**
 * Process avatar image (square, smaller)
 */
export async function processAvatar(buffer) {
  const processedBuffer = await sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();
  
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(uploadDirs.avatars, filename);
  
  await fs.promises.writeFile(filepath, processedBuffer);
  
  return {
    url: `/uploads/avatars/${filename}`,
    filename,
    size: processedBuffer.length
  };
}

/**
 * Process voice message (normalize volume, convert to webm)
 */
export async function processVoiceMessage(buffer, originalFormat = 'webm') {
  const filename = `${uuidv4()}.webm`;
  const tempInputPath = path.join(uploadDirs.voice, `temp-${filename}`);
  const outputPath = path.join(uploadDirs.voice, filename);
  
  // Save temp file
  await fs.promises.writeFile(tempInputPath, buffer);
  
  // Process with ffmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(tempInputPath)
      .audioCodec('libopus')
      .audioBitrate('32k')
      .audioFrequency(16000)
      .format('webm')
      .on('end', () => {
        fs.unlinkSync(tempInputPath);
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // If processing fails, just save original
        fs.renameSync(tempInputPath, outputPath);
        resolve();
      })
      .save(outputPath);
  });
  
  // Get duration
  let duration = 0;
  try {
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(outputPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
    duration = Math.round(metadata.format.duration || 0);
  } catch (err) {
    console.error('Error getting audio duration:', err);
  }
  
  const stats = await fs.promises.stat(outputPath);
  
  return {
    url: `/uploads/voice/${filename}`,
    filename,
    size: stats.size,
    duration,
    format: 'webm'
  };
}

/**
 * Create thumbnail for image
 */
export async function createThumbnail(buffer, size = 200) {
  const thumbnailBuffer = await sharp(buffer)
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 60 })
    .toBuffer();
  
  const filename = `${uuidv4()}-thumb.webp`;
  const filepath = path.join(uploadDirs.images, filename);
  
  await fs.promises.writeFile(filepath, thumbnailBuffer);
  
  return {
    url: `/uploads/images/${filename}`,
    filename,
    size: thumbnailBuffer.length
  };
}

/**
 * Validate image
 */
export function validateImage(buffer, maxSizeMB = 20) {
  const maxSize = maxSizeMB * 1024 * 1024;
  
  if (buffer.length > maxSize) {
    return { valid: false, error: `Image too large (max ${maxSizeMB}MB)` };
  }
  
  // Check if it's actually an image by trying to read metadata
  try {
    sharp(buffer).metadata();
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid image file' };
  }
}

/**
 * Validate audio for voice message
 */
export function validateAudio(buffer, maxSizeMB = 10, maxDurationSec = 120) {
  const maxSize = maxSizeMB * 1024 * 1024;
  
  if (buffer.length > maxSize) {
    return { valid: false, error: `Voice message too large (max ${maxSizeMB}MB)` };
  }
  
  // Basic validation - actual duration will be checked after processing
  return { valid: true };
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    return null;
  }
}

/**
 * Optimize image for different use cases
 */
export async function optimizeImageForChat(buffer) {
  const dimensions = await getImageDimensions(buffer);
  
  if (!dimensions) return null;
  
  // If image is small, don't optimize too much
  if (dimensions.width <= 800 && dimensions.height <= 600) {
    const processedBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();
    
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDirs.images, filename);
    await fs.promises.writeFile(filepath, processedBuffer);
    
    return {
      url: `/uploads/images/${filename}`,
      size: processedBuffer.length,
      width: dimensions.width,
      height: dimensions.height
    };
  }
  
  // For larger images, create both original and thumbnail
  const processed = await processImage(buffer, { maxWidth: 1920, quality: 75 });
  const thumbnail = await createThumbnail(buffer, 200);
  
  return {
    ...processed,
    thumbnail: thumbnail.url
  };
}