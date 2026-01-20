# 🚀 EduEval Deployment Guide

## Overview
This guide will help you deploy your EduEval application to free hosting platforms, then add OAuth with production URLs.

**Deployment Strategy:**
- Frontend (Next.js) → **Vercel** (Free)
- Backend (Express) → **Render** (Free)
- Database → **Firebase** (Already configured)

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free - sign up with GitHub)
- [ ] Render account (free - sign up with GitHub)
- [ ] Firebase project (already set up)
- [ ] Git installed on your computer

---

## STEP 1: Initialize Git Repository

Run these commands in your project root:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - EduEval with OAuth support"
```

---

## STEP 2: Create GitHub Repository

### Option A: Using GitHub Website
1. Go to https://github.com/new
2. Repository name: `edueval` (or your choice)
3. Description: `EduEval - Education Evaluation Platform with OAuth`
4. Choose: **Private** (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Option B: Using GitHub CLI (if installed)
```bash
gh repo create edueval --private --source=. --remote=origin
```

### Push your code:
```bash
# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/edueval.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## STEP 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### 3.2 Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `edueval` repository
4. Configure:
   - **Name**: `edueval-api` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3.3 Add Environment Variables
In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Update after deploying frontend
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# OAuth Configuration (Add after getting production URLs)
SESSION_SECRET=your-session-secret-change-this
CLIENT_URL=https://your-frontend-url.vercel.app

# Google OAuth (Leave empty for now, add after OAuth setup)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://edueval-api.onrender.com/api/oauth/google/callback

# Microsoft OAuth (Leave empty for now, add after OAuth setup)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=https://edueval-api.onrender.com/api/oauth/microsoft/callback
MICROSOFT_TENANT=common
```

**Note:** Replace `edueval-api` with your actual Render service name.

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Copy your backend URL: `https://edueval-api.onrender.com`

---

## STEP 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to https://vercel.com/
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

### 4.2 Deploy Frontend
1. Click "Add New..." → "Project"
2. Import your `edueval` repository
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 4.3 Add Environment Variables
In Vercel project settings → Environment Variables, add:

```env
NEXT_PUBLIC_API_URL=https://edueval-api.onrender.com
```

**Important:** Replace `edueval-api` with your actual Render service name.

### 4.4 Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL: `https://edueval-xyz123.vercel.app`

---

## STEP 5: Update CORS Configuration

### 5.1 Update Backend Environment Variable
1. Go back to Render dashboard
2. Find your backend service
3. Go to "Environment" tab
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://edueval-xyz123.vercel.app
   ```
5. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://edueval-xyz123.vercel.app
   ```
6. Save changes (service will auto-redeploy)

---

## STEP 6: Test Basic Deployment

### 6.1 Test Backend Health
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "..."
}
```

### 6.2 Test Frontend
Visit: `https://your-frontend-url.vercel.app`

You should see the login page.

### 6.3 Test Email/Password Login
1. Go to login page
2. Try logging in with existing test account
3. Should work normally (OAuth buttons won't work yet - that's expected)

---

## STEP 7: Setup Google OAuth with Production URLs

### 7.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create new one: "EduEval")

### 7.2 Configure OAuth Consent Screen
1. **APIs & Services** → **OAuth consent screen**
2. User Type: **External**
3. App name: `EduEval`
4. User support email: Your email
5. Developer contact: Your email
6. **Add Test Users**: Add your email for testing
7. Save and Continue through all steps

### 7.3 Create OAuth Credentials
1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `EduEval Production`
5. **Authorized JavaScript origins**:
   - Add: `https://your-frontend-url.vercel.app`
6. **Authorized redirect URIs**:
   - Add: `https://your-backend-url.onrender.com/api/oauth/google/callback`
7. Click **Create**
8. **Copy** Client ID and Client Secret

### 7.4 Add to Render Environment Variables
1. Go to Render dashboard → Your backend service
2. Environment tab
3. Update:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
4. Save (will auto-redeploy)

---

## STEP 8: Setup Microsoft OAuth with Production URLs

### 8.1 Go to Azure Portal
1. Visit: https://portal.azure.com/
2. Search: **Azure Active Directory** (or Microsoft Entra ID)

### 8.2 Register Application
1. **App registrations** → **New registration**
2. Name: `EduEval`
3. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
4. Redirect URI:
   - Platform: **Web**
   - URI: `https://your-backend-url.onrender.com/api/oauth/microsoft/callback`
5. Click **Register**

### 8.3 Copy Application ID
Copy the **Application (client) ID** from the overview page.

### 8.4 Create Client Secret
1. **Certificates & secrets** → **New client secret**
2. Description: `EduEval Production`
3. Expires: 24 months
4. Click **Add**
5. **Copy the Value immediately** (you can't see it again!)

### 8.5 Configure Permissions
1. **API permissions** → **Add a permission**
2. **Microsoft Graph** → **Delegated permissions**
3. Add: `email`, `openid`, `profile`
4. Click **Add permissions**

### 8.6 Enable ID Tokens
1. **Authentication** → Check **ID tokens**
2. Click **Save**

### 8.7 Add to Render Environment Variables
1. Go to Render dashboard → Your backend service
2. Environment tab
3. Update:
   ```
   MICROSOFT_CLIENT_ID=your-application-id
   MICROSOFT_CLIENT_SECRET=your-secret-value
   ```
4. Save (will auto-redeploy)

---

## STEP 9: Test OAuth in Production

### 9.1 Wait for Deployment
- After adding OAuth credentials, wait 2-3 minutes for Render to redeploy

### 9.2 Test Google OAuth
1. Visit: `https://your-frontend-url.vercel.app/auth/login`
2. Click **Sign in with Google**
3. Complete Google authentication
4. Should redirect back and log you in ✅

### 9.3 Test Microsoft OAuth
1. Visit: `https://your-frontend-url.vercel.app/auth/login`
2. Click **Sign in with Microsoft**
3. Complete Microsoft authentication
4. Should redirect back and log you in ✅

### 9.4 Test Account Linking
1. Create account with email/password
2. Log out
3. Sign in with OAuth using same email
4. Accounts should be linked ✅

---

## 🎉 Deployment Complete!

Your application is now live with:
- ✅ Production frontend on Vercel
- ✅ Production backend on Render
- ✅ Google OAuth working
- ✅ Microsoft OAuth working
- ✅ HTTPS enabled automatically
- ✅ Professional, shareable URLs

---

## 📝 Your Production URLs

**Frontend:** `https://your-app.vercel.app`
**Backend API:** `https://your-api.onrender.com`

**Important Links:**
- Login: `https://your-app.vercel.app/auth/login`
- Health Check: `https://your-api.onrender.com/api/health`
- Admin Panel: `https://your-app.vercel.app/admin/users`

---

## 🔧 Troubleshooting

### Issue: "CORS Error"
**Fix:** Make sure `CORS_ORIGIN` in Render matches your Vercel URL exactly

### Issue: "OAuth redirect mismatch"
**Fix:** Check that callback URLs in Google/Microsoft match your Render URL exactly

### Issue: "Cannot connect to backend"
**Fix:** Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL

### Issue: Render service keeps restarting
**Fix:** Check logs in Render dashboard for errors. Usually missing environment variables.

---

## 💰 Cost

- **Vercel Free Tier**: 100GB bandwidth, unlimited deployments
- **Render Free Tier**: 750 hours/month, auto-sleep after 15 min inactivity
- **Firebase**: Free tier is generous for small-medium apps
- **Total Monthly Cost**: **$0** 🎉

---

## 🚀 Next Steps

1. Add custom domain (optional)
2. Set up monitoring/analytics
3. Configure error tracking (Sentry)
4. Enable production optimizations
5. Set up CI/CD pipelines

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)
