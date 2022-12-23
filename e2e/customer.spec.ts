import { test, expect } from "@playwright/test";
import type { GlobalData } from "./global-setup";

test("enter", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("navigation", async ({ page }) => {
  await page.goto("/access/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await page.getByRole("link", { name: "Hubs" }).click();
  await expect(page.getByRole("heading", { name: "Hubs" })).toBeVisible();
  await page.getByRole("link", { name: "Hub 1" }).click();
  await expect(page.getByRole("heading", { name: "Hub 1" })).toBeVisible();
  await page.getByRole("link", { name: "View" }).first().click();
  await expect(page.getByRole("heading", { name: "Point 1" })).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(
    page.getByRole("heading", { name: "Access Point Settings" })
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Hub", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Hub 1" })).toBeVisible();
});

test("access user", async ({ page }) => {
  const globalData = JSON.parse(
    process.env.PLAYWRIGHT_GLOBAL_DATA!
  ) as GlobalData;
  // console.log({ globalData });

  await page.goto("/access/");
});
