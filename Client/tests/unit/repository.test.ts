import { describe, expect, it } from "vitest";
import {
  deleteListing,
  listListings,
  loadListing,
  loadProfile,
  saveListing,
  saveProfile,
} from "@/app/lib/listings/repository";
import type { ListingForm, ListingImage } from "@/app/lib/types";
import { validForm } from "../fixtures";
import { createFakeSupabase, PIXEL } from "../fakeSupabase";

const USER = "user-1";
const photo = (name: string): ListingImage => ({ name, preview: PIXEL });
const form = (over: Partial<ListingForm> = {}): ListingForm => ({
  ...validForm,
  agentCompanyLogo: null,
  agentPhoto: null,
  agentQrCode: null,
  ...over,
});

describe("saveListing", () => {
  it("uploads new photos into the user's folder and stores only paths", async () => {
    const fake = createFakeSupabase();
    const saved = await saveListing(fake.client, USER, {
      id: null,
      form: form(),
      images: [photo("a.jpg"), photo("b.jpg")],
    });

    expect(fake.uploads).toHaveLength(2);
    for (const path of fake.uploads) {
      expect(path.startsWith(`${USER}/${saved.id}/`)).toBe(true);
      expect(path.endsWith(".png")).toBe(true);
    }
    const [row] = fake.rowsOf("listings");
    expect(row).toMatchObject({
      id: saved.id,
      user_id: USER,
      title: validForm.propertyTitle,
    });
    // The row holds paths and text only, never image data.
    expect(JSON.stringify(row)).not.toContain("base64");
    expect(row!.images).toEqual(
      fake.uploads.map((path, i) => ({ name: ["a.jpg", "b.jpg"][i], path }))
    );
    expect(
      saved.images.every((i) =>
        i.preview.startsWith("https://test.supabase.co/")
      )
    ).toBe(true);
  });

  it("does not re-upload photos that are already stored", async () => {
    const fake = createFakeSupabase();
    const first = await saveListing(fake.client, USER, {
      id: null,
      form: form(),
      images: [photo("a.jpg")],
    });
    fake.uploads.length = 0;

    await saveListing(fake.client, USER, {
      id: first.id,
      form: form({ propertyTitle: "Renamed Home" }),
      images: first.images,
    });

    expect(fake.uploads).toHaveLength(0);
    expect(fake.rowsOf("listings")).toHaveLength(1); // updated, not duplicated
    expect(fake.rowsOf("listings")[0]!.title).toBe("Renamed Home");
  });

  it("uploads only the new photo and deletes removed ones", async () => {
    const fake = createFakeSupabase();
    const first = await saveListing(fake.client, USER, {
      id: null,
      form: form(),
      images: [photo("a.jpg"), photo("b.jpg")],
    });
    const [keep, drop] = first.images as [ListingImage, ListingImage];
    fake.uploads.length = 0;

    const second = await saveListing(fake.client, USER, {
      id: first.id,
      form: form(),
      images: [keep, photo("c.jpg")], // b removed, c added
    });

    expect(fake.uploads).toHaveLength(1);
    expect(fake.removed).toEqual([drop.path]);
    expect(second.images.map((i) => i.name)).toEqual(["a.jpg", "c.jpg"]);
  });

  it("keeps photo order", async () => {
    const fake = createFakeSupabase();
    const saved = await saveListing(fake.client, USER, {
      id: null,
      form: form(),
      images: [photo("1"), photo("2"), photo("3")],
    });
    expect(saved.images.map((i) => i.name)).toEqual(["1", "2", "3"]);
  });

  it("cleans up uploaded files if saving the row fails", async () => {
    const fake = createFakeSupabase({ failUpsertOn: "listings" });
    await expect(
      saveListing(fake.client, USER, {
        id: null,
        form: form(),
        images: [photo("a.jpg")],
      })
    ).rejects.toThrow("Could not save the listing.");
    expect(fake.removed).toEqual(fake.uploads);
    expect(fake.rowsOf("listings")).toHaveLength(0);
  });

  it("rejects an undecodable photo and saves nothing", async () => {
    const fake = createFakeSupabase();
    // A data URL that is not valid base64 cannot be decoded.
    await expect(
      saveListing(fake.client, USER, {
        id: null,
        form: form(),
        images: [{ name: "bad", preview: "not a url" }],
      })
    ).rejects.toThrow();
    expect(fake.rowsOf("listings")).toHaveLength(0);
  });
});

describe("listing reads and delete", () => {
  it("lists newest first and opens a listing", async () => {
    const fake = createFakeSupabase();
    const a = await saveListing(fake.client, USER, {
      id: null,
      form: form({ propertyTitle: "Older home" }),
      images: [photo("a.jpg")],
    });
    fake.rowsOf("listings")[0]!.updated_at = "2026-01-01T00:00:00Z";
    const b = await saveListing(fake.client, USER, {
      id: null,
      form: form({ propertyTitle: "Newer home" }),
      images: [],
    });

    const list = await listListings(fake.client);
    expect(list.map((l) => l.title)).toEqual(["Newer home", "Older home"]);
    expect(list[1]!.cover).toContain(a.images[0]!.path!);

    const opened = await loadListing(fake.client, b.id);
    expect(opened.form.propertyTitle).toBe("Newer home");
  });

  it("surfaces a friendly error for a missing listing", async () => {
    const fake = createFakeSupabase();
    await expect(loadListing(fake.client, "nope")).rejects.toThrow(
      "Could not open that listing."
    );
  });

  it("deletes the row and its photos", async () => {
    const fake = createFakeSupabase();
    const saved = await saveListing(fake.client, USER, {
      id: null,
      form: form(),
      images: [photo("a.jpg"), photo("b.jpg")],
    });
    await deleteListing(fake.client, saved.id);
    expect(fake.rowsOf("listings")).toHaveLength(0);
    expect(fake.removed.sort()).toEqual(
      saved.images.map((i) => i.path!).sort()
    );
    expect(fake.files.size).toBe(0);
  });
});

describe("agent profile", () => {
  it("saves details, uploads logo and photo into the profile folder", async () => {
    const fake = createFakeSupabase();
    const profile = await saveProfile(
      fake.client,
      USER,
      form({
        agentCompanyLogo: { name: "logo.png", preview: PIXEL },
        agentPhoto: { name: "me.jpg", preview: PIXEL },
      })
    );
    expect(fake.uploads).toHaveLength(2);
    for (const p of fake.uploads)
      expect(p.startsWith(`${USER}/profile/`)).toBe(true);
    expect(fake.rowsOf("profiles")[0]).toMatchObject({
      id: USER,
      agent_name: validForm.agentName,
      company_name: validForm.agentCompanyName,
    });
    expect(profile.agentCompanyLogo?.path).toBe(fake.uploads[0]);
    expect(profile.agentQrCode).toBeNull();
  });

  it("does not store the built-in default logo", async () => {
    const fake = createFakeSupabase();
    const profile = await saveProfile(
      fake.client,
      USER,
      form({
        agentCompanyLogo: {
          name: "Default Logo",
          type: "default-svg-logo",
          preview: "__default_svg_logo__",
        },
      })
    );
    expect(fake.uploads).toHaveLength(0);
    expect(profile.agentCompanyLogo).toBeNull();
    expect(fake.rowsOf("profiles")[0]!.logo_path).toBeNull();
  });

  it("reuses stored assets and deletes replaced ones", async () => {
    const fake = createFakeSupabase();
    const first = await saveProfile(
      fake.client,
      USER,
      form({ agentPhoto: { name: "me.jpg", preview: PIXEL } })
    );
    const oldPath = (first.agentPhoto as ListingImage).path!;
    fake.uploads.length = 0;

    // Same stored photo: nothing uploaded or removed.
    await saveProfile(
      fake.client,
      USER,
      form({ agentPhoto: first.agentPhoto })
    );
    expect(fake.uploads).toHaveLength(0);
    expect(fake.removed).toEqual([]);

    // A new photo replaces it and the old file is deleted.
    await saveProfile(
      fake.client,
      USER,
      form({ agentPhoto: { name: "new.jpg", preview: PIXEL } })
    );
    expect(fake.uploads).toHaveLength(1);
    expect(fake.removed).toEqual([oldPath]);
  });

  it("loads a saved profile, or null for a new user", async () => {
    const fake = createFakeSupabase();
    expect(await loadProfile(fake.client, USER)).toBeNull();
    await saveProfile(
      fake.client,
      USER,
      form({ agentCompanyLogo: { name: "logo.png", preview: PIXEL } })
    );
    const loaded = await loadProfile(fake.client, USER);
    expect(loaded?.agentName).toBe(validForm.agentName);
    expect(loaded?.agentCompanyLogo?.preview).toContain(
      "/storage/v1/object/public/media/"
    );
  });
});
