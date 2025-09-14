const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { processImage, cleanupFile, cleanupOldFiles, getFileInfo } = require('../middleware/fileUpload');

class FileService {
  constructor() {
    this.baseUploadPath = path.join(__dirname, '../uploads');
    this.avatarPath = path.join(this.baseUploadPath, 'avatars');
    this.resumePath = path.join(this.baseUploadPath, 'resumes');
    this.tempPath = path.join(this.baseUploadPath, 'temp');
    this.atsPath = path.join(this.baseUploadPath, 'ats');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.avatarPath, this.resumePath, this.tempPath, this.atsPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Avatar management
  async saveAvatar(file, userId) {
    try {
      const filename = `avatar-${userId}-${uuidv4()}.jpg`;
      const filePath = path.join(this.avatarPath, filename);
      
      // Process and save image
      const result = await processImage(file.path, filePath, {
        width: 200,
        height: 200,
        quality: 85
      });
      
      if (result.success) {
        // Clean up original file
        cleanupFile(file.path);
        
        return {
          success: true,
          filename,
          path: filePath,
          url: `/uploads/avatars/${filename}`
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Avatar save error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteAvatar(filename) {
    try {
      const filePath = path.join(this.avatarPath, filename);
      const result = cleanupFile(filePath);
      return result;
    } catch (error) {
      console.error('Avatar delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Resume file management
  async saveResume(file, userId) {
    try {
      const filename = `resume-${userId}-${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(this.resumePath, filename);
      
      // Move file to final location
      fs.renameSync(file.path, filePath);
      
      return {
        success: true,
        filename,
        path: filePath,
        url: `/uploads/resumes/${filename}`,
        size: file.size,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('Resume save error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteResume(filename) {
    try {
      const filePath = path.join(this.resumePath, filename);
      const result = cleanupFile(filePath);
      return result;
    } catch (error) {
      console.error('Resume delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Temporary file management
  async saveTempFile(file, prefix = 'temp') {
    try {
      const filename = `${prefix}-${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(this.tempPath, filename);
      
      fs.renameSync(file.path, filePath);
      
      return {
        success: true,
        filename,
        path: filePath,
        url: `/uploads/temp/${filename}`
      };
    } catch (error) {
      console.error('Temp file save error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTempFile(filename) {
    try {
      const filePath = path.join(this.tempPath, filename);
      const result = cleanupFile(filePath);
      return result;
    } catch (error) {
      console.error('Temp file delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // File info and validation
  async getFileInfo(filePath) {
    return getFileInfo(filePath);
  }

  async validateFile(file, allowedTypes, maxSize) {
    const errors = [];
    
    // Check file type
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Cleanup operations
  async cleanupOldFiles(daysOld = 7) {
    try {
      const results = {};
      
      // Cleanup avatars
      results.avatars = cleanupOldFiles(this.avatarPath, daysOld);
      
      // Cleanup temp files
      results.temp = cleanupOldFiles(this.tempPath, 1); // Clean temp files after 1 day
      
      // Cleanup ATS files
      results.ats = cleanupOldFiles(this.atsPath, daysOld);
      
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const stats = {
        avatars: this.getDirectoryStats(this.avatarPath),
        resumes: this.getDirectoryStats(this.resumePath),
        temp: this.getDirectoryStats(this.tempPath),
        ats: this.getDirectoryStats(this.atsPath)
      };
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Storage stats error:', error);
      return { success: false, error: error.message };
    }
  }

  getDirectoryStats(directory) {
    try {
      if (!fs.existsSync(directory)) {
        return { count: 0, size: 0 };
      }
      
      const files = fs.readdirSync(directory);
      let totalSize = 0;
      
      files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });
      
      return {
        count: files.length,
        size: totalSize,
        sizeFormatted: this.formatBytes(totalSize)
      };
    } catch (error) {
      return { count: 0, size: 0, error: error.message };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate file URL
  generateFileUrl(type, filename) {
    return `/uploads/${type}/${filename}`;
  }

  // Check if file exists
  fileExists(type, filename) {
    const filePath = path.join(this.baseUploadPath, type, filename);
    return fs.existsSync(filePath);
  }
}

module.exports = new FileService();
