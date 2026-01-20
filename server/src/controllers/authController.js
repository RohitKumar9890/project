import { validationResult } from 'express-validator';
import { User, USER_ROLES } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const toAuthResponse = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
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

  return res.status(201).json(toAuthResponse(user));
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // eslint-disable-next-line no-console
    console.log('Login validation failed:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    // eslint-disable-next-line no-console
    console.log(`Login failed: User not found or inactive - ${email}`);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if user registered via OAuth (no password)
  if (!user.passwordHash && user.oauthProvider) {
    // eslint-disable-next-line no-console
    console.log(`Login failed: OAuth user attempting password login - ${email}`);
    return res.status(401).json({ 
      message: `This account uses ${user.oauthProvider} login. Please use the "Sign in with ${user.oauthProvider}" button.`,
      oauthProvider: user.oauthProvider 
    });
  }

  if (!user.passwordHash) {
    // eslint-disable-next-line no-console
    console.log(`Login failed: No password set for user - ${email}`);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    // eslint-disable-next-line no-console
    console.log(`Login failed: Invalid password for - ${email}`);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // eslint-disable-next-line no-console
  console.log(`Login successful: ${user.email} (${user.role})`);
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
