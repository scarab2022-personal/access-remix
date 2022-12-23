// global-setup.ts
import type { Browser, FullConfig } from "@playwright/test";
import { chromium } from "@playwright/test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "db_types";

export type GlobalData = {
  adminUser: User;
  customerUser: User;
};

export const adminStorageStatePath =
  "e2e-results/storage-states/adminStorageState.json";

export const customerStorageStatePath =
  "e2e-results/storage-states/customerStorageState.json";

async function saveStorageState({
  email,
  storageStatePath,
  browser,
  supabase,
}: {
  email: string;
  storageStatePath: string;
  browser: Browser;
  supabase: SupabaseClient<Database>;
}) {
  console.log({ fn: "saveStorageState", email, storageStatePath });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) {
    throw error;
  }
  const page = await browser.newPage();
  await page.goto(data.properties.action_link);
  await page.getByRole("link", { name: "Enter" }).click();
  await page.context().storageState({
    path: storageStatePath,
  });
  await page.close();

  return data.user;
}

async function globalSetup(config: FullConfig) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const browser = await chromium.launch();
  const adminUser = await saveStorageState({
    email: "scarab2022@gmail.com",
    storageStatePath: adminStorageStatePath,
    browser,
    supabase,
  });
  const customerUser = await saveStorageState({
    email: "customer@dreadfulcompany.com",
    storageStatePath: customerStorageStatePath,
    browser,
    supabase,
  });
  await browser.close();

  // https://playwright.dev/docs/test-advanced#global-setup-and-teardown
  const globalData: GlobalData = { adminUser, customerUser };
  process.env.PLAYWRIGHT_GLOBAL_DATA = JSON.stringify(globalData);
}

export default globalSetup;
