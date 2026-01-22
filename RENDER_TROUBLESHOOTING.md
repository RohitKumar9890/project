# 🔧 Render Deployment Troubleshooting Guide

## Quick Fix Checklist

If your Render deployment is failing, follow these steps:

### ✅ Step 1: Update Your Repository

The `render.yaml` file has been updated with fixes. Push the changes to GitHub:

```bash
git add render.yaml
git commit -m "Fix Render deployment configuration"
git push origin main
```

### ✅ Step 2: Check Required Environment Variables

Go to your Render service → **Environment** tab and verify these are set:

#### **REQUIRED Variables (Build will fail without these):**

```bash
# JWT Secrets - Generate using: npm run generate-secrets
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-refresh-secret>

# Firebase Credentials - From firebase-service-account.json
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_CLIENT_EMAIL=<your-client-email>
FIREBASE_PRIVATE_KEY=<your-private-key-with-newlines>
FIREBASE_DATABASE_URL=https://<your-project-id>.firebaseio.com
```

⚠️ **CRITICAL:** For `FIREBASE_PRIVATE_KEY`, make sure to include the full key including:
- `-----BEGIN PRIVATE KEY-----`
- All the key content
- `-----END PRIVATE KEY-----`
- Keep `\n` as literal `\n` (Render will handle the conversion)

### ✅ Step 3: Trigger Manual Deploy

1. Go to your Render dashboard
2. Select your `edueval-api` service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Watch the logs for errors

---

## 🐛 Common Errors and Solutions

### Error 1: "Module not found" or "Cannot find package"

**Cause:** Dependencies not installed correctly

**Solution:**
1. The updated `render.yaml` uses: `npm install --prefix server --production`
2. If still failing, check `server/package.json` has all dependencies listed
3. Clear build cache in Render: Settings → Build Cache → Clear Cache

---

### Error 2: "Firebase credentials not found"

**Cause:** Missing Firebase environment variables

**Solution:**
1. Check you have ALL four Firebase variables set:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_DATABASE_URL`

2. Get values from `server/firebase-service-account.json`:
```json
{
  "project_id": "your-project-id",        → FIREBASE_PROJECT_ID
  "client_email": "firebase-admin@...",    → FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE...",  → FIREBASE_PRIVATE_KEY
}
```

3. For `FIREBASE_DATABASE_URL`, use:
   `https://YOUR-PROJECT-ID.firebaseio.com`
   (or check your Firebase Console → Project Settings)

---

### Error 3: Build succeeds but app crashes on start

**Cause:** Missing JWT secrets or runtime error

**Solution:**
1. Check Render logs: Service → Logs tab
2. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
3. Look for specific error message in logs
4. Common issues:
   - Firebase credentials formatted incorrectly
   - Missing required environment variables
   - Port binding issues (should use PORT=5000)

---

### Error 4: "npm ERR! Unsupported engine"

**Cause:** Node version mismatch

**Solution:**
The project requires Node ≥18. Render should auto-detect this from `package.json`.

If it doesn't:
1. Check `server/package.json` has:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

2. In Render dashboard, verify Node version in Environment → Node Version

---

### Error 5: "Build failed: Command failed with exit code 1"

**Cause:** Generic build failure - need to check logs

**Solution:**
1. Go to Render Dashboard → Your Service → Events
2. Click on the failed deployment
3. Read the build logs carefully
4. Common causes:
   - Syntax errors in code
   - Missing dependencies in package.json
   - Permission issues
   - Network timeouts

**Debug steps:**
```bash
# Test build locally first:
cd server
npm install --production
npm start

# If local build works, but Render fails:
# - Check .gitignore isn't excluding necessary files
# - Verify all files are pushed to GitHub
```

---

### Error 6: "Cannot read properties of undefined (reading 'replace')"

**Cause:** `FIREBASE_PRIVATE_KEY` is not set or malformed

**Solution:**
1. The private key must be in quotes in Render dashboard
2. Keep the newlines as `\n` (literal backslash-n)
3. Example format:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0...\n-----END PRIVATE KEY-----\n
```

---

## 📋 Step-by-Step Firebase Key Setup

1. Open `server/firebase-service-account.json` in a text editor
2. Find the `private_key` field
3. Copy the ENTIRE value (including quotes)
4. In Render dashboard, paste it into `FIREBASE_PRIVATE_KEY`
5. Make sure it includes:
   - `-----BEGIN PRIVATE KEY-----`
   - All the key content (very long string)
   - `-----END PRIVATE KEY-----`
   - `\n` characters for line breaks

**Example:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...(more)...xyz\n-----END PRIVATE KEY-----\n"
```

---

## 🧪 Testing Your Deployment

After successful deployment:

### 1. Test Health Endpoint
```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

### 2. Test API Root
```bash
curl https://your-app.onrender.com/
```

Expected response:
```json
{"name":"EduEval API","status":"ok","version":"v1"}
```

### 3. Check Logs
- Go to Render Dashboard → Your Service → Logs
- Should see: `✓ Firebase initialized successfully`
- Should see: `Server running on port 5000`

---

## 🔄 Force Rebuild

If you've made changes and deployment still fails:

1. **Clear Build Cache:**
   - Render Dashboard → Service → Settings
   - Scroll to "Build Cache"
   - Click "Clear Build Cache"

2. **Manual Deploy:**
   - Click "Manual Deploy" → "Clear build cache & deploy"

3. **Check GitHub:**
   - Verify latest code is pushed: `git push origin main`
   - Check GitHub shows your latest commit

---

## 💡 Pro Tips

### Tip 1: Use Render Shell
Access your deployed app directly:
1. Render Dashboard → Service → Shell
2. Run commands to debug:
```bash
cd server
ls -la
cat package.json
npm list
```

### Tip 2: Check Environment Variables
In Render Shell:
```bash
echo $FIREBASE_PROJECT_ID
echo $JWT_SECRET
# Don't echo private key (security!)
```

### Tip 3: Monitor Cold Starts
Render free tier sleeps after inactivity:
- First request takes 30-60 seconds
- Use health check to keep it warm
- Or upgrade to paid plan for always-on

---

## 📞 Still Having Issues?

### Before asking for help, collect this info:

1. **Error message** from Render logs
2. **Build command** from render.yaml
3. **Environment variables** set (names only, not values!)
4. **Node version** from Render dashboard
5. **Local test results**:
```bash
cd server
npm install
npm start
# Does it work locally?
```

### Share in your issue/ticket:
- Error message
- Steps you've tried
- What works locally vs what fails in Render
- Screenshots of Render dashboard (hide secrets!)

---

## 🎯 Quick Reference: Complete Setup

```bash
# 1. Generate secrets locally
npm run generate-secrets

# 2. Get Firebase credentials
cat server/firebase-service-account.json

# 3. Set in Render (Environment tab):
NODE_ENV=production
PORT=5000
JWT_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FIREBASE_PROJECT_ID=<from json>
FIREBASE_CLIENT_EMAIL=<from json>
FIREBASE_PRIVATE_KEY=<from json>
FIREBASE_DATABASE_URL=https://<project-id>.firebaseio.com
CORS_ORIGIN=<your-vercel-url>
CLIENT_URL=<your-vercel-url>

# 4. Push code and deploy
git push origin main
# Then Manual Deploy in Render
```

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Logs show "Firebase initialized successfully"
- ✅ Logs show "Server running on port 5000"
- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ No error messages in logs
- ✅ Service shows "Live" status in Render dashboard

---

**Need more help?** Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for full setup instructions.
