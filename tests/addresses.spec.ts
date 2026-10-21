import { expect, test } from "@playwright/test";
import { USER_STATE, uniqueName, tid } from "./helpers";

test.use({ storageState: USER_STATE });

test("a customer adds, edits, makes default and deletes a delivery address", async ({ page }) => {
  const label = uniqueName("Site");
  await page.goto("/account/addresses");
  await tid(page, "add-address").click();
  const dialog = page.getByRole("dialog");

  await dialog.getByRole("button", { name: "Save address" }).click();
  await expect(dialog.getByText("Recipient name is required.")).toBeVisible();

  await dialog.getByLabel("Label").fill(label);
  await dialog.getByLabel("Recipient name").fill("Pak Joko");
  await dialog.getByLabel("Phone").fill("081234567890");
  await dialog.getByLabel("Postal code").fill("40111");
  await dialog.getByLabel("Street address").fill("Jl. Industri No. 5");
  await dialog.getByLabel("City").fill("Bandung");
  await dialog.getByLabel("Province").fill("Jawa Barat");
  await dialog.getByRole("button", { name: "Save address" }).click();

  const card = tid(page, "address-card").filter({ hasText: label });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("Pak Joko");
  await expect(card).not.toContainText("Default");

  await card.getByRole("button", { name: "Make default" }).click();
  await expect(tid(page, "address-card").filter({ hasText: label })).toContainText("Default");

  // give the default back to the seeded address, then remove ours
  await tid(page, "address-card").filter({ hasText: "E2E Address" }).getByRole("button", { name: "Make default" }).click();
  await expect(tid(page, "address-card").filter({ hasText: "E2E Address" })).toContainText("Default");
  await tid(page, "address-card").filter({ hasText: label }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(tid(page, "address-card").filter({ hasText: label })).toHaveCount(0);
});