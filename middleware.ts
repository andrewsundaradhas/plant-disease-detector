import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 10, // Max requests per window
};

export async function middleware(request: Request) {
  // Only apply rate limiting to API routes
  if (!request.url.includes('/api/')) {
    return NextResponse.next();
  }

  try {
    // Skip if Upstash credentials are not configured
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      return NextResponse.next();
    }

    // Initialize Redis client (Edge-compatible; no Node global usage)
    const redis = new Redis({ url, token });

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = `rate-limit:${ip}`;
    
    // Get current request count
    const current = await redis.get<number>(key);
    
    if (current === null) {
      // Set initial count with expiration
      await redis.setex(key, RATE_LIMIT.WINDOW_MS / 1000, 1);
    } else if (current >= RATE_LIMIT.MAX_REQUESTS) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${RATE_LIMIT.WINDOW_MS / 1000} seconds.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(RATE_LIMIT.WINDOW_MS / 1000),
            'X-RateLimit-Limit': String(RATE_LIMIT.MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor((Date.now() + RATE_LIMIT.WINDOW_MS) / 1000)),
          },
        }
      );
    } else {
      // Increment request count
      await redis.incr(key);
      
      // Update TTL if this is the first request in a new window
      if (current === 1) {
        await redis.expire(key, RATE_LIMIT.WINDOW_MS / 1000);
      }
    }
    
    const response = NextResponse.next();
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT.MAX_REQUESTS));
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, RATE_LIMIT.MAX_REQUESTS - (current || 0) - 1)));
    response.headers.set('X-RateLimit-Reset', String(Math.floor((Date.now() + RATE_LIMIT.WINDOW_MS) / 1000)));
    
    return response;
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open in case of Redis errors
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/api/:path*',
};
