import { expect, test } from "@playwright/test";
import { ADMIN_STATE, USER_STATE, credentials, loginViaUi, tid } from "./helpers";

test.describe("logged-out visitors", () => {
  for (const path of ["/dashboard", "/dashboard/categories", "/dashboard/orders", "/orders", "/checkout", "/account/addresses"]) {
    test(`${path} redirects to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path).replace(/\//g, "%2F")}`));
    });
  }

  test("after logging in they are taken back to the page they wanted", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login\?next=/);
    await page.getByLabel("Email").fill(credentials.userEmail);
    await page.getByLabel("Password").fill(credentials.userPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
  });
});

test.describe("customers", () => {
  test.use({ storageState: USER_STATE });

  for (const path of ["/dashboard", "/dashboard/orders", "/dashboard/categories"]) {
    test(`${path} redirects a customer to the home page`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL("/");
      await expect(page.getByText("That page is for administrators only.")).toBeVisible();
    });
  }

  test("customers can open their own pages", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: "My orders" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toHaveCount(0);
  });
});

test.describe("admin login", () => {
  test("an admin logs in and lands on the dashboard", async ({ page }) => {
    await loginViaUi(page, credentials.adminEmail, credentials.adminPassword);
    await expect(page).toHaveURL("/dashboard");
    await expect(tid(page, "user-name")).toContainText("MEPhub Admin");
    await expect(page.getByRole("heading", { name: "Products", exact: true })).toBeVisible();
  });
});

test.describe("admins", () => {
  test.use({ storageState: ADMIN_STATE });

  test("can open every dashboard page", async ({ page }) => {
    for (const [path, heading] of [
      ["/dashboard", "Products"],
      ["/dashboard/categories", "Categories"],
      ["/dashboard/orders", "All orders"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
  });
});

test("a session that has expired is cleared instead of trusted", async ({ page }) => {
  await page.goto("/");
  // a token whose expiry (exp) is in the past
  const expired = "e30." + Buffer.from(JSON.stringify({ exp: 1000 })).toString("base64url") + ".sig";
  await page.evaluate((token) => {
    localStorage.setItem("mephub_auth", JSON.stringify({ token, user: { id: 1, email: "x@x.com", full_name: "Old Session", role: "admin" } }));
  }, expired);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await loginViaUi(page, credentials.userEmail, credentials.userPassword);
  await expect(tid(page, "user-name")).toContainText("E2E Test Buyer");
});