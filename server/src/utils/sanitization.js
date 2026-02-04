import xss from 'xss';
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // First escape, then apply XSS filter
  return xss(validator.escape(input));
};

/**
 * Sanitize HTML content - allows safe HTML tags
 */
export const sanitizeHtmlContent = (html) => {
  if (typeof html !== 'string') return html;
  
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      'code': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      'a': ['http', 'https', 'mailto']
    }
  });
};

/**
 * Validate and sanitize URL
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Validate URL format
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  })) {
    throw new Error('Invalid URL format');
  }
  
  return validator.escape(url);
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  const normalized = validator.normalizeEmail(email);
  if (!normalized || !validator.isEmail(normalized)) {
    throw new Error('Invalid email address');
  }
  
  return normalized;
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return null;
  
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove dangerous characters
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
};

/**
 * Sanitize object - recursively sanitize all string values
 */
export const sanitizeObject = (obj, options = {}) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const { allowHtml = false, skipFields = [] } = options;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (skipFields.includes(key)) {
      sanitized[key] = obj[key];
      continue;
    }
    
    const value = obj[key];
    
    if (typeof value === 'string') {
      sanitized[key] = allowHtml ? sanitizeHtmlContent(value) : sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize integer input
 */
export const sanitizeInteger = (value, min = null, max = null) => {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    throw new Error('Invalid number format');
  }
  
  if (min !== null && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }
  
  if (max !== null && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }
  
  return num;
};

/**
 * Mask sensitive data in logs (emails, IPs, etc.)
 */
export const maskSensitiveData = (data) => {
  if (!data) return data;
  
  let masked = JSON.stringify(data);
  
  // Mask emails
  masked = masked.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    (email) => {
      const [local, domain] = email.split('@');
      return `${local[0]}***@${domain}`;
    }
  );
  
  // Mask IPs
  masked = masked.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    (ip) => {
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.***.***.`;
    }
  );
  
  // Mask tokens
  masked = masked.replace(
    /"(token|password|secret|key)":\s*"[^"]+"/gi,
    (match) => match.replace(/"[^"]+"$/, '"***"')
  );
  
  return JSON.parse(masked);
};
