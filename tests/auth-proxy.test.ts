import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ claims: null as Record<string, unknown> | null }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: vi.fn(async () => ({
        data: authState.claims ? { claims: authState.claims } : null,
      })),
    },
  })),
}));

import { updateSession } from "@/lib/supabase/proxy";

function request(pathname: string) {
  return new NextRequest(`https://example.test${pathname}`);
}

describe("application access proxy", () => {
  beforeEach(() => {
    authState.claims = null;
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
  });

  it("redirects an unauthenticated workspace request to login", async () => {
    const response = await updateSession(request("/today"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/login");
  });

  it("redirects anonymous users away from protected pages", async () => {
    authState.claims = { is_anonymous: true };

    const response = await updateSession(request("/simulator"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/login");
  });

  it("rejects unauthenticated API requests with JSON 401", async () => {
    const response = await updateSession(request("/api/coach/chat"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required" });
  });

  it("keeps public login accessible to anonymous users", async () => {
    authState.claims = { is_anonymous: true };

    const response = await updateSession(request("/login"));

    expect(response.status).toBe(200);
  });

  it("sends authenticated users away from the login form", async () => {
    authState.claims = { is_anonymous: false, sub: "student-1" };

    const response = await updateSession(request("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/today");
  });
});
