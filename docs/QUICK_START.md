# Quick Start Guide

Get EduEval up and running in 10 minutes! ⚡

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Docker installed (for code execution)
- [ ] Firebase account created
- [ ] Git installed

---

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/edueval.git
cd edueval

# Install all dependencies
npm run install:all
```

### 2. Environment Setup (3 minutes)

```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local
```

### 3. Generate JWT Secrets (30 seconds)

```bash
npm run generate-secrets
```

Copy the generated secrets to `server/.env`:
```env
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-refresh-secret>
```

### 4. Firebase Setup (3 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/select a project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save as `server/firebase-service-account.json`

### 5. Configure Environment Variables (1 minute)

Edit `server/.env`:
```env
# Required
NODE_ENV=development
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Optional (for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 6. Seed Admin User (30 seconds)

```bash
npm run seed:admin
```

**Default admin credentials:**
- Email: `admin@edueval.local`
- Password: `Admin@12345`

⚠️ **Change these credentials after first login!**

### 7. Start Development Servers (30 seconds)

```bash
npm run dev
```

This starts both frontend and backend concurrently.

---

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

---

## First Login

1. Navigate to http://localhost:3000
2. Click "Login"
3. Use admin credentials:
   - Email: `admin@edueval.local`
   - Password: `Admin@12345`
4. You're in! 🎉

---

## Verify Setup

```bash
npm run check-setup
```

This command checks:
- ✅ Environment files exist
- ✅ Firebase configuration
- ✅ Servers are running
- ✅ Database connectivity

---

## Alternative: Docker Setup

If you prefer using Docker:

```bash
# Start all services with Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

---

## Common Issues & Solutions

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Firebase Connection Failed

**Error:** `Failed to initialize Firebase`

**Solutions:**
- Verify `firebase-service-account.json` exists in server directory
- Check JSON file is valid (not corrupted)
- Ensure Firebase project is active

### Cannot Connect to Backend

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions:**
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `client/.env.local`
- Ensure CORS_ORIGIN in `server/.env` matches frontend URL

### Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall dependencies
npm run install:all
```

---

## Next Steps

Now that you're up and running:

1. **Create Users**
   - Go to Admin → Users
   - Add faculty and student accounts

2. **Create Semester & Subjects**
   - Admin → Semesters
   - Admin → Subjects

3. **Create Your First Exam**
   - Login as faculty
   - Faculty → Exams → Create New Exam

4. **Test Student Flow**
   - Login as student
   - Join exam using exam code
   - Take the exam

---

## Useful Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:server       # Backend only
npm run dev:client       # Frontend only

# Testing
npm test                 # Run tests
npm run lint            # Check code style

# Database
npm run seed:admin      # Create admin user
npm run seed:test       # Create test data

# Utilities
npm run check-setup     # Verify setup
npm run generate-secrets # Generate JWT secrets
```

---

## Need Help?

- 📖 [Full Documentation](../README.md)
- 🔧 [Development Guide](./DEVELOPMENT.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🤝 [Contributing Guide](./CONTRIBUTING.md)
- 📡 [API Documentation](./API.md)

---

**Happy Teaching & Learning! 🎓**
