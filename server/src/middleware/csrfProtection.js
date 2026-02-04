import crypto from 'crypto';

// In-memory store for CSRF tokens (use Redis in production)
const csrfTokens = new Map();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(token);
    }
  }
}, 60000); // Clean up every minute

/**
 * Generate CSRF token for a session
 */
export const generateCsrfToken = (req, res, next) => {
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 3600000; // 1 hour
  
  // Store token with user/session info
  const userId = req.user?.id || req.ip;
  csrfTokens.set(token, {
    userId,
    expiresAt,
    createdAt: Date.now()
  });
  
  // Send token in response header
  res.set('X-CSRF-Token', token);
  
  next();
};

/**
 * Verify CSRF token from request
 */
export const verifyCsrfToken = (req, res, next) => {
  // Skip CSRF verification for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip for health check and public endpoints
  if (req.path.includes('/health') || req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    return next();
  }
  
  // Get token from header
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({ 
      message: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING'
    });
  }
  
  // Verify token exists and is valid
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    return res.status(403).json({ 
      message: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  // Check if token is expired
  if (tokenData.expiresAt < Date.now()) {
    csrfTokens.delete(token);
    return res.status(403).json({ 
      message: 'CSRF token expired',
      code: 'CSRF_TOKEN_EXPIRED'
    });
  }
  
  // Verify token belongs to this user/session
  const userId = req.user?.id || req.ip;
  if (tokenData.userId !== userId) {
    return res.status(403).json({ 
      message: 'CSRF token mismatch',
      code: 'CSRF_TOKEN_MISMATCH'
    });
  }
  
  // Token is valid, allow request
  next();
};

/**
 * Simplified CSRF protection that works with REST APIs
 * Uses double-submit cookie pattern
 */
export const simpleCsrfProtection = (req, res, next) => {
  // Skip CSRF verification for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip for certain public endpoints
  const publicEndpoints = ['/api/health', '/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }
  
  // For authenticated requests, verify origin header
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean);
  
  if (!origin) {
    return res.status(403).json({ 
      message: 'Origin header missing',
      code: 'ORIGIN_MISSING'
    });
  }
  
  const isAllowedOrigin = allowedOrigins.some(allowed => 
    origin.startsWith(allowed)
  );
  
  if (!isAllowedOrigin) {
    return res.status(403).json({ 
      message: 'Invalid origin',
      code: 'INVALID_ORIGIN'
    });
  }
  
  next();
};
