// global-setup.ts
import { Browser, FullConfig, request } from "@playwright/test";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "db_types";

export const adminTestData = {
  email: "scarab2022@gmail.com",
  mailboxUrl: "http://localhost:54324/m/scarab2022",
  storageStatePath: "e2e-results/storage-states/adminStorageState.json",
};

export const customerTestData = {
  email: "customer@dreadfulcompany.com",
  mailboxUrl: "http://localhost:54324/m/customer",
  storageStatePath: "e2e-results/storage-states/customerStorageState.json",
};

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function saveStorageState(
  {
    email,
    mailboxUrl,
    storageStatePath,
  }: { email: string; mailboxUrl: string; storageStatePath: string },
  browser: Browser
) {
  console.log({ fn: "saveStorageState", email, mailboxUrl, storageStatePath });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) {
    throw error;
  }
  console.log({ data });

  // http://localhost:54324/api/v1/mailbox/mw10013
  // const username = email.split("@")[0];
  // const context = await request.newContext();
  // const response = await context.delete(
  //   `http://localhost:54324/api/v1/mailbox/${username}`
  // );
  // if (!response.ok) {
  //   throw new Error(
  //     `Error deleting mailbox for ${username}: ${response.statusText}`
  //   );
  // }

  // await page.goto(mailboxUrl);
  // await page.locator(".fa-trash").click();
  // await page.getByText("delete all messages");
  // await page.getByRole("button", { name: "yes" }).click();

  // await page.goto("http://localhost:3000");
  // await page.getByRole("link", { name: "sign in" }).click();
  // await page.getByLabel("Email").fill(email);
  // await page.getByRole("button", { name: "sign in" }).click();

  // const { error } = await supabase.auth.signInWithOtp({
  //   email,
  // });
  // if (error) {
  //   throw error;
  // }

  // await page.goto(mailboxUrl);
  // // hack
  // for (let i = 0; i < 10; i++) {
  //   if ((await page.getByText("your magic link").count()) > 0) {
  //     break;
  //   }
  //   console.log(`Wait for magic link iteration: ${i}`);
  //   await page.reload();
  // }
  // await page.getByText("Your Magic Link").first().click();
  // await page.getByRole("link", { name: "Log In" }).click();
  // await page.getByRole("link", { name: "Enter" }).click();

  const page = await browser.newPage();
  await page.goto(data.properties.action_link);
  await page.context().storageState({
    path: storageStatePath,
  });
  await page.close();
}

async function globalSetup(config: FullConfig) {
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();
  console.log({ users, error });

  const browser = await chromium.launch();

  await saveStorageState(adminTestData, browser);
  await saveStorageState(customerTestData, browser);

  await browser.close();
}

export default globalSetup;
