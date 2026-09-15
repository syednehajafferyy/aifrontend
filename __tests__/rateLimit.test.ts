import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../lib/rateLimit";

describe("Sliding Window Rate Limiter", () => {
  it("allows requests under the limit", () => {
    const res1 = checkRateLimit("test_ip_1", { limit: 3, windowMs: 10000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit("test_ip_1", { limit: 3, windowMs: 10000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);
  });

  it("blocks requests that exceed the limit", () => {
    const key = "test_ip_blocked";
    checkRateLimit(key, { limit: 2, windowMs: 10000 });
    checkRateLimit(key, { limit: 2, windowMs: 10000 });

    const blocked = checkRateLimit(key, { limit: 2, windowMs: 10000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });
});
