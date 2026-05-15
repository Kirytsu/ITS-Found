/**
 * src/app/(main)/report/[id]/edit/page.tsx
 */
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ReportFormLayout from "@/components/shared/ReportFormLayout";
import { getReportById } from "@/lib/actions/report.actions";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getSession } from "@/lib/auth";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?from=/report/${id}/edit`);

  const [report, areas, categories] = await Promise.all([
    getReportById(id),
    getAllAreas(),
    getAllCategories(),
  ]);

  if (!report) notFound();
  if (report.authorId !== session.userId && session.role !== "ADMIN") redirect(`/report/${id}`);
  if (report.status === "RESOLVED") redirect(`/report/${id}`);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Ubah Laporan" />
      <ReportFormLayout
        type={report.type === "LOST" ? "lost" : "found"}
        areas={areas}
        categories={categories}
        initialData={report}
      />
    </div>
  );
}
