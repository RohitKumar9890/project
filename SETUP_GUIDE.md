# Local Setup Guide - Step by Step

Follow these steps to run EduEval locally on your machine.

## Prerequisites Check

Before starting, make sure you have:

1. **Node.js 18 or higher** 
   ```bash
   node --version  # Should show v18.x.x or higher
   ```
   If not installed: [Download Node.js](https://nodejs.org/)

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **MongoDB** - You have two options:

   **Option A: Install MongoDB locally**
   - [Download MongoDB Community Edition](https://www.mongodb.com/try/download/community)
   - Start MongoDB:
     ```bash
     # On macOS (with Homebrew)
     brew services start mongodb-community
     
     # On Windows
     # MongoDB should start automatically as a service
     
     # On Linux
     sudo systemctl start mongod
     ```

   **Option B: Use MongoDB Atlas (Free Cloud Database)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account and cluster
   - Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/edueval`)

## Step-by-Step Setup

### Step 1: Install Server Dependencies

Open a terminal in the project root:

```bash
cd server
npm install
```

This will install all backend dependencies (Express, Mongoose, JWT, etc.)

### Step 2: Configure Server Environment

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your text editor
```

Edit `server/.env` and update if needed:

```env
NODE_ENV=development
PORT=5000

# If using local MongoDB (default):
MONGODB_URI=mongodb://localhost:27017/edueval

# OR if using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edueval

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000

# Code execution settings
CODE_EXECUTION_TIMEOUT=10000
CODE_EXECUTION_MEMORY_LIMIT=256

# Admin user credentials
SEED_ADMIN_EMAIL=admin@edueval.local
SEED_ADMIN_PASSWORD=Admin@12345
SEED_ADMIN_NAME=EduEval Admin
```

### Step 3: Start MongoDB

**If using local MongoDB:**
```bash
# Verify MongoDB is running
mongosh  # or: mongo

# You should see a MongoDB shell prompt
# Type 'exit' to quit
```

**If using MongoDB Atlas:**
- Your database is already running in the cloud ✓

### Step 4: Create Admin User

Still in the `server` directory:

```bash
npm run seed:admin
```

You should see: `✓ Admin user created successfully`

### Step 5: Start the Backend Server

```bash
npm run dev
```

You should see:
```
EduEval API server running on port 5000
MongoDB connected successfully
```

**Keep this terminal open!** The server is now running.

### Step 6: Install Client Dependencies

Open a **NEW terminal** (keep the server running in the first one):

```bash
cd client
npm install
```

This will install Next.js, React, Axios, Tailwind CSS, etc.

### Step 7: Start the Frontend

In the same terminal (in the `client` directory):

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 8: Open the Application

Open your browser and go to: **http://localhost:3000**

You should see the EduEval homepage!

## Step 9: Login

1. Click the **"Login"** button
2. Use these credentials:
   - **Email**: `admin@edueval.local`
   - **Password**: `Admin@12345`
3. You should be logged in as an admin user

## Verify Everything is Working

### Test the API Health
- Go to: http://localhost:3000/health
- You should see API health status

### Test the Dashboard
- Go to: http://localhost:3000/dashboard
- You should see your admin user information

### Test Code Runner (Optional - requires Docker)
- Go to: http://localhost:3000/code-runner
- Try running some code
- **Note**: If you don't have Docker installed, you'll see an error message, which is expected

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
# On macOS/Linux:
ps aux | grep mongod

# On Windows:
tasklist | findstr mongod

# Try restarting MongoDB
# macOS:
brew services restart mongodb-community

# Linux:
sudo systemctl restart mongod

# Windows:
# Restart the MongoDB service from Services app
```

### "Port 5000 already in use"
```bash
# Find what's using port 5000
# macOS/Linux:
lsof -ti:5000

# Kill the process
kill -9 <PID>

# Or change the port in server/.env:
PORT=5001
```

### "Port 3000 already in use"
```bash
# Kill the process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies won't install
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Module not found errors
```bash
# Make sure you're in the correct directory
pwd  # Should show either /path/to/edueval/server or /path/to/edueval/client

# Reinstall dependencies
npm install
```

## Development Workflow

Once everything is set up, here's how to work with the project:

### Starting the Application

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

### Stopping the Application

Press `Ctrl+C` in each terminal window

### Making Changes

- **Backend changes**: Server auto-reloads (nodemon)
- **Frontend changes**: Next.js auto-reloads (hot module replacement)

Just save your files and refresh the browser!

## Next Steps

Now that you have the application running:

1. **Explore the codebase**: Check out the models, controllers, and routes
2. **Test the API**: Use the health endpoint and try creating users
3. **Build features**: The frontend is minimal - you can build out the full dashboards
4. **Add functionality**: Implement exam creation, student enrollment, etc.

## Useful Commands

### Server
```bash
npm run dev          # Start with auto-reload
npm start            # Start production mode
npm test             # Run tests
npm run lint         # Check code style
npm run seed:admin   # Re-create admin user
```

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check code style
```

## Getting Help

If you run into issues:

1. Check the error messages carefully
2. Verify all prerequisites are installed
3. Make sure MongoDB is running
4. Check that ports 3000 and 5000 are available
5. Review the troubleshooting section above

## Success Checklist

- ✓ Node.js 18+ installed
- ✓ MongoDB running (local or Atlas)
- ✓ Server dependencies installed (`server/node_modules` exists)
- ✓ Client dependencies installed (`client/node_modules` exists)
- ✓ Admin user created
- ✓ Backend running on port 5000
- ✓ Frontend running on port 3000
- ✓ Can access http://localhost:3000
- ✓ Can login with admin credentials

Happy coding! 🚀
