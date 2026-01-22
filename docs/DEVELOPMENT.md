# Development Guide

This guide will help you set up your development environment and understand the project architecture.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [API Design Patterns](#api-design-patterns)
- [Frontend Architecture](#frontend-architecture)
- [Code Execution System](#code-execution-system)
- [Common Development Tasks](#common-development-tasks)

---

## Project Architecture

EduEval follows a modern client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │     API      │  │
│  │   Routing    │  │   Reusable   │  │    Client    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Server (Express)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Routes  │→ │Controller│→ │ Services │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                     ┌──────────┐        │
│                                     │   Models │        │
│                                     └──────────┘        │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
         ┌────────────┐        ┌────────────┐
         │  Firebase  │        │   Docker   │
         │  Firestore │        │ (Code Exec)│
         └────────────┘        └────────────┘
```

---

## Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator
- **Code Execution:** Docker + Dockerode
- **Email:** Nodemailer

### Frontend
- **Framework:** Next.js 14
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form Handling:** react-hook-form
- **Notifications:** react-toastify

### DevOps
- **Containerization:** Docker
- **Process Manager:** PM2
- **Testing:** Jest
- **Linting:** ESLint
- **Version Control:** Git

---

## Directory Structure

```
edueval/
├── client/                    # Frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Input.js
│   │   │   ├── Layout.js
│   │   │   ├── Modal.js
│   │   │   ├── Select.js
│   │   │   └── Table.js
│   │   ├── lib/
│   │   │   └── api.js        # API client with interceptors
│   │   ├── pages/            # Next.js pages (file-based routing)
│   │   │   ├── _app.js       # App wrapper
│   │   │   ├── index.js      # Landing page
│   │   │   ├── dashboard.js  # Main dashboard
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── faculty/      # Faculty pages
│   │   │   └── student/      # Student pages
│   │   └── styles/
│   │       └── globals.css   # Global styles
│   └── package.json
│
├── server/                    # Backend application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── db.js         # Firebase connection
│   │   │   ├── firebase.js   # Firebase setup
│   │   │   └── multer.js     # File upload config
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── codeController.js
│   │   │   ├── admin/        # Admin controllers
│   │   │   ├── faculty/      # Faculty controllers
│   │   │   └── student/      # Student controllers
│   │   ├── middleware/       # Express middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── rateLimitMiddleware.js
│   │   ├── models/           # Data models
│   │   │   ├── User.js
│   │   │   ├── Exam.js
│   │   │   ├── Submission.js
│   │   │   └── ...
│   │   ├── routes/           # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── admin/
│   │   │   ├── faculty/
│   │   │   └── student/
│   │   ├── services/         # Business logic
│   │   │   └── codeExecutionService.js
│   │   ├── utils/            # Helper functions
│   │   │   ├── asyncHandler.js
│   │   │   ├── emailService.js
│   │   │   ├── jwt.js
│   │   │   └── password.js
│   │   ├── scripts/          # Utility scripts
│   │   │   ├── seedAdmin.js
│   │   │   └── seedTestUsers.js
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── tests/                # Test files
│   └── package.json
│
├── scripts/                   # Root-level scripts
│   ├── check-setup.js
│   └── generate-jwt-secrets.js
│
├── docs/                      # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── DEVELOPMENT.md (this file)
│
├── docker-compose.yml         # Docker orchestration
├── package.json               # Root package.json
└── README.md                  # Main documentation
```

---

## Database Schema

### Collections

#### users
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string (hashed),
  role: 'admin' | 'faculty' | 'student',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### semesters
```javascript
{
  id: string,
  name: string,
  startDate: date,
  endDate: date,
  isActive: boolean
}
```

#### subjects
```javascript
{
  id: string,
  name: string,
  code: string,
  semester: string (ref),
  faculty: string (ref),
  sections: [string] (refs)
}
```

#### exams
```javascript
{
  id: string,
  title: string,
  subject: string (ref),
  faculty: string (ref),
  startTime: timestamp,
  endTime: timestamp,
  duration: number (minutes),
  questions: [{
    id: string,
    type: 'mcq' | 'coding' | 'essay',
    question: string,
    options?: [string],
    correctAnswer?: number,
    testCases?: [{input: string, expectedOutput: string}],
    points: number
  }],
  enrolledStudents: [string] (refs),
  examCode: string
}
```

#### submissions
```javascript
{
  id: string,
  exam: string (ref),
  student: string (ref),
  answers: [{
    questionId: string,
    answer: any
  }],
  score: number,
  feedback: string,
  submittedAt: timestamp,
  gradedAt: timestamp
}
```

---

## Authentication Flow

### Registration
1. User submits registration form
2. Server validates input
3. Password is hashed with bcrypt
4. User document created in Firestore
5. JWT tokens generated (access + refresh)
6. Welcome email sent
7. Tokens returned to client

### Login
1. User submits credentials
2. Server validates email/password
3. Password verified with bcrypt
4. JWT tokens generated
5. Tokens returned to client
6. Client stores tokens (localStorage/cookies)

### Token Refresh
1. Access token expires
2. Client detects 401 error
3. Refresh token sent to `/api/auth/refresh`
4. New access token generated
5. Original request retried with new token

### Protected Routes
```javascript
// Middleware chain
requireAuth → requireRole('faculty') → controller
```

---

## API Design Patterns

### Controller Pattern
```javascript
// controllers/examController.js
export const createExam = asyncHandler(async (req, res) => {
  // 1. Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Business logic
  const exam = await Exam.create(req.body);

  // 3. Response
  res.status(201).json({
    success: true,
    data: exam
  });
});
```

### Error Handling
```javascript
// Use asyncHandler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Centralized error middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

---

## Frontend Architecture

### Page Structure
```javascript
// pages/faculty/exams.js
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function FacultyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await api.get('/faculty/exams');
      setExams(response.data.data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Component JSX */}
    </Layout>
  );
}
```

### API Client with Interceptors
```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token refresh
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);
```

---

## Code Execution System

### Architecture
1. Student submits code
2. Server validates submission
3. Docker container created with language image
4. Code executed with test cases
5. Results captured and returned
6. Container cleaned up

### Security Measures
- Time limits (10s default)
- Memory limits (256MB default)
- Network isolation
- No persistent storage
- Read-only file system

### Supported Languages
- Python 3
- JavaScript (Node.js)
- Java
- C++

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Create controller**
```javascript
// controllers/faculty/examController.js
export const getExamStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stats = await Exam.getStats(id);
  res.json({ success: true, data: stats });
});
```

2. **Add route**
```javascript
// routes/faculty/examRoutes.js
router.get('/:id/stats', getExamStats);
```

3. **Update API docs**
Add endpoint documentation to `docs/API.md`

### Adding a New Page

1. **Create page file**
```javascript
// pages/faculty/analytics.js
export default function Analytics() {
  return <div>Analytics Page</div>;
}
```

2. **Add to navigation** (if needed)
Update Layout component with new navigation link

### Adding a New Model

1. **Create model file**
```javascript
// models/Assignment.js
import { db } from '../config/db.js';

const collection = db.collection('assignments');

export const Assignment = {
  async create(data) {
    const docRef = await collection.add({
      ...data,
      createdAt: new Date()
    });
    return { id: docRef.id, ...data };
  },

  async findById(id) {
    const doc = await collection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
};
```

2. **Add controller**
3. **Add routes**
4. **Update frontend**

### Running Database Migrations

Since Firestore is schema-less, migrations are typically scripts:

```javascript
// scripts/migrateData.js
import { db } from '../config/db.js';

async function migrate() {
  const users = await db.collection('users').get();
  const batch = db.batch();

  users.forEach((doc) => {
    batch.update(doc.ref, { newField: 'defaultValue' });
  });

  await batch.commit();
  console.log('Migration complete');
}

migrate();
```

---

## Debugging Tips

### Backend Debugging
```javascript
// Use console.log strategically
console.log('Request body:', req.body);

// Use try-catch for detailed errors
try {
  await someOperation();
} catch (error) {
  console.error('Detailed error:', error);
  throw error;
}
```

### Frontend Debugging
- Use React DevTools
- Check Network tab for API calls
- Use `console.log` in useEffect
- Check localStorage/cookies for tokens

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Firebase connection issues:**
- Verify credentials in `.env`
- Check Firebase console for service status
- Ensure service account has proper permissions

---

## Performance Optimization

### Backend
- Use Firebase queries efficiently
- Implement caching where appropriate
- Use batch operations for multiple updates
- Enable compression middleware

### Frontend
- Use Next.js Image component
- Implement lazy loading
- Minimize bundle size
- Use React.memo for expensive components

---

## Security Best Practices

- Never commit `.env` files
- Validate all user input
- Sanitize data before database queries
- Use parameterized queries
- Implement rate limiting
- Keep dependencies updated
- Use HTTPS in production
- Implement CSRF protection

---

## Useful Commands

```bash
# Development
npm run dev                    # Start both servers
npm run dev:server            # Start backend only
npm run dev:client            # Start frontend only

# Testing
npm test                      # Run tests
npm run test:watch           # Watch mode

# Linting
npm run lint                  # Lint code
npm run lint:fix             # Auto-fix issues

# Database
npm run seed:admin           # Seed admin user
npm run seed:test            # Seed test data

# Docker
npm run docker:up            # Start containers
npm run docker:down          # Stop containers
npm run docker:logs          # View logs

# Utilities
npm run check-setup          # Check setup
npm run generate-secrets     # Generate JWT secrets
```

---

Happy coding! 🚀
