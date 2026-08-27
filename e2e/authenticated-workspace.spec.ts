import { expect, test } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

const workspaceRoutes = [
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

test.describe("authenticated workspace", () => {
  test.skip(!email || !password, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated coverage.");

  test("opens every workspace route after a real login", async ({ page }) => {
    await page.goto("/login");
    const consentButton = page.getByRole("button", { name: "Kabul Et" });
    const consentVisible = await consentButton
      .waitFor({ state: "visible", timeout: 2_000 })
      .then(() => true)
      .catch(() => false);
    if (consentVisible) {
      await consentButton.click();
    }
    await page.locator('input[type="email"]').fill(email!);
    await page.locator('input[type="password"]').fill(password!);
    await page.getByRole("button", { name: "Giriş Yap" }).click();

    await expect(page).toHaveURL(/\/today$/, { timeout: 15_000 });

    for (const route of workspaceRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    }
  });
});
