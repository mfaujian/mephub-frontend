import { expect, test } from "@playwright/test";
import { ADMIN_STATE, uniqueName, tid } from "./helpers";

test.use({ storageState: ADMIN_STATE });

test.describe("admin category CRUD on /dashboard/categories", () => {
  test("the name is validated before anything is sent", async ({ page }) => {
    await page.goto("/dashboard/categories");
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByText("Category name is required.")).toBeVisible();
    await page.getByLabel("Category name").fill("A");
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByText("Category name must be at least 2 characters.")).toBeVisible();
  });

  test("create, edit and delete a category", async ({ page }) => {
    const name = uniqueName("E2E Category");
    await page.goto("/dashboard/categories");

    await page.getByLabel("Category name").fill(name);
    await page.getByLabel("Description (optional)").fill("Created by a test");
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByText(`Category "${name}" created`).first()).toBeVisible();
    const row = tid(page, "category-row").filter({ hasText: name });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("Created by a test");

    await page.getByRole("button", { name: `Edit ${name}` }).click();
    const renamed = `${name} renamed`;
    await page.getByRole("dialog").getByLabel("Category name").fill(renamed);
    await page.getByRole("dialog").getByRole("button", { name: "Save changes" }).click();
    await expect(tid(page, "category-row").filter({ hasText: renamed })).toHaveCount(1);

    await page.getByRole("button", { name: `Delete ${renamed}` }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText(`Category "${renamed}" deleted`).first()).toBeVisible();
    await expect(tid(page, "category-row").filter({ hasText: renamed })).toHaveCount(0);
  });

  test("a duplicate category name is rejected with a visible error", async ({ page }) => {
    await page.goto("/dashboard/categories");
    await page.getByLabel("Category name").fill("Electrical");
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(tid(page, "form-error")).toBeVisible();
  });

  test("a category that still has products cannot be deleted", async ({ page }) => {
    await page.goto("/dashboard/categories");
    await page.getByRole("button", { name: "Delete Circuit Protection" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(tid(page, "confirm-error")).toContainText("product(s) are still assigned");
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
    await expect(tid(page, "category-row").filter({ hasText: "Circuit Protection" })).toHaveCount(1);
  });

  test("a category that still has subcategories cannot be deleted", async ({ page }) => {
    await page.goto("/dashboard/categories");
    await page.getByRole("button", { name: "Delete Electrical", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(tid(page, "confirm-error")).toContainText("subcategory");
  });
});