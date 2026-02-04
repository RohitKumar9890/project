import { sanitizeObject } from '../utils/sanitization.js';

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (options = {}) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, options);
    }
    next();
  };
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = (options = {}) => {
  return (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, options);
    }
    next();
  };
};

/**
 * Middleware to sanitize params
 */
export const sanitizeParams = (options = {}) => {
  return (req, res, next) => {
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, options);
    }
    next();
  };
};

/**
 * Middleware to sanitize all request inputs
 */
export const sanitizeAll = (options = {}) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, options);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, options);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, options);
    }
    next();
  };
};
