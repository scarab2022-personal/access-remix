import { test, expect } from "@playwright/test";

// https://github.com/microsoft/playwright/issues/15977
test.use({ storageState: { cookies: [], origins: [] } });

test("sign in", async ({ page, context }) => {
  console.log({ test: "sign in", storage: await context.storageState() });

  // Delete any existing emails.
  await page.goto("http://localhost:54324/m/scarab2022");
  await page.getByRole("button", { name: "" }).last().click();
  await page.getByText("delete all messages");
  await page.getByRole("button", { name: "yes" }).click();
  await expect(page.getByRole("complementary").nth(1)).toBeEmpty();

  await page.goto("/");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill("scarab2022@gmail.com");
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page.getByText("check your email")).toBeVisible();

  await page.goto("http://localhost:54324/m/scarab2022");
  await page.getByText("Your Magic Link").first().click();
  await page.getByRole("link", { name: "Log In" }).click();
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // await context.storageState({ path: "scarab2022-state.json" });
});
