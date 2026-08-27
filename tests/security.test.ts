import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/security";

describe("Security & Rate Limiting Engine", () => {
  it("extracts client IP from x-forwarded-for header", () => {
    const req = new Request("https://example.test/api", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("extracts client IP from x-real-ip header", () => {
    const req = new Request("https://example.test/api", {
      headers: { "x-real-ip": "198.51.100.42" },
    });
    expect(getClientIp(req)).toBe("198.51.100.42");
  });

  it("extracts client IP from cf-connecting-ip header", () => {
    const req = new Request("https://example.test/api", {
      headers: { "cf-connecting-ip": "192.0.2.1" },
    });
    expect(getClientIp(req)).toBe("192.0.2.1");
  });

  it("falls back to localhost when no IP headers present", () => {
    const req = new Request("https://example.test/api");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("passes checkRateLimit in test environment without blocking", () => {
    const req = new Request("https://example.test/api");
    const result = checkRateLimit(req, "test_prefix", { limit: 1, windowMs: 1000 });
    expect(result.success).toBe(true);
  });
});

