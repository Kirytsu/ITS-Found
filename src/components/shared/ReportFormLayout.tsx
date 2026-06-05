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
import Textarea from "@/components/ui/Textarea";
import DatePicker from "@/components/ui/DatePicker";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { getFacilitiesByArea } from "@/lib/actions/area.actions";
import { createReport, updateReport } from "@/lib/actions/report.actions";
import type { SelectOption, CreateReportInput, ReportWithRelations } from "@/types";

interface ReportFormLayoutProps {
  type: "lost" | "found";
  areas: SelectOption[];
  categories: SelectOption[];
  initialData?: ReportWithRelations;
}

/** Upload file to /api/upload — returns URL or throws */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Upload gagal.");
  }
  const { url } = await res.json();
  return url as string;
}

export default function ReportFormLayout({ type, areas, categories, initialData }: ReportFormLayoutProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toasts, addToast, dismiss } = useToast();
  const isEdit = !!initialData;
  const typeLabel = type === "lost" ? "kehilangan" : "penemuan";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [areaId, setAreaId] = useState(initialData?.areaId ?? "");
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      try {
        // 1. Upload image if selected
        let imageUrl: string | undefined = initialData?.imageUrl ?? undefined;
        if (selectedFile) {
          try {
            imageUrl = await uploadImage(selectedFile);
          } catch (uploadErr: unknown) {
            const msg = uploadErr instanceof Error ? uploadErr.message : "Upload gambar gagal.";
            addToast(msg, "error");
            return;
          }
        }

        // 2. Build payload
        const payload: CreateReportInput = {
          title, type: type === "lost" ? "LOST" : "FOUND",
          categoryId, areaId,
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
          setTimeout(() => {
            router.push(isEdit ? `/report/${initialData!.id}` : (type === "lost" ? "/lost" : "/found"));
            router.refresh();
          }, 1200);
        } else {
          addToast(result.message, "error");
          if (result.errors) setErrors(result.errors);
        }
      } catch {
        addToast("Terjadi kesalahan. Coba lagi.", "error");
      }
    });
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <form id="report-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-28">
        <Input
          label="Nama Barang" name="title" required
          placeholder={`Nama barang yang ${typeLabel}`}
          value={title} onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Combobox
            label="Area" options={areas} value={areaId}
            onChange={handleAreaChange} placeholder="Pilih Area" required
          />
          <Select
            label="Kategori" name="categoryId" options={categories}
            placeholder="Pilih Jenis" required
            value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            error={errors.categoryId}
          />
        </div>

        {type === "found" && (
          <Select
            label="Fasilitas Penitipan" name="facilityId" options={facilityOptions}
            placeholder={areaId ? "Pilih Fasilitas" : "Pilih area terlebih dahulu"}
            required value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            disabled={!areaId || facilityOptions.length === 0}
            helperText="Fasilitas tempat barang dititipkan"
            error={errors.facilityId}
          />
        )}

        <Textarea
          label="Deskripsi" name="description" required rows={4}
          placeholder={`Deskripsi barang yang ${typeLabel} secara lengkap`}
          helperText={`Masukkan deskripsi barang yang ${typeLabel} selengkapnya`}
          value={description} onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <DatePicker
          label="Tanggal Kejadian" name="incidentDate" required
          helperText={`Perkiraan tanggal ${typeLabel}`}
          value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)}
          error={errors.incidentDate}
        />

        <Input
          label="Lokasi Kejadian" name="locationDetail" required
          placeholder="Contoh: Lab 301, Koridor Lantai 2"
          helperText={`Perkiraan lokasi ${typeLabel}`}
          value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
          error={errors.locationDetail}
        />

        <FileUpload
          label="Foto Barang"
          helperText="Foto akan membantu identifikasi barang (opsional)"
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
            Batal
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
            {isEdit ? "Simpan Perubahan" : "Laporkan"}
          </Button>
        </div>
      </div>
    </>
  );
}
