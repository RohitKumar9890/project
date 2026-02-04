import { validationResult } from 'express-validator';
import { User, USER_ROLES } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, generateTokenFingerprint } from '../utils/jwt.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AuditLog, AUDIT_ACTIONS } from '../models/AuditLog.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';
import admin from 'firebase-admin';

const toAuthResponse = async (user, req) => {
  const payload = { sub: user._id.toString(), role: user.role };
  
  // Generate token fingerprint for additional security
  const fingerprint = generateTokenFingerprint(req.headers['user-agent'], req.ip);
  
  const accessToken = signAccessToken(payload, fingerprint);
  const refreshToken = signRefreshToken(payload, fingerprint);
  
  // Store refresh token in database
  await RefreshToken.create({
    userId: user._id.toString(),
    token: refreshToken,
    deviceInfo: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled || false,
    },
    accessToken,
    refreshToken,
  };
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role = 'student' } = req.body; // Default to student

  if (![USER_ROLES.FACULTY, USER_ROLES.STUDENT].includes(role)) {
    return res.status(400).json({ message: 'Invalid role for self-registration' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role, failedLoginAttempts: 0, accountLockedUntil: null });

    // Log registration
    await AuditLog.create({
      userId: user._id.toString(),
      action: AUDIT_ACTIONS.REGISTER,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email: user.email, role: user.role }
    });

    // Send welcome email
    sendEmail(user.email, 'welcomeEmail', {
      name: user.name,
      email: user.email,
      role: user.role,
      loginUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login`,
    }).catch(err => console.error('Welcome email error:', err));

    return res.status(201).json(await toAuthResponse(user, req));
  } catch (error) {
    // Handle password validation errors
    if (error.validationErrors) {
      return res.status(400).json({ 
        message: error.message, 
        errors: error.validationErrors 
      });
    }
    throw error;
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, mfaToken } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    // Log failed login attempt
    await AuditLog.create({
      action: AUDIT_ACTIONS.FAILED_LOGIN,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email, reason: 'User not found or inactive' },
      success: false
    });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if account is locked
  if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.accountLockedUntil) - new Date()) / 60000);
    await AuditLog.create({
      userId: user._id.toString(),
      action: AUDIT_ACTIONS.FAILED_LOGIN,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email, reason: 'Account locked' },
      success: false
    });
    return res.status(423).json({ 
      message: `Account is locked due to multiple failed login attempts. Please try again in ${minutesLeft} minute(s).` 
    });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    // Increment failed login attempts
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updates = { failedLoginAttempts: failedAttempts };
    
    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
      updates.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await AuditLog.create({
        userId: user._id.toString(),
        action: AUDIT_ACTIONS.ACCOUNT_LOCKED,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { email, failedAttempts }
      });
    }
    
    await User.updateById(user._id, updates);
    
    await AuditLog.create({
      userId: user._id.toString(),
      action: AUDIT_ACTIONS.FAILED_LOGIN,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email, failedAttempts },
      success: false
    });
    
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check MFA if enabled
  if (user.mfaEnabled && user.mfaSecret) {
    if (!mfaToken) {
      return res.status(403).json({ 
        message: 'MFA token required',
        requiresMFA: true 
      });
    }
    
    const { verifyMFAToken } = await import('../utils/mfa.js');
    const isValidMFA = verifyMFAToken(mfaToken, user.mfaSecret);
    
    if (!isValidMFA) {
      await AuditLog.create({
        userId: user._id.toString(),
        action: AUDIT_ACTIONS.FAILED_LOGIN,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { email, reason: 'Invalid MFA token' },
        success: false
      });
      return res.status(401).json({ message: 'Invalid MFA token' });
    }
  }

  // Reset failed login attempts on successful login
  await User.updateById(user._id, { 
    failedLoginAttempts: 0, 
    accountLockedUntil: null,
    lastLoginAt: new Date()
  });

  // Log successful login
  await AuditLog.create({
    userId: user._id.toString(),
    action: AUDIT_ACTIONS.LOGIN,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { email }
  });

  return res.json(await toAuthResponse(user, req));
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Missing refreshToken' });
  }

  try {
    // Generate fingerprint for verification
    const fingerprint = generateTokenFingerprint(req.headers['user-agent'], req.ip);
    
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken, fingerprint);
    
    // Check if token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({ token: refreshToken, isRevoked: false });
    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid or revoked refresh token' });
    }
    
    // Check if token is expired
    const expiresAt = storedToken.expiresAt?.toDate?.() || storedToken.expiresAt;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Revoke old refresh token (token rotation)
    await RefreshToken.revokeToken(storedToken._id || storedToken.id);
    
    // Issue new tokens
    return res.json(await toAuthResponse(user, req));
  } catch (e) {
    console.error('Refresh token error:', e.message);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const me = async (req, res) => {
  return res.json({ user: req.user });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    // Revoke the specific refresh token
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (storedToken) {
      await RefreshToken.revokeToken(storedToken._id || storedToken.id);
    }
  }
  
  // Log logout
  await AuditLog.create({
    userId: req.user.id,
    action: AUDIT_ACTIONS.LOGOUT,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  return res.json({ message: 'Logged out successfully' });
};

export const logoutAll = async (req, res) => {
  // Revoke all refresh tokens for the user
  await RefreshToken.revokeAllUserTokens(req.user.id);
  
  // Log logout from all devices
  await AuditLog.create({
    userId: req.user.id,
    action: AUDIT_ACTIONS.LOGOUT,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { logoutAll: true }
  });
  
  return res.json({ message: 'Logged out from all devices successfully' });
};

// Password reset functionality
export const requestPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour

  // Save reset token to user
  await User.updateById(user._id, {
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: resetTokenExpiry,
  });

  // Send reset email
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  sendEmail(user.email, 'passwordReset', {
    name: user.name,
    resetUrl: resetUrl,
  }).catch(err => console.error('Password reset email error:', err));

  return res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
};

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  // Hash the token to compare with stored hash
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const users = await User.find({});
  const user = users.find(u => 
    u.resetPasswordToken === resetTokenHash && 
    u.resetPasswordExpires > Date.now()
  );

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  // Update password and clear reset token
  const passwordHash = await hashPassword(newPassword);
  await User.updateById(user._id, {
    passwordHash,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  return res.json({ message: 'Password reset successfully. You can now login with your new password.' });
};

/**
 * OAuth Login (Google/Microsoft via Firebase Authentication)
 * Verifies Firebase ID token and creates/logs in user
 */
export const oauthLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { idToken, provider } = req.body;

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const { email, name, picture, uid, firebase } = decodedToken;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email not provided by OAuth provider. Please use an account with email access.' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user - check if active
      if (!user.isActive) {
        return res.status(401).json({ 
          message: 'Account is deactivated. Please contact administrator.' 
        });
      }

      // Update OAuth info if needed
      const updates = {};
      if (picture && !user.photoURL) {
        updates.photoURL = picture;
      }
      if (uid && !user.firebaseUid) {
        updates.firebaseUid = uid;
      }
      if (provider && !user.oauthProvider) {
        updates.oauthProvider = provider;
      }

      if (Object.keys(updates).length > 0) {
        await User.updateById(user._id, updates);
        user = await User.findById(user._id);
      }
    } else {
      // New user - auto-create with student role
      // Extract provider from Firebase sign-in method
      const signInProvider = firebase?.sign_in_provider || provider || 'oauth';
      
      user = await User.create({
        name: name || email.split('@')[0], // Use email prefix if no name
        email: email.toLowerCase(),
        role: USER_ROLES.STUDENT, // Default to student for OAuth
        passwordHash: null, // OAuth users don't have password
        firebaseUid: uid,
        oauthProvider: signInProvider,
        photoURL: picture || null,
        isActive: true,
      });

      // Send welcome email
      sendEmail(user.email, 'welcomeEmail', {
        name: user.name,
        email: user.email,
        role: user.role,
        loginUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login`,
        isOAuth: true,
        provider: signInProvider,
      }).catch(err => console.error('Welcome email error:', err));
    }

    // Return tokens
    return res.json(await toAuthResponse(user, req));
    
  } catch (error) {
    console.error('OAuth login error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Authentication token expired. Please try again.' });
    }
    
    if (error.code === 'auth/invalid-id-token' || error.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    return res.status(500).json({ 
      message: 'OAuth authentication failed. Please try again.' 
    });
  }
};

// ============ MFA Endpoints ============

export const setupMFA = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (user.mfaEnabled) {
    return res.status(400).json({ message: 'MFA is already enabled' });
  }
  
  const { generateMFASecret, generateQRCode } = await import('../utils/mfa.js');
  
  // Generate MFA secret
  const { secret, otpauthUrl } = generateMFASecret(user.email);
  
  // Generate QR code
  const qrCode = await generateQRCode(otpauthUrl);
  
  // Store secret temporarily (not yet enabled)
  await User.updateById(userId, { mfaTempSecret: secret });
  
  return res.json({
    secret,
    qrCode,
    message: 'Scan the QR code with your authenticator app and verify with a token to enable MFA'
  });
};

export const verifyAndEnableMFA = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { token } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);
  
  if (!user || !user.mfaTempSecret) {
    return res.status(400).json({ message: 'MFA setup not initiated' });
  }
  
  const { verifyMFAToken, generateBackupCodes } = await import('../utils/mfa.js');
  
  // Verify the token
  const isValid = verifyMFAToken(token, user.mfaTempSecret);
  
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid MFA token' });
  }
  
  // Generate backup codes
  const backupCodes = generateBackupCodes();
  
  // Enable MFA
  await User.updateById(userId, {
    mfaEnabled: true,
    mfaSecret: user.mfaTempSecret,
    mfaTempSecret: null,
    mfaBackupCodes: backupCodes
  });
  
  // Log MFA enabled
  await AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.MFA_ENABLED,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  return res.json({
    message: 'MFA enabled successfully',
    backupCodes,
    warning: 'Save these backup codes in a safe place. They can be used if you lose access to your authenticator app.'
  });
};

export const disableMFA = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { password, token } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (!user.mfaEnabled) {
    return res.status(400).json({ message: 'MFA is not enabled' });
  }
  
  // Verify password
  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ message: 'Invalid password' });
  }
  
  // Verify MFA token
  const { verifyMFAToken } = await import('../utils/mfa.js');
  const isValid = verifyMFAToken(token, user.mfaSecret);
  
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid MFA token' });
  }
  
  // Disable MFA
  await User.updateById(userId, {
    mfaEnabled: false,
    mfaSecret: null,
    mfaBackupCodes: null
  });
  
  // Log MFA disabled
  await AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.MFA_DISABLED,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  return res.json({ message: 'MFA disabled successfully' });
};
