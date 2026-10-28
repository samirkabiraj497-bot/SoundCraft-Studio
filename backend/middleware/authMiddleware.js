const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'soundcraft_studio_ultra_secret_key_987654321_jwt';

/**
 * Middleware to enforce authenticated JWT token
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No Bearer token provided in Authorization header.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, username, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Optional authentication middleware:
 * Populates req.user if a valid token is present, but doesn't block guests.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore token failure for optional endpoints
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
};
