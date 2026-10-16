import type { ListingImage } from "../types";

/** Size presets: photos fill the flyer, logos and avatars are small. */
export const PHOTO_MAX_EDGE = 1600;
export const AVATAR_MAX_EDGE = 512;
export const PHOTO_QUALITY = 0.85;

/**
 * Scales (w, h) down so the longest edge is at most `maxEdge`, keeping the
 * aspect ratio. Never scales up.
 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest === 0) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export interface ResizeOptions {
  maxEdge: number;
  /** Keep transparency (logos, QR codes) by encoding PNG instead of JPEG. */
  keepAlpha?: boolean;
  quality?: number;
}

/**
 * Reads an image File, shrinks it in the browser and returns it as a data URL.
 * Phone photos are 3-8 MB; this brings them to a few hundred KB so storage,
 * uploads and the AI request stay small. SVGs are passed through untouched.
 */
export async function resizeImageFile(
  file: File,
  { maxEdge, keepAlpha = false, quality = PHOTO_QUALITY }: ResizeOptions
): Promise<ListingImage> {
  if (file.type === "image/svg+xml") {
    return { name: file.name, preview: await readAsDataUrl(file) };
  }

  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");

    if (!keepAlpha) {
      // JPEG has no alpha: paint white so transparent PNGs don't turn black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const type = keepAlpha ? "image/png" : "image/jpeg";
    return {
      name: file.name,
      preview: canvas.toDataURL(type, quality),
    };
  } finally {
    bitmap.close();
  }
}

async function readAsDataUrl(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  // Chunked so large images don't overflow the argument limit of apply().
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${file.type || "application/octet-stream"};base64,${btoa(binary)}`;
}

/** Decodes a `data:` URL into a Blob (for uploading). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const match = dataUrl.match(/^data:([^;,]+)(;base64)?,([\s\S]*)$/);
  if (!match) throw new Error("Not a data URL");
  const [, mime = "application/octet-stream", base64, body = ""] = match;
  if (!base64) return new Blob([decodeURIComponent(body)], { type: mime });
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Returns a `data:` URL for an image source: data URLs pass through; remote
 * URLs (saved photos) are fetched. Needed because the AI request sends photos
 * inline as base64.
 */
export async function ensureDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const resp = await fetch(src);
  if (!resp.ok) throw new Error(`Could not load image (${resp.status})`);
  return readAsDataUrl(await resp.blob());
}
