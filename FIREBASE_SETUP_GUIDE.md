# 🔥 Firebase Setup Guide for EduEval

This guide will walk you through setting up Firebase for your EduEval project.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., `edueval` or `edueval-dev`)
4. Click **Continue**
5. (Optional) Disable Google Analytics if you don't need it
6. Click **Create project**
7. Wait for the project to be created (takes ~30 seconds)
8. Click **Continue** when ready

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Choose **"Start in test mode"** (for development)
   - This allows read/write access without authentication initially
   - We'll secure it later for production
5. Choose a location closest to you (e.g., `us-central1`, `europe-west1`, `asia-south1`)
6. Click **"Enable"**
7. Wait for Firestore to be created

✅ Your Firestore database is now ready!

## Step 3: Generate Service Account Key

This is the credential file your backend server will use to connect to Firebase.

1. In your Firebase project, click the **⚙️ gear icon** (Settings) in the left sidebar
2. Click **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A popup will appear - click **"Generate key"**
6. A JSON file will download to your computer (e.g., `edueval-xxxxx-firebase-adminsdk-xxxxx.json`)

⚠️ **IMPORTANT**: This file contains sensitive credentials. Never commit it to Git!

## Step 4: Add Service Account to Your Project

1. **Rename the downloaded file** to `firebase-service-account.json`
2. **Move it to your server directory**:
   ```
   your-project/
   └── server/
       └── firebase-service-account.json  ← Put it here
   ```

The file should look like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@your-project.iam.gserviceaccount.com",
  ...
}
```

## Step 5: Verify Your Setup

Your `.gitignore` file already excludes `firebase-service-account.json`, so it won't be committed to Git. ✅

Your `server/.env` file doesn't need any Firebase configuration if you're using the service account file! The app will automatically find it.

## Step 6: Install Dependencies and Start

Now you're ready to run the application!

### Install Server Dependencies
```bash
cd server
npm install
```

### Create Admin User
```bash
npm run seed:admin
```

You should see:
```
✓ Connected to Firestore
✓ Admin user created successfully!
  Email: admin@edueval.local
  Password: Admin@12345
```

### Start the Server
```bash
npm run dev
```

You should see:
```
✓ Firebase initialized successfully
✓ Firestore connected
EduEval API server running on port 5000
```

## Step 7: Install and Start Client

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will start on http://localhost:3000

## Step 8: Test the Application

1. Open your browser to http://localhost:3000
2. Click **"Login"**
3. Use the admin credentials:
   - **Email**: `admin@edueval.local`
   - **Password**: `Admin@12345`
4. You should be logged in! 🎉

## Verify Data in Firebase Console

1. Go back to the [Firebase Console](https://console.firebase.google.com/)
2. Click on your project
3. Go to **Firestore Database**
4. You should see a `users` collection with your admin user!

## Alternative Setup: Using Environment Variables

If you don't want to use a service account file (e.g., for production), you can use environment variables:

1. Open `server/.env`
2. Add these lines:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```
3. Get these values from your `firebase-service-account.json` file

## Troubleshooting

### "Firebase credentials not found"
- Make sure `firebase-service-account.json` is in the `server/` directory
- Check the filename is exactly `firebase-service-account.json`
- Verify the JSON file is valid (open it in a text editor)

### "Permission denied" errors in Firestore
- Your test mode rules might have expired
- Go to Firestore → Rules
- Update the rules to:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```
- This allows all access (only for development!)

### "Cannot find module 'firebase-admin'"
```bash
cd server
npm install
```

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

## Security Notes for Production

⚠️ Before deploying to production:

1. **Secure Firestore Rules**: Update your security rules to require authentication
2. **Use Environment Variables**: Don't deploy service account files to production servers
3. **Rotate Keys**: If your service account key is ever exposed, rotate it immediately
4. **Enable App Check**: Add additional security layer for your Firebase project

Example production Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin-only collections
    match /semesters/{semesterId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }
    
    // Add more rules for other collections...
  }
}
```

## What's Next?

Now that Firebase is set up, you can:
- ✅ Create faculty and student accounts
- ✅ Add semesters and subjects (admin dashboard)
- ✅ Create exams (faculty dashboard)
- ✅ Build out the frontend dashboards
- ✅ Deploy to production

## Helpful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Need help?** Check the troubleshooting section or create an issue in the repository.

Happy coding! 🚀
