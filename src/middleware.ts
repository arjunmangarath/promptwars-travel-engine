import { NextRequest, NextResponse } from "next/server";

/** Max requests per IP within the rate limit window. */
const RATE_LIMIT = 10;
/** Rate limit window duration in milliseconds (1 minute). */
const WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitEntry>();

/** Extracts the client IP from standard proxy headers or falls back to "unknown". */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Enforces a sliding-window rate limit on the /api/plan endpoint.
 * Returns 429 with Retry-After when the limit is exceeded.
 * All other routes pass through unchanged.
 */
export function middleware(req: NextRequest): NextResponse {
  if (!req.nextUrl.pathname.startsWith("/api/plan")) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
    res.headers.set("X-RateLimit-Remaining", String(RATE_LIMIT - 1));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil((now + WINDOW_MS) / 1000)));
    return res;
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please wait before generating a new itinerary." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  entry.count++;
  const remaining = RATE_LIMIT - entry.count;
  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  res.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
