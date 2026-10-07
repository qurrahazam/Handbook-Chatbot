/**
 * In-memory fixed-window rate limiting, keyed by client IP.
 *
 * This is where per-user limiting actually works: the browser's own IP is
 * visible on the incoming request, whereas everything reaching the Space
 * originates from Vercel and looks like one shared client.
 *
 * Best-effort only -- state is per serverless instance, so the effective limit
 * is roughly N_instances x RATE_LIMIT_MAX. Use Upstash/Redis if you need a
 * hard global guarantee.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 1000 * 60;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? 20);

// Keep the map from growing without bound across distinct client IPs.
const MAX_BUCKETS = 5000;

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
): { allowed: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });

    if (buckets.size > MAX_BUCKETS) {
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k);
      }
    }

    return { allowed: true, retryAfter: 0, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0, remaining: MAX_REQUESTS - existing.count };
}