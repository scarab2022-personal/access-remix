import { test, expect } from "@playwright/test";
import { adminStorageStatePath } from "./global-setup";

test.use({ storageState: adminStorageStatePath });

test("enter", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("navigation", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Customers" }).click();
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await page.getByRole("link", { name: "View" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Access Hubs" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Access Users" })
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Customers" })
    .click();
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await page.getByRole("link", { name: "View" }).last().click();
  await expect(
    page.getByRole("heading", { name: "Access Hubs" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Access Users" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
