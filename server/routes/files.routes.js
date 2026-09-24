const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { FileUploadService, uploadAvatar, uploadSingle, uploadMultiple } = require('../services/fileUploadService');
const logger = require('../utils/logger');

// Upload Avatar
router.post('/upload-avatar', authenticateToken, uploadAvatar, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    let result;

    // Try S3 first, fallback to local
    if (process.env.AWS_ACCESS_KEY_ID) {
      result = await FileUploadService.uploadAvatar(req.file, req.userId);
    } else {
      result = await FileUploadService.uploadFileLocal(req.file, 'avatars', req.userId);
    }

    if (!result.success) {
      return res.status(500).json(result);
    }

    logger.info('Avatar uploaded', {
      userId: req.userId,
      fileSize: result.size,
      url: result.url
    });

    res.json({
      success: true,
      avatarUrl: result.url,
      fileKey: result.key,
      fileName: result.fileName,
      size: result.size,
      uploadedAt: result.uploadedAt
    });
  } catch (error) {
    logger.error('Avatar upload error', {
      userId: req.userId,
      error: error.message
    });
    next(error);
  }
});

// Upload Document
router.post('/upload-document', authenticateToken, uploadSingle, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const docType = req.query.type || 'general';

    let result;

    // Try S3 first, fallback to local
    if (process.env.AWS_ACCESS_KEY_ID) {
      result = await FileUploadService.uploadDocument(req.file, req.userId, docType);
    } else {
      result = await FileUploadService.uploadFileLocal(req.file, `documents/${docType}`, req.userId);
    }

    if (!result.success) {
      return res.status(500).json(result);
    }

    logger.info('Document uploaded', {
      userId: req.userId,
      docType,
      fileSize: result.size,
      fileName: result.fileName
    });

    res.json({
      success: true,
      documentUrl: result.url,
      fileKey: result.key,
      fileName: result.fileName,
      size: result.size,
      type: result.type,
      uploadedAt: result.uploadedAt
    });
  } catch (error) {
    logger.error('Document upload error', {
      userId: req.userId,
      error: error.message
    });
    next(error);
  }
});

// Upload Multiple Files
router.post('/upload-multiple', authenticateToken, uploadMultiple, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const folder = req.query.folder || 'documents';

    let results;

    // Try S3 first, fallback to local
    if (process.env.AWS_ACCESS_KEY_ID) {
      results = await FileUploadService.uploadMultiple(req.files, folder, req.userId);
    } else {
      results = await Promise.all(
        req.files.map(file => FileUploadService.uploadFileLocal(file, folder, req.userId))
      );
      results = {
        success: true,
        uploaded: results.filter(r => r.success),
        failed: results.filter(r => !r.success),
        total: results.length,
        successCount: results.filter(r => r.success).length
      };
    }

    logger.info('Batch file upload', {
      userId: req.userId,
      folder,
      totalFiles: results.total,
      successCount: results.successCount
    });

    res.json({
      success: results.success,
      uploaded: results.uploaded,
      failed: results.failed,
      summary: {
        total: results.total,
        successful: results.successCount,
        failed: results.total - results.successCount
      }
    });
  } catch (error) {
    logger.error('Batch file upload error', {
      userId: req.userId,
      error: error.message
    });
    next(error);
  }
});

// Delete File
router.delete('/delete/:fileKey', authenticateToken, async (req, res, next) => {
  try {
    const { fileKey } = req.params;

    if (!fileKey) {
      return res.status(400).json({ error: 'File key is required' });
    }

    // Security: verify user owns the file (fileKey contains userId)
    if (!fileKey.startsWith(req.userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await FileUploadService.deleteFile(fileKey);

    if (!result.success) {
      return res.status(500).json(result);
    }

    logger.info('File deleted', {
      userId: req.userId,
      fileKey
    });

    res.json(result);
  } catch (error) {
    logger.error('File delete error', {
      userId: req.userId,
      error: error.message
    });
    next(error);
  }
});

// Get Signed URL (for secure downloads)
router.get('/signed-url/:fileKey', authenticateToken, async (req, res, next) => {
  try {
    const { fileKey } = req.params;
    const expiresIn = req.query.expiresIn || 3600;

    if (!fileKey) {
      return res.status(400).json({ error: 'File key is required' });
    }

    // Security: verify user owns the file
    if (!fileKey.startsWith(req.userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await FileUploadService.generateSignedUrl(fileKey, parseInt(expiresIn));

    if (!result.success) {
      return res.status(500).json(result);
    }

    logger.info('Signed URL generated', {
      userId: req.userId,
      fileKey,
      expiresIn
    });

    res.json(result);
  } catch (error) {
    logger.error('Signed URL generation error', {
      userId: req.userId,
      error: error.message
    });
    next(error);
  }
});

module.exports = router;
