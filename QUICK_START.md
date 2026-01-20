# 🚀 Quick Start - Get EduEval Running in 10 Minutes

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ A Google account (for Firebase)

## Step 1: Setup Firebase (5 minutes)

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Name it (e.g., "edueval-dev")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 1.2 Enable Firestore
1. Click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select your region
5. Click **"Enable"**

### 1.3 Download Service Account Key
1. Click ⚙️ **Settings** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"**
5. Save the downloaded JSON file

### 1.4 Add to Project
1. Rename the file to `firebase-service-account.json`
2. Move it to `server/firebase-service-account.json`

✅ Firebase is ready!

## Step 2: Setup Backend (2 minutes)

```bash
cd server
npm install
npm run seed:admin
npm run dev
```

You should see:
```
✓ Firebase initialized successfully
✓ Firestore connected
EduEval API server running on port 5000
```

✅ Backend is running!

## Step 3: Setup Frontend (2 minutes)

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

✅ Frontend is running!

## Step 4: Test It! (1 minute)

1. Open http://localhost:3000
2. Click **"Login"**
3. Use credentials:
   - Email: `admin@edueval.local`
   - Password: `Admin@12345`
4. You're in! 🎉

## Verify in Firebase Console

1. Go back to Firebase Console
2. Open **Firestore Database**
3. You should see a `users` collection with your admin user

## Common Issues

**"Firebase credentials not found"**
- Make sure the file is at `server/firebase-service-account.json`
- Check the filename is exactly right

**"Port already in use"**
```bash
# Kill port 5000
lsof -ti:5000 | xargs kill -9

# Kill port 3000
lsof -ti:3000 | xargs kill -9
```

**"Module not found"**
```bash
cd server
npm install
```

## What's Next?

Now you can:
- ✅ Explore the API at http://localhost:5000/api/health
- ✅ Check the dashboard at http://localhost:3000/dashboard
- ✅ Try the code runner at http://localhost:3000/code-runner
- ✅ Read the full documentation in [README.md](./README.md)
- ✅ See detailed Firebase setup in [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)

Happy coding! 🚀
