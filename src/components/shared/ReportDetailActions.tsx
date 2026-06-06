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
import { createClaim, cancelClaim } from "@/lib/actions/claim.actions";
import FileUpload from "@/components/ui/FileUpload";

interface Props {
  report: {
    id: string;
    type: string;
    status: string;
    facility: { name: string; phone: string } | null;
  };
  isOwner: boolean;
  isAdmin: boolean;
  userId?: string;
  userRole?: string;
  hasClaim: boolean;
  claimUserId?: string;
  claimantName?: string;
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

export default function ReportDetailActions({
  report,
  isOwner,
  isAdmin,
  userId,
  userRole,
  hasClaim,
  claimUserId,
  claimantName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [takerName, setTakerName] = useState(claimantName ?? "");
  
  // Anonymous Taker state
  const [takerPhone, setTakerPhone] = useState("");
  const [takerIdCard, setTakerIdCard] = useState("");
  const [takerNotes, setTakerNotes] = useState("");
  const [takerPhotoFile, setTakerPhotoFile] = useState<File | null>(null);
  const [takerPhotoError, setTakerPhotoError] = useState("");

  // Claim state
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [claimNotes, setClaimNotes] = useState("");
  const [claimFileError, setClaimFileError] = useState("");

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
    const finalTakerName = hasClaim ? (claimantName ?? "") : takerName;
    if (report.type === "FOUND" && !finalTakerName.trim()) {
      addToast("Nama pengambil wajib diisi.", "error");
      return;
    }

    if (report.type === "FOUND" && !hasClaim) {
      if (!takerPhone.trim()) {
        addToast("Nomor HP pengambil wajib diisi.", "error");
        return;
      }
      if (!takerIdCard.trim()) {
        addToast("Nomor Identitas wajib diisi.", "error");
        return;
      }
      if (!takerPhotoFile) {
        setTakerPhotoError("Foto serah terima wajib diunggah.");
        addToast("Foto serah terima wajib diunggah.", "error");
        return;
      }
    }
    setTakerPhotoError("");

    startTransition(async () => {
      try {
        let finalTakerPhotoUrl = "";
        if (report.type === "FOUND" && !hasClaim && takerPhotoFile) {
          finalTakerPhotoUrl = await uploadImage(takerPhotoFile);
        }

        const result = await resolveReport(
          report.id,
          finalTakerName,
          report.type === "FOUND" && !hasClaim ? takerPhone : undefined,
          report.type === "FOUND" && !hasClaim ? takerIdCard : undefined,
          report.type === "FOUND" && !hasClaim ? finalTakerPhotoUrl : undefined,
          report.type === "FOUND" && !hasClaim ? takerNotes : undefined
        );

        if (result.success) {
          addToast(result.message, "success");
          setShowResolveConfirm(false);
          // Reset states
          setTakerPhone("");
          setTakerIdCard("");
          setTakerNotes("");
          setTakerPhotoFile(null);
          router.refresh();
        } else {
          addToast(result.message, "error");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal memproses penyelesaian laporan.";
        addToast(msg, "error");
      }
    });
  };

  const executeCreateClaim = () => {
    if (!claimFile) {
      setClaimFileError("Foto bukti wajib diunggah.");
      return;
    }
    setClaimFileError("");

    startTransition(async () => {
      try {
        const photoUrl = await uploadImage(claimFile);
        const result = await createClaim(report.id, photoUrl, claimNotes);
        if (result.success) {
          addToast(result.message, "success");
          setShowClaimModal(false);
          setClaimFile(null);
          setClaimNotes("");
          router.refresh();
        } else {
          addToast(result.message, "error");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal mengajukan klaim.";
        addToast(msg, "error");
      }
    });
  };

  const executeCancelClaim = () => {
    startTransition(async () => {
      const result = await cancelClaim(report.id);
      if (result.success) {
        addToast(result.message, "success");
        setShowCancelConfirm(false);
        router.refresh();
      } else {
        addToast(result.message, "error");
        setShowCancelConfirm(false);
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

      {/* Other user viewing a FOUND report — show contact + location + claim if logged in */}
      {report.type === "FOUND" && report.facility && report.status === "PUBLISHED" && !(isOwner || isAdmin) && (
        <StickyBar>
          {/* Claim Button: logged in, report not claimed, not admin */}
          {userId && !hasClaim && userRole !== "ADMIN" && (
            <Button
              variant="primary" size="full" className="rounded-full flex-1"
              icon={<CheckCircle size={15} />}
              onClick={() => setShowClaimModal(true)}
            >
              Klaim Barang
            </Button>
          )}

          {/* Cancel Claim Button: claimant, report claimed, not resolved */}
          {userId && hasClaim && userId === claimUserId && (
            <Button
              variant="destructive" size="full" className="rounded-full flex-1"
              icon={<AlertTriangle size={15} />}
              onClick={() => setShowCancelConfirm(true)}
            >
              Batalkan Klaim
            </Button>
          )}

          <a href={`tel:${report.facility.phone.replace(/\D/g, "")}`} className="flex-1">
            <Button
              variant={userId && (!hasClaim && userRole !== "ADMIN" || userId === claimUserId) ? "outline" : "primary"}
              size="full" className="rounded-full flex justify-center items-center" icon={<Phone size={15} />}
            >
              {userId && (!hasClaim && userRole !== "ADMIN" || userId === claimUserId) ? "Hubungi" : "Hubungi Fasilitas"}
            </Button>
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(report.facility.name + " ITS Surabaya")}`}
            target="_blank" rel="noopener noreferrer" className="flex-1"
          >
            <Button variant="secondary" size="full" className="rounded-full flex justify-center items-center" icon={<MapPin size={15} />}>
              Lokasi
            </Button>
          </a>
        </StickyBar>
      )}

      {/* Custom Confirm Modal (Delete) */}
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
          <div className={`bg-white rounded-2xl w-full ${report.type === "FOUND" && !hasClaim ? "max-w-md" : "max-w-sm"} overflow-hidden shadow-xl animate-in zoom-in-95 duration-200`}>
            <div className="p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
              <div className="flex flex-col items-center text-center gap-1">
                <CheckCircle size={28} className="text-teal-500 mb-1" />
                <h3 className="text-lg font-bold text-gray-900">Tandai Selesai?</h3>
                {report.type === "LOST" && (
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin laporan ini telah selesai? (Misalnya barang sudah ditemukan sendiri). Status laporan akan diubah dan tidak dapat dikembalikan.
                  </p>
                )}
                {report.type === "FOUND" && hasClaim && (
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin menyelesaikan laporan ini dan menyerahkan barang kepada pengklaim <strong>{claimantName}</strong>? Status laporan akan diubah menjadi selesai.
                  </p>
                )}
                {report.type === "FOUND" && !hasClaim && (
                  <p className="text-sm text-gray-500">
                    Silakan isi identitas pengambil barang (offline) di bawah untuk menyelesaikan laporan ini.
                  </p>
                )}
              </div>

              {report.type === "FOUND" && !hasClaim && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">Nama Lengkap</label>
                    <input
                      type="text"
                      value={takerName}
                      onChange={(e) => setTakerName(e.target.value)}
                      placeholder="Nama Lengkap Pengambil"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">Nomor HP</label>
                    <input
                      type="text"
                      value={takerPhone}
                      onChange={(e) => setTakerPhone(e.target.value)}
                      placeholder="Nomor HP Aktif"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">Nomor Identitas (NIK/NRP/KTM)</label>
                    <input
                      type="text"
                      value={takerIdCard}
                      onChange={(e) => setTakerIdCard(e.target.value)}
                      placeholder="Contoh: 5025211001"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <FileUpload
                    label="Foto Bukti"
                    onFileChange={setTakerPhotoFile}
                    error={takerPhotoError}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">Catatan (Opsional)</label>
                    <textarea
                      value={takerNotes}
                      onChange={(e) => setTakerNotes(e.target.value)}
                      placeholder="Catatan tambahan mengenai serah terima..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex border-t border-gray-100">
              <button
                onClick={() => {
                  setShowResolveConfirm(false);
                  setTakerPhone("");
                  setTakerIdCard("");
                  setTakerNotes("");
                  setTakerPhotoFile(null);
                  setTakerPhotoError("");
                }}
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

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col items-center text-center gap-1">
                <CheckCircle size={28} className="text-teal-500 mb-1" />
                <h3 className="text-lg font-bold text-gray-900">Klaim Barang</h3>
                <p className="text-xs text-gray-500">
                  Ajukan klaim kepemilikan barang ini. Pastikan Anda mengunggah bukti valid.
                </p>
              </div>

              <FileUpload
                label="Foto Bukti"
                onFileChange={setClaimFile}
                error={claimFileError}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-900">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="Masukkan deskripsi tambahan atau pesan khusus..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setClaimFile(null);
                  setClaimNotes("");
                  setClaimFileError("");
                }}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeCreateClaim}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-teal-600 hover:bg-teal-50 transition-colors"
              >
                {isPending ? "Memproses..." : "Ajukan Klaim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Claim Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Batalkan Klaim?</h3>
              <p className="text-sm text-gray-500">
                Apakah Anda yakin ingin membatalkan klaim untuk barang ini? Laporan ini akan terbuka kembali untuk diklaim oleh pengguna lain.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeCancelClaim}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                {isPending ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
