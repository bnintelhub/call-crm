import rateLimit from 'express-rate-limit';

// Strict Rate Limiter for Login (Brute-Force Attack Protection)
// Protects against brute-force / credential stuffing:
// Allows maximum 15 failed login attempts per 15 minutes per IP address.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 attempts per 15 mins
  standardHeaders: true, // Return standard RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  statusCode: 429,
  skipSuccessfulRequests: true, // Only count failed attempts so legitimate users on shared NAT IP aren't blocked
  message: {
    error: 'Too many failed login attempts from this IP address. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Password Change Rate Limiter (Prevents password guessing & computation attacks)
export const passwordChangeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit password changes to 5 per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    error: 'Too many password change attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// General API Rate Limiter (Protects all routes from spam/DDoS)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
