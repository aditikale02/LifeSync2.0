import { expect, test } from "@playwright/test";
import { makeE2EUser } from "../utils/user";

test("create authenticated storage state", async ({ page }) => {
  const user = makeE2EUser();

  await page.goto("/login");
  await page.getByTestId("tab-signup").click();

  await page.getByTestId("input-register-name").fill(user.name);
  await page.getByTestId("input-register-email").fill(user.email);
  await page.getByTestId("input-register-password").fill(user.password);
  await page.getByTestId("button-register").click();

  await page.waitForURL("**/dashboard", { timeout: 45_000 });
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
});
