import rateLimit from 'express-rate-limit';

/**
 * Per-user rate limiting for code execution
 * More restrictive than general API rate limiting
 */
export const codeExecutionLimiter = rateLimit({
  windowMs: Number(process.env.CODE_EXEC_RATE_LIMIT_WINDOW_MS || 60 * 1000), // 1 minute
  max: Number(process.env.CODE_EXEC_RATE_LIMIT_MAX || 5), // 5 executions per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user, not per IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many code execution requests. Please wait a moment and try again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  },
  skip: (req) => {
    // Skip rate limiting for admins in development
    return process.env.NODE_ENV === 'development' && req.user?.role === 'admin';
  }
});

/**
 * Daily quota for code execution per user
 */
const userDailyQuotas = new Map();

export const dailyQuotaMiddleware = (req, res, next) => {
  const userId = req.user?.id || req.ip;
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}:${today}`;
  
  const maxDailyExecutions = Number(process.env.CODE_EXEC_DAILY_QUOTA || 100);
  
  // Get or initialize quota
  let quota = userDailyQuotas.get(key) || { count: 0, date: today };
  
  // Check if we've exceeded the quota
  if (quota.count >= maxDailyExecutions) {
    return res.status(429).json({
      message: `Daily code execution quota exceeded. You can execute up to ${maxDailyExecutions} programs per day.`,
      quota: {
        used: quota.count,
        limit: maxDailyExecutions,
        resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      }
    });
  }
  
  // Increment quota
  quota.count++;
  userDailyQuotas.set(key, quota);
  
  // Clean up old quotas (keep only today's)
  for (const [k, v] of userDailyQuotas.entries()) {
    if (v.date !== today) {
      userDailyQuotas.delete(k);
    }
  }
  
  // Add quota info to response headers
  res.set('X-RateLimit-Daily-Limit', maxDailyExecutions.toString());
  res.set('X-RateLimit-Daily-Remaining', (maxDailyExecutions - quota.count).toString());
  
  next();
};
