import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @supabase/ssr and next/headers so cookie-based auth works in unit tests
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      })),
    },
  })),
}));

import { POST as coachPost } from "@/app/api/coach/chat/route";
import { POST as plannerPost } from "@/app/api/planner/generate/route";
import { POST as analyticsPost } from "@/app/api/analytics/ai-report/route";

const request = (payload: unknown) =>
  new Request("https://example.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

const deepSeekResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("DeepSeek API routes", () => {
  beforeEach(() => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects an empty coach message without calling DeepSeek", async () => {
    const response = await coachPost(request({ message: "" }));

    expect(response.status).toBe(400);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("rejects coach messages exceeding 2000 characters", async () => {
    const response = await coachPost(request({ message: "a".repeat(2001) }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("2000");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("returns a structured coach response from DeepSeek", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      deepSeekResponse({
        choices: [{ message: { content: JSON.stringify({ text: "Önce paragraf çöz.", cards: [] }) } }],
      })
    );

    const response = await coachPost(request({ message: "Bugün ne çalışayım?", context: {} }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ text: "Önce paragraf çöz.", cards: [] });
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("rejects planner focus field longer than 500 characters", async () => {
    const response = await plannerPost(request({ focus: "x".repeat(501), context: {} }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("500");
  });

  it("surfaces an upstream planner failure instead of returning a fallback plan", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(deepSeekResponse({ error: "quota" }, 429));

    const response = await plannerPost(request({ context: {} }));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: "DeepSeek plan oluştururken bir hata verdi." });
  });

  it("returns only the parsed AI analytics report", async () => {
    const report = {
      readinessScore: 72,
      executiveSummary: "İstikrarlı gidiyorsun.",
      projectedNet: "80 - 85 Net",
      tempoEvaluation: "Dengeli",
      strengths: ["Paragraf"],
      bottlenecks: ["Geometri"],
      actionRoadmap: [],
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      deepSeekResponse({ choices: [{ message: { content: JSON.stringify(report) } }] })
    );

    const response = await analyticsPost(request({ context: {} }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(report);
  });

  it("rejects analytics requests with oversized payload (> 64 KB)", async () => {
    const bigPayload = { context: { data: "x".repeat(65 * 1024) } };
    const req = new Request("https://example.test/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bigPayload),
    });

    const response = await analyticsPost(req);

    expect(response.status).toBe(413);
    const body = await response.json();
    expect(body.error).toContain("64 KB");
  });

  it("returns a configuration error when the provider key is unavailable", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");

    const response = await analyticsPost(request({ context: {} }));

    expect(response.status).toBe(500);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});

