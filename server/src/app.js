import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { sanitizeAll } from './middleware/sanitizationMiddleware.js';
import { simpleCsrfProtection } from './middleware/csrfProtection.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/admin/index.js';
import facultyRoutes from './routes/faculty/index.js';
import studentRoutes from './routes/student/index.js';
import privacyRoutes from './routes/privacyRoutes.js';
import { requireAuth, requireRole } from './middleware/authMiddleware.js';
import codeRoutes from './routes/codeRoutes.js';

const app = express();

// Core middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Sanitize all inputs to prevent XSS
app.use(sanitizeAll({ 
  skipFields: ['password', 'passwordHash', 'code', 'stdin'] // Don't sanitize these fields
}));

// CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Rate limiting
app.use('/api', apiLimiter);

// CSRF protection (simple origin-based validation)
app.use(simpleCsrfProtection);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/privacy', privacyRoutes);
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
