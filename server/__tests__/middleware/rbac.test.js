const {
  ROLES,
  PERMISSIONS,
  requireRole,
  requirePermission,
  requireOwnership,
  canAccess,
  getRolePermissions
} = require('../../middleware/rbac');

describe('RBAC Middleware', () => {
  describe('Roles and Permissions', () => {
    test('should define all roles', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.THERAPIST).toBe('therapist');
      expect(ROLES.PATIENT).toBe('patient');
      expect(ROLES.GUEST).toBe('guest');
    });

    test('should define all permissions', () => {
      expect(PERMISSIONS['user.create']).toBeDefined();
      expect(PERMISSIONS['patient.view']).toBeDefined();
      expect(PERMISSIONS['therapist.list']).toBeDefined();
      expect(PERMISSIONS['appointment.create']).toBeDefined();
    });
  });

  describe('canAccess helper', () => {
    test('admin should access all resources', () => {
      expect(canAccess('admin', 'user.create')).toBe(true);
      expect(canAccess('admin', 'admin.users')).toBe(true);
      expect(canAccess('admin', 'appointment.delete')).toBe(true);
    });

    test('patient should access patient-specific actions', () => {
      expect(canAccess('patient', 'patient.profile')).toBe(true);
      expect(canAccess('patient', 'appointment.create')).toBe(true);
      expect(canAccess('patient', 'mood.create')).toBe(true);
    });

    test('therapist should access therapist-specific actions', () => {
      expect(canAccess('therapist', 'therapist.view')).toBe(true);
      expect(canAccess('therapist', 'patient.list')).toBe(true);
      expect(canAccess('therapist', 'appointment.update')).toBe(true);
    });

    test('guest should only access public resources', () => {
      expect(canAccess('guest', 'community.read')).toBe(true);
      expect(canAccess('guest', 'user.create')).toBe(false);
      expect(canAccess('guest', 'appointment.create')).toBe(false);
    });
  });

  describe('getRolePermissions helper', () => {
    test('should return all permissions for admin', () => {
      const adminPermissions = getRolePermissions('admin');
      expect(adminPermissions.length).toBeGreaterThan(20);
      expect(adminPermissions).toContain('user.create');
      expect(adminPermissions).toContain('admin.users');
    });

    test('should return patient-specific permissions', () => {
      const patientPermissions = getRolePermissions('patient');
      expect(patientPermissions).toContain('patient.profile');
      expect(patientPermissions).toContain('mood.create');
      expect(patientPermissions).not.toContain('user.delete');
    });

    test('should return therapist-specific permissions', () => {
      const therapistPermissions = getRolePermissions('therapist');
      expect(therapistPermissions).toContain('therapist.view');
      expect(therapistPermissions).toContain('patient.list');
      expect(therapistPermissions).not.toContain('user.delete');
    });
  });

  describe('requireRole middleware', () => {
    test('should allow user with required role', () => {
      const req = { user: { _id: '123', role: 'admin' } };
      const res = { status: () => ({ json: () => {} }) };
      const next = jest.fn();

      requireRole(['admin'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should deny user without required role', () => {
      const req = { user: { _id: '123', role: 'patient' }, path: '/admin' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireRole(['admin'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny unauthenticated user', () => {
      const req = { user: null, path: '/admin' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireRole(['admin'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('should allow multiple roles', () => {
      const req = { user: { _id: '123', role: 'therapist' } };
      const res = { status: () => ({ json: () => {} }) };
      const next = jest.fn();

      requireRole(['admin', 'therapist'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requirePermission middleware', () => {
    test('should allow user with required permission', () => {
      const req = { user: { _id: '123', role: 'admin' } };
      const res = { status: () => ({ json: () => {} }) };
      const next = jest.fn();

      requirePermission('user.create')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should deny user without required permission', () => {
      const req = { user: { _id: '123', role: 'patient' }, path: '/api/users' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requirePermission('user.delete')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny unauthenticated user', () => {
      const req = { user: null, path: '/api/users' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requirePermission('user.create')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnership middleware', () => {
    test('should allow user to access own resource', () => {
      const userId = '507f1f77bcf86cd799439011';
      const req = {
        user: { _id: userId },
        params: { userId }
      };
      const res = { status: () => ({ json: () => {} }) };
      const next = jest.fn();

      requireOwnership('userId')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should deny user accessing another user resource', () => {
      const req = {
        user: { _id: '507f1f77bcf86cd799439011' },
        params: { userId: '607f1f77bcf86cd799439012' },
        path: '/api/mood'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireOwnership('userId')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should allow therapist to access any resource', () => {
      const req = {
        user: { _id: '507f1f77bcf86cd799439011', role: 'therapist' },
        params: { userId: '607f1f77bcf86cd799439012' }
      };
      const res = { status: () => ({ json: () => {} }) };
      const next = jest.fn();

      requireOwnership('userId')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should allow admin to access any resource', () => {
      const req = {
        user: { _id: '507f1f77bcf86cd799439011', role: 'admin' },
        params: { userId: '607f1f77bcf86cd799439012' }
      };
      const res = { status: () => ({ json: () => {} }) };
      const next = jest.fn();

      requireOwnership('userId')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should deny unauthenticated user', () => {
      const req = {
        user: null,
        params: { userId: '607f1f77bcf86cd799439012' },
        path: '/api/mood'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireOwnership('userId')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
