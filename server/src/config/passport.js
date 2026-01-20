import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { User, USER_ROLES } from '../models/User.js';

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id || user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({
            oauthProvider: 'google',
            oauthId: profile.id,
          });

          if (user) {
            // Update user info if needed
            if (user.name !== profile.displayName || user.avatar !== profile.photos?.[0]?.value) {
              user = await User.updateById(user._id, {
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
              });
            }
            return done(null, user);
          }

          // Check if user exists with this email (for linking accounts)
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            
            if (user) {
              // Link Google account to existing user
              user = await User.updateById(user._id, {
                oauthProvider: 'google',
                oauthId: profile.id,
                avatar: profile.photos?.[0]?.value || user.avatar,
              });
              return done(null, user);
            }
          }

          // Create new user
          if (!email) {
            return done(new Error('Email not provided by Google'), null);
          }

          user = await User.create({
            name: profile.displayName,
            email: email,
            oauthProvider: 'google',
            oauthId: profile.id,
            avatar: profile.photos?.[0]?.value,
            role: USER_ROLES.STUDENT, // Default role for OAuth users
            isActive: true,
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Microsoft OAuth Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:5000/api/auth/microsoft/callback',
        scope: ['user.read'],
        tenant: process.env.MICROSOFT_TENANT || 'common',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Microsoft ID
          let user = await User.findOne({
            oauthProvider: 'microsoft',
            oauthId: profile.id,
          });

          if (user) {
            // Update user info if needed
            if (user.name !== profile.displayName) {
              user = await User.updateById(user._id, {
                name: profile.displayName,
              });
            }
            return done(null, user);
          }

          // Check if user exists with this email (for linking accounts)
          const email = profile.emails?.[0]?.value || profile.userPrincipalName;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            
            if (user) {
              // Link Microsoft account to existing user
              user = await User.updateById(user._id, {
                oauthProvider: 'microsoft',
                oauthId: profile.id,
              });
              return done(null, user);
            }
          }

          // Create new user
          if (!email) {
            return done(new Error('Email not provided by Microsoft'), null);
          }

          user = await User.create({
            name: profile.displayName,
            email: email,
            oauthProvider: 'microsoft',
            oauthId: profile.id,
            role: USER_ROLES.STUDENT, // Default role for OAuth users
            isActive: true,
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
