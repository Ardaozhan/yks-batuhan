import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/privacy", "/terms"];
const protectedRoutes = [
  "/today",
  "/subjects",
  "/exams",
  "/simulator",
  "/planner",
  "/analytics",
  "/coach",
  "/profile",
  "/settings",
  "/onboarding",
];

test.describe("public site and authentication boundary", () => {
  for (const route of publicRoutes) {
    test(`renders the public route ${route}`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.status()).toBe(200);
    });
  }

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated visitors from ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("heading", { name: "Tekrar Hoş Geldin" })).toBeVisible();
    });
  }

  test("opens the login screen from the landing page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Giriş Yap", exact: true }).first().click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
  });

  test("shows the expected login fields and recovery link", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("link", { name: "Şifremi unuttum" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  test("returns JSON 401 for an unauthenticated AI endpoint", async ({ request }) => {
    const response = await request.post("/api/coach/chat", { data: { message: "Merhaba" } });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required" });
  });
});

test.describe("mobile landing navigation", () => {
  test("keeps the login action reachable from the mobile menu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only navigation coverage.");
    await page.goto("/");

    await page.getByRole("button", { name: "Menüyü aç/kapat" }).click();
    await page.getByRole("link", { name: "Giriş Yap", exact: true }).last().click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
