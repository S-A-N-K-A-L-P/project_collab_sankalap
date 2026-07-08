/**
 * Cloudinary upload helper
 * ─────────────────────────────────────────────────────────────────
 * Set these environment variables to enable file uploads:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 *
 * When not configured, the UI accepts external URLs only.
 * ─────────────────────────────────────────────────────────────────
 */

import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_ENABLED =
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name:  process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:     process.env.CLOUDINARY_API_KEY!,
    api_secret:  process.env.CLOUDINARY_API_SECRET!,
    secure:      true,
  });
}

export interface UploadResult {
  url:       string;
  publicId?: string;
  width?:    number;
  height?:   number;
  format?:   string;
  bytes?:    number;
}

export interface UploadOptions {
  folder?:        string;          // e.g. "sankalp/orgs/logos"
  resourceType?:  "image" | "video" | "raw" | "auto";
  maxBytes?:      number;          // throws if file exceeds this
  transformation?: object[];       // Cloudinary transformation array
  publicId?:      string;          // override the generated public_id
  overwrite?:     boolean;
}

/** Size limits */
export const LIMITS = {
  avatar:  2 * 1024 * 1024,    // 2 MB
  banner:  5 * 1024 * 1024,    // 5 MB
  gallery: 10 * 1024 * 1024,   // 10 MB
  video:   50 * 1024 * 1024,   // 50 MB
  general: 10 * 1024 * 1024,   // 10 MB
} as const;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
];

/**
 * Upload a file or pass an external URL through unchanged.
 * - If `input` is a string URL → returns it as-is (no upload).
 * - If `input` is a Buffer/base64 string starting with "data:" → uploads.
 * - Throws if Cloudinary is not configured and a real file is provided.
 */
export async function uploadFile(
  input: Buffer | string,
  options?: UploadOptions
): Promise<UploadResult> {
  // Pass-through for external URLs
  if (typeof input === "string" && !input.startsWith("data:")) {
    return { url: input.trim() };
  }

  if (!CLOUDINARY_ENABLED) {
    throw new Error(
      "File uploads are not configured. Please paste an external URL instead, or add Cloudinary credentials to your environment."
    );
  }

  const {
    folder       = "sankalp/uploads/general",
    resourceType = "image",
    maxBytes,
    transformation,
    publicId,
    overwrite    = true,
  } = options ?? {};

  // Check size (buffer only — data URIs are checked by the API route)
  if (maxBytes && Buffer.isBuffer(input) && input.length > maxBytes) {
    throw new Error(`File exceeds the ${(maxBytes / 1024 / 1024).toFixed(1)} MB limit.`);
  }

  const uploadInput = Buffer.isBuffer(input)
    ? `data:application/octet-stream;base64,${input.toString("base64")}`
    : input;

  const result = await cloudinary.uploader.upload(uploadInput, {
    folder,
    resource_type: resourceType,
    transformation: transformation ?? [
      { quality: "auto", fetch_format: "auto" },
    ],
    public_id: publicId,
    overwrite,
  });

  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
    format:   result.format,
    bytes:    result.bytes,
  };
}

/**
 * Upload a file from a FormData / Web API File object (for use in API routes).
 * Reads the File as a Buffer and delegates to uploadFile().
 */
export async function uploadWebFile(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  if (!CLOUDINARY_ENABLED) {
    throw new Error(
      "File uploads are not configured. Please paste an external URL instead."
    );
  }
  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return uploadFile(buffer, options);
}

/** Delete a previously uploaded file by Cloudinary publicId. */
export async function deleteFile(publicId: string): Promise<void> {
  if (!CLOUDINARY_ENABLED || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate a signed upload signature for client-side direct-to-Cloudinary uploads.
 * Returns the params needed to call the Cloudinary upload API directly from the browser.
 */
export function generateUploadSignature(params: {
  folder:    string;
  timestamp: number;
}): { signature: string; timestamp: number; cloudName: string; apiKey: string } {
  if (!CLOUDINARY_ENABLED) {
    throw new Error("Cloudinary is not configured.");
  }
  const signature = cloudinary.utils.api_sign_request(
    { folder: params.folder, timestamp: params.timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    signature,
    timestamp:  params.timestamp,
    cloudName:  process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey:     process.env.CLOUDINARY_API_KEY!,
  };
}

/** Returns true once Cloudinary is wired up. Used by UI to enable file pickers. */
export function isUploadEnabled(): boolean {
  return CLOUDINARY_ENABLED;
}
