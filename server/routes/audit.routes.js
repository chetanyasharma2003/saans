const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const auditLogService = require('../services/auditLogService');
const logger = require('../utils/logger');

/**
 * Audit Log Routes - HIPAA Compliance
 * Requires admin access for most endpoints
 */

// Get audit trail for current user (all users can see their own)
router.get('/my-activity', authenticateToken, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;

    const logs = await auditLogService.getUserAuditTrail(req.user._id, days);

    res.json({
      success: true,
      data: {
        userId: req.user._id,
        period: `Last ${days} days`,
        totalEvents: logs.length,
        logs
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Audit trail retrieval failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get audit trail for specific user (admin only)
router.get('/user/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const days = req.query.days ? parseInt(req.query.days) : 90;

    const logs = await auditLogService.getUserAuditTrail(userId, days);

    await auditLogService.logAdminAction(req.user._id, 'VIEW_AUDIT_LOG', userId, {
      days
    });

    res.json({
      success: true,
      data: {
        userId,
        period: `Last ${days} days`,
        totalEvents: logs.length,
        logs
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Audit trail retrieval failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get audit trail for resource (admin only)
router.get('/resource/:resourceType/:resourceId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;

    const logs = await auditLogService.getResourceAuditTrail(resourceType, resourceId, limit);

    await auditLogService.logAdminAction(req.user._id, 'VIEW_AUDIT_LOG', resourceId, {
      resourceType
    });

    res.json({
      success: true,
      data: {
        resourceType,
        resourceId,
        totalEvents: logs.length,
        logs
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Resource audit trail retrieval failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Detect suspicious activity (admin only)
router.post('/detect-suspicious/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await auditLogService.detectSuspiciousActivity(userId);

    if (result.suspicious) {
      await auditLogService.logAdminAction(req.user._id, 'SUSPICIOUS_ACTIVITY_DETECTED', userId, {
        type: result.type,
        count: result.count
      });
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Suspicious activity detection failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Export audit log (admin only)
router.post('/export', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, format } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: 'startDate must be before endDate',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const exportFormat = format || 'json';
    const result = await auditLogService.exportAuditLog(start, end, exportFormat);

    await auditLogService.logAdminAction(req.user._id, 'EXPORT_AUDIT_LOG', 'system', {
      startDate,
      endDate,
      format: exportFormat
    });

    if (exportFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
      res.send(result);
    } else {
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Audit log export failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate compliance report (admin only)
router.get('/compliance-report', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;

    const report = await auditLogService.generateComplianceReport(days);

    await auditLogService.logAdminAction(req.user._id, 'GENERATE_COMPLIANCE_REPORT', 'system', {
      days
    });

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Compliance report generation failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
