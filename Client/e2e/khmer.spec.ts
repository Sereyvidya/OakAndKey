import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const KHMER = /[ក-៿]/;

test("Khmer: UI, flyer text, and PNG/PDF export", async ({ page }) => {
  await page.route("**/api/captions/generate", async (route) => {
    // The request must carry the chosen output language.
    expect(route.request().postDataJSON().language).toBe("km");
    await route.fulfill({
      json: {
        variants: [
          {
            name: "ទម្រង់ 1",
            caption: "ផ្ទះថ្មីសម្រាប់លក់នៅអូស្ទីន។",
            hashtags: ["#RealEstate"],
            note: "",
          },
        ],
      },
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "ខ្មែរ" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  await expect(page.getByRole("heading", { level: 1 }).last()).toContainText(
    KHMER
  );

  // Language survives navigation (client-side store).
  await page.getByRole("link", { name: "ចាប់ផ្តើម" }).click();
  await page.getByRole("button", { name: "គំរូ" }).click();
  await page.getByRole("button", { name: "រក្សាទុក និងបន្ត" }).click();
  await expect(page).toHaveURL(/\/property\/flyer/);

  // Flyer: Khmer default wording, Khmer font, on every template.
  for (const template of ["Showcase", "Gallery", "Modern"]) {
    await page.getByRole("button", { name: template, exact: true }).click();
    const flyer = page.locator('[data-flyer-lang="km"]');
    await expect(flyer).toContainText(KHMER);
    await expect(flyer).toContainText("$485,000");
  }

  // The Khmer font file must actually have loaded (not a fallback).
  const khmerFontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    // Dev serves "Noto Sans Khmer"; production hashes it ("__Noto_Sans_Khmer_xx").
    return [...document.fonts].some(
      (f) =>
        /Noto[ _]Sans[ _]Khmer/.test(f.family) &&
        f.unicodeRange.includes("1780") &&
        f.status === "loaded"
    );
  });
  expect(khmerFontLoaded).toBe(true);

  // PNG export: a real, full-size PNG.
  const png = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const pngFile = await (await png).path();
  const pngBytes = readFileSync(pngFile);
  expect(pngBytes.subarray(1, 4).toString()).toBe("PNG");
  expect(pngBytes.readUInt32BE(16)).toBe(3240); // 1080 * pixelRatio 3
  expect(pngBytes.readUInt32BE(20)).toBe(4050); // 1350 * 3
  expect(pngBytes.length).toBeGreaterThan(200_000);

  // PDF export: the flyer is embedded as an image, so Khmer shaping is baked in.
  await page.getByRole("button", { name: "PDF", exact: true }).click();
  const pdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const pdfFile = await (await pdf).path();
  const pdfBytes = readFileSync(pdfFile);
  expect(pdfBytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdfBytes.length).toBeGreaterThan(100_000);

  // Captions in Khmer, request carries language=km
  await page.getByRole("link", { name: "អត្ថបទ" }).first().click();
  await page.getByRole("button", { name: /បង្កើតក្នុងម៉ាស៊ីន/ }).click();
  await page.getByRole("button", { name: "បង្កើត", exact: true }).click();
  await expect(page.getByText("ផ្ទះថ្មីសម្រាប់លក់នៅអូស្ទីន។")).toBeVisible();
});
