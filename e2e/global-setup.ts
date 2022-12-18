// global-setup.ts
import type { FullConfig } from "@playwright/test";
import { chromium, expect } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Delete any existing emails.
  await page.goto("http://localhost:54324/m/scarab2022");
  await page.getByRole("button", { name: "" }).last().click();
  await page.getByText("delete all messages");
  await page.getByRole("button", { name: "yes" }).click();
  await expect(page.getByRole("complementary").nth(1)).toBeEmpty();

  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "sign in" }).click();
  await page.getByLabel("Email").fill("scarab2022@gmail.com");
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page.getByText("check your email")).toBeVisible();

  await page.goto("http://localhost:54324/m/scarab2022");
  await page.getByText("Your Magic Link").first().click();
  await page.getByRole("link", { name: "Log In" }).click();
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.context().storageState({ path: "storageState.json" });
  await browser.close();
}

export default globalSetup;
