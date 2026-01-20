import passport from '../config/passport.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

/**
 * Generate auth response with tokens
 */
const toAuthResponse = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

/**
 * Handle OAuth callback success
 */
export const handleOAuthCallback = (req, res) => {
  try {
    if (!req.user) {
      // OAuth failed - redirect to login with error
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }

    const authData = toAuthResponse(req.user);
    
    // Redirect to client with tokens in URL hash (more secure than query params)
    // The client will extract these and store them properly
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/oauth-callback`;
    const params = new URLSearchParams({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      userId: authData.user.id,
      userName: authData.user.name,
      userEmail: authData.user.email,
      userRole: authData.user.role,
      userAvatar: authData.user.avatar || '',
    });
    
    return res.redirect(`${redirectUrl}?${params.toString()}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=oauth_error`);
  }
};

/**
 * Initiate Google OAuth flow
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * Handle Google OAuth callback
 */
export const googleCallback = [
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=google_auth_failed`,
  }),
  handleOAuthCallback,
];

/**
 * Initiate Microsoft OAuth flow
 */
export const microsoftAuth = passport.authenticate('microsoft', {
  scope: ['user.read'],
  session: false,
});

/**
 * Handle Microsoft OAuth callback
 */
export const microsoftCallback = [
  passport.authenticate('microsoft', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=microsoft_auth_failed`,
  }),
  handleOAuthCallback,
];
