import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Global in-memory storage for sliding rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitOptions {
  limit?: number; // max requests per window
  windowMs?: number; // window duration in ms
}

/**
 * Extracts client IP from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

/**
 * Checks sliding window rate limit for a given key (IP or user ID)
 * Returns { success: true } if within limits, or { success: false, response: NextResponse } if exceeded.
 */
export function checkRateLimit(
  req: Request,
  prefix = "ai",
  options: RateLimitOptions = {}
): { success: boolean; response?: NextResponse } {
  // Allow test environments to bypass rate limiting
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
    return { success: true };
  }

  const limit = options.limit || 20; // default 20 requests
  const windowMs = options.windowMs || 60 * 1000; // default 1 minute

  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      ),
    };
  }

  record.count += 1;
  return { success: true };
}

