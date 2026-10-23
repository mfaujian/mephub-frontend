import { expect, test } from "@playwright/test";
import { USER_STATE, ADMIN_STATE, tid } from "./helpers";

// page.route() lets a test pretend the API answered in a certain way, so error and empty states can be tested on demand.

test.describe("mocked API responses", () => {
  test.use({ storageState: USER_STATE });

  test("the orders page shows its empty state when the API returns no orders", async ({ page }) => {
    await page.route("**/orders?**", (route) =>
      route.fulfill({
        json: { message: "ok", orders: [], meta: { current_page: 1, total_pages: 1, total_items: 0, items_per_page: 10, has_next: false, has_prev: false } },
      }),
    );
    await page.goto("/orders");
    await expect(tid(page, "no-orders")).toBeVisible();
    await expect(page.getByText("No orders yet")).toBeVisible();
  });

  test("the orders page shows an error with a retry button when the server fails", async ({ page }) => {
    let failing = true;
    await page.route("**/orders?**", (route) =>
      failing ? route.fulfill({ status: 500, json: { error: "Internal Server Error" } }) : route.continue(),
    );
    await page.goto("/orders");
    await expect(page.getByRole("alert").filter({ hasText: "Could not load your orders" })).toBeVisible();
    failing = false;
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(tid(page, "order-row").first()).toBeVisible();
  });

  test("a 401 from the API logs the user out and explains why", async ({ page }) => {
    await page.route("**/orders?**", (route) =>
      route.fulfill({ status: 401, json: { error: "Your session has expired. Please log in again.", code: "token_expired" } }),
    );
    await page.goto("/orders");
    await expect(page.getByText("Your session has expired. Please log in again.").first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("quick order reports a network failure", async ({ page }) => {
    await page.route("**/products/lookup?**", (route) => route.abort());
    await page.goto("/quick-order");
    await page.getByLabel("Part numbers and quantities").fill("EZ9F34110, 2");
    await tid(page, "quick-order-lookup").click();
    await expect(page.getByText("Could not reach the MEPhub server").first()).toBeVisible();
  });

  test("checkout shows the server's per-item problems when stock ran out", async ({ page }) => {
    await page.route("**/orders", (route) => {
      if (route.request().method() !== "POST") return route.continue();
      return route.fulfill({
        status: 422,
        json: { error: "Some items cannot be ordered. Please review your cart.", details: [{ product_id: 1, message: "Insufficient stock for 'Cable Tie'. Only 2 pack left." }] },
      });
    });
    await page.goto("/products?q=CT-200-BK");
    await page.getByRole("article").first().getByTestId("add-to-cart").click();
    await page.goto("/checkout");
    await tid(page, "confirm-order").click();
    await expect(tid(page, "line-problems")).toContainText("Insufficient stock");
    await expect(page).toHaveURL("/checkout");
    await expect(tid(page, "cart-count")).toHaveText("1"); // the cart is kept
  });
});

test.describe("admin dashboard with a mocked product list", () => {
  test.use({ storageState: ADMIN_STATE });

  test("shows an empty table message when nothing matches", async ({ page }) => {
    await page.route("**/products?**", (route) =>
      route.fulfill({
        json: { message: "ok", data: [], meta: { current_page: 1, total_pages: 1, total_items: 0, items_per_page: 10, has_next: false, has_prev: false } },
      }),
    );
    await page.goto("/dashboard");
    await expect(page.getByText("No products match your search.")).toBeVisible();
  });
});