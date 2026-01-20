import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');

    if (!token) {
      // eslint-disable-next-line no-console
      console.log('Auth failed: Missing token');
      return res.status(401).json({ message: 'Missing Authorization token' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || user.isActive === false) {
      // eslint-disable-next-line no-console
      console.log(`Auth failed: User not found or inactive - ${decoded.sub}`);
      return res.status(401).json({ message: 'Invalid user' });
    }

    req.user = { id: user._id || user.id, role: user.role, email: user.email, name: user.name };
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`Auth failed: ${err.message}`);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};
