import { expect, test } from "@playwright/test";
import { tid } from "./helpers";

test.describe("quick order", () => {
  test("pasted part numbers are looked up, checked and added to the cart", async ({ page }) => {
    await page.goto("/quick-order");
    await page.getByLabel("Part numbers and quantities").fill("EZ9F34110, 24\nlc1e0910m5   10\nNOT-A-PART 3\n6205-2RS\t1");
    await tid(page, "quick-order-lookup").click();

    const rows = tid(page, "quick-order-row");
    await expect(rows).toHaveCount(4);
    await expect(rows.filter({ hasText: "EZ9F34110" })).toContainText("Rp 56.000"); // 24 pcs reaches the 12+ tier
    await expect(rows.filter({ hasText: "LC1E0910M5" })).toContainText("Rp 262.000"); // 10 pcs reaches the 10+ tier
    await expect(rows.filter({ hasText: "NOT-A-PART" })).toContainText("Part number not found");
    await expect(rows.filter({ hasText: "6205-2RS" })).toContainText("Raised to the minimum order of 2"); // MOQ is 2

    await tid(page, "quick-order-add-all").click();
    await expect(page.getByText("3 items added to your cart").first()).toBeVisible();
    await page.goto("/cart");
    await expect(tid(page, "cart-row")).toHaveCount(3);
  });

  test("lines that cannot be read are reported", async ({ page }) => {
    await page.goto("/quick-order");
    await page.getByLabel("Part numbers and quantities").fill("EZ9F34110, lots\n!!!");
    await tid(page, "quick-order-lookup").click();
    await expect(page.getByRole("alert").filter({ hasText: "Could not read these lines" })).toBeVisible();
  });
});