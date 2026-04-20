import { test, expect } from "@playwright/test";

test("upload and ask flow renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("PDF RAG Starter")).toBeVisible();
  await expect(page.getByText("Upload PDF")).toBeVisible();
});
