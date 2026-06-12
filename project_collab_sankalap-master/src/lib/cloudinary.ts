/**
 * Cloudinary upload stub
 * ─────────────────────────────────────────────────────────────────
 * Safe no-op implementation. The app builds + deploys without any
 * Cloudinary configuration.
 *
 * To wire up a real Cloudinary later:
 *   1. `npm i cloudinary`
 *   2. Add `CLOUDINARY_URL` (or CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET) to env
 *   3. Set CLOUDINARY_ENABLED below to `true`
 *   4. Replace the body of `uploadFile()` with a real upload call
 *      using `cloudinary.v2.uploader.upload()`
 *
 * Until then, the UI accepts external URLs only — `isUploadEnabled()`
 * returns false so file-input dialogs degrade gracefully.
 * ─────────────────────────────────────────────────────────────────
 */

export const CLOUDINARY_ENABLED = false;

export interface UploadResult {
  url: string;
  publicId?: string;
}

export interface UploadOptions {
  folder?: string;
  resourceType?: "image" | "video" | "raw";
  maxBytes?: number;
}

/**
 * Upload a file or pass an external URL through unchanged.
 * - If `input` is a string URL, returns it as-is (no upload needed).
 * - If `input` is a `File` and Cloudinary is disabled, throws so the caller
 *   can show "use external URL instead" guidance.
 */
export async function uploadFile(
  input: File | string,
  _options?: UploadOptions
): Promise<UploadResult> {
  if (typeof input === "string") {
    return { url: input.trim() };
  }
  if (!CLOUDINARY_ENABLED) {
    throw new Error(
      "File uploads are not configured. Please paste an external URL instead."
    );
  }
  // TODO: real Cloudinary upload when enabled
  return { url: "" };
}

/** Returns true once Cloudinary is wired up. Used by UI to enable file pickers. */
export function isUploadEnabled(): boolean {
  return CLOUDINARY_ENABLED;
}

/** Delete a previously uploaded file by Cloudinary publicId. No-op when disabled. */
export async function deleteFile(_publicId: string): Promise<void> {
  if (!CLOUDINARY_ENABLED) return;
  // TODO: real Cloudinary delete when enabled
}
