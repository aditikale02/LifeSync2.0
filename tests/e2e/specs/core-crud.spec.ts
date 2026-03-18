import { expect, test } from "@playwright/test";

test("todo blocks empty create and keeps focus input visible", async ({ page }) => {
  await page.goto("/todo");

  await page.getByTestId("button-todo-add").click();

  await expect(page.getByText("Empty Task")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("input-todo-new")).toBeVisible();
});

test("water tracker updates manual and increment flows", async ({ page }) => {
  await page.goto("/water");

  const manual = page.getByTestId("input-water-manual");
  await manual.fill("4");
  await page.getByTestId("button-water-manual-save").click();

  await expect(manual).toHaveValue("4");

  await page.getByTestId("button-water-increment").click();
  await expect(manual).toHaveValue("5");

  const goal = page.getByTestId("input-water-goal");
  await goal.fill("9");
  await page.getByTestId("button-water-goal-save").click();
  await expect(goal).toHaveValue("9");
});
