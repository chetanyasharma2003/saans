const jwt = require('jsonwebtoken');

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

    jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authenticateToken };
