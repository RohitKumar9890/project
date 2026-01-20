# EduEval - Educational Evaluation Platform

A full-stack semester-wise educational assessment platform with role-based access control, exam management, and secure code execution capabilities.

## Features

- **Role-Based Access**: Admin, Faculty, and Student roles with specific permissions
- **Exam Management**: MCQ, Quiz, and Coding exams with automated grading
- **Code Execution**: Secure Docker-based sandboxed code execution (JavaScript & Python)
- **Academic Structure**: Semesters → Subjects → Exams/Materials
- **Progress Tracking**: Student performance monitoring
- **Materials & Announcements**: Faculty can share resources and updates

## Tech Stack

### Backend
- Node.js + Express
- Firebase Firestore (Cloud NoSQL Database)
- JWT Authentication
- Docker SDK for code execution
- Express Validator, Helmet, Rate Limiting

### Frontend
- Next.js (React)
- Tailwind CSS
- Axios for API calls

### Infrastructure
- Docker & Docker Compose (optional for code execution)
- Firebase/Firestore (managed cloud database)

## Prerequisites

Before running this project, ensure you have:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Firebase Account** (free) - [Create Firebase Account](https://firebase.google.com/)
- **Git** (to clone the repository)
- **Docker** (optional, only needed for code execution feature)

## Quick Start with Firebase

This is the **recommended way** to run the application locally:

### 1. Clone the repository
```bash
git clone <repository-url>
cd edueval
```

### 2. Set up Firebase (5 minutes)

**Follow the detailed guide**: [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)

**Quick version:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database (Start in test mode)
4. Go to Project Settings → Service Accounts
5. Click "Generate new private key"
6. Save the downloaded file as `server/firebase-service-account.json`

### 3. Install and run the backend
```bash
cd server
npm install

# Create admin user
npm run seed:admin

# Start server
npm run dev
```

You should see:
```
✓ Firebase initialized successfully
✓ Firestore connected
EduEval API server running on port 5000
```

### 4. Install and run the frontend
```bash
# In a new terminal
cd client
npm install
npm run dev
```

### 5. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

**Default admin credentials**:
- Email: `admin@edueval.local`
- Password: `Admin@12345`

## Alternative: Docker Compose Setup

If you prefer to use Docker for everything (including MongoDB instead of Firebase):

> **Note**: The project now uses Firebase by default. If you want to use the Docker Compose setup with MongoDB, you'll need to switch back to Mongoose. See the git history for the MongoDB implementation.

```bash
docker-compose up --build
```

This will start MongoDB, the backend, and frontend in containers.

## Available Scripts

### Server
```bash
npm run dev          # Start development server with hot-reload
npm start            # Start production server
npm test             # Run tests with coverage
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run seed:admin   # Create admin user
```

### Client
```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Lint code
```

## Environment Variables

Key environment variables in `server/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Firebase (Option 1: Use service account file - recommended)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Firebase (Option 2: Use environment variables - for production)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Code Execution (requires Docker)
CODE_EXECUTION_TIMEOUT=10000
CODE_EXECUTION_MEMORY_LIMIT=256

# Admin Seed
SEED_ADMIN_EMAIL=admin@edueval.local
SEED_ADMIN_PASSWORD=Admin@12345
SEED_ADMIN_NAME=EduEval Admin
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (faculty/student)
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Admin Routes (requires admin role)
- `/api/admin/users` - User management
- `/api/admin/semesters` - Semester management
- `/api/admin/subjects` - Subject management

### Faculty Routes (requires faculty role)
- `/api/faculty/exams` - Exam creation and management
- `/api/faculty/materials` - Upload and manage materials
- `/api/faculty/announcements` - Create announcements

### Student Routes (requires student role)
- `/api/student/exams` - View and attempt exams

### Code Execution
- `POST /api/code/execute` - Execute code securely

### Health Check
- `GET /api/health` - API health status

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec server npm run seed:admin
docker-compose exec server npm test
```

## Project Structure

```
edueval/
├── client/                 # Next.js frontend
│   ├── public/
│   ├── src/
│   │   ├── lib/           # API utilities
│   │   ├── pages/         # Next.js pages
│   │   └── styles/        # CSS files
│   ├── Dockerfile
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Utility scripts
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   ├── uploads/           # File uploads
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
└── docker-compose.yml     # Docker orchestration
```

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Helmet.js for security headers
- CORS configuration
- Rate limiting on API endpoints
- Sandboxed code execution with:
  - Network isolation
  - Memory limits (256MB default)
  - CPU limits (0.5 CPU)
  - Timeout protection (10s default)
  - Read-only filesystem
  - Dropped capabilities

## Development Notes

### Code Execution Service
The code execution service requires Docker to be running. If Docker is not available, the service will return a clear error message but won't crash the application.

### Database Seeding
Run `npm run seed:admin` to create the initial admin user. This script is idempotent and won't create duplicates.

## Troubleshooting

### Firebase Connection Issues
```bash
# Check if service account file exists
ls server/firebase-service-account.json

# Verify the JSON file is valid
cat server/firebase-service-account.json | python -m json.tool

# Make sure you've enabled Firestore in Firebase Console
```

**Common errors:**
- `Firebase credentials not found` - Service account file is missing or in wrong location
- `Permission denied` - Firestore rules are too restrictive (set to test mode for development)
- `Cannot find module 'firebase-admin'` - Run `npm install` in the server directory

### Port Already in Use
If ports 3000 or 5000 are in use:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Code Execution Not Working
- Ensure Docker daemon is running
- Pull required images manually:
  ```bash
  docker pull node:18-alpine
  docker pull python:3.11-alpine
  ```

## Testing

```bash
cd server
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Update JWT secrets and database credentials
3. Configure proper CORS origins
4. Use a process manager (PM2) or container orchestration
5. Set up reverse proxy (nginx)
6. Enable SSL/TLS
7. Configure proper logging and monitoring

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on the repository.
