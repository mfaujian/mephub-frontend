import { expect, test } from "@playwright/test";
import { CABLE_TIE, USER_STATE, findProductCard, tid, uniquePo } from "./helpers";

test.use({ storageState: USER_STATE });

test.describe("browsing journey: product list -> cart -> checkout -> orders", () => {
  test("a customer finds a product, adds it, checks out and sees the order", async ({ page }) => {
    const po = uniquePo("PO-E2E-001");
    // 1. product list
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await expect(tid(page, "cart-count")).toHaveText("1");

    // 2. cart
    await tid(page, "cart-link").click();
    await expect(tid(page, "cart-row")).toContainText(CABLE_TIE.name);
    await tid(page, "checkout-button").click();

    // 3. checkout: the seeded default address is preselected
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("radio", { name: "Deliver to E2E Address" })).toBeChecked();
    await page.getByLabel("PO number (optional)").fill(po);
    await page.getByLabel("Notes for the supplier (optional)").fill("Deliver to the loading dock");
    await expect(tid(page, "checkout-total")).toHaveText("Rp 120.000");
    await tid(page, "confirm-order").click();

    // 4. the order is placed, the cart is cleared and we land on /orders
    await expect(page.getByText("Order placed successfully!").first()).toBeVisible();
    await expect(page).toHaveURL("/orders");
    await expect(tid(page, "cart-count")).toHaveCount(0);
    const row = tid(page, "order-row").filter({ hasText: `PO ${po}` }).first();
    await expect(row).toBeVisible();
    await expect(row.getByTestId("order-status")).toHaveText("pending");

    // 5. order detail shows what was bought, at the server's price
    await row.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
    await expect(tid(page, "order-item")).toContainText(CABLE_TIE.name);
    await expect(tid(page, "order-total")).toHaveText("Rp 120.000");
    await expect(tid(page, "shipping-address")).toContainText("Jl. Testing No. 1");

    // 6. cancel it again so the product's stock goes back (keeps the test repeatable)
    await tid(page, "cancel-order").click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, cancel order" }).click();
    await expect(tid(page, "order-status")).toHaveText("cancelled");
  });

  test("a customer with several suppliers in the cart gets one order per supplier", async ({ page }) => {
    const po = uniquePo("PO-E2E-SPLIT");
    for (const sku of [CABLE_TIE.sku, "HLM-ABS-Y"]) {
      const card = await findProductCard(page, sku);
      await card.getByTestId("add-to-cart").click();
      await expect(tid(page, "cart-count")).toBeVisible();
    }
    await expect(tid(page, "cart-count")).toHaveText("2");
    await page.goto("/checkout");
    await page.getByLabel("PO number (optional)").fill(po);
    await tid(page, "confirm-order").click();
    await expect(page.getByText(/split into 2 orders/).first()).toBeVisible();
    await expect(page).toHaveURL("/orders");
    const rows = tid(page, "order-row").filter({ hasText: `PO ${po}` });
    await expect(rows).toHaveCount(2);
    // clean up: cancel both
    for (let i = 0; i < 2; i += 1) {
      await tid(page, "order-row").filter({ hasText: `PO ${po}` }).filter({ hasText: "pending" }).first().getByRole("link").first().click();
      await tid(page, "cancel-order").click();
      await page.getByRole("dialog").getByRole("button", { name: "Yes, cancel order" }).click();
      await expect(tid(page, "order-status")).toHaveText("cancelled");
      await page.goto("/orders");
    }
  });

  test("checkout needs a delivery address and the confirm button stays disabled without one", async ({ page }) => {
    await page.route("**/addresses", (route) => route.fulfill({ json: { message: "ok", addresses: [] } }));
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/checkout");
    await expect(page.getByText("Add your first delivery address")).toBeVisible();
    await expect(tid(page, "confirm-order")).toBeDisabled();
  });

  test("an empty cart cannot be checked out", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(tid(page, "confirm-order")).toHaveCount(0);
  });

  test("requesting payment terms is shown on the order", async ({ page }) => {
    const po = uniquePo("PO-E2E-TERMS");
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/checkout");
    await page.getByLabel("Payment").selectOption("request_terms");
    await page.getByLabel("PO number (optional)").fill(po);
    await tid(page, "confirm-order").click();
    await expect(page).toHaveURL("/orders");
    const row = tid(page, "order-row").filter({ hasText: `PO ${po}` }).first();
    await expect(row.getByTestId("payment-status")).toHaveText("terms requested");
    await row.getByRole("link").first().click();
    await tid(page, "cancel-order").click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, cancel order" }).click();
    await expect(tid(page, "order-status")).toHaveText("cancelled");
  });

  test("order again puts the items of an earlier order back into the cart", async ({ page }) => {
    const po = uniquePo("PO-E2E-AGAIN");
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/checkout");
    await page.getByLabel("PO number (optional)").fill(po);
    await tid(page, "confirm-order").click();
    await expect(page).toHaveURL("/orders");
    await tid(page, "order-row").filter({ hasText: `PO ${po}` }).first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
    const orderUrl = page.url();

    await tid(page, "reorder").click();
    await expect(page).toHaveURL("/cart");
    await expect(tid(page, "cart-row")).toContainText(CABLE_TIE.name);

    // clean up: cancel the order we created
    await page.goto(orderUrl);
    await tid(page, "cancel-order").click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, cancel order" }).click();
    await expect(tid(page, "order-status")).toHaveText("cancelled");
  });
});

test.describe("guests", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("a guest can fill a cart and is asked to log in at checkout, with the cart intact", async ({ page }) => {
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    await tid(page, "checkout-button").click();
    await expect(page).toHaveURL(/\/login\?next=%2Fcheckout/);
    await page.goto("/cart");
    await expect(tid(page, "cart-row")).toHaveCount(1);
  });
});