import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import adminRoutes from './routes/admin/index.js';
import facultyRoutes from './routes/faculty/index.js';
import studentRoutes from './routes/student/index.js';
import { requireAuth, requireRole } from './middleware/authMiddleware.js';
import codeRoutes from './routes/codeRoutes.js';

const app = express();

// Core middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000, // 10 minutes (just for OAuth flow)
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/admin', requireAuth, requireRole('admin'), adminRoutes);
app.use('/api/faculty', requireAuth, requireRole('faculty'), facultyRoutes);
app.use('/api/student', requireAuth, requireRole('student'), studentRoutes);
app.use('/api/code', codeRoutes);

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'EduEval API',
    status: 'ok',
    version: process.env.API_VERSION || 'v1',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
