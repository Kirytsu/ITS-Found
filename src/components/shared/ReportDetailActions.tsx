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
import { Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { useT } from "@/components/shared/LanguageProvider";
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
  const t = useT();

  const executeDelete = () => {
    startTransition(async () => {
      const result = await deleteReport(report.id);
      if (result.success) {
        // Navigate away BEFORE the deleted detail page can re-render (avoids a 404 flash).
        // router.replace is a client transition — the detail route unmounts immediately.
        setShowConfirm(false);
        router.replace("/my-reports?notif=1");
      } else {
        addToast(result.message, "error");
        setShowConfirm(false);
      }
    });
  };

  const executeResolve = () => {
    const finalTakerName = hasClaim ? (claimantName ?? "") : takerName;
    if (report.type === "FOUND" && !finalTakerName.trim()) {
      addToast(t("error.takerNameRequired"), "error");
      return;
    }

    if (report.type === "FOUND" && !hasClaim) {
      if (!takerPhone.trim()) {
        addToast(t("error.takerPhoneRequired"), "error");
        return;
      }
      if (!takerIdCard.trim()) {
        addToast(t("error.takerIdRequired"), "error");
        return;
      }
      if (!takerPhotoFile) {
        setTakerPhotoError(t("error.takerPhotoRequired"));
        addToast(t("error.takerPhotoRequired"), "error");
        return;
      }
    }
    setTakerPhotoError("");

    startTransition(async () => {
      try {
        let finalTakerPhotoUrl = "";
        if (report.type === "FOUND" && !hasClaim && takerPhotoFile) {
          finalTakerPhotoUrl = await uploadImage(takerPhotoFile, t("error.uploadFailed"));
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
        const msg = err instanceof Error ? err.message : t("error.resolveFailed");
        addToast(msg, "error");
      }
    });
  };

  const executeCreateClaim = () => {
    if (!claimFile) {
      setClaimFileError(t("error.claimProofRequired"));
      return;
    }
    setClaimFileError("");

    startTransition(async () => {
      try {
        const photoUrl = await uploadImage(claimFile, t("error.uploadFailed"));
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
        const msg = err instanceof Error ? err.message : t("error.claimFailed");
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
              {t("action.resolve")}
            </Button>
          )}
          <Link href={`/report/${report.id}/edit`} className="flex-1">
            <Button variant="outline" size="full" className="rounded-full flex justify-center items-center" icon={<Pencil size={15} />}>
              {t("action.edit")}
            </Button>
          </Link>
          {/* Verified FOUND reports can no longer be deleted by the owner (LOST is exempt) */}
          {!(report.type === "FOUND" && report.status === "PUBLISHED" && !isAdmin) && (
            <Button
              variant="destructive" size="full" className="rounded-full flex-1"
              icon={<Trash2 size={15} />} disabled={isPending} onClick={() => setShowConfirm(true)}
            >
              {t("action.delete")}
            </Button>
          )}
        </StickyBar>
      )}

      {/* Other user viewing a published FOUND report — claim / cancel-claim only.
          Facility contact + address stay in the detail meta card. Bar renders only
          when the viewer actually has an action (never an empty bar). */}
      {report.type === "FOUND" && report.status === "PUBLISHED" && !(isOwner || isAdmin) &&
        ((!!userId && !hasClaim && userRole !== "ADMIN") || (!!userId && hasClaim && userId === claimUserId)) && (
        <StickyBar>
          {/* Claim Button: logged in, report not claimed, not admin */}
          {userId && !hasClaim && userRole !== "ADMIN" && (
            <Button
              variant="primary" size="full" className="rounded-full flex-1"
              icon={<CheckCircle size={15} />}
              onClick={() => setShowClaimModal(true)}
            >
              {t("action.claim")}
            </Button>
          )}

          {/* Cancel Claim Button: claimant, report claimed, not resolved */}
          {userId && hasClaim && userId === claimUserId && (
            <Button
              variant="destructive" size="full" className="rounded-full flex-1"
              icon={<AlertTriangle size={15} />}
              onClick={() => setShowCancelConfirm(true)}
            >
              {t("action.cancelClaim")}
            </Button>
          )}
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
              <h3 className="text-lg font-bold text-gray-900">{t("modal.delete.title")}</h3>
              <p className="text-sm text-gray-500">
                {t("modal.delete.body")}
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeDelete}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                {isPending ? t("action.deleting") : t("modal.delete.confirm")}
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
                <CheckCircle size={28} className="text-brand-500 mb-1" />
                <h3 className="text-lg font-bold text-gray-900">{t("modal.resolve.title")}</h3>
                {report.type === "LOST" && (
                  <p className="text-sm text-gray-500">
                    {t("modal.resolve.bodyLost")}
                  </p>
                )}
                {report.type === "FOUND" && hasClaim && (
                  <p className="text-sm text-gray-500">
                    {t("modal.resolve.bodyFoundClaim", { name: claimantName ?? "" })}
                  </p>
                )}
                {report.type === "FOUND" && !hasClaim && (
                  <p className="text-sm text-gray-500">
                    {t("modal.resolve.bodyFoundOffline")}
                  </p>
                )}
              </div>

              {report.type === "FOUND" && !hasClaim && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">{t("form.takerName.label")}</label>
                    <input
                      type="text"
                      value={takerName}
                      onChange={(e) => setTakerName(e.target.value)}
                      placeholder={t("form.takerName.placeholder")}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">{t("form.takerPhone.label")}</label>
                    <input
                      type="text"
                      value={takerPhone}
                      onChange={(e) => setTakerPhone(e.target.value)}
                      placeholder={t("form.takerPhone.placeholder")}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">{t("form.takerIdCard.label")}</label>
                    <input
                      type="text"
                      value={takerIdCard}
                      onChange={(e) => setTakerIdCard(e.target.value)}
                      placeholder={t("form.takerIdCard.placeholder")}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <FileUpload
                    label={t("modal.photoProof")}
                    onFileChange={setTakerPhotoFile}
                    error={takerPhotoError}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-900">{t("form.takerNotes.label")}</label>
                    <textarea
                      value={takerNotes}
                      onChange={(e) => setTakerNotes(e.target.value)}
                      placeholder={t("form.takerNotes.placeholder")}
                      rows={2}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400"
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
                {t("common.cancel")}
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeResolve}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors"
              >
                {isPending ? t("common.processing") : t("modal.resolve.confirm")}
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
                <CheckCircle size={28} className="text-brand-500 mb-1" />
                <h3 className="text-lg font-bold text-gray-900">{t("modal.claim.title")}</h3>
                <p className="text-xs text-gray-500">
                  {t("modal.claim.body")}
                </p>
              </div>

              <FileUpload
                label={t("modal.photoProof")}
                onFileChange={setClaimFile}
                error={claimFileError}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-900">{t("modal.notesOptional")}</label>
                <textarea
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder={t("form.claimNotes.placeholder")}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400"
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
                {t("common.cancel")}
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeCreateClaim}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors"
              >
                {isPending ? t("common.processing") : t("modal.claim.submit")}
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
              <h3 className="text-lg font-bold text-gray-900">{t("modal.cancelClaim.title")}</h3>
              <p className="text-sm text-gray-500">
                {t("modal.cancelClaim.body")}
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <div className="w-[1px] bg-gray-100" />
              <button
                onClick={executeCancelClaim}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                {isPending ? t("action.cancelling") : t("modal.cancelClaim.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
