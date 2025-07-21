const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests. Try again later.',
    res: {}
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = authRateLimiter;