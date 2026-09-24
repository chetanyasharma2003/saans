const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: [
      'AUTH_SUCCESS',
      'AUTH_FAILURE',
      'LOGIN',
      'LOGOUT',
      'DATA_ACCESS',
      'DATA_MODIFY',
      'DATA_DELETE',
      'FILE_UPLOAD',
      'FILE_DOWNLOAD',
      'FILE_DELETE',
      'ADMIN_CREATE_USER',
      'ADMIN_UPDATE_USER',
      'ADMIN_DELETE_USER',
      'ADMIN_CHANGE_ROLE',
      'REPORT_GENERATED',
      'SETTINGS_CHANGED',
      'PASSWORD_CHANGED',
      'OAUTH_LOGIN'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: [
      'user',
      'patient',
      'therapist',
      'appointment',
      'mood',
      'file',
      'authentication',
      'community',
      'report',
      'settings'
    ]
  },
  resourceId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  ip: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'partial'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index - Auto-delete logs after 2 years for HIPAA compliance
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
