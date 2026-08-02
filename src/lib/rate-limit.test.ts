import { describe, it, expect } from "vitest";
import { checkRateLimit, rateLimitRequest } from "@/lib/rate-limit";

function makeRequest(ip: string): Request {
  return new Request("http://localhost/api/x", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const rule = { limit: 2, windowMs: 1000 };
    expect(checkRateLimit("k1", rule).ok).toBe(true);
    expect(checkRateLimit("k1", rule).ok).toBe(true);
  });

  it("blocks once the limit is exceeded", () => {
    const rule = { limit: 1, windowMs: 1000 };
    expect(checkRateLimit("k2", rule).ok).toBe(true);
    const result = checkRateLimit("k2", rule);
    expect(result.ok).toBe(false);
  });

  it("never reports a negative remaining count", () => {
    const rule = { limit: 2, windowMs: 1000 };
    checkRateLimit("k3", rule);
    checkRateLimit("k3", rule);
    checkRateLimit("k3", rule);
    const result = checkRateLimit("k3", rule);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
    expect(result.remaining).toBe(0);
  });

  it("resets the window after it expires", () => {
    const rule = { limit: 1, windowMs: -1000 };
    expect(checkRateLimit("k4", rule).ok).toBe(true);
    expect(checkRateLimit("k4", rule).ok).toBe(true);
  });
});

describe("rateLimitRequest", () => {
  it("keys the limit by scope and client id", () => {
    const rule = { limit: 1, windowMs: 1000 };
    expect(rateLimitRequest(makeRequest("10.0.0.1"), "login", rule).ok).toBe(true);
    expect(rateLimitRequest(makeRequest("10.0.0.2"), "login", rule).ok).toBe(true);
    expect(rateLimitRequest(makeRequest("10.0.0.1"), "login", rule).ok).toBe(false);
  });
});
