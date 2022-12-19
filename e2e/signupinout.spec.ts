import { test, expect, Page } from "@playwright/test";

// https://github.com/microsoft/playwright/issues/15977
test.use({ storageState: { cookies: [], origins: [] } });

test("sign up in out", async ({ page, context }) => {
  await page.goto("http://localhost:54324/m/signupinout");
  await page.locator(".fa-trash").click();
  await page.getByText("delete all messages");
  await page.getByRole("button", { name: "yes" }).click();
  await expect(page.getByRole("complementary").nth(1)).toBeEmpty();

  await page.goto("/");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Sign up" }).click();
  await page.getByLabel("Email").fill("signupinout@dreadfulcompany.com");
  await page.getByRole("button", { name: "sign up" }).click();
  await expect(page.getByText("check your email")).toBeVisible();

  await page.goto("http://localhost:54324/m/signupinout");
  await waitForMagicLink(page);
  await page.getByText("Your Magic Link").first().click();
  await page.getByRole("link", { name: "Log In" }).click();
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page.getByText("from the cloud")).toBeVisible();

  await page.goto("http://localhost:54324/m/signupinout");
  await page.locator(".fa-trash").click();
  await page.getByText("delete all messages");
  await page.getByRole("button", { name: "yes" }).click();
  await expect(page.getByRole("complementary").nth(1)).toBeEmpty();

  await page.goto("/");
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill("signupinout@dreadfulcompany.com");
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page.getByText("check your email")).toBeVisible();

  await page.goto("http://localhost:54324/m/signupinout");
  await waitForMagicLink(page);
  await page.getByText("Your Magic Link").first().click();
  await page.getByRole("link", { name: "Log In" }).click();
  await expect(page).toHaveTitle(/Access Remix/);
  await page.getByRole("link", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page.getByText("from the cloud")).toBeVisible();
});

// Hack
async function waitForMagicLink(page: Page) {
  for (let i = 0; i < 10; i++) {
    if ((await page.getByText("your magic link").count()) > 0) {
      break;
    }
    await page.reload();
  }
}
