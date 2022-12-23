import { test, expect } from "@playwright/test";
import type { GlobalData } from "./global-setup";
import { faker } from "@faker-js/faker";

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
  // const globalData = JSON.parse(
  //   process.env.PLAYWRIGHT_GLOBAL_DATA!
  // ) as GlobalData;
  // console.log({ globalData });

  const createName = faker.name.fullName();
  const createDescription = `${createName} is very special access user`;
  const createCode = faker.random.numeric(10);

  await page.goto("/access/Users");
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "users" })
  ).toBeVisible();
  await page.getByRole("button", { name: "create" }).click();
  await expect(
    page.getByRole("heading", { name: "create access user" })
  ).toBeVisible();
  await page.getByLabel("name").fill(createName);
  await page.getByLabel("description").fill(createDescription);
  await page.getByLabel("code").fill(createCode);
  await page.getByRole("button", { name: "create" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "User" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: createName })).toBeVisible();
  await expect(page.getByText(`Code${createCode}`)).toBeVisible();
  await expect(page.getByText(`Description${createDescription}`)).toBeVisible();

  await page.getByRole("button", { name: "edit" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "User", exact: true })
  ).toBeVisible();
  const name = `${createName} the third`;
  const description = "So uppity";
  const code = `${createCode}1`;
  await page.getByLabel("name").fill(name);
  await page.getByLabel("description").fill(description);
  await page.getByLabel("Code", { exact: true }).fill(code);
  await page.getByRole("button", { name: "save" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "User", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText(`Code${code}`)).toBeVisible();
  await expect(page.getByText(`Description${description}`)).toBeVisible();

  await page
    .getByText("Access PointsAdd")
    .getByRole("button", { name: "add" })
    .click();
  await expect(page.getByRole("heading", { name: "Add Points" })).toBeVisible();
  await expect(page.getByLabel("Hub 1: Point 1")).not.toBeChecked();
  await page.getByLabel("Hub 1: Point 1").check();
  await expect(page.getByLabel("Hub 2: Point 2")).not.toBeChecked();
  await page.getByLabel("Hub 2: Point 2").check();
  await page.getByRole("button", { name: "add" }).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText(`Code${code}`)).toBeVisible();
  await expect(page.getByText(`Description${description}`)).toBeVisible();
  await expect(page.getByRole("row", { name: /^Point/ })).toHaveCount(2);
  await page
    .getByRole("row", { name: "Point 1 Hub 1 Remove" })
    .getByRole("link", { name: "Remove" })
    .click();
  await expect(page.getByRole("row", { name: /^Point/ })).toHaveCount(1);
  await expect(
    page.getByRole("row", { name: "Point 2 Hub 2 Remove" })
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Users" })
    .click();
  await expect(page.getByRole("heading", { name: "users" })).toBeVisible();
  await page.getByRole("link", { name }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Delete user" })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByRole("heading", { name: "users" })).toBeVisible();
  await expect(page.getByRole("link", { name })).toHaveCount(0);
});
