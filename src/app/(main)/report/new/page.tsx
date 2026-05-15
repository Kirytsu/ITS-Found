/**
 * src/app/(main)/report/new/page.tsx
 */
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ReportFormLayout from "@/components/shared/ReportFormLayout";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getSession } from "@/lib/auth";

interface SearchParams { type?: string; }

export default async function NewReportPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getSession();
  if (!session) redirect("/login?from=/report/new");

  const params = await searchParams;
  const type = params.type === "found" ? "found" : "lost";
  const [areas, categories] = await Promise.all([getAllAreas(), getAllCategories()]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={type === "lost" ? "Lapor Kehilangan" : "Lapor Penemuan"} />
      <ReportFormLayout type={type} areas={areas} categories={categories} />
    </div>
  );
}
