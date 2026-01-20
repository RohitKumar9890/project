# OAuth Setup Guide - Google & Microsoft Authentication

This guide walks you through setting up Google and Microsoft OAuth authentication for the EduEval platform.

## Overview

The application now supports three authentication methods:
1. **Email/Password** - Traditional authentication
2. **Google OAuth** - Sign in with Google account
3. **Microsoft OAuth** - Sign in with Microsoft/Outlook account

## Features

- Seamless OAuth integration with Google and Microsoft
- Automatic account linking (if email already exists)
- User avatars from OAuth providers
- Secure token-based authentication
- Session management

## Prerequisites

Before setting up OAuth, you need to:
1. Have a Google Cloud Platform account (for Google OAuth)
2. Have a Microsoft Azure account (for Microsoft OAuth)
3. Update your `.env` files with OAuth credentials

---

## Part 1: Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click **OAuth consent screen** in the left sidebar
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: EduEval
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users (for development) if needed
6. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Go to **Credentials** tab
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: EduEval Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/oauth/google/callback` (development)
     - `https://yourapi.com/api/oauth/google/callback` (production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Update Environment Variables

Add to `server/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback
```

---

## Part 2: Microsoft OAuth Setup

### Step 1: Register an Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: EduEval
   - **Supported account types**: Choose based on your needs:
     - *Accounts in any organizational directory and personal Microsoft accounts* (recommended for most cases)
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `http://localhost:5000/api/oauth/microsoft/callback`
5. Click **Register**

### Step 2: Configure Authentication

1. In your app registration, go to **Authentication**
2. Under **Redirect URIs**, add production callback URL if needed:
   - `https://yourapi.com/api/oauth/microsoft/callback`
3. Under **Implicit grant and hybrid flows**, enable:
   - ✅ ID tokens
4. Click **Save**

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g., "EduEval Production")
4. Choose expiration period
5. Click **Add**
6. **IMPORTANT**: Copy the secret value immediately (you won't see it again!)

### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Choose **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read` (should be there by default)
   - `email`
   - `profile`
   - `openid`
6. Click **Add permissions**
7. (Optional) Click **Grant admin consent** for your organization

### Step 5: Get Application (Client) ID

1. Go to **Overview** in your app registration
2. Copy the **Application (client) ID**
3. Copy the **Directory (tenant) ID** (optional, use "common" for multi-tenant)

### Step 6: Update Environment Variables

Add to `server/.env`:

```env
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/oauth/microsoft/callback
MICROSOFT_TENANT=common
```

**Tenant Options:**
- `common` - Multi-tenant (personal + organizational accounts)
- `organizations` - Only organizational accounts
- `consumers` - Only personal Microsoft accounts
- `{tenant-id}` - Specific organization only

---

## Part 3: Server Configuration

### Complete Environment Variables

Ensure your `server/.env` has all required OAuth variables:

```env
# OAuth Configuration
SESSION_SECRET=your-long-random-session-secret
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/oauth/microsoft/callback
MICROSOFT_TENANT=common
```

### Restart the Server

After updating environment variables:

```bash
cd server
npm run dev
```

---

## Part 4: Client Configuration

Ensure your `client/.env.local` has the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Restart the client:

```bash
cd client
npm run dev
```

---

## Testing OAuth

### Test Google OAuth

1. Navigate to `http://localhost:3000/auth/login`
2. Click **Sign in with Google**
3. You'll be redirected to Google's sign-in page
4. Sign in with your Google account
5. Grant permissions to EduEval
6. You should be redirected back and logged in

### Test Microsoft OAuth

1. Navigate to `http://localhost:3000/auth/login`
2. Click **Sign in with Microsoft**
3. You'll be redirected to Microsoft's sign-in page
4. Sign in with your Microsoft/Outlook account
5. Grant permissions to EduEval
6. You should be redirected back and logged in

---

## How It Works

### OAuth Flow

1. User clicks "Sign in with Google/Microsoft"
2. User is redirected to provider's authorization page
3. User grants permission
4. Provider redirects back to callback URL with authorization code
5. Server exchanges code for user profile information
6. Server creates/updates user account
7. Server generates JWT tokens
8. User is redirected to client with tokens
9. Client stores tokens and redirects to dashboard

### Account Linking

If a user signs in with OAuth using an email that already exists:
- The OAuth provider information is linked to the existing account
- User can now sign in using either method
- Account data is preserved

### Default Role

New users created via OAuth are assigned the **student** role by default. Admins can change roles through the admin panel.

---

## Production Deployment

### Update Callback URLs

When deploying to production, update:

1. **Google Cloud Console**:
   - Add production callback URL: `https://api.yourdomain.com/api/oauth/google/callback`
   - Add production origin: `https://yourdomain.com`

2. **Azure Portal**:
   - Add production redirect URI: `https://api.yourdomain.com/api/oauth/microsoft/callback`

3. **Environment Variables**:
   ```env
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/oauth/google/callback
   MICROSOFT_CALLBACK_URL=https://api.yourdomain.com/api/oauth/microsoft/callback
   CLIENT_URL=https://yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   ```

### Security Considerations

- Always use HTTPS in production
- Keep client secrets secure and never commit them to version control
- Rotate secrets periodically
- Enable session cookie `secure` flag in production (already configured)
- Monitor OAuth usage and failed attempts
- Review and minimize requested OAuth scopes

---

## Troubleshooting

### "Redirect URI mismatch" Error

**Cause**: The callback URL in your OAuth provider settings doesn't match the one in your `.env` file.

**Solution**: 
- Ensure URLs match exactly (including http/https, port, path)
- Check for trailing slashes
- Wait a few minutes after updating settings

### "Access blocked" Error (Google)

**Cause**: App is not verified or user is not added as test user.

**Solution**:
- Add users to test users in OAuth consent screen
- Or complete the app verification process for production

### "AADSTS50011" Error (Microsoft)

**Cause**: Reply URL mismatch in Azure.

**Solution**:
- Verify redirect URI in Azure App Registration matches your `.env`
- Ensure the URI is registered in the Authentication section

### OAuth Callback Shows Error

**Cause**: Various issues with OAuth flow.

**Solution**:
- Check server logs for detailed error messages
- Verify environment variables are loaded correctly
- Ensure Passport strategies are initialized
- Check that session middleware is configured

### User Created but Can't Login

**Cause**: User might be inactive or role not set correctly.

**Solution**:
- Check user in database/Firestore
- Verify `isActive: true` and `role` is set
- Check server logs during login attempt

---

## API Endpoints

### OAuth Routes

- **GET** `/api/oauth/google` - Initiate Google OAuth
- **GET** `/api/oauth/google/callback` - Google OAuth callback
- **GET** `/api/oauth/microsoft` - Initiate Microsoft OAuth  
- **GET** `/api/oauth/microsoft/callback` - Microsoft OAuth callback

### Example Usage (Backend)

The OAuth routes are automatically handled by Passport.js. No direct API calls needed from the client except redirecting to the OAuth initiation URLs.

---

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Express Session Documentation](https://github.com/expressjs/session)

---

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure OAuth provider credentials are valid and not expired
4. Test with the provider's OAuth playground tools
5. Review the troubleshooting section above

## Summary

✅ Google OAuth configured with proper credentials
✅ Microsoft OAuth configured with proper credentials  
✅ Login page updated with OAuth buttons
✅ OAuth callback handling implemented
✅ Account linking supported
✅ Secure token management in place
