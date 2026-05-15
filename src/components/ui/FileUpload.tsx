"use client";
/**
 * src/components/ui/FileUpload.tsx
 * Drag-and-drop file upload with image preview.
 * Calls onFileChange(file) when file is selected/cleared.
 */
import { useState, useRef, useCallback } from "react";
import { ImageIcon, X, Upload } from "lucide-react";
import { clsx } from "clsx";

interface FileUploadProps {
  label?: string;
  helperText?: string;
  error?: string;
  name?: string;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  /** Existing image URL (for edit mode) */
  currentImageUrl?: string;
}

export default function FileUpload({
  label,
  helperText,
  error,
  name,
  accept = "image/*",
  onFileChange,
  disabled,
  currentImageUrl,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setPreview(currentImageUrl ?? null);
        onFileChange?.(null);
        return;
      }
      // Show local preview immediately
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileChange?.(file);
    },
    [onFileChange, currentImageUrl]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0] ?? null;
    handleFile(file);
  };

  const handleClear = () => {
    handleFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-sm font-semibold text-gray-900">{label}</p>}
      {helperText && <p className="text-xs text-gray-400">{helperText}</p>}

      {preview ? (
        /* ── Preview ── */
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Hapus foto"
          >
            <X size={15} className="text-gray-600" />
          </button>
        </div>
      ) : (
        /* ── Drop Zone ── */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            isDragging
              ? "border-teal-400 bg-teal-50"
              : error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          )}
        >
          <Upload size={28} className="text-gray-400" strokeWidth={1.5} />
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            <span className="font-semibold text-gray-700">Klik untuk pilih foto</span>
            <br />
            <span className="text-xs">atau seret &amp; lepas di sini</span>
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, WebP — maks. 5MB</p>
        </div>
      )}

      {/* Hidden real input */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
