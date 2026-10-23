import { expect, type Locator, type Page } from "@playwright/test";

export const ADMIN_STATE = "playwright/.auth/admin.json";
export const USER_STATE = "playwright/.auth/user.json";

export const credentials = {
  adminEmail: process.env.E2E_ADMIN_EMAIL ?? "",
  adminPassword: process.env.E2E_ADMIN_PASSWORD ?? "",
  userEmail: process.env.E2E_USER_EMAIL ?? "",
  userPassword: process.env.E2E_USER_PASSWORD ?? "",
};

/** A name that is unique per test run, so tests never collide with each other or with old data. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/** Open the product list filtered to one part number and return its card. */
export async function findProductCard(page: Page, sku: string) {
  await page.goto(`/products?q=${encodeURIComponent(sku)}`);
  const card = page.getByRole("article").filter({ hasText: sku }).first();
  await expect(card).toBeVisible();
  return card;
}

export const CABLE_TIE = { sku: "CT-200-BK", name: "Cable Tie 200mm Black (Pack 100)" };

/**
 * Find elements by data-testid, but only the visible ones.
 * Next.js "cache components" keeps pages you just left mounted (but hidden) so going back is instant.
 * A plain getByTestId() would also match those hidden copies, so the tests look at visible elements only.
 */
export function tid(scope: Page | Locator, id: string): Locator {
  return scope.getByTestId(id).filter({ visible: true });
}

/** A purchase-order number that is unique per run, so repeated test runs never see each other's orders. */
export function uniquePo(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}