import { expect, test } from "@playwright/test";
import { credentials, loginViaUi, tid } from "./helpers";

test.describe("registration", () => {
  test("shows a message for every invalid field and does not submit", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Full name must be at least 3 characters.")).toBeVisible();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password must be at least 6 characters.")).toBeVisible();
    await expect(page.getByText("Confirm your password.")).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("rejects a weak password and a mismatched confirmation", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Test Person");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel(/^Password/).fill("onlyletters");
    await page.getByLabel("Confirm password").fill("different1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Password must contain at least one letter and one number.")).toBeVisible();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });

  test("a new user is registered, logged in, redirected home and stays logged in after a refresh", async ({ page }) => {
    const email = `e2e.${Date.now()}@mephub.id`;
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Siti Kontraktor");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel(/^Password/).fill("Passw0rd!x");
    await page.getByLabel("Confirm password").fill("Passw0rd!x");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/");
    await expect(tid(page, "user-name")).toContainText("Siti Kontraktor");
    await page.reload();
    await expect(tid(page, "user-name")).toContainText("Siti Kontraktor");
    await expect(page.getByRole("link", { name: "Login" })).toHaveCount(0);
  });

  test("an email that is already registered is reported on the email field", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Duplicate Person");
    await page.getByLabel("Email").fill(credentials.userEmail);
    await page.getByLabel(/^Password/).fill("Passw0rd!x");
    await page.getByLabel("Confirm password").fill("Passw0rd!x");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText("An account with this email already exists.")).toBeVisible();
  });
});

test.describe("login and logout", () => {
  test("a customer logs in and lands on the home page", async ({ page }) => {
    await loginViaUi(page, credentials.userEmail, credentials.userPassword);
    await expect(page).toHaveURL("/");
    await expect(tid(page, "user-name")).toContainText("E2E Test Buyer");
    await expect(page.getByRole("link", { name: "Dashboard" })).toHaveCount(0);
  });

  test("wrong credentials show an error message and keep the user on the login page", async ({ page }) => {
    await loginViaUi(page, credentials.userEmail, "wrong-password-1");
    await expect(tid(page, "form-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    await expect(tid(page, "user-name")).toHaveCount(0);
  });

  test("login validates empty fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });

  test("logout clears the session, even after a refresh", async ({ page }) => {
    await loginViaUi(page, credentials.userEmail, credentials.userPassword);
    await expect(tid(page, "user-name")).toBeVisible();
    await tid(page, "logout-button").click();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(tid(page, "user-name")).toHaveCount(0);
  });

  test("a logged-in user who opens /login is sent away from it", async ({ page }) => {
    await loginViaUi(page, credentials.userEmail, credentials.userPassword);
    await expect(page).toHaveURL("/");
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});