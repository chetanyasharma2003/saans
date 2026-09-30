const crypto = require('crypto');

// Simple CSRF token store (in production, use Redis or session store)
const tokenStore = new Map();

const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString('hex');
  tokenStore.set(sessionId, token);
  return token;
};

const verifyCSRFToken = (sessionId, token) => {
  const storedToken = tokenStore.get(sessionId);
  return storedToken && storedToken === token;
};

const csrfProtection = (req, res, next) => {
  const sessionId = req.userId || req.sessionID;

  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    // Generate token for GET requests
    const token = generateCSRFToken(sessionId);
    res.locals.csrfToken = token;
    return next();
  }

  // Verify token for POST, PUT, DELETE, PATCH
  const token = req.body._csrf || req.headers['x-csrf-token'];

  if (!token || !verifyCSRFToken(sessionId, token)) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token validation failed',
    });
  }

  next();
};

module.exports = {
  csrfProtection,
  generateCSRFToken,
  verifyCSRFToken,
};
