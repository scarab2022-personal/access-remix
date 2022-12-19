// global-setup.ts
import type { Browser, FullConfig } from "@playwright/test";
import { chromium } from "@playwright/test";

async function saveStorageState(
  email: string,
  mailboxUrl: string,
  storageStatePath: string,
  browser: Browser
) {
  console.log({ fn: "saveStorageState", email, mailboxUrl, storageStatePath });
  const page = await browser.newPage();
  await page.goto(mailboxUrl);
  await page.locator(".fa-trash").click();
  await page.getByText("delete all messages");
  await page.getByRole("button", { name: "yes" }).click();

  await page.goto("http://localhost:3000");
  await page.getByRole("link", { name: "sign in" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "sign in" }).click();

  await page.goto(mailboxUrl);
  // hack
  for (let i = 0; i < 10; i++) {
    if ((await page.getByText("your magic link").count()) > 0) {
      break;
    }
    await page.reload();
  }
  await page.getByText("Your Magic Link").first().click();
  await page.getByRole("link", { name: "Log In" }).click();
  await page.getByRole("link", { name: "Enter" }).click();

  await page.context().storageState({
    path: storageStatePath,
  });
  await page.close();
}

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();

  await saveStorageState(
    "scarab2022@gmail.com",
    "http://localhost:54324/m/scarab2022",
    "e2e-results/storage-states/adminStorageState.json",
    browser
  );
  await saveStorageState(
    "customer@dreadfulcompany.com",
    "http://localhost:54324/m/customer",
    "e2e-results/storage-states/customerStorageState.json",
    browser
  );

  await browser.close();
}

export default globalSetup;
