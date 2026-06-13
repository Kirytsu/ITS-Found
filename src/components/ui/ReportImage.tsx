/**
 * src/components/ui/ReportImage.tsx
 * Report imagery, rendered whole (never cropped): a blurred cover of the same
 * photo fills the frame as a backdrop, with the full image contained on top.
 * Any aspect ratio sits cleanly inside a fixed card box.
 */
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { clsx } from "clsx";

interface ReportImageProps {
  src?: string | null;
  alt: string;
  /** Tailwind height (and any extra) for the frame, e.g. "h-44" */
  className?: string;
  /** Lucide icon size for the empty state */
  emptySize?: number;
}

export default function ReportImage({ src, alt, className, emptySize = 38 }: ReportImageProps) {
  return (
    <div className={clsx("relative w-full overflow-hidden bg-gray-100", className)}>
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
          />
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, 420px"
            className="relative object-contain"
          />
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 text-gray-300">
          <ImageIcon size={emptySize} />
          <span className="text-[11px]">Tidak ada foto</span>
        </div>
      )}
    </div>
  );
}
