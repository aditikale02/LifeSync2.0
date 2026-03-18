import { expect, test } from "@playwright/test";

test("keeps authenticated user on protected routes", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId("button-sidebar-toggle")).toBeVisible();
});

test("redirects unauthenticated users to login", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();

  await page.goto("/todo");
  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

  await context.close();
});
