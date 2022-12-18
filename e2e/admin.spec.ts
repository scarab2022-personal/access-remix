import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e-results/storage-states/adminStorageState.json" });

test("enter", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
