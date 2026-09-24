const jwt = require('jsonwebtoken');

// Validate JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required and must be set');
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }

      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
