const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required. Please log in to access this resource.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'campus_lost_found_dev_jwt_secret_key_3847294829348923'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    if (user.isBlocked) {
      return sendError(res, 403, 'Your account has been suspended by campus administration.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired session. Please log in again.');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, `User role (${req.user?.role || 'guest'}) is not authorized to access this route.`);
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'campus_lost_found_dev_jwt_secret_key_3847294829348923'
    );
    const user = await User.findById(decoded.id).select('-password');
    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch (err) {
    // Silently continue for optional auth
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
