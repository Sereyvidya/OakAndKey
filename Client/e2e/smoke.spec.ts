import { expect, test } from "@playwright/test";

const mockCaptions = {
  variants: [
    {
      name: "Version 1",
      caption: "Mocked AI caption for the sample home.",
      hashtags: ["#JustListed", "#Austin"],
      note: "Mocked.",
    },
  ],
};

test("sample listing -> flyer templates -> export -> AI captions", async ({
  page,
}) => {
  // Never hit the real Gemini API from tests.
  await page.route("**/api/captions/generate", (route) =>
    route.fulfill({ json: mockCaptions })
  );

  await page.goto("/");
  await page.getByRole("link", { name: /get started/i }).click();
  await expect(page).toHaveURL(/\/property\/general/);

  await page.getByRole("button", { name: "Sample" }).click();
  await expect(page.getByLabel("Title")).toHaveValue(
    "Modern 4-Bedroom Family Home"
  );
  await page.getByRole("button", { name: /save & continue/i }).click();
  await expect(page).toHaveURL(/\/property\/flyer/);

  for (const template of ["Showcase", "Gallery", "Modern"]) {
    await page.getByRole("button", { name: template, exact: true }).click();
    // Every template shows the formatted price.
    await expect(page.getByText("$485,000").first()).toBeVisible();
  }

  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  expect((await pngDownload).suggestedFilename()).toBe(
    "modern-4-bedroom-family-home.png"
  );

  await page.getByRole("button", { name: "PDF", exact: true }).click();
  const pdfDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  expect((await pdfDownload).suggestedFilename()).toBe(
    "modern-4-bedroom-family-home.pdf"
  );

  // Captions page, using the mocked API
  await page.getByRole("link", { name: "Captions" }).first().click();
  await page.getByRole("button", { name: /local generator/i }).click();
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(
    page.getByText("Mocked AI caption for the sample home.")
  ).toBeVisible();
});
