import { expect, test } from "@playwright/test";
import { ADMIN_STATE, uniqueName, tid } from "./helpers";

test.use({ storageState: ADMIN_STATE });

const SEARCH = "Search by name, SKU or brand...";

test.describe("admin product CRUD on /dashboard", () => {
  test("validation: an empty form shows errors and nothing is created", async ({ page }) => {
    await page.goto("/dashboard");
    await tid(page, "add-product").click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Create product" }).click();
    await expect(dialog.getByText("Product name must be at least 3 characters.")).toBeVisible();
    await expect(dialog.getByText("Choose a category.")).toBeVisible();
    await expect(dialog.getByText("Choose the supplier who sells this product.")).toBeVisible();
    await expect(dialog.getByText("Enter a price greater than 0.")).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("create, edit and delete a product (full journey)", async ({ page }) => {
    const name = uniqueName("E2E Test MCB");
    const sku = `E2E-${Date.now().toString(36).toUpperCase()}`;
    await page.goto("/dashboard");

    // ----- create
    await tid(page, "add-product").click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Product name").fill(name);
    await dialog.getByLabel("SKU / part number").fill(sku);
    await dialog.getByLabel("Brand").fill("E2E Brand");
    await dialog.getByLabel("Category").selectOption({ label: "Electrical / Circuit Protection" });
    await dialog.getByLabel("Supplier").selectOption({ label: "PT Angkasa Panelindo Elektrik" });
    await dialog.getByLabel("Price (Rp)").fill("100000");
    await dialog.getByLabel("Stock").fill("25");
    await dialog.getByLabel("Min. order qty").fill("2");
    await dialog.getByRole("button", { name: "Add price tier" }).click();
    await dialog.getByLabel("From quantity").fill("10");
    await dialog.getByLabel("Price per unit (Rp)").fill("90000");
    await dialog.getByLabel("Description and specifications").fill("A test product\n\nRated current: 10 A");
    await dialog.getByRole("button", { name: "Create product" }).click();

    await expect(page.getByText(`"${name}" was created`).first()).toBeVisible();
    await page.getByPlaceholder(SEARCH).fill(name);
    const row = tid(page, "product-row").filter({ hasText: name });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Rp 100.000");
    await expect(row).toContainText("PT Angkasa Panelindo Elektrik");

    // the public catalog shows it with its volume price
    await row.getByRole("link", { name }).click();
    await expect(tid(page, "price-tiers")).toContainText("Rp 90.000");
    await expect(page.getByText("Rated current")).toBeVisible();
    await page.goto("/dashboard");

    // ----- edit
    await page.getByPlaceholder(SEARCH).fill(name);
    await page.getByRole("button", { name: `Edit ${name}` }).click();
    const editDialog = page.getByRole("dialog");
    await editDialog.getByLabel("Price (Rp)").fill("125000");
    await editDialog.getByLabel("Stock").fill("40");
    await editDialog.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(`"${name}" was updated`).first()).toBeVisible();
    await expect(tid(page, "product-row").filter({ hasText: name })).toContainText("Rp 125.000");
    await expect(tid(page, "product-row").filter({ hasText: name })).toContainText("40 pcs");

    // ----- delete
    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText(`"${name}" was deleted`).first()).toBeVisible();
    await expect(tid(page, "product-row").filter({ hasText: name })).toHaveCount(0);
  });

  test("a duplicate SKU is rejected with a visible error", async ({ page }) => {
    await page.goto("/dashboard");
    await tid(page, "add-product").click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Product name").fill(uniqueName("E2E Duplicate SKU"));
    await dialog.getByLabel("SKU / part number").fill("ez9f34110");
    await dialog.getByLabel("Category").selectOption({ label: "Electrical / Circuit Protection" });
    await dialog.getByLabel("Supplier").selectOption({ label: "PT Angkasa Panelindo Elektrik" });
    await dialog.getByLabel("Price (Rp)").fill("1000");
    await dialog.getByRole("button", { name: "Create product" }).click();
    await expect(dialog.getByTestId("form-error")).toContainText("already used");
  });

  test("a made-to-order product needs a lead time", async ({ page }) => {
    await page.goto("/dashboard");
    await tid(page, "add-product").click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Availability").selectOption("indent");
    await dialog.getByRole("button", { name: "Create product" }).click();
    await expect(dialog.getByText("Lead time (days) is required for made-to-order products.")).toBeVisible();
  });

  test("deleting a product that is part of an active order shows an error and keeps the product", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByPlaceholder(SEARCH).fill("EZ9F34110");
    await expect(tid(page, "product-row")).toHaveCount(1);
    await page.getByRole("button", { name: "Delete MCB 1P 10A 6kA C-Curve" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();

    await expect(tid(page, "confirm-error")).toContainText("active orders");
    await expect(page.getByText(/tied to one or more active orders/).first()).toBeVisible(); // the toast
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
    await expect(tid(page, "product-row")).toHaveCount(1); // still there
  });

  test("the product table pages through the catalog", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(tid(page, "product-row")).toHaveCount(10);
    await page.getByRole("button", { name: /Next/ }).click();
    await expect(page.getByText("Page 2 of")).toBeVisible();
  });
});