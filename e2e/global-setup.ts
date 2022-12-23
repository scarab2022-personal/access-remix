// global-setup.ts
import type { Browser, FullConfig } from "@playwright/test";
import { chromium } from "@playwright/test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "db_types";

export let adminUser: User;
export const adminStorageStatePath =
  "e2e-results/storage-states/adminStorageState.json";

export let customerUser: User;
export const customerStorageStatePath =
  "e2e-results/storage-states/customerStorageState.json";

export let supabase: SupabaseClient<Database>;

async function saveStorageState(
  email: string,
  storageStatePath: string,
  browser: Browser
) {
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
  await page.context().storageState({
    path: storageStatePath,
  });
  await page.close();

  return data.user;
}

async function globalSetup(config: FullConfig) {
  supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const browser = await chromium.launch();
  adminUser = await saveStorageState(
    "scarab2022@gmail.com",
    "e2e-results/storage-states/adminStorageState.json",
    browser
  );
  customerUser = await saveStorageState(
    "customer@dreadfulcompany.com",
    "e2e-results/storage-states/customerStorageState.json",
    browser
  );
  await browser.close();
}

export default globalSetup;
