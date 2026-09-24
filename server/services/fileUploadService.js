const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not allowed`));
  }

  if (file.size > maxSize) {
    return cb(new Error(`File size exceeds 10MB limit`));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

class FileUploadService {
  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || 'saans-files';
  }

  // Upload single file
  async uploadFile(file, folder, userId) {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided'
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${userId}/${folder}/${timestamp}-${file.originalname}`;

      const params = {
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          'userId': userId,
          'uploadedAt': new Date().toISOString(),
          'originalName': file.originalname
        }
      };

      // Upload to S3
      const result = await s3.upload(params).promise();

      logger.info('File uploaded to S3', {
        userId,
        fileName: file.originalname,
        size: file.size,
        url: result.Location
      });

      return {
        success: true,
        url: result.Location,
        key: fileName,
        fileName: file.originalname,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date(),
        etag: result.ETag
      };
    } catch (error) {
      logger.error('S3 upload failed', {
        error: error.message,
        fileName: file?.originalname
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload avatar
  async uploadAvatar(file, userId) {
    return this.uploadFile(file, 'avatars', userId);
  }

  // Upload document
  async uploadDocument(file, userId, docType = 'general') {
    return this.uploadFile(file, `documents/${docType}`, userId);
  }

  // Delete file from S3
  async deleteFile(fileKey) {
    try {
      if (!fileKey) {
        return {
          success: false,
          error: 'No file key provided'
        };
      }

      const params = {
        Bucket: this.bucket,
        Key: fileKey
      };

      await s3.deleteObject(params).promise();

      logger.info('File deleted from S3', { fileKey });

      return {
        success: true,
        deletedKey: fileKey
      };
    } catch (error) {
      logger.error('S3 delete failed', {
        error: error.message,
        fileKey
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get file metadata
  async getFileMetadata(fileKey) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: fileKey
      };

      const metadata = await s3.headObject(params).promise();

      return {
        success: true,
        size: metadata.ContentLength,
        type: metadata.ContentType,
        lastModified: metadata.LastModified,
        etag: metadata.ETag
      };
    } catch (error) {
      logger.error('Get file metadata failed', {
        error: error.message,
        fileKey
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate signed URL (for secure downloads)
  async generateSignedUrl(fileKey, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: fileKey,
        Expires: expiresIn
      };

      const signedUrl = s3.getSignedUrl('getObject', params);

      return {
        success: true,
        signedUrl,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      };
    } catch (error) {
      logger.error('Generate signed URL failed', {
        error: error.message,
        fileKey
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Batch upload
  async uploadMultiple(files, folder, userId) {
    try {
      const results = await Promise.all(
        files.map(file => this.uploadFile(file, folder, userId))
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: successful.length > 0,
        uploaded: successful,
        failed,
        total: results.length,
        successCount: successful.length
      };
    } catch (error) {
      logger.error('Batch upload failed', {
        error: error.message,
        fileCount: files?.length
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Local fallback (if S3 not configured)
  async uploadFileLocal(file, folder, userId) {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided'
        };
      }

      const uploadsDir = path.join(__dirname, '../uploads', userId, folder);

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      const fileUrl = `/uploads/${userId}/${folder}/${fileName}`;

      logger.info('File uploaded locally', {
        userId,
        fileName,
        size: file.size,
        path: filePath
      });

      return {
        success: true,
        url: fileUrl,
        fileName: file.originalname,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date(),
        local: true
      };
    } catch (error) {
      logger.error('Local upload failed', {
        error: error.message,
        fileName: file?.originalname
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  FileUploadService: new FileUploadService(),
  upload,
  uploadSingle: upload.single('file'),
  uploadMultiple: upload.array('files', 5),
  uploadAvatar: upload.single('avatar')
};
