import {
  AVATAR_MAX_EDGE,
  PHOTO_MAX_EDGE,
  resizeImageFile,
} from "./images/resize";
import type { ListingImage } from "./types";

/** A property photo, shrunk for the flyer (1600px, JPEG). */
export const photoFromFile = (file: File): Promise<ListingImage> =>
  resizeImageFile(file, { maxEdge: PHOTO_MAX_EDGE });

/** An agent headshot (512px, JPEG). */
export const avatarFromFile = (file: File): Promise<ListingImage> =>
  resizeImageFile(file, { maxEdge: AVATAR_MAX_EDGE });

/** A logo or QR code (512px, PNG so transparency survives). */
export const logoFromFile = (file: File): Promise<ListingImage> =>
  resizeImageFile(file, { maxEdge: AVATAR_MAX_EDGE, keepAlpha: true });
