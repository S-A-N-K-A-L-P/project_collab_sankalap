"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

export interface ImageUploaderProps {
  /** Cloudinary folder (e.g. "sankalp/orgs/logos") */
  folder?:      string;
  /** Current value (URL) */
  value?:       string;
  /** Called when upload completes or URL is pasted */
  onUpload:     (url: string, publicId?: string) => void;
  /** Aspect ratio hint (e.g. "1/1" for square, "16/9" for banner) */
  aspectRatio?: string;
  /** Label shown in the drop zone */
  label?:       string;
  /** Max file size label for UI */
  maxSizeLabel?: string;
  className?:   string;
  disabled?:    boolean;
}

export default function ImageUploader({
  folder       = "sankalp/uploads/general",
  value,
  onUpload,
  aspectRatio  = "16/9",
  label        = "Upload Image",
  maxSizeLabel = "10 MB max",
  className    = "",
  disabled     = false,
}: ImageUploaderProps) {
  const inputRef       = useRef<HTMLInputElement>(null);
  const [tab, setTab]  = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);

  const { upload, uploading, progress, error, reset } = useCloudinaryUpload({
    folder,
    resourceType: "image",
    onSuccess: (result) => {
      onUpload(result.url, result.publicId);
    },
  });

  const handleFile = useCallback(
    (file: File) => { if (!disabled) upload(file); },
    [upload, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) handleFile(file);
    },
    [handleFile]
  );

  const handleUrlSubmit = useCallback(() => {
    const url = urlInput.trim();
    if (!url) return;
    onUpload(url);
    setUrlInput("");
  }, [urlInput, onUpload]);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 w-fit">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === t
                ? "bg-white/15 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {t === "upload" ? <Upload size={12} /> : <LinkIcon size={12} />}
            {t === "upload" ? "Upload" : "URL"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {/* Drop zone */}
            <div
              onClick={() => !disabled && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{ aspectRatio }}
              className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex items-center justify-center
                ${dragging
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {/* Preview */}
              {value && !uploading && (
                <img
                  src={value}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Overlay content */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity ${value && !uploading ? "opacity-0 hover:opacity-100 bg-black/60" : "opacity-100"}`}>
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin text-white" size={24} />
                    <div className="w-32 h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-400 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <p className="text-xs text-white/60">{progress}%</p>
                  </>
                ) : (
                  <>
                    {value ? (
                      <Check className="text-green-400" size={24} />
                    ) : (
                      <ImageIcon className="text-white/40" size={32} />
                    )}
                    <p className="text-xs text-white/60 text-center px-4">
                      {value ? "Click to replace" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-[10px] text-white/30">{maxSizeLabel} · JPEG, PNG, WebP</p>
                  </>
                )}
              </div>

              {/* Remove button */}
              {value && !uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); onUpload(""); reset(); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                disabled={disabled}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || disabled}
                className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                Use
              </button>
            </div>
            {value && (
              <div className="relative rounded-lg overflow-hidden border border-white/10" style={{ aspectRatio }}>
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { onUpload(""); reset(); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-red-500/80"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  );
}
