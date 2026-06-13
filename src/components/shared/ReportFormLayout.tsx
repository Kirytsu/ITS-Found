"use client";
/**
 * src/components/shared/ReportFormLayout.tsx
 * Uploads image to /api/upload before calling createReport/updateReport.
 * Sticky bar: left-0 right-0 lg:left-64 (excludes desktop sidebar).
 */
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Combobox from "@/components/ui/Combobox";
import MultiCombobox from "@/components/ui/MultiCombobox";
import Textarea from "@/components/ui/Textarea";
import DatePicker from "@/components/ui/DatePicker";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { getFacilitiesByArea } from "@/lib/actions/area.actions";
import { createReport, updateReport } from "@/lib/actions/report.actions";
import { todayInputValue } from "@/lib/utils";
import { useT } from "@/components/shared/LanguageProvider";
import type { SelectOption, CreateReportInput, ReportWithRelations } from "@/types";

interface ReportFormLayoutProps {
  type: "lost" | "found";
  areas: SelectOption[];
  categories: SelectOption[];
  initialData?: ReportWithRelations;
}

/** Upload file to /api/upload — returns URL or throws */
async function uploadImage(file: File, uploadFailedMsg: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? uploadFailedMsg);
  }
  const { url } = await res.json();
  return url as string;
}

export default function ReportFormLayout({ type, areas, categories, initialData }: ReportFormLayoutProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toasts, addToast, dismiss } = useToast();
  const isEdit = !!initialData;
  const isLost = type === "lost";
  const t = useT();
  const typeWord = t(isLost ? "typeword.lost" : "typeword.found");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [areaId, setAreaId] = useState(initialData?.areaId ?? "");
  // LOST may span multiple areas. Seed from existing relation (edit) or primary area.
  // `areas` is an empty array (not undefined) for older records predating the M2M relation,
  // so fall back to `areaId` when the relation is empty too.
  const [areaIds, setAreaIds] = useState<string[]>(
    initialData?.areas && initialData.areas.length > 0
      ? initialData.areas.map((a) => a.id)
      : initialData?.areaId ? [initialData.areaId] : []
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [facilityId, setFacilityId] = useState(initialData?.facilityId ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [locationDetail, setLocationDetail] = useState(initialData?.locationDetail ?? "");
  const [incidentDate, setIncidentDate] = useState(
    initialData?.incidentDate
      ? new Date(initialData.incidentDate).toISOString().split("T")[0]
      : ""
  );
  const [facilityOptions, setFacilityOptions] = useState<SelectOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (type !== "found" || !areaId) return;

    let isActive = true;
    getFacilitiesByArea(areaId).then((options) => {
      if (isActive) setFacilityOptions(options);
    });

    return () => {
      isActive = false;
    };
  }, [areaId, type]);

  const handleAreaChange = (nextAreaId: string) => {
    setAreaId(nextAreaId);
    setFacilityId("");
    setFacilityOptions([]);
  };

  const todayStr = todayInputValue();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    // Date guard — required + never in the future (server re-validates authoritatively)
    if (!incidentDate) {
      setErrors({ incidentDate: t("form.err.dateRequired") });
      addToast(t("form.err.dateRequired"), "error");
      return;
    }
    if (incidentDate > todayStr) {
      setErrors({ incidentDate: t("form.err.dateFuture") });
      addToast(t("form.err.dateFuture"), "error");
      return;
    }

    // Area guard — LOST needs ≥1 area, FOUND needs the single area
    if (isLost ? areaIds.length === 0 : !areaId) {
      setErrors({ areaId: t("form.err.areaRequired") });
      addToast(t("form.err.areaRequired"), "error");
      return;
    }

    startTransition(async () => {
      try {
        // 1. Upload image if selected
        let imageUrl: string | undefined = initialData?.imageUrl ?? undefined;
        if (selectedFile) {
          try {
            imageUrl = await uploadImage(selectedFile, t("error.uploadFailed"));
          } catch (uploadErr: unknown) {
            const msg = uploadErr instanceof Error ? uploadErr.message : t("error.imageUploadFailed");
            addToast(msg, "error");
            return;
          }
        }

        // 2. Build payload — LOST: multi-area (primary = first); FOUND: single area
        const allAreaIds = isLost ? areaIds : areaId ? [areaId] : [];
        const primaryAreaId = isLost ? areaIds[0] ?? "" : areaId;
        const payload: CreateReportInput = {
          title, type: isLost ? "LOST" : "FOUND",
          categoryId,
          areaId: primaryAreaId,
          areaIds: allAreaIds,
          facilityId: facilityId || undefined,
          locationDetail, description,
          incidentDate: new Date(incidentDate),
          imageUrl,
        };

        // 3. Create or update
        const result = isEdit && initialData
          ? await updateReport(initialData.id, { ...payload })
          : await createReport(payload);

        if (result.success) {
          addToast(result.message, "success");
          const targetId = isEdit ? initialData!.id : (result.data?.reportId as string | undefined);
          setTimeout(() => {
            router.push(targetId ? `/report/${targetId}` : (type === "lost" ? "/lost" : "/found"));
            router.refresh();
          }, 1200);
        } else {
          addToast(result.message, "error");
          if (result.errors) setErrors(result.errors);
        }
      } catch {
        addToast(t("form.err.generic"), "error");
      }
    });
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <form id="report-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-28">
        <Input
          label={t("form.itemName")} name="title" required
          placeholder={t("form.itemName.ph", { type: typeWord })}
          value={title} onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        {isLost && (
          <MultiCombobox
            label={t("form.area")} options={areas} value={areaIds} onChange={setAreaIds}
            placeholder={t("form.area.multiPh")}
            helperText={t("form.area.multiHelp")}
            required error={errors.areaId}
          />
        )}
        <div className={`grid gap-4 ${isLost ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
          {!isLost && (
            <Combobox
              label={t("form.area")} options={areas} value={areaId}
              onChange={handleAreaChange} placeholder={t("form.area.ph")} required
              error={errors.areaId}
            />
          )}
          <Select
            label={t("form.category")} name="categoryId" options={categories}
            placeholder={t("form.category.ph")} required
            value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            error={errors.categoryId}
          />
        </div>

        {type === "found" && (
          <Select
            label={t("form.facility")} name="facilityId" options={facilityOptions}
            placeholder={areaId ? t("form.facility.ph") : t("form.facility.phNoArea")}
            required value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            disabled={!areaId || facilityOptions.length === 0}
            helperText={t("form.facility.help")}
            error={errors.facilityId}
          />
        )}

        <Textarea
          label={t("form.description")} name="description" required rows={4}
          placeholder={t("form.description.ph", { type: typeWord })}
          helperText={t("form.description.help", { type: typeWord })}
          value={description} onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <DatePicker
          label={t("form.date")} name="incidentDate" required
          max={todayStr}
          helperText={t("form.date.help", { type: typeWord })}
          value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)}
          error={errors.incidentDate}
        />

        <Input
          label={t("form.location")} name="locationDetail" required
          placeholder={t("form.location.ph")}
          helperText={t("form.location.help", { type: typeWord })}
          value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
          error={errors.locationDetail}
        />

        <FileUpload
          label={t("form.photo")}
          helperText={t("form.photo.help")}
          onFileChange={setSelectedFile}
          currentImageUrl={initialData?.imageUrl ?? undefined}
          error={errors.imageUrl}
        />
      </form>

      {/* ── Sticky bottom bar — lg:left-64 excludes sidebar ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            type="button" variant="outline" size="full" className="rounded-full"
            onClick={() => router.back()} disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button" variant="primary" size="full" className="rounded-full"
            loading={isPending}
            onClick={() =>
              document
                .getElementById("report-form")
                ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
            }
          >
            {isEdit ? t("form.submit.save") : t("form.submit.create")}
          </Button>
        </div>
      </div>
    </>
  );
}
