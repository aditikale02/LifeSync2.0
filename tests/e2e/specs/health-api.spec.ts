import { expect, test } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  expect(payload.status).toBe("ok");
  expect(payload.service).toBe("lifesync-api");
});
