"use client";
/**
 * src/components/shared/ReportDetailActions.tsx
 *
 * Sticky bottom action bar.
 * IMPORTANT: Must use `left-0 right-0 lg:left-64` so it doesn't overlap the desktop sidebar.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, MapPin, Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { deleteReport, resolveReport } from "@/lib/actions/report.actions";

interface Props {
  report: {
    id: string;
    type: string;
    status: string;
    facility: { name: string; phone: string } | null;
  };
  isOwner: boolean;
  isAdmin: boolean;
}

/** Sticky bar wrapper — excludes desktop sidebar */
function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex gap-3 px-4 py-3 max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export default function ReportDetailActions({ report, isOwner, isAdmin }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [takerName, setTakerName] = useState("");
  const { toasts, addToast, dismiss } = useToast();

  const executeDelete = () => {
    startTransition(async () => {
      const result = await deleteReport(report.id);
      if (result.success) {
        window.location.href = "/my-reports?deleted=1";
      } else {
        addToast(result.message, "error");
        setShowConfirm(false);
      }
    });
  };

  const executeResolve = () => {
    if (report.type === "FOUND" && !takerName.trim()) {
      addToast("Nama pengambil wajib diisi.", "error");
      return;
    }
    startTransition(async () => {
      const result = await resolveReport(report.id, takerName);
      if (result.success) {
        addToast(result.message, "success");
        setShowResolveConfirm(false);
        router.refresh();
      } else {
        addToast(result.message, "error");
        setShowResolveConfirm(false);
      }
    });
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {(isOwner || isAdmin) && report.status !== "RESOLVED" && (
        <StickyBar>
          {((report.type === "LOST" && isOwner) || (report.type === "FOUND" && isAdmin)) && (
            <Button
              variant="primary" size="full" className="rounded-full flex-1"
              icon={<CheckCircle size={15} />} disabled={isPending} onClick={() => setShowResolveConfirm(true)}
            >
              Selesai
            </Button>
          )}
          <Link href={`/report/${report.id}/edit`} className="flex-1">
            <Button variant="outline" size="full" className="rounded-full flex justify-center items-center" icon={<Pencil size={15} />}>
              Ubah
            </Button>
          </Link>
          <Button
            variant="destructive" size="full" className="rounded-full flex-1"
            icon={<Trash2 size={15} />} disabled={isPending} onClick={() => setShowConfirm(true)}
          >
            Hapus
          </Button>
        </StickyBar>
      )}

      {/* Other user viewing a FOUND report — show contact + location */}
      {report.type === "FOUND" && report.facility && report.status === "PUBLISHED" && !(isOwner || isAdmin) && (
        <StickyBar>
          <a href={`tel:${report.facility.phone.replace(/\D/g, "")}`} className="flex-1">
            <Button variant="primary" size="full" className="rounded-full" icon={<Phone size={15} />}>
              Hubungi Fasilitas
            </Button>
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(report.facility.name + " ITS Surabaya")}`}
            target="_blank" rel="noopener noreferrer" className="flex-1"
          >
            <Button variant="secondary" size="full" className="rounded-full" icon={<MapPin size={15} />}>
              Lokasi
            </Button>
          </a>
        </StickyBar>
      )}

      {/* Custom Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Laporan?</h3>
              <p className="text-sm text-gray-500">
                Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara permanen dari sistem.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeDelete}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Resolve Modal */}
      {showResolveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mb-2">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tandai Selesai?</h3>
              {report.type === "LOST" ? (
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin laporan ini telah selesai? (Misalnya barang sudah ditemukan sendiri). Status laporan akan diubah dan tidak dapat dikembalikan.
                </p>
              ) : (
                <div className="flex flex-col gap-2 w-full text-left mt-2">
                  <p className="text-sm text-gray-500 text-center mb-1">
                    Silakan masukkan nama pihak pengambil untuk menyelesaikan laporan penemuan ini.
                  </p>
                  <input
                    type="text"
                    value={takerName}
                    onChange={(e) => setTakerName(e.target.value)}
                    placeholder="Nama Pengambil"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowResolveConfirm(false)}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeResolve}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-teal-600 hover:bg-teal-50 transition-colors"
              >
                {isPending ? "Memproses..." : "Ya, Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
