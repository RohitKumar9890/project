# 🎯 START HERE - Deploy EduEval in 30 Minutes

Your code is ready! Follow these steps to deploy.

---

## ✅ What's Already Done:
- ✅ Code committed to Git
- ✅ JWT secrets generated
- ✅ Firebase configuration exists
- ✅ Deployment guides created

---

## 🚀 Next Steps (Do These Now):

### **STEP 1: Create GitHub Repository** (5 minutes)

1. **Go to GitHub:** https://github.com/new
2. **Fill in:**
   - Repository name: `edueval` (or any name you prefer)
   - Description: `Educational Evaluation System`
   - Visibility: **Private** (recommended) or Public
   - ⚠️ **DO NOT** check "Add README" or any initialization options
3. **Click "Create repository"**
4. **Copy the repository URL** (looks like `https://github.com/YOUR-USERNAME/edueval.git`)

---

### **STEP 2: Push Your Code to GitHub** (2 minutes)

Open PowerShell in your project folder and run these commands:

```powershell
# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/edueval.git

# Push your code
git branch -M main
git push -u origin main
```

**If asked for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your regular password)
  - Generate token at: https://github.com/settings/tokens
  - Select "repo" scope
  - Copy and paste the token

---

### **STEP 3: Get Your Firebase Credentials** (3 minutes)

You already have `server/firebase-service-account.json`. We need to extract 3 values from it:

Run this PowerShell command in your project folder:

```powershell
$firebase = Get-Content server/firebase-service-account.json | ConvertFrom-Json
Write-Host "`nCopy these to Render environment variables:`n"
Write-Host "FIREBASE_PROJECT_ID=$($firebase.project_id)"
Write-Host "FIREBASE_CLIENT_EMAIL=$($firebase.client_email)"
Write-Host "`nFIREBASE_PRIVATE_KEY=`"$($firebase.private_key)`""
Write-Host "`nSave these for the next step!`n"
```

**Or manually:**
1. Open `server/firebase-service-account.json` in a text editor
2. Find and copy these 3 values:
   - `project_id`
   - `client_email`
   - `private_key` (the entire key including BEGIN/END lines)

---

### **STEP 4: Deploy Backend to Render** (10 minutes)

1. **Go to Render:** https://render.com/register
2. **Sign up** with GitHub (easiest)
3. **Click "New +" → "Web Service"**
4. **Connect your repository** and select it
5. **Configure:**
   - Name: `edueval-api`
   - Region: Oregon (or closest to you)
   - Branch: `main`
   - Root Directory: `server` ← **IMPORTANT!**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

6. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```env
NODE_ENV=production
PORT=5000

# Firebase (from Step 3)
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your entire private key...
-----END PRIVATE KEY-----"

# JWT (already generated for you)
JWT_SECRET=b9377d87bcbcc025b3ea0c4549810575199f3851dc435d9248dd0a34749422a0d574c6fe0707cf506f3798267f8a89c6900b7027b6f68ab2e39d0af44da44703
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=16c2ba33c6663d085f03c369bcc5e93a8112f5bb7c5656d0e253bdcad2a69bb2a12f509e1a1248f63e809a6f65d0affc9b5cb7f60261c13e6ad8c711a6780dc7
JWT_REFRESH_EXPIRE=30d

# CORS (temporary, will update later)
CORS_ORIGIN=*
CLIENT_URL=http://localhost:3000
```

7. **Click "Create Web Service"**
8. **Wait 5-10 minutes** for deployment
9. **Copy your backend URL** (e.g., `https://edueval-api.onrender.com`)
10. **Test it:** Visit `https://YOUR-URL.onrender.com/api/health`
    - Should see: `{"status":"success","message":"Server is running"}`

---

### **STEP 5: Deploy Frontend to Vercel** (5 minutes)

1. **Go to Vercel:** https://vercel.com/signup
2. **Sign up** with GitHub
3. **Click "Add New..." → "Project"**
4. **Import your repository**
5. **Configure Build Settings:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `client` ← **CLICK EDIT AND SET THIS!**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

6. **Add Environment Variable:**
   ```env
   NEXT_PUBLIC_API_URL=https://YOUR-RENDER-URL.onrender.com
   ```
   ⚠️ Replace with your actual Render URL from Step 4

7. **Click "Deploy"**
8. **Wait 3-5 minutes**
9. **Copy your frontend URL** (e.g., `https://edueval-xyz123.vercel.app`)

---

### **STEP 6: Update Backend CORS** (2 minutes)

Now that frontend is deployed, secure your backend:

1. **Go back to Render Dashboard**
2. **Click your service → Environment tab**
3. **Update these two variables:**
   ```env
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   CLIENT_URL=https://your-vercel-url.vercel.app
   ```
4. **Click "Save Changes"** (will auto-redeploy)

---

### **STEP 7: Create Admin User** (2 minutes)

1. **Go to Render Dashboard → Your Service**
2. **Click "Shell" tab** (top right corner)
3. **Type and run:**
   ```bash
   npm run seed:admin
   ```
4. **Wait for success message**

**Default Admin Login:**
- Email: `admin@edueval.local`
- Password: `Admin@12345`

---

## 🎉 **YOU'RE DONE!**

Your app is now live and accessible worldwide!

### **Your Live URLs:**

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-api.onrender.com`

### **Test Your App:**

1. Visit your Vercel URL
2. Login with admin credentials
3. Explore the features
4. Share the URL with your testers!

---

## 📱 **Share With Testers:**

Send them:
- **App URL:** Your Vercel URL
- **Test Credentials:** Create test accounts for them

**Create test users via admin panel or run:**
```bash
npm run seed:test
```
(in Render Shell)

---

## 🐛 **Having Issues?**

### Backend is slow on first load?
- **Normal!** Render free tier sleeps after 15 min. First request takes 30-60 seconds.

### CORS errors?
- Verify `CORS_ORIGIN` matches your Vercel URL exactly (including https://)
- Wait 2-3 minutes after updating for Render to redeploy

### Can't login?
- Check browser console (F12) for errors
- Verify API URL in Vercel environment variables
- Check Render logs for backend errors

### Firebase errors?
- Verify all 3 Firebase env variables are set correctly
- Check that private key has proper `\n` characters (literal backslash-n, not actual newlines)

---

## 📊 **Check Deployment Status:**

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com

---

## 📚 **More Help:**

- **Detailed Guide:** See `DEPLOYMENT-GUIDE.md`
- **Step-by-Step Checklist:** See `DEPLOYMENT-CHECKLIST.md`
- **Quick Commands:** See `deployment-helper.md`

---

## 🔒 **After Testing - Security:**

1. Change admin password immediately
2. Update CORS to only allow your Vercel domain (not `*`)
3. Review Firebase security rules
4. Create proper test accounts for testers

---

**Good luck! Your app is about to go live! 🚀**

Any questions? Check the other guides or ask for help!
