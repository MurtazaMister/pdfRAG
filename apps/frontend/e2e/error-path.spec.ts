import { test, expect } from "@playwright/test";

test("shows initial not-ready guidance", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Upload and wait for indexing.")).toBeVisible();
});
