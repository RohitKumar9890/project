import { maskSensitiveData } from '../utils/sanitization.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log full error server-side with masked sensitive data
  console.error('[ERROR]', maskSensitiveData({
    message: err.message,
    stack: err.stack,
    user: req.user?.id || 'anonymous',
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    statusCode
  }));
  
  // Send appropriate error to client
  res.status(statusCode);

  // Never expose internal errors in production
  const message = isProduction && statusCode === 500 
    ? 'Internal server error' 
    : err.message;

  res.json({
    message,
    // Include validation errors if present
    ...(err.validationErrors ? { errors: err.validationErrors } : {}),
    // Only include stack trace in development
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
