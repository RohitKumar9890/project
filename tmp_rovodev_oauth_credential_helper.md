# OAuth Credential Setup Helper

## Current Status: Getting Credentials

### ✅ Prerequisites Check
- [ ] Google account (for Google OAuth)
- [ ] Microsoft account (for Microsoft OAuth)
- [ ] Access to Google Cloud Console
- [ ] Access to Azure Portal

---

## Part 1: Google OAuth Credentials

### Step 1: Access Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create or Select Project
- If no project exists: Click "Create Project"
  - Project Name: **EduEval** (or your choice)
  - Click "Create"
- If project exists: Select it from dropdown

### Step 3: Enable Required APIs
1. Go to: **APIs & Services** > **Library**
2. Search for: **Google+ API** 
3. Click and enable it
4. Search for: **People API**
5. Click and enable it

### Step 4: Configure OAuth Consent Screen
1. Go to: **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in:
   - App name: `EduEval`
   - User support email: [Your email]
   - Developer contact: [Your email]
4. Click "Save and Continue"
5. On Scopes page: Click "Add or Remove Scopes"
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
   - Click "Update" then "Save and Continue"
6. Add Test Users (IMPORTANT for development):
   - Click "Add Users"
   - Add your email and any test accounts
   - Click "Save and Continue"
7. Click "Back to Dashboard"

### Step 5: Create OAuth Credentials
1. Go to: **APIs & Services** > **Credentials**
2. Click: **+ Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `EduEval Web Client`
5. **Authorized JavaScript origins:**
   - Add: `http://localhost:3000`
6. **Authorized redirect URIs:**
   - Add: `http://localhost:5000/api/oauth/google/callback`
7. Click **Create**
8. **COPY THESE NOW** (you'll see a popup):
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxxx`
9. Click "OK"

---

## Part 2: Microsoft OAuth Credentials

### Step 1: Access Azure Portal
1. Open: https://portal.azure.com/
2. Sign in with your Microsoft account

### Step 2: Navigate to App Registrations
1. Search for: **Azure Active Directory** (or **Microsoft Entra ID**)
2. Click on it
3. In left menu: Click **App registrations**
4. Click: **+ New registration**

### Step 3: Register Application
1. Name: `EduEval`
2. Supported account types: 
   - Choose: **Accounts in any organizational directory and personal Microsoft accounts**
   - (This allows both personal Outlook and work Microsoft accounts)
3. Redirect URI:
   - Platform: **Web**
   - URI: `http://localhost:5000/api/oauth/microsoft/callback`
4. Click: **Register**

### Step 4: Copy Application ID
1. You'll see the app overview page
2. **COPY THIS:**
   - Application (client) ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 5: Create Client Secret
1. In left menu: Click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `EduEval Development`
4. Expires: Choose `24 months` (or your preference)
5. Click **Add**
6. **COPY THIS NOW** (you won't see it again!):
   - Value: `xxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 6: Configure API Permissions
1. In left menu: Click **API permissions**
2. You should see: **Microsoft Graph > User.Read** (already there)
3. Click **+ Add a permission**
4. Choose: **Microsoft Graph**
5. Choose: **Delegated permissions**
6. Search and check:
   - ✅ `email`
   - ✅ `openid`
   - ✅ `profile`
7. Click: **Add permissions**
8. (Optional) Click: **Grant admin consent for [your org]**

### Step 7: Configure Authentication
1. In left menu: Click **Authentication**
2. Under **Implicit grant and hybrid flows:**
   - ✅ Check: **ID tokens**
3. Click: **Save**

---

## Part 3: Add Credentials to Your App

### Update server/.env file

Add these lines to your `server/.env` file:

```env
# OAuth Configuration
SESSION_SECRET=your-jwt-secret-can-be-reused-here
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=paste-your-google-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=paste-your-microsoft-client-id-here
MICROSOFT_CLIENT_SECRET=paste-your-microsoft-client-secret-here
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/oauth/microsoft/callback
MICROSOFT_TENANT=common
```

---

## Checklist Before Testing

- [ ] Google credentials added to .env
- [ ] Microsoft credentials added to .env
- [ ] Test users added to Google OAuth consent screen
- [ ] Server restarted after adding credentials
- [ ] Both servers are running (backend on 5000, frontend on 3000)

---

## Ready to Test!

Once you have credentials added, we'll test:
1. Google OAuth login flow
2. Microsoft OAuth login flow
3. Account linking
4. Error handling
