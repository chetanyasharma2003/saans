const logger = require('../utils/logger');

/**
 * RBAC Middleware - Control access based on user roles
 *
 * Roles:
 * - admin: Full system access
 * - therapist: Patient management, session scheduling
 * - patient: Own data only, appointment booking
 * - guest: Limited read access (public resources)
 */

const ROLES = {
  ADMIN: 'admin',
  THERAPIST: 'therapist',
  PATIENT: 'patient',
  GUEST: 'guest'
};

const PERMISSIONS = {
  // User management
  'user.create': ['admin'],
  'user.read': ['admin', 'patient', 'therapist'],
  'user.update': ['admin'],
  'user.delete': ['admin'],

  // Patient management
  'patient.view': ['admin', 'therapist', 'patient'],
  'patient.list': ['admin', 'therapist'],
  'patient.profile': ['admin', 'patient'],

  // Therapist management
  'therapist.view': ['admin', 'therapist'],
  'therapist.list': ['admin', 'patient'],
  'therapist.profile': ['admin', 'therapist'],

  // Appointments
  'appointment.create': ['admin', 'patient', 'therapist'],
  'appointment.read': ['admin', 'therapist', 'patient'],
  'appointment.update': ['admin', 'therapist'],
  'appointment.delete': ['admin'],
  'appointment.list': ['admin', 'therapist'],

  // Mood tracking
  'mood.create': ['patient'],
  'mood.read': ['admin', 'patient', 'therapist'],
  'mood.update': ['admin', 'patient'],
  'mood.delete': ['admin'],
  'mood.list': ['admin', 'therapist'],

  // Community
  'community.create': ['admin', 'patient', 'therapist'],
  'community.read': ['admin', 'patient', 'therapist', 'guest'],
  'community.update': ['admin'],
  'community.delete': ['admin'],
  'community.moderate': ['admin', 'therapist'],

  // AI features
  'ai.access': ['admin', 'patient', 'therapist'],
  'ai.analyze': ['admin', 'therapist'],

  // File management
  'file.upload': ['admin', 'patient', 'therapist'],
  'file.read': ['admin', 'patient', 'therapist'],
  'file.delete': ['admin'],

  // Admin only
  'admin.users': ['admin'],
  'admin.reports': ['admin'],
  'admin.audit': ['admin'],
  'admin.settings': ['admin']
};

// Middleware: Check if user has required role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Unauthorized access attempt', { path: req.path });
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role || ROLES.GUEST;

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Insufficient permissions', {
        userId: req.user._id,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        requiredRole: allowedRoles
      });
    }

    next();
  };
};

// Middleware: Check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Unauthorized access attempt', { path: req.path });
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role || ROLES.GUEST;
    const allowedRoles = PERMISSIONS[permission] || [];

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Permission denied', {
        userId: req.user._id,
        userRole,
        permission,
        path: req.path
      });

      return res.status(403).json({
        error: `Permission denied: ${permission}`,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

// Middleware: Check resource ownership (for patient data)
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role || ROLES.GUEST;

    // Admins and therapists can access all resources
    if (['admin', 'therapist'].includes(userRole)) {
      return next();
    }

    // Patients can only access their own data
    const resourceUserId = req.params[resourceField] || req.body[resourceField];

    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      logger.warn('Ownership check failed', {
        userId: req.user._id,
        resourceUserId,
        path: req.path
      });

      return res.status(403).json({
        error: 'Cannot access other user\'s resources'
      });
    }

    next();
  };
};

// Helper: Check if user can perform action on resource
const canAccess = (userRole, action) => {
  const allowedRoles = PERMISSIONS[action] || [];
  return allowedRoles.includes(userRole);
};

// Helper: Get all permissions for a role
const getRolePermissions = (role) => {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission, _]) => permission);
};

module.exports = {
  ROLES,
  PERMISSIONS,
  requireRole,
  requirePermission,
  requireOwnership,
  canAccess,
  getRolePermissions
};
