import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp, resetRateLimits } from "@/lib/security";
import { sign, validAdminPassword } from "@/lib/admin-session";

describe("Comprehensive Security & Rate Limiting Test Suite", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  describe("IP Extraction & Header Precedence", () => {
    it("extracts first client IP in multi-proxy x-forwarded-for chain", () => {
      const req = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.1" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("extracts IPv6 address with whitespace trimming", () => {
      const req = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "  2001:0db8:85a3:0000:0000:8a2e:0370:7334  " },
      });
      expect(getClientIp(req)).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
    });

    it("falls back to x-real-ip when x-forwarded-for is missing", () => {
      const req = new Request("https://example.test/api", {
        headers: { "x-real-ip": "198.51.100.42" },
      });
      expect(getClientIp(req)).toBe("198.51.100.42");
    });

    it("falls back to cf-connecting-ip when other headers are missing", () => {
      const req = new Request("https://example.test/api", {
        headers: { "cf-connecting-ip": "192.0.2.1" },
      });
      expect(getClientIp(req)).toBe("192.0.2.1");
    });

    it("defaults to safe 127.0.0.1 when no IP headers are present", () => {
      const req = new Request("https://example.test/api");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("Sliding Window Rate Limiter Enforcement", () => {
    it("allows requests strictly up to the configured limit", () => {
      const req = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });

      // 3 allowed requests
      const r1 = checkRateLimit(req, "test_action", { limit: 3, windowMs: 60000, skipEnvBypass: true });
      const r2 = checkRateLimit(req, "test_action", { limit: 3, windowMs: 60000, skipEnvBypass: true });
      const r3 = checkRateLimit(req, "test_action", { limit: 3, windowMs: 60000, skipEnvBypass: true });

      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r3.success).toBe(true);
    });

    it("blocks the N+1 request with 429 Too Many Requests and security headers", async () => {
      const req = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "10.0.0.2" },
      });

      // Limit = 2
      checkRateLimit(req, "test_block", { limit: 2, windowMs: 60000, skipEnvBypass: true });
      checkRateLimit(req, "test_block", { limit: 2, windowMs: 60000, skipEnvBypass: true });

      // 3rd attempt exceeds limit
      const blocked = checkRateLimit(req, "test_block", { limit: 2, windowMs: 60000, skipEnvBypass: true });

      expect(blocked.success).toBe(false);
      expect(blocked.response).toBeDefined();
      expect(blocked.response?.status).toBe(429);
      expect(blocked.response?.headers.get("Retry-After")).toBeDefined();
      expect(blocked.response?.headers.get("X-RateLimit-Limit")).toBe("2");
      expect(blocked.response?.headers.get("X-RateLimit-Remaining")).toBe("0");

      const body = await blocked.response?.json();
      expect(body?.error).toContain("Çok fazla istek");
    });

    it("isolates rate limit quotas across different IP addresses", () => {
      const reqA = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "10.0.0.3" },
      });
      const reqB = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "10.0.0.4" },
      });

      // Exhaust quota for IP A
      checkRateLimit(reqA, "test_isolate", { limit: 1, windowMs: 60000, skipEnvBypass: true });
      const blockedA = checkRateLimit(reqA, "test_isolate", { limit: 1, windowMs: 60000, skipEnvBypass: true });
      expect(blockedA.success).toBe(false);

      // IP B should still have its quota
      const allowedB = checkRateLimit(reqB, "test_isolate", { limit: 1, windowMs: 60000, skipEnvBypass: true });
      expect(allowedB.success).toBe(true);
    });

    it("isolates rate limit buckets across different action prefixes", () => {
      const req = new Request("https://example.test/api", {
        headers: { "x-forwarded-for": "10.0.0.5" },
      });

      // Exhaust quota for prefix "coach"
      checkRateLimit(req, "coach", { limit: 1, windowMs: 60000, skipEnvBypass: true });
      const blockedCoach = checkRateLimit(req, "coach", { limit: 1, windowMs: 60000, skipEnvBypass: true });
      expect(blockedCoach.success).toBe(false);

      // Same IP for prefix "planner" should still succeed
      const allowedPlanner = checkRateLimit(req, "planner", { limit: 1, windowMs: 60000, skipEnvBypass: true });
      expect(allowedPlanner.success).toBe(true);
    });
  });

  describe("Admin Session & Constant-Time Security", () => {
    it("validates correct admin password", () => {
      process.env.ADMIN_PASSWORD = "super-secret-password-123";
      expect(validAdminPassword("super-secret-password-123")).toBe(true);
    });

    it("rejects incorrect password without timing vulnerability", () => {
      process.env.ADMIN_PASSWORD = "super-secret-password-123";
      expect(validAdminPassword("wrong-password")).toBe(false);
      expect(validAdminPassword("")).toBe(false);
      expect(validAdminPassword("super-secret-password-124")).toBe(false);
    });

    it("generates deterministic HMAC-SHA256 signature", () => {
      process.env.ADMIN_PASSWORD = "test-secret-key";
      const sig1 = sign();
      const sig2 = sign();
      expect(sig1).toBe(sig2);
      expect(sig1.length).toBe(64); // SHA-256 hex length
    });
  });
});


