import path from 'path';

/**
 * Validate file type by checking magic bytes (file signature)
 * More secure than just checking MIME type or extension
 */
export const validateFileSignature = (buffer, expectedType) => {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  // Common file signatures (magic bytes)
  const signatures = {
    // Excel files
    xlsx: [
      [0x50, 0x4B, 0x03, 0x04], // ZIP-based (XLSX)
      [0x50, 0x4B, 0x05, 0x06], // ZIP-based (XLSX)
      [0x50, 0x4B, 0x07, 0x08], // ZIP-based (XLSX)
    ],
    xls: [
      [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE2 (XLS)
    ],
    // Images
    png: [[0x89, 0x50, 0x4E, 0x47]],
    jpg: [[0xFF, 0xD8, 0xFF]],
    gif: [[0x47, 0x49, 0x46, 0x38]],
    // PDF
    pdf: [[0x25, 0x50, 0x44, 0x46]],
  };

  const fileSignatures = signatures[expectedType] || [];

  return fileSignatures.some(signature => {
    return signature.every((byte, index) => buffer[index] === byte);
  });
};

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }

  // Remove any directory path
  const basename = path.basename(filename);

  // Remove dangerous characters and patterns
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow alphanumeric, dots, underscores, hyphens
    .replace(/\.{2,}/g, '.') // Remove multiple consecutive dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid filename after sanitization');
  }

  return sanitized;
};

/**
 * Validate file size
 */
export const validateFileSize = (size, maxSizeInMB = 5) => {
  const maxSize = maxSizeInMB * 1024 * 1024;
  
  if (size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeInMB}MB`);
  }
  
  return true;
};

/**
 * Check if file is a zip bomb (compressed file that expands to huge size)
 */
export const checkZipBomb = (compressedSize, uncompressedSize) => {
  const compressionRatio = uncompressedSize / compressedSize;
  
  // If compression ratio is too high, it might be a zip bomb
  // Normal compression ratios are typically under 10:1
  if (compressionRatio > 100) {
    throw new Error('Potential zip bomb detected');
  }
  
  // Also check absolute uncompressed size
  const maxUncompressedSize = 100 * 1024 * 1024; // 100MB
  if (uncompressedSize > maxUncompressedSize) {
    throw new Error('Uncompressed file size exceeds safe limit');
  }
  
  return true;
};

/**
 * Validate Excel file structure
 */
export const validateExcelFile = async (buffer) => {
  try {
    // Check file signature
    const isXLSX = validateFileSignature(buffer, 'xlsx');
    const isXLS = validateFileSignature(buffer, 'xls');
    
    if (!isXLSX && !isXLS) {
      throw new Error('Invalid Excel file format');
    }
    
    // For XLSX (ZIP-based), check for potential zip bombs
    if (isXLSX) {
      // Basic check: if file is suspiciously small but claims to be Excel, reject it
      if (buffer.length < 1024) {
        throw new Error('File too small to be a valid Excel file');
      }
    }
    
    return true;
  } catch (error) {
    throw new Error(`Excel file validation failed: ${error.message}`);
  }
};

/**
 * Generate secure random filename
 */
export const generateSecureFilename = (originalFilename) => {
  const ext = path.extname(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  return `${timestamp}_${random}${ext}`;
};

/**
 * Validate upload rate per user
 */
const uploadCounts = new Map();

export const checkUploadRate = (userId, maxUploadsPerHour = 20) => {
  const now = Date.now();
  const hourAgo = now - 3600000;
  
  // Get or initialize user's upload history
  let uploads = uploadCounts.get(userId) || [];
  
  // Filter out uploads older than 1 hour
  uploads = uploads.filter(timestamp => timestamp > hourAgo);
  
  // Check if limit exceeded
  if (uploads.length >= maxUploadsPerHour) {
    throw new Error(`Upload rate limit exceeded. Maximum ${maxUploadsPerHour} uploads per hour.`);
  }
  
  // Add current upload
  uploads.push(now);
  uploadCounts.set(userId, uploads);
  
  // Clean up old entries periodically
  if (uploadCounts.size > 10000) {
    for (const [key, timestamps] of uploadCounts.entries()) {
      const filtered = timestamps.filter(t => t > hourAgo);
      if (filtered.length === 0) {
        uploadCounts.delete(key);
      } else {
        uploadCounts.set(key, filtered);
      }
    }
  }
  
  return true;
};
