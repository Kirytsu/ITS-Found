/**
 * src/app/(main)/admin/verification/page.tsx
 * Verification hub with a two-queue segmented control:
 *   - "Perlu Verifikasi": new FOUND reports to verify/reject.
 *   - "Klaim Menunggu":   published FOUND reports with a pending claim to resolve.
 * (Full status browsing + edit for admins lives on /found and /lost.)
 */
import PageHeader from "@/components/ui/PageHeader";
import VerificationTabs from "@/components/shared/VerificationTabs";
import { getUnverifiedFoundReports, getClaimPendingReports } from "@/lib/actions/admin.actions";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionaries";

export default async function AdminVerificationPage() {
  const locale = await getLocale();
  const t = getTranslator(locale);
  const [unverified, claimPending] = await Promise.all([
    getUnverifiedFoundReports(),
    getClaimPendingReports(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("admin.verify.title")} />
      <VerificationTabs unverified={unverified} claimPending={claimPending} />
    </div>
  );
}
