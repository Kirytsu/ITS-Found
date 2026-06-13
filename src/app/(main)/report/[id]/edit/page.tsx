/**
 * src/app/(main)/report/[id]/edit/page.tsx
 */
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ReportFormLayout from "@/components/shared/ReportFormLayout";
import { getReportById } from "@/lib/actions/report.actions";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = rawId.trim();

  if (!id) notFound();

  const session = await getSession();
  if (!session) redirect(`/login?from=/report/${id}/edit`);

  const [report, areas, categories, t] = await Promise.all([
    getReportById(id),
    getAllAreas(),
    getAllCategories(),
    getT(),
  ]);

  if (!report) notFound();
  if (report.authorId !== session.userId && session.role !== "ADMIN") redirect(`/report/${id}`);
  if (report.status === "RESOLVED") redirect(`/report/${id}`);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("page.editReport.title")} />
      <ReportFormLayout
        type={report.type === "LOST" ? "lost" : "found"}
        areas={areas}
        categories={categories}
        initialData={report}
      />
    </div>
  );
}
