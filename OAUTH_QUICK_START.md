# OAuth Quick Start Guide

## ✅ What's Been Implemented

Google and Microsoft OAuth authentication has been fully integrated into your EduEval platform!

### Features Added
- 🔐 **Google OAuth** - Sign in with Google account
- 🔐 **Microsoft OAuth** - Sign in with Microsoft/Outlook account  
- 🔗 **Account Linking** - Automatically links OAuth accounts to existing email accounts
- 👤 **User Avatars** - Profile pictures from OAuth providers
- 🛡️ **Secure Authentication** - JWT tokens with proper session management
- 🎨 **Updated UI** - Beautiful OAuth buttons on login page

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get OAuth Credentials

#### For Google:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:5000/api/oauth/google/callback`
5. Copy Client ID and Client Secret

#### For Microsoft:
1. Go to [Azure Portal](https://portal.azure.com/)
2. Azure AD → App registrations → New registration
3. Add redirect URI: `http://localhost:5000/api/oauth/microsoft/callback`
4. Create client secret in "Certificates & secrets"
5. Copy Application (client) ID and secret value

### Step 2: Update Environment Variables

Add to `server/.env`:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/oauth/microsoft/callback
MICROSOFT_TENANT=common

CLIENT_URL=http://localhost:3000
```

### Step 3: Restart Server

```bash
cd server
npm run dev
```

That's it! 🎉

---

## 📝 How to Use

### For Users
1. Navigate to http://localhost:3000/auth/login
2. Click **"Sign in with Google"** or **"Sign in with Microsoft"**
3. Complete authentication with provider
4. Get redirected back and logged in automatically

### For Developers

**API Endpoints:**
- `GET /api/oauth/google` - Start Google OAuth flow
- `GET /api/oauth/google/callback` - Google callback handler
- `GET /api/oauth/microsoft` - Start Microsoft OAuth flow
- `GET /api/oauth/microsoft/callback` - Microsoft callback handler

**New User Fields:**
```javascript
{
  oauthProvider: 'google' | 'microsoft' | null,
  oauthId: 'provider-user-id',
  avatar: 'https://profile-image-url.com/photo.jpg',
  passwordHash: null // Optional for OAuth users
}
```

---

## 🔍 Testing Without OAuth Credentials

Even without OAuth credentials configured, your app still works:
- Email/password login continues to work normally
- OAuth buttons appear but won't work until credentials are added
- No breaking changes to existing functionality

---

## 📚 Detailed Documentation

For complete setup instructions, troubleshooting, and production deployment, see:
- **[OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)** - Comprehensive setup guide

---

## 🏗️ Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │    Server    │         │   OAuth     │
│  (Next.js)  │         │  (Express)   │         │  Provider   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Click OAuth btn   │                        │
       ├──────────────────────>│                        │
       │                       │  2. Redirect to OAuth  │
       │                       ├───────────────────────>│
       │                       │                        │
       │     3. User authenticates                      │
       │<──────────────────────────────────────────────┤
       │                       │                        │
       │                       │  4. Callback with code │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │  5. Exchange for profile
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │  6. User profile data  │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │  7. Create/update user │
       │                       │     Generate JWT       │
       │                       │                        │
       │  8. Redirect with JWT │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │  9. Store tokens &    │                        │
       │     redirect to app   │                        │
       └───────────────────────┘                        │
```

---

## 🔒 Security Features

✅ **Session-based OAuth flow** - Temporary sessions only during OAuth  
✅ **JWT tokens** - Secure authentication after OAuth  
✅ **HTTPS enforcement** - In production  
✅ **Secure cookies** - HttpOnly, Secure flags in production  
✅ **Account linking** - Prevents duplicate accounts  
✅ **Password optional** - OAuth users don't need passwords  

---

## 📦 Files Modified/Created

### Backend
- ✨ `server/src/config/passport.js` - Passport configuration
- ✨ `server/src/controllers/oauthController.js` - OAuth handlers
- ✨ `server/src/routes/oauthRoutes.js` - OAuth routes
- 📝 `server/src/models/User.js` - Added OAuth fields
- 📝 `server/src/controllers/authController.js` - OAuth user handling
- 📝 `server/src/app.js` - Passport middleware
- 📝 `server/.env.example` - OAuth environment variables
- 📦 `server/package.json` - Added passport packages

### Frontend
- 📝 `client/src/pages/auth/login.js` - OAuth buttons
- ✨ `client/src/pages/auth/oauth-callback.js` - Callback handler
- 📝 `client/.env.local` - Updated API URL
- ✨ `client/.env.local.example` - Environment template

### Documentation
- ✨ `OAUTH_SETUP_GUIDE.md` - Comprehensive setup guide
- ✨ `OAUTH_QUICK_START.md` - This file

---

## 🐛 Common Issues

**Issue:** "Redirect URI mismatch"  
**Fix:** Ensure callback URLs in provider settings match exactly with your `.env`

**Issue:** OAuth buttons don't work  
**Fix:** Make sure you've added OAuth credentials to `server/.env` and restarted the server

**Issue:** User created but can't login  
**Fix:** Check that user has `isActive: true` and proper role set

---

## 💡 Tips

- Use `common` tenant for Microsoft to support both personal and work accounts
- Test with test users before publishing OAuth consent screen
- Keep client secrets secure and never commit to git
- Update callback URLs when deploying to production
- Default role for OAuth users is "student" - admins can change this

---

## ✅ Ready to Use

Both servers are running:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000

Just add your OAuth credentials and start testing! 🚀
