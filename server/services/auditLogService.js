const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Audit Logging Service for HIPAA compliance
 * Tracks all access to sensitive patient data
 */

class AuditLogService {
  // Log user access to patient data
  async logAccess(userId, action, resourceType, resourceId, details = {}) {
    try {
      const log = new AuditLog({
        userId,
        action,
        resourceType,
        resourceId,
        details,
        timestamp: new Date(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
      });

      await log.save();

      logger.info('Audit log created', {
        userId,
        action,
        resourceType,
        resourceId
      });

      return log;
    } catch (error) {
      logger.error('Audit logging failed', { error: error.message });
    }
  }

  // Log sensitive data access
  async logDataAccess(userId, dataType, patientId, reason, details = {}) {
    try {
      const log = new AuditLog({
        userId,
        action: 'DATA_ACCESS',
        resourceType: dataType,
        resourceId: patientId,
        reason,
        details: {
          ...details,
          sensitive: true
        },
        timestamp: new Date(),
        ip: details.ip || 'unknown'
      });

      await log.save();

      logger.warn('Sensitive data accessed', {
        userId,
        dataType,
        patientId
      });

      return log;
    } catch (error) {
      logger.error('Sensitive access logging failed', { error: error.message });
    }
  }

  // Log data modification
  async logModification(userId, action, resourceType, resourceId, oldValue, newValue, details = {}) {
    try {
      const log = new AuditLog({
        userId,
        action,
        resourceType,
        resourceId,
        details: {
          ...details,
          oldValue: this.maskSensitive(oldValue),
          newValue: this.maskSensitive(newValue),
          modified: true
        },
        timestamp: new Date()
      });

      await log.save();

      logger.warn('Data modification logged', {
        userId,
        action,
        resourceType,
        resourceId
      });

      return log;
    } catch (error) {
      logger.error('Modification logging failed', { error: error.message });
    }
  }

  // Log authentication attempts
  async logAuthAttempt(email, success, reason = '', ip = '', userAgent = '') {
    try {
      const log = new AuditLog({
        userId: null, // User not authenticated yet
        action: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
        resourceType: 'authentication',
        resourceId: email,
        details: {
          email,
          success,
          reason,
          ip,
          userAgent
        },
        timestamp: new Date(),
        ip,
        userAgent
      });

      await log.save();

      const status = success ? 'successful' : 'failed';
      logger.info(`Authentication ${status}`, {
        email,
        ip
      });

      return log;
    } catch (error) {
      logger.error('Auth logging failed', { error: error.message });
    }
  }

  // Log admin actions
  async logAdminAction(adminId, action, targetUserId, details = {}) {
    try {
      const log = new AuditLog({
        userId: adminId,
        action: `ADMIN_${action}`,
        resourceType: 'user',
        resourceId: targetUserId,
        details: {
          ...details,
          admin: true
        },
        timestamp: new Date()
      });

      await log.save();

      logger.warn('Admin action logged', {
        adminId,
        action,
        targetUserId
      });

      return log;
    } catch (error) {
      logger.error('Admin action logging failed', { error: error.message });
    }
  }

  // Log file access
  async logFileAccess(userId, fileId, action, ip = '', details = {}) {
    try {
      const log = new AuditLog({
        userId,
        action: `FILE_${action}`,
        resourceType: 'file',
        resourceId: fileId,
        details: {
          ...details,
          ip
        },
        timestamp: new Date(),
        ip
      });

      await log.save();

      logger.info('File access logged', {
        userId,
        fileId,
        action
      });

      return log;
    } catch (error) {
      logger.error('File access logging failed', { error: error.message });
    }
  }

  // Get audit trail for user
  async getUserAuditTrail(userId, days = 90) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await AuditLog.find({
        userId,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: -1 });

      logger.debug('Retrieved audit trail', {
        userId,
        count: logs.length,
        days
      });

      return logs;
    } catch (error) {
      logger.error('Audit trail retrieval failed', { error: error.message });
      return [];
    }
  }

  // Get audit trail for resource
  async getResourceAuditTrail(resourceType, resourceId, limit = 100) {
    try {
      const logs = await AuditLog.find({
        resourceType,
        resourceId
      })
        .sort({ timestamp: -1 })
        .limit(limit);

      logger.debug('Retrieved resource audit trail', {
        resourceType,
        resourceId,
        count: logs.length
      });

      return logs;
    } catch (error) {
      logger.error('Resource audit trail retrieval failed', { error: error.message });
      return [];
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(userId) {
    try {
      // Failed login attempts in last hour
      const failedLogins = await AuditLog.countDocuments({
        action: 'AUTH_FAILURE',
        resourceId: userId,
        timestamp: {
          $gte: new Date(Date.now() - 3600000)
        }
      });

      if (failedLogins > 5) {
        logger.warn('Suspicious activity detected: Multiple failed logins', {
          userId,
          count: failedLogins
        });

        return {
          suspicious: true,
          type: 'multiple_failed_logins',
          count: failedLogins
        };
      }

      // Unusual data access pattern
      const accessCount = await AuditLog.countDocuments({
        userId,
        action: 'DATA_ACCESS',
        timestamp: {
          $gte: new Date(Date.now() - 600000) // Last 10 minutes
        }
      });

      if (accessCount > 20) {
        logger.warn('Suspicious activity detected: Bulk data access', {
          userId,
          count: accessCount
        });

        return {
          suspicious: true,
          type: 'bulk_data_access',
          count: accessCount
        };
      }

      return { suspicious: false };
    } catch (error) {
      logger.error('Suspicious activity detection failed', { error: error.message });
      return { suspicious: false };
    }
  }

  // Mask sensitive information in logs
  maskSensitive(value) {
    if (!value) return value;

    const str = JSON.stringify(value);

    // Mask email addresses
    let masked = str.replace(/[\w.-]+@[\w.-]+\.\w+/g, '***@***.***');

    // Mask phone numbers
    masked = masked.replace(/\d{10}/g, '****' + Math.floor(Math.random() * 10000));

    // Mask SSN-like patterns
    masked = masked.replace(/\d{3}-\d{2}-\d{4}/g, '***-**-****');

    // Mask credit card patterns
    masked = masked.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '****-****-****-****');

    return masked;
  }

  // Export audit log (HIPAA requires this capability)
  async exportAuditLog(startDate, endDate, format = 'json') {
    try {
      const logs = await AuditLog.find({
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ timestamp: -1 });

      logger.info('Audit log exported', {
        count: logs.length,
        format,
        dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
      });

      if (format === 'csv') {
        return this.logsToCSV(logs);
      }

      return logs;
    } catch (error) {
      logger.error('Audit log export failed', { error: error.message });
      return [];
    }
  }

  // Convert logs to CSV format
  logsToCSV(logs) {
    const headers = ['Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Details'];
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.userId || 'N/A',
      log.action,
      log.resourceType,
      log.resourceId,
      JSON.stringify(log.details).replace(/"/g, '""')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  // Compliance report
  async generateComplianceReport(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await AuditLog.find({
        timestamp: { $gte: startDate }
      });

      const totalAccess = logs.length;
      const dataModifications = logs.filter(l => l.details.modified).length;
      const adminActions = logs.filter(l => l.details.admin).length;
      const suspiciousEvents = logs.filter(l => l.action.includes('FAILURE')).length;

      const report = {
        period: `Last ${days} days`,
        generated: new Date(),
        summary: {
          totalAccess,
          dataModifications,
          adminActions,
          suspiciousEvents
        },
        byAction: this.groupBy(logs, 'action'),
        byUser: this.groupBy(logs, 'userId'),
        byResourceType: this.groupBy(logs, 'resourceType'),
        recommendations: this.getRecommendations(logs)
      };

      logger.info('Compliance report generated', {
        days,
        totalEvents: totalAccess
      });

      return report;
    } catch (error) {
      logger.error('Compliance report generation failed', { error: error.message });
      return null;
    }
  }

  // Group logs by field
  groupBy(logs, field) {
    return logs.reduce((acc, log) => {
      const key = log[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // Get compliance recommendations
  getRecommendations(logs) {
    const recommendations = [];

    // Check for high failure rate
    const failures = logs.filter(l => l.action.includes('FAILURE')).length;
    if (failures > logs.length * 0.1) {
      recommendations.push('⚠️  High authentication failure rate detected');
    }

    // Check for bulk access
    const bulkAccess = logs.filter(l => l.action === 'DATA_ACCESS').length;
    if (bulkAccess > logs.length * 0.3) {
      recommendations.push('⚠️  Consider monitoring bulk data access patterns');
    }

    // Check for admin activity
    const adminActivity = logs.filter(l => l.details?.admin).length;
    if (adminActivity === 0) {
      recommendations.push('✅ No admin modifications detected');
    }

    return recommendations;
  }
}

module.exports = new AuditLogService();
