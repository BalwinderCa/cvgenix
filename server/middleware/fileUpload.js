const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads/avatars'),
    path.join(__dirname, '../uploads/resumes'),
    path.join(__dirname, '../uploads/temp'),
    path.join(__dirname, '../uploads/ats')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
ensureUploadDirs();

// Configure storage for different file types
const createStorage = (destination, allowedTypes, maxSize = 5 * 1024 * 1024) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4();
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
};

// File filter for different types
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  };
};

// Avatar upload configuration
const avatarStorage = createStorage(
  path.join(__dirname, '../uploads/avatars'),
  ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  2 * 1024 * 1024 // 2MB limit
);

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: createFileFilter(['.jpg', '.jpeg', '.png', '.gif', '.webp']),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  }
});

// Resume upload configuration
const resumeStorage = createStorage(
  path.join(__dirname, '../uploads/resumes'),
  ['.pdf', '.docx', '.doc', '.txt', '.html'],
  10 * 1024 * 1024 // 10MB limit
);

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: createFileFilter(['.pdf', '.docx', '.doc', '.txt', '.html']),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// ATS upload configuration (existing)
const atsStorage = createStorage(
  path.join(__dirname, '../uploads/ats'),
  ['.pdf', '.docx', '.doc', '.txt', '.html'],
  10 * 1024 * 1024 // 10MB limit
);

const atsUpload = multer({
  storage: atsStorage,
  fileFilter: createFileFilter(['.pdf', '.docx', '.doc', '.txt', '.html']),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// Image processing utility
const processImage = async (inputPath, outputPath, options = {}) => {
  const {
    width = 300,
    height = 300,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    return { success: true, outputPath };
  } catch (error) {
    console.error('Image processing error:', error);
    return { success: false, error: error.message };
  }
};

// File cleanup utility
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: true, message: 'File does not exist' };
  } catch (error) {
    console.error('File cleanup error:', error);
    return { success: false, error: error.message };
  }
};

// Cleanup old files (older than specified days)
const cleanupOldFiles = (directory, daysOld = 7) => {
  try {
    const files = fs.readdirSync(directory);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let cleanedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        cleanedCount++;
      }
    });
    
    return { success: true, cleanedCount };
  } catch (error) {
    console.error('Old files cleanup error:', error);
    return { success: false, error: error.message };
  }
};

// Get file info
const getFileInfo = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }
    
    const stats = fs.statSync(filePath);
    return {
      success: true,
      info: {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(filePath),
        name: path.basename(filePath)
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  avatarUpload,
  resumeUpload,
  atsUpload,
  processImage,
  cleanupFile,
  cleanupOldFiles,
  getFileInfo,
  ensureUploadDirs
};
