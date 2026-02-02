// Simple request logger for debugging proxy and rate limiting
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    ip: req.ip,
    forwardedFor: req.headers['x-forwarded-for'],
    email: req.body?.email ? '***@' + req.body.email.split('@')[1] : undefined
  });

  // Log response when done
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 5000) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
};

module.exports = requestLogger;
