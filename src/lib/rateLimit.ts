/**
 * Lightweight production rate limiter for API routes.
 * Uses an in-memory sliding window cache with automatic expiration.
 * In a distributed setup, this seamlessly swaps with Upstash / Redis.
 */

interface RateLimitConfig {
  maxRequests: number; // e.g. 60 requests
  windowMs: number;    // e.g. 60_000 (1 minute)
}

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale IPs every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      const recent = record.timestamps.filter(t => now - t < 300_000);
      if (recent.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, { timestamps: recent });
      }
    }
  }, 300_000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 60, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const record = rateLimitMap.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside window
  const activeTimestamps = record.timestamps.filter(t => t > windowStart);

  if (activeTimestamps.length >= config.maxRequests) {
    const oldest = activeTimestamps[0];
    const resetTime = Math.ceil((oldest + config.windowMs - now) / 1000);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: Math.max(1, resetTime)
    };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(identifier, { timestamps: activeTimestamps });

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - activeTimestamps.length,
    reset: Math.ceil(config.windowMs / 1000)
  };
}
