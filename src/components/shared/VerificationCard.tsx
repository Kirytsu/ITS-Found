"use client";
/**
 * src/components/shared/VerificationCard.tsx
 * Card for admin verification queue — extracted from admin/verification/page.tsx
 */
import { CheckCircle, XCircle } from "lucide-react";
import ReportImage from "@/components/ui/ReportImage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDateShort } from "@/lib/utils";
import { useT } from "@/components/shared/LanguageProvider";
import type { ReportWithRelations } from "@/types";

interface VerificationCardProps {
  report: ReportWithRelations;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}

export default function VerificationCard({
  report, onVerify, onReject, isPending,
}: VerificationCardProps) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Image — full photo, never cropped */}
      <ReportImage src={report.imageUrl} alt={report.title} className="h-44" />

      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 truncate">{report.area.name}</span>
          <Badge variant="unverified" />
        </div>

        <h3 className="text-base font-bold text-gray-900 line-clamp-2 break-words">{report.title}</h3>

        <div className="flex flex-col gap-0.5 text-xs text-gray-500">
          <span>{t("verify.category")} <strong>{report.category.name}</strong></span>
          <span>{t("verify.reporter")} <strong>{report.author.name}</strong></span>
          <span>{t("verify.reportedAt")} {formatDateShort(report.createdAt)}</span>
          {report.facility && (
            <span className="text-brand-600 font-semibold mt-0.5">
              {t("verify.depositedAt")} {report.facility.name}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{report.description}</p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button
            variant="primary"
            size="full"
            className="rounded-full text-xs"
            icon={<CheckCircle size={14} />}
            loading={isPending}
            onClick={() => onVerify(report.id)}
          >
            {t("action.verify")}
          </Button>
          <Button
            variant="destructive"
            size="full"
            className="rounded-full text-xs"
            icon={<XCircle size={14} />}
            loading={isPending}
            onClick={() => onReject(report.id)}
          >
            {t("action.reject")}
          </Button>
        </div>
      </div>
    </div>
  );
}
