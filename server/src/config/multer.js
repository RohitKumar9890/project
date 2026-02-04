import multer from 'multer';
import { validateFileSignature, sanitizeFilename, validateFileSize, checkUploadRate } from '../utils/fileValidation.js';

// Configure multer for memory storage (for Excel files)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  try {
    // Validate file size first
    if (req.headers['content-length']) {
      const sizeMB = parseInt(req.headers['content-length']) / (1024 * 1024);
      if (sizeMB > 5) {
        return cb(new Error('File size exceeds 5MB limit'), false);
      }
    }
    
    // Check upload rate
    const userId = req.user?.id || req.ip;
    checkUploadRate(userId, 20); // Max 20 uploads per hour
    
    // Sanitize filename
    const sanitized = sanitizeFilename(file.originalname);
    file.originalname = sanitized;
    
    // Accept only Excel files (check MIME type)
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'), false);
    }
    
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only 1 file at a time
  },
});
