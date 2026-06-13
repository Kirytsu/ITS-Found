/**
 * src/components/ui/BrandMark.tsx
 * The ITS Found logo lockup: navy-gradient glyph + Fraunces wordmark.
 * Single source of truth for brand identity across navbar + auth.
 */
import { PackageSearch } from "lucide-react";
import { clsx } from "clsx";

type Size = "sm" | "md" | "lg";

const boxBySize: Record<Size, string> = {
  sm: "w-7 h-7 rounded-lg",
  md: "w-8 h-8 rounded-xl",
  lg: "w-11 h-11 rounded-2xl",
};
const iconBySize: Record<Size, number> = { sm: 15, md: 18, lg: 24 };
const textBySize: Record<Size, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

interface BrandMarkProps {
  size?: Size;
  /** Hide the wordmark, show only the glyph */
  glyphOnly?: boolean;
  className?: string;
}

export default function BrandMark({ size = "md", glyphOnly = false, className }: BrandMarkProps) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5 select-none", className)}>
      <span
        className={clsx(
          "bg-brand-600 text-white flex items-center justify-center flex-shrink-0",
          "shadow-sm",
          boxBySize[size]
        )}
      >
        <PackageSearch size={iconBySize[size]} strokeWidth={2.2} />
      </span>
      {!glyphOnly && (
        <span
          className={clsx(
            "font-display font-semibold tracking-tight leading-none text-gray-900",
            textBySize[size]
          )}
        >
          ITS <span className="text-brand-600">Found</span>
        </span>
      )}
    </span>
  );
}
