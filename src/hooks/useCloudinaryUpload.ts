"use client";

import { useState, useCallback } from "react";

export interface UploadResult {
  url:       string;
  publicId?: string;
  width?:    number;
  height?:   number;
}

export interface UseCloudinaryUploadOptions {
  folder?:       string;
  resourceType?: "image" | "video" | "raw";
  onSuccess?:    (result: UploadResult) => void;
  onError?:      (error: string) => void;
}

export function useCloudinaryUpload(options: UseCloudinaryUploadOptions = {}) {
  const {
    folder       = "sankalp/uploads/general",
    resourceType = "image",
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState<string | null>(null);
  const [result,    setResult]    = useState<UploadResult | null>(null);

  const upload = useCallback(
    async (file: File | string): Promise<UploadResult | null> => {
      // If it's already a URL, just return it
      if (typeof file === "string") {
        const r: UploadResult = { url: file };
        setResult(r);
        onSuccess?.(r);
        return r;
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append("resourceType", resourceType);

        // Use XMLHttpRequest for progress tracking
        const result = await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload");

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              const body = JSON.parse(xhr.responseText || "{}");
              reject(new Error(body.message || "Upload failed"));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
          xhr.send(formData);
        });

        setResult(result);
        setProgress(100);
        onSuccess?.(result);
        return result;
      } catch (err: any) {
        const msg = err.message || "Upload failed";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [folder, resourceType, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { upload, uploading, progress, error, result, reset };
}
