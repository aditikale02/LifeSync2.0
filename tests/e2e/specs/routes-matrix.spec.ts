import { expect, test } from "@playwright/test";

const protectedRoutes = [
  "/dashboard",
  "/dashboard-hub",
  "/timeline",
  "/wellness-test",
  "/todo",
  "/pomodoro",
  "/water",
  "/meditation",
  "/health",
  "/journal",
  "/study",
  "/mood",
  "/sleep",
  "/activity",
  "/social",
  "/habits",
  "/gratitude",
  "/mindfulness",
  "/goals",
  "/ai-insights",
  "/games",
  "/feedback",
  "/analytics",
  "/profile",
];

test.describe("protected route matrix", () => {
  for (const route of protectedRoutes) {
    test(`loads ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route.replace("/", "\\/")}`));
      await expect(page.getByTestId("button-sidebar-toggle")).toBeVisible();
      await expect(page.getByText("Page not found")).toHaveCount(0);
    });
  }
});
