# OAuth Setup Checklist - Google & Microsoft

## 📋 What You'll Need
- [ ] Google account
- [ ] Microsoft account  
- [ ] 20-30 minutes
- [ ] Text editor for copying credentials

---

## 🔵 PART 1: GOOGLE OAUTH SETUP

### Step 1: Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click project dropdown (top left, near "Google Cloud")
4. Click "NEW PROJECT"
5. Project name: `EduEval` (or your choice)
6. Click "CREATE"
7. Wait for notification (top right bell icon)
8. Select your new project from the dropdown

### Step 2: Configure OAuth Consent Screen
1. Left menu: Click ☰ → **APIs & Services** → **OAuth consent screen**
2. Select: ⚪ **External**
3. Click "CREATE"
4. Fill in App information:
   - **App name**: `EduEval`
   - **User support email**: [Select your email from dropdown]
   - **App logo**: (Skip for now)
5. Scroll to "Developer contact information":
   - **Email addresses**: [Your email]
6. Click "SAVE AND CONTINUE"

### Step 3: Configure Scopes
1. On "Scopes" page, click "ADD OR REMOVE SCOPES"
2. Filter/search for: `userinfo.email`
3. Check: ✅ `.../auth/userinfo.email`
4. Check: ✅ `.../auth/userinfo.profile`
5. Check: ✅ `openid`
6. Click "UPDATE"
7. Click "SAVE AND CONTINUE"

### Step 4: Add Test Users (IMPORTANT!)
1. On "Test users" page, click "ADD USERS"
2. Enter your email address (the one you'll use to test)
3. Click "ADD"
4. Add any other test accounts if needed
5. Click "SAVE AND CONTINUE"
6. Review summary, click "BACK TO DASHBOARD"

### Step 5: Create OAuth Credentials
1. Left menu: **APIs & Services** → **Credentials**
2. Top bar: Click "+ CREATE CREDENTIALS" → **OAuth client ID**
3. If prompted "Configure Consent Screen", you already did it, just continue
4. Application type: Select **Web application**
5. Name: `EduEval Web Client`
6. Under "Authorized JavaScript origins":
   - Click "ADD URI"
   - Enter: `http://localhost:3000`
7. Under "Authorized redirect URIs":
   - Click "ADD URI"  
   - Enter: `http://localhost:5000/api/oauth/google/callback`
8. Click "CREATE"

### Step 6: Copy Google Credentials
📋 **COPY THESE NOW!** (A popup should appear)

```
GOOGLE_CLIENT_ID: [Copy this - ends with .apps.googleusercontent.com]
GOOGLE_CLIENT_SECRET: [Copy this - random string]
```

✅ Keep these safe! We'll add them to your .env file later.

---

## 🔷 PART 2: MICROSOFT OAUTH SETUP

### Step 1: Access Azure Portal
1. Go to: https://portal.azure.com/
2. Sign in with your Microsoft account
3. If first time: May need to verify account, follow prompts

### Step 2: Navigate to App Registrations
1. In search bar at top: Type `Azure Active Directory` or `Microsoft Entra ID`
2. Click on the result
3. Left menu: Click **App registrations**
4. Top bar: Click "+ New registration"

### Step 3: Register Your Application
1. **Name**: `EduEval`
2. **Supported account types**: Select:
   - ⚪ **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**
   - *(This allows both personal Outlook and work Microsoft accounts)*
3. **Redirect URI**:
   - Platform dropdown: Select **Web**
   - URI field: Enter `http://localhost:5000/api/oauth/microsoft/callback`
4. Click "Register"
5. Wait for app to be created (few seconds)

### Step 4: Copy Application (Client) ID
📋 **COPY THIS NOW!**

On the Overview page, you'll see:
```
Application (client) ID: [Copy this - format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]
```

✅ Keep this safe!

### Step 5: Create Client Secret
1. Left menu: Click **Certificates & secrets**
2. Click the "Client secrets" tab
3. Click "+ New client secret"
4. **Description**: `EduEval Development Secret`
5. **Expires**: Select `24 months` (or your preference)
6. Click "Add"
7. **⚠️ COPY THE VALUE IMMEDIATELY!** (You can't see it again)

📋 **COPY THIS NOW!**
```
Secret Value: [Copy the VALUE column, NOT the Secret ID]
```

✅ This is your MICROSOFT_CLIENT_SECRET!

### Step 6: Configure API Permissions
1. Left menu: Click **API permissions**
2. You should see "Microsoft Graph - User.Read" already there
3. Click "+ Add a permission"
4. Click **Microsoft Graph**
5. Click **Delegated permissions**
6. In search box, type and check these:
   - ✅ `email`
   - ✅ `openid`  
   - ✅ `profile`
   - ✅ `User.Read` (should already be checked)
7. Click "Add permissions" at bottom
8. (Optional) Click "Grant admin consent for [your directory]" - makes testing easier

### Step 7: Enable ID Tokens
1. Left menu: Click **Authentication**
2. Scroll to "Implicit grant and hybrid flows"
3. Check: ✅ **ID tokens (used for implicit and hybrid flows)**
4. Click "Save" at top

✅ Microsoft OAuth setup complete!

---

## 📝 PART 3: ADD CREDENTIALS TO YOUR APP

### Your Credentials Summary

You should now have:

**From Google:**
- ✅ GOOGLE_CLIENT_ID (ends with .apps.googleusercontent.com)
- ✅ GOOGLE_CLIENT_SECRET

**From Microsoft:**
- ✅ MICROSOFT_CLIENT_ID (UUID format)
- ✅ MICROSOFT_CLIENT_SECRET (Secret Value you copied)

### Update server/.env File

1. Open: `server/.env` in your code editor
2. Add/update these lines:

```env
# OAuth Configuration
SESSION_SECRET=your-jwt-secret-from-above-or-any-long-random-string
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=paste-your-google-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-google-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

# Microsoft OAuth  
MICROSOFT_CLIENT_ID=paste-your-microsoft-client-id-here
MICROSOFT_CLIENT_SECRET=paste-your-microsoft-secret-here
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/oauth/microsoft/callback
MICROSOFT_TENANT=common
```

3. Save the file

---

## 🔄 PART 4: RESTART YOUR SERVER

After adding credentials, restart the server:

```bash
# Stop the current server (Ctrl+C in terminal)
cd server
npm run dev
```

The server should start without errors.

---

## ✅ COMPLETION CHECKLIST

Before testing, verify:

- [ ] Google Cloud project created
- [ ] Google OAuth consent screen configured
- [ ] Test users added to Google OAuth
- [ ] Google credentials copied
- [ ] Azure app registered
- [ ] Microsoft client secret copied
- [ ] All credentials added to server/.env
- [ ] server/.env file saved
- [ ] Server restarted
- [ ] No errors in server console
- [ ] Client still running on http://localhost:3000

---

## 🎯 READY TO TEST!

Once all boxes are checked, we'll test:
1. ✅ Email/password login (should still work)
2. ✅ Google OAuth login
3. ✅ Microsoft OAuth login
4. ✅ Account linking
5. ✅ User profile with avatar

---

## 🆘 Common Issues During Setup

**Google: "Access blocked: This app's request is invalid"**
- Make sure you added yourself as a test user
- Check redirect URI matches exactly

**Microsoft: "AADSTS50011: The reply URL specified in the request does not match"**
- Check redirect URI in Azure matches your .env exactly
- Make sure you clicked "Save" in Authentication settings

**Server won't start:**
- Check .env file syntax (no spaces around =)
- Make sure all required variables are present
- Check server console for specific error

---

Need help? Let me know which step you're on!
