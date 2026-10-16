import { describe, expect, it } from "vitest";
import {
  applyProfileToForm,
  formToStored,
  imagesToStored,
  profileToRow,
  rowToProfile,
  rowToSaved,
  rowToSummary,
  type ListingRow,
} from "@/app/lib/listings/serialize";
import type { AgentProfile, ListingForm, ListingImage } from "@/app/lib/types";
import { validForm } from "../fixtures";

const urlFor = (p: string) => `https://cdn/${p}`;

const emptyForm = (): ListingForm => ({
  ...validForm,
  agentName: "",
  agentCompanyName: "",
  agentSocialLink: "",
  agentPhone: "",
  agentEmail: "",
  agentCompanyLogo: null,
  agentPhoto: null,
  agentQrCode: null,
});

const profile: AgentProfile = {
  agentName: "Sokha Chan",
  agentCompanyName: "Angkor Homes",
  agentSocialLink: "angkorhomes.com",
  agentPhone: "012 345 678",
  agentEmail: "sokha@example.com",
  agentCompanyLogo: {
    name: "logo",
    path: "u/profile/logo.png",
    preview: urlFor("u/profile/logo.png"),
  },
  agentPhoto: {
    name: "photo",
    path: "u/profile/photo.jpg",
    preview: urlFor("u/profile/photo.jpg"),
  },
  agentQrCode: null,
};

describe("formToStored", () => {
  it("drops the image-valued agent fields but keeps every text field", () => {
    const stored = formToStored({
      ...validForm,
      agentCompanyLogo: { name: "l", preview: "data:big" },
      agentPhoto: { name: "p", preview: "data:big" },
      agentQrCode: { name: "q", preview: "data:big" },
    });
    expect(stored).not.toHaveProperty("agentCompanyLogo");
    expect(stored).not.toHaveProperty("agentPhoto");
    expect(stored).not.toHaveProperty("agentQrCode");
    expect(stored.propertyTitle).toBe(validForm.propertyTitle);
    expect(stored.price).toBe(validForm.price);
    expect(JSON.stringify(stored)).not.toContain("data:big");
  });
});

describe("formToStored: default logo", () => {
  it("keeps the built-in default logo marker (it carries no image data)", () => {
    const stored = formToStored({
      ...validForm,
      agentCompanyLogo: {
        name: "Default Logo",
        type: "default-svg-logo",
        preview: "__default_svg_logo__",
      },
    });
    expect(stored.agentCompanyLogo?.type).toBe("default-svg-logo");
  });
});

describe("imagesToStored", () => {
  it("keeps only images that are already in storage", () => {
    expect(
      imagesToStored([
        { name: "a.jpg", preview: "x", path: "u/l/a.jpg" },
        { name: "b.jpg", preview: "data:..." },
      ])
    ).toEqual([{ name: "a.jpg", path: "u/l/a.jpg" }]);
  });
});

describe("row mapping", () => {
  const row: ListingRow = {
    id: "l1",
    title: "Lakeside Home",
    form: {
      ...formToStored(validForm),
      price: "300000",
      address: "1 Lake Rd, Austin, TX",
    },
    images: [
      { name: "a.jpg", path: "u/l1/a.jpg" },
      { name: "b.jpg", path: "u/l1/b.jpg" },
    ],
    updated_at: "2026-10-16T10:00:00Z",
  };

  it("turns a row into a saved listing with public image URLs", () => {
    const saved = rowToSaved(row, urlFor);
    expect(saved.id).toBe("l1");
    expect(saved.images).toEqual([
      { name: "a.jpg", path: "u/l1/a.jpg", preview: "https://cdn/u/l1/a.jpg" },
      { name: "b.jpg", path: "u/l1/b.jpg", preview: "https://cdn/u/l1/b.jpg" },
    ]);
  });

  it("summarizes a row for the list view", () => {
    expect(rowToSummary(row, urlFor)).toEqual({
      id: "l1",
      title: "Lakeside Home",
      price: "300000",
      address: "1 Lake Rd, Austin, TX",
      cover: "https://cdn/u/l1/a.jpg",
      updatedAt: "2026-10-16T10:00:00Z",
    });
  });

  it("falls back for untitled listings and listings without photos", () => {
    const summary = rowToSummary({ ...row, title: "", images: [] }, urlFor);
    expect(summary.title).toBe("Untitled listing");
    expect(summary.cover).toBe("");
  });
});

describe("profile mapping", () => {
  it("round-trips agent details and asset paths", () => {
    const row = profileToRow(profile, {
      logo: "u/profile/logo.png",
      photo: "u/profile/photo.jpg",
      qr: null,
    });
    expect(row).toMatchObject({
      agent_name: "Sokha Chan",
      company_name: "Angkor Homes",
      logo_path: "u/profile/logo.png",
      qr_path: null,
    });
    const back = rowToProfile(row, urlFor);
    expect(back.agentName).toBe("Sokha Chan");
    expect(back.agentCompanyLogo?.preview).toBe(
      "https://cdn/u/profile/logo.png"
    );
    expect(back.agentQrCode).toBeNull();
  });
});

describe("applyProfileToForm", () => {
  it("fills empty agent fields and assets from the profile", () => {
    const patch = applyProfileToForm(profile, emptyForm());
    expect(patch).toMatchObject({
      agentName: "Sokha Chan",
      agentCompanyName: "Angkor Homes",
      agentPhone: "012 345 678",
    });
    expect(patch.agentCompanyLogo?.path).toBe("u/profile/logo.png");
    expect((patch.agentPhoto as ListingImage).path).toBe("u/profile/photo.jpg");
    expect(patch).not.toHaveProperty("agentQrCode");
  });

  it("never overwrites what the agent already typed or uploaded", () => {
    const form = {
      ...emptyForm(),
      agentName: "Typed Name",
      agentCompanyLogo: { name: "mine", preview: "data:mine" },
    };
    const patch = applyProfileToForm(profile, form);
    expect(patch).not.toHaveProperty("agentName");
    expect(patch).not.toHaveProperty("agentCompanyLogo");
    expect(patch.agentCompanyName).toBe("Angkor Homes");
  });

  it("treats whitespace-only fields as empty", () => {
    const patch = applyProfileToForm(profile, {
      ...emptyForm(),
      agentName: "   ",
    });
    expect(patch.agentName).toBe("Sokha Chan");
  });

  it("returns an empty patch when nothing is missing", () => {
    expect(applyProfileToForm(profile, validForm)).toEqual({});
  });
});
