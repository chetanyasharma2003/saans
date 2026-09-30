const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload profile picture
router.post('/profile-picture', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.update({ avatar: filePath });

    res.json({
      success: true,
      message: 'Profile picture uploaded',
      url: filePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
});

// Upload document (license, certificate, etc.)
router.post('/document', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { documentType } = req.body;

    const filePath = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(
      req.userId,
      { $push: { documents: { type: documentType, url: filePath } } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Document uploaded',
      url: filePath
    });
  } catch (error) {
    next(error);
  }
});

// Delete file
router.delete('/:fileId', authenticateToken, async (req, res, next) => {
  try {
    const fs = require('fs');
    const filePath = path.join('uploads', req.params.fileId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
