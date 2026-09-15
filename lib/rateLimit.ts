// DevForge AI — Sliding Window Rate Limiter

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

const memoryStore = new Map<string, number[]>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of memoryStore.entries()) {
      const valid = timestamps.filter((t) => now - t < 600000);
      if (valid.length === 0) memoryStore.delete(key);
      else memoryStore.set(key, valid);
    }
  }, 300000);
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 15, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const timestamps = memoryStore.get(identifier) || [];
  const validTimestamps = timestamps.filter((t) => t > windowStart);

  if (validTimestamps.length >= options.limit) {
    const oldest = validTimestamps[0];
    const resetMs = oldest + options.windowMs - now;
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetMs: Math.max(resetMs, 1000),
    };
  }

  validTimestamps.push(now);
  memoryStore.set(identifier, validTimestamps);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - validTimestamps.length,
    resetMs: options.windowMs,
  };
}
