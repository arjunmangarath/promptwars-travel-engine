/**
 * Tests for rate limiting logic matching the behaviour in src/middleware.ts.
 * Keeps tests in-process (no HTTP calls) by testing the algorithm directly.
 */

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

function checkRateLimit(
  ipMap: Map<string, RateLimitEntry>,
  ip: string,
  now: number
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

describe("Rate limiting algorithm", () => {
  let ipMap: Map<string, RateLimitEntry>;
  const NOW = 1_700_000_000_000;
  const IP = "192.168.1.1";

  beforeEach(() => {
    ipMap = new Map();
  });

  it("allows first request", () => {
    const result = checkRateLimit(ipMap, IP, NOW);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMIT - 1);
  });

  it("allows up to RATE_LIMIT requests within the window", () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      const result = checkRateLimit(ipMap, IP, NOW + i);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the (RATE_LIMIT + 1)th request", () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      checkRateLimit(ipMap, IP, NOW + i);
    }
    const result = checkRateLimit(ipMap, IP, NOW + RATE_LIMIT);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns retryAfter when blocked", () => {
    for (let i = 0; i <= RATE_LIMIT; i++) {
      checkRateLimit(ipMap, IP, NOW);
    }
    const result = checkRateLimit(ipMap, IP, NOW);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(WINDOW_MS / 1000);
  });

  it("resets counter after the window expires", () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      checkRateLimit(ipMap, IP, NOW);
    }
    const afterWindow = NOW + WINDOW_MS + 1;
    const result = checkRateLimit(ipMap, IP, afterWindow);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMIT - 1);
  });

  it("tracks different IPs independently", () => {
    const ip1 = "10.0.0.1";
    const ip2 = "10.0.0.2";

    for (let i = 0; i < RATE_LIMIT; i++) {
      checkRateLimit(ipMap, ip1, NOW);
    }

    const blockedResult = checkRateLimit(ipMap, ip1, NOW);
    expect(blockedResult.allowed).toBe(false);

    const allowedResult = checkRateLimit(ipMap, ip2, NOW);
    expect(allowedResult.allowed).toBe(true);
  });

  it("remaining count decrements with each request", () => {
    const r1 = checkRateLimit(ipMap, IP, NOW);
    const r2 = checkRateLimit(ipMap, IP, NOW + 1);
    const r3 = checkRateLimit(ipMap, IP, NOW + 2);
    expect(r1.remaining).toBe(RATE_LIMIT - 1);
    expect(r2.remaining).toBe(RATE_LIMIT - 2);
    expect(r3.remaining).toBe(RATE_LIMIT - 3);
  });

  it("sets resetAt to now + WINDOW_MS on first request", () => {
    checkRateLimit(ipMap, IP, NOW);
    const entry = ipMap.get(IP);
    expect(entry?.resetAt).toBe(NOW + WINDOW_MS);
  });

  it("allows exactly RATE_LIMIT requests before blocking", () => {
    const results: boolean[] = [];
    for (let i = 0; i <= RATE_LIMIT; i++) {
      results.push(checkRateLimit(ipMap, IP, NOW).allowed);
    }
    const allowed = results.filter(Boolean).length;
    const blocked = results.filter((r) => !r).length;
    expect(allowed).toBe(RATE_LIMIT);
    expect(blocked).toBe(1);
  });
});
