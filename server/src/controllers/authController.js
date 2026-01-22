import { validationResult } from 'express-validator';
import { User, USER_ROLES } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';
import admin from 'firebase-admin';

const toAuthResponse = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
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

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });

  // Send welcome email
  sendEmail(user.email, 'welcomeEmail', {
    name: user.name,
    email: user.email,
    role: user.role,
    loginUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login`,
  }).catch(err => console.error('Welcome email error:', err));

  return res.status(201).json(toAuthResponse(user));
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json(toAuthResponse(user));
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Missing refreshToken' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    return res.json(toAuthResponse(user));
  } catch (e) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const me = async (req, res) => {
  return res.json({ user: req.user });
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
    return res.json(toAuthResponse(user));
    
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
