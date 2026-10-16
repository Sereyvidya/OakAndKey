import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { mockSupabase } from "./helpers/mockSupabase";

test("accounts: sign in, save, reopen, export, delete, sign out", async ({
  page,
}) => {
  const db = await mockSupabase(page);

  // Wrong password: friendly message, still signed out.
  await page.goto("/login");
  await page.getByLabel("Email").fill("agent@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await expect(
    page.getByText("That email and password don't match.")
  ).toBeVisible();

  // Correct password lands on My Listings, which starts empty.
  await page.getByLabel("Password").fill("correct-horse");
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/\/listings/);
  await expect(page.getByText("No saved listings yet")).toBeVisible();

  // Build the sample listing and save it.
  await page.getByRole("button", { name: "New listing" }).click();
  await expect(page).toHaveURL(/\/property\/general/);
  await page.getByRole("button", { name: "Sample" }).click();
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page.getByText("Saved ✓")).toBeVisible();

  // 4 listing photos + the agent headshot uploaded; the default logo is not stored.
  expect(db.uploads.filter((p) => p.includes("/profile/"))).toHaveLength(1);
  expect(db.uploads.filter((p) => !p.includes("/profile/"))).toHaveLength(4);
  expect(db.listings).toHaveLength(1);
  expect(JSON.stringify(db.listings[0])).not.toContain("base64");

  // Saving again updates the same row and uploads nothing new.
  const uploaded = db.uploads.length;
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page.getByText("Saved ✓")).toBeVisible();
  expect(db.listings).toHaveLength(1);
  expect(db.uploads).toHaveLength(uploaded);

  // The listing shows up in My Listings (price + address), and survives a reload.
  await page.getByRole("link", { name: "My Listings" }).first().click();
  await expect(page).toHaveURL(/\/listings/);
  await page.reload();
  const card = page.getByRole("listitem").filter({
    hasText: "Modern 4-Bedroom Family Home",
  });
  await expect(card).toContainText("$485,000");
  await expect(card).toContainText("Austin");

  // Open it: fields and the 4 photos come back from storage.
  await card.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(/\/property\/general/);
  await expect(page.getByLabel("Title")).toHaveValue(
    "Modern 4-Bedroom Family Home"
  );
  await expect(page.locator('img[alt^="Uploaded"]')).toHaveCount(4);

  // Flyer export works with photos loaded from storage (cross-origin images).
  await page.getByRole("button", { name: /save & continue/i }).click();
  await expect(page).toHaveURL(/\/property\/flyer/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const png = readFileSync(await (await download).path());
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.length).toBeGreaterThan(100_000);

  // Delete removes the row and its files.
  await page.getByRole("link", { name: "My Listings" }).first().click();
  await card.getByRole("button", { name: "Delete" }).click();
  await card.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByText("No saved listings yet")).toBeVisible();
  expect(db.listings).toHaveLength(0);
  expect(db.removed.filter((p) => !p.includes("/profile/"))).toHaveLength(4);

  // Sign out clears the working listing and hides account-only navigation.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "My Listings" })).toHaveCount(0);
});

test("accounts: visiting My Listings signed out redirects to sign in", async ({
  page,
}) => {
  await mockSupabase(page);
  await page.goto("/listings");
  await expect(page).toHaveURL(/\/login\?next=\/listings/);
});
