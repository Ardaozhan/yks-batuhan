import { expect, test } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test.describe("test account bootstrap", () => {
  test.skip(
    process.env.E2E_CREATE_TEST_USER !== "1" || !email || !password,
    "Set E2E_CREATE_TEST_USER=1 plus E2E_TEST_EMAIL and E2E_TEST_PASSWORD to create a test account."
  );

  test("creates the configured test account through the public registration flow", async ({ page }) => {
    const diagnostics: string[] = [];
    page.on("pageerror", (error) => diagnostics.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") {
        diagnostics.push(`console: ${message.text()} ${message.location().url}`);
      }
    });
    page.on("response", (response) => {
      if (response.url().includes("/auth/v1/")) {
        diagnostics.push(`auth response: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/register");
    await page.locator('input[type="email"]').fill(email!);
    await page.locator('input[type="password"]').fill(password!);
    await page.getByRole("button", { name: "Kayıt Ol" }).click();

    try {
      await expect(page.getByRole("status")).toContainText("e-posta adresini doğrula", { timeout: 15_000 });
    } catch {
      const alert = await page.getByRole("alert").textContent().catch(() => null);
      throw new Error(`Registration did not complete. url=${page.url()} alert=${alert ?? "none"} diagnostics=${diagnostics.join(" | ") || "none"}`);
    }
  });
});
