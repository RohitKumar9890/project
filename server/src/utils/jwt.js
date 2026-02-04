import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate a secure token fingerprint for additional security
 */
export const generateTokenFingerprint = (userAgent, ipAddress) => {
  const data = `${userAgent || ''}:${ipAddress || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};

/**
 * Sign access token with short expiry (15 minutes)
 */
export const signAccessToken = (payload, fingerprint = null) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || '15m'; // Changed from 7d to 15m
  
  const tokenPayload = {
    ...payload,
    ...(fingerprint ? { fingerprint } : {}),
    type: 'access'
  };
  
  return jwt.sign(tokenPayload, secret, { expiresIn });
};

/**
 * Sign refresh token with longer expiry (7 days)
 */
export const signRefreshToken = (payload, fingerprint = null) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d'; // Changed from 30d to 7d
  
  const tokenPayload = {
    ...payload,
    ...(fingerprint ? { fingerprint } : {}),
    type: 'refresh'
  };
  
  return jwt.sign(tokenPayload, secret, { expiresIn });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token, expectedFingerprint = null) => {
  const secret = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, secret);
  
  // Verify token type
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  
  // Verify fingerprint if provided
  if (expectedFingerprint && decoded.fingerprint !== expectedFingerprint) {
    throw new Error('Token fingerprint mismatch');
  }
  
  return decoded;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token, expectedFingerprint = null) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const decoded = jwt.verify(token, secret);
  
  // Verify token type
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  
  // Verify fingerprint if provided
  if (expectedFingerprint && decoded.fingerprint !== expectedFingerprint) {
    throw new Error('Token fingerprint mismatch');
  }
  
  return decoded;
};
