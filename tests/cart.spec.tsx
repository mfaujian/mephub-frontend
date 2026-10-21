import { expect, test } from "@playwright/test";
import { CABLE_TIE, findProductCard, tid } from "./helpers";

test.describe("shopping cart", () => {
  test("an empty cart shows an empty state and a disabled checkout button", async ({ page }) => {
    await page.goto("/cart");
    await expect(tid(page, "empty-cart")).toBeVisible();
    await expect(tid(page, "checkout-button")).toBeDisabled();
    await expect(tid(page, "cart-count")).toHaveCount(0);
  });

  test("adding a product shows a toast, updates the header badge and fills the cart table", async ({ page }) => {
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await expect(page.getByText(`${CABLE_TIE.name} added to cart`).first()).toBeVisible();
    await expect(tid(page, "cart-count")).toHaveText("1");

    await tid(page, "cart-link").click();
    await expect(page).toHaveURL("/cart");
    const row = tid(page, "cart-row");
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(CABLE_TIE.name);
    // minimum order is 5 packs at Rp 24.000
    await expect(row.getByTestId("line-total")).toHaveText("Rp 120.000");
    await expect(tid(page, "cart-subtotal")).toHaveText("Rp 120.000");
    await expect(tid(page, "checkout-button")).toBeEnabled();
  });

  test("the cart is kept after a page refresh (localStorage)", async ({ page }) => {
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    await expect(tid(page, "cart-row")).toHaveCount(1);
    await page.reload();
    await expect(tid(page, "cart-row")).toHaveCount(1);
    await expect(tid(page, "cart-count")).toHaveText("1");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("mephub_cart_v1") ?? "[]"));
    expect(saved).toHaveLength(1);
    expect(saved[0].quantity).toBe(5);
  });

  test("changing the quantity recalculates totals and applies the volume price", async ({ page }) => {
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    const quantity = page.getByRole("textbox", { name: `Quantity for ${CABLE_TIE.name}` });
    await quantity.fill("20");
    await quantity.press("Enter");
    await expect(tid(page, "line-total")).toHaveText("Rp 420.000"); // 20 x 21.000
    await expect(page.getByText("Volume price applied")).toBeVisible();
  });

  test("the quantity cannot go below the product's minimum order", async ({ page }) => {
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    const quantity = page.getByRole("textbox", { name: `Quantity for ${CABLE_TIE.name}` });
    await quantity.fill("1");
    await quantity.press("Enter");
    await expect(quantity).toHaveValue("5");
    await expect(page.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });

  test("removing the last item brings back the empty state", async ({ page }) => {
    const card = await findProductCard(page, CABLE_TIE.sku);
    await card.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    await tid(page, "remove-item").click();
    await expect(page.getByText(`${CABLE_TIE.name} removed from cart`).first()).toBeVisible();
    await expect(tid(page, "empty-cart")).toBeVisible();
    await expect(tid(page, "checkout-button")).toBeDisabled();
    await expect(tid(page, "cart-count")).toHaveCount(0);
  });

  test("a made-to-order product can be added to the cart", async ({ page }) => {
    const card = await findProductCard(page, "MVS10N3MD2A");
    await card.getByTestId("add-to-cart").click();
    await page.goto("/cart");
    await expect(tid(page, "cart-row")).toContainText("Made to order");
  });

});