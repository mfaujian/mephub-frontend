import { expect, test } from "@playwright/test";
import { ADMIN_STATE, tid, uniquePo } from "./helpers";

test.use({ storageState: ADMIN_STATE });

test.describe("admin order overview on /dashboard/orders", () => {
  test("lists the orders of every buyer with buyer names", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(tid(page, "orders-table")).toBeVisible();
    await expect(tid(page, "order-row").first()).toBeVisible();
    // search by buyer name, so the demo buyers are found no matter how many other orders exist
    const search = page.getByPlaceholder("Search by buyer name, email or PO number...");
    await search.fill("Budi Santoso");
    await expect(tid(page, "orders-table")).toContainText("Budi Santoso");
    await expect(tid(page, "orders-table")).not.toContainText("Rudi Hartono");
    await search.fill("Rudi Hartono");
    await expect(tid(page, "orders-table")).toContainText("Rudi Hartono");
    await expect(tid(page, "orders-table")).not.toContainText("Budi Santoso");
  });

  test("filters by status", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByLabel("Filter by status").selectOption("cancelled");
    // the table refreshes after the request finishes, so keep checking until only cancelled orders are listed
    await expect(async () => {
      const statuses = await tid(page, "order-row").getByTestId("order-status").allTextContents();
      expect(statuses.length).toBeGreaterThan(0);
      expect(new Set(statuses)).toEqual(new Set(["cancelled"]));
    }).toPass();
  });

  test("searches by PO number", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByPlaceholder("Search by buyer name, email or PO number...").fill("PO-KK-DPRD");
    await expect(tid(page, "order-row")).toHaveCount(4);
    await expect(tid(page, "orders-table")).not.toContainText("Budi Santoso");
  });

  test("the list itself is read-only: there are no edit or delete buttons", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(tid(page, "order-row").first()).toBeVisible();
    await expect(tid(page, "orders-table").getByRole("button")).toHaveCount(0);
  });

  test("opening an order shows its details and the admin actions", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByPlaceholder("Search by buyer name, email or PO number...").fill("PO-KK-DPRD-04");
    await expect(tid(page, "order-row")).toHaveCount(1); // wait for the (debounced) search to filter the list
    await tid(page, "order-row").first().getByRole("link").first().click();
    await expect(tid(page, "order-item")).toContainText("Main Distribution Panel 400A (Custom)");
    await expect(tid(page, "admin-actions")).toBeVisible();
    await expect(tid(page, "payment-status")).toHaveText("terms requested");
    await expect(page.getByRole("button", { name: "Payment: terms approved" })).toBeVisible();
  });

  test("an admin can approve payment terms and move an order forward", async ({ page, browser }) => {
    // create an order as the customer first, so we never touch the seeded demo orders
    const po = uniquePo("PO-E2E-ADMIN");
    const customer = await browser.newContext({ storageState: "playwright/.auth/user.json" });
    const buyerPage = await customer.newPage();
    await buyerPage.goto("/products?q=CT-200-BK");
    await buyerPage.getByRole("article").first().getByTestId("add-to-cart").click();
    await buyerPage.goto("/checkout");
    await buyerPage.getByLabel("Payment").selectOption("request_terms");
    await buyerPage.getByLabel("PO number (optional)").fill(po);
    await tid(buyerPage, "confirm-order").click();
    await expect(buyerPage).toHaveURL("/orders");

    await page.goto("/dashboard/orders");
    await page.getByPlaceholder("Search by buyer name, email or PO number...").fill(po);
    await expect(tid(page, "order-row")).toHaveCount(1);
    await tid(page, "order-row").first().getByRole("link").first().click();
    await page.getByRole("button", { name: "Payment: terms approved" }).click();
    await expect(tid(page, "payment-status")).toHaveText("terms approved");
    await page.getByRole("button", { name: "Mark processing" }).click();
    await expect(tid(page, "order-status")).toHaveText("processing");
    await page.getByRole("button", { name: "Mark cancelled" }).click(); // gives the stock back
    await expect(tid(page, "order-status")).toHaveText("cancelled");
    await customer.close();
  });
});