import { expect, test } from "@playwright/test";

test("photos are shrunk in the browser before they are used", async ({
  page,
}) => {
  await page.goto("/property/general");

  // Build a large (4000x3000) noisy image in the page, like a phone photo.
  await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 4000;
    canvas.height = 3000;
    const ctx = canvas.getContext("2d")!;
    for (let y = 0; y < 3000; y += 50) {
      for (let x = 0; x < 4000; x += 50) {
        ctx.fillStyle = `hsl(${(x * 7 + y * 3) % 360} 70% ${30 + ((x + y) % 40)}%)`;
        ctx.fillRect(x, y, 50, 50);
      }
    }
    const blob: Blob = await new Promise((r) =>
      canvas.toBlob((b) => r(b!), "image/png")
    );
    const file = new File([blob], "big-photo.png", { type: "image/png" });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.querySelector<HTMLInputElement>(
      "#property-images-input"
    )!;
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const thumb = page.locator('img[alt^="Uploaded"]').first();
  await expect(thumb).toBeVisible();

  const result = await thumb.evaluate(async (img) => {
    const el = img as HTMLImageElement;
    await el.decode();
    return {
      src: el.src.slice(0, 22),
      width: el.naturalWidth,
      height: el.naturalHeight,
      // data URL length ≈ 4/3 of the encoded bytes
      approxBytes: Math.round((el.src.length * 3) / 4),
    };
  });

  expect(result.src).toBe("data:image/jpeg;base64");
  expect(result.width).toBe(1600); // longest edge capped
  expect(result.height).toBe(1200); // aspect ratio kept
  expect(result.approxBytes).toBeLessThan(500_000);
});

test("only 12 photos are kept per listing, with a notice", async ({ page }) => {
  await page.goto("/property/general");
  await page.evaluate(async () => {
    const make = async (i: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = 40;
      c.getContext("2d")!.fillRect(0, 0, 40, 40);
      const blob: Blob = await new Promise((r) =>
        c.toBlob((b) => r(b!), "image/png")
      );
      return new File([blob], `p${i}.png`, { type: "image/png" });
    };
    const dt = new DataTransfer();
    for (let i = 0; i < 15; i++) dt.items.add(await make(i));
    const input = document.querySelector<HTMLInputElement>(
      "#property-images-input"
    )!;
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator('img[alt^="Uploaded"]')).toHaveCount(12);
  await expect(
    page.getByText("Up to 12 photos per listing. Added 12 of 15.")
  ).toBeVisible();
});
