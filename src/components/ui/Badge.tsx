/**
 * src/components/ui/Badge.tsx
 * Status badge — aligns 1:1 with ReportStatus enum + a "lost"/"found" type variant.
 */
import { clsx } from "clsx";
import { translate } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

type BadgeVariant = "active" | "unverified" | "resolved" | "rejected" | "lost" | "found" | "claimed";

interface BadgeProps {
  variant: BadgeVariant;
  label?: string; // override default label
  className?: string;
  locale?: Locale;
}

const variantConfig: Record<BadgeVariant, { classes: string; key: string }> = {
  active:     { classes: "bg-brand-500 text-white",  key: "status.active" },
  unverified: { classes: "bg-yellow-500 text-white", key: "status.unverified" },
  resolved:   { classes: "bg-gray-500 text-white",   key: "status.resolved" },
  rejected:   { classes: "bg-red-500 text-white",    key: "status.rejected" },
  lost:       { classes: "bg-orange-600 text-white", key: "type.lost" },
  found:      { classes: "bg-brand-500 text-white",  key: "type.found" },
  claimed:    { classes: "bg-amber-500 text-white",  key: "status.claimed" },
};

export default function Badge({ variant, label, className, locale = DEFAULT_LOCALE }: BadgeProps) {
  const { classes, key } = variantConfig[variant];
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        classes,
        className
      )}
    >
      {label ?? translate(locale, key)}
    </span>
  );
}
