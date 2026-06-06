/**
 * src/components/ui/Badge.tsx
 * Status badge — aligns 1:1 with ReportStatus enum + a "lost"/"found" type variant.
 */
import { clsx } from "clsx";

type BadgeVariant = "active" | "unverified" | "resolved" | "rejected" | "lost" | "found" | "claimed";

interface BadgeProps {
  variant: BadgeVariant;
  label?: string; // override default label
  className?: string;
}

const variantConfig: Record<BadgeVariant, { classes: string; defaultLabel: string }> = {
  active:     { classes: "bg-teal-500 text-white",   defaultLabel: "Aktif" },
  unverified: { classes: "bg-yellow-500 text-white", defaultLabel: "Menunggu Verifikasi" },
  resolved:   { classes: "bg-gray-500 text-white",   defaultLabel: "Selesai" },
  rejected:   { classes: "bg-red-500 text-white",    defaultLabel: "Ditolak" },
  lost:       { classes: "bg-orange-500 text-white", defaultLabel: "Kehilangan" },
  found:      { classes: "bg-blue-500 text-white",   defaultLabel: "Penemuan" },
  claimed:    { classes: "bg-amber-500 text-white",  defaultLabel: "Sudah Diklaim" },
};

export default function Badge({ variant, label, className }: BadgeProps) {
  const { classes, defaultLabel } = variantConfig[variant];
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        classes,
        className
      )}
    >
      {label ?? defaultLabel}
    </span>
  );
}
