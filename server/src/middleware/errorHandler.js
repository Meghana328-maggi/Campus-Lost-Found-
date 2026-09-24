const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for development
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error]: ${err.name} - ${err.message}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({
      success: false,
      message,
      errors: [message],
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return res.status(409).json({
      success: false,
      message,
      errors: [message],
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid session token',
      errors: ['Invalid token provided'],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please log in again.',
      errors: ['Token expired'],
    });
  }

  // Default server error
  const statusCode = error.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errors: [error.message || 'An unexpected error occurred.'],
  });
};

module.exports = errorHandler;
