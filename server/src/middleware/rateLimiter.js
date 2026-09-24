const rateLimit = require('express-rate-limit');

// General API rate limiter (150 requests per 10 minutes)
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 10 minutes.',
    errors: ['Rate limit exceeded'],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter auth limiter (20 requests per 15 minutes for login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: ['Authentication rate limit exceeded'],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
};
