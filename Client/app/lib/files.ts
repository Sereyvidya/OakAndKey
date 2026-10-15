import type { ListingImage } from "./types";

/** Reads a File into the `{ preview, name }` shape the store keeps for images. */
export function fileToImage(file: File): Promise<ListingImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ preview: String(reader.result ?? ""), name: file.name });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
