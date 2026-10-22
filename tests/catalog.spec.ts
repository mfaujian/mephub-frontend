import { expect, test } from "@playwright/test";
import { findProductCard, tid } from "./helpers";

test.describe("browsing the catalog", () => {
  test("the product list shows product cards with part numbers and prices", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products", exact: true })).toBeVisible();
    await expect(tid(page, "product-grid").getByRole("article")).toHaveCount(12);
    await expect(tid(page, "result-count")).toContainText("55 products");
  });

  test("searching by part number filters the list and keeps the search in the URL", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("searchbox").fill("EZ9F34110");
    await expect(page).toHaveURL(/q=EZ9F34110/);
    await expect(tid(page, "result-count")).toContainText("1 product");
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toContainText("MCB 1P 10A 6kA C-Curve");
  });

  test("search also matches the brand and sorting by price works", async ({ page }) => {
    await page.goto("/products?q=fluke&sort=price_desc");
    const productHeadings = page.getByRole("article").getByRole("heading");
    await expect(productHeadings.first()).toBeVisible({ timeout: 5000 });
    const names = await productHeadings.allTextContents();
    expect(names).toEqual(["AC Clamp Meter 600A", "Digital Multimeter CAT III"]);
  });

  test("filtering by brand narrows the list", async ({ page }) => {
    await page.goto("/products");
    await page.getByLabel("Filter by brand").selectOption("Rucika");
    await expect(page).toHaveURL(/brand=Rucika/);
    await expect(tid(page, "result-count")).toContainText("3 products");
  });

  test("a search with no results shows an empty message", async ({ page }) => {
    await page.goto("/products?q=zzzz-not-a-product");
    await expect(tid(page, "no-products")).toContainText("No products found.");
  });

  test("the product detail page shows specs, volume pricing and its own title", async ({ page }) => {
    const card = await findProductCard(page, "EZ9F34110");
    await card.getByRole("link", { name: "MCB 1P 10A 6kA C-Curve" }).click();
    await expect(page).toHaveURL(/\/products\/\d+$/);
    await expect(page).toHaveTitle(/MCB 1P 10A 6kA C-Curve/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("MCB 1P 10A 6kA C-Curve");
    await expect(page.getByText("Part no.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Specifications" })).toBeVisible();
    await expect(page.getByText("Breaking capacity")).toBeVisible();
    await expect(tid(page, "price-tiers")).toBeVisible();
    await expect(page.getByRole("link", { name: "Datasheet (PDF)" })).toBeVisible();
  });

  test("the quantity box applies volume pricing live on the product page", async ({ page }) => {
    const card = await findProductCard(page, "EZ9F34110");
    await card.getByRole("link", { name: "MCB 1P 10A 6kA C-Curve" }).click();
    await expect(tid(page, "line-total")).toHaveText("Rp 62.000");
    const quantity = page.getByRole("textbox", { name: /Quantity/ });
    await quantity.fill("12");
    await quantity.press("Enter");
    await expect(tid(page, "line-total")).toHaveText("Rp 672.000"); // 12 x 56.000
    await quantity.fill("48");
    await quantity.press("Enter");
    await expect(tid(page, "line-total")).toHaveText("Rp 2.400.000"); // 48 x 50.000
  });

  test("a made-to-order product shows its lead time", async ({ page }) => {
    const card = await findProductCard(page, "MVS10N3MD2A");
    await expect(card).toContainText("Made to order");
    await card.getByRole("link").first().click();
    await expect(page.getByText("Estimated lead time 28 days")).toBeVisible();
  });

  test("an unknown product id shows the not-found page", async ({ page }) => {
    await page.goto("/products/999999");
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
  });

  test("the category listing links to a filtered product list", async ({ page }) => {
    await page.goto("/categories");
    await expect(page.getByRole("heading", { name: "Categories", exact: true })).toBeVisible();
    await page.getByRole("link", { name: /View all Plumbing/ }).click();
    await expect(page).toHaveURL(/category=\d+/);
    await expect(tid(page, "result-count")).toContainText("10 products");
  });
});