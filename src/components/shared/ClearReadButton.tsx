"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { clearReadNotifications } from "@/lib/actions/notification.actions";
import { useT } from "@/components/shared/LanguageProvider";

export default function ClearReadButton({ userId }: { userId: string }) {
  const router = useRouter();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      await clearReadNotifications(userId);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/40 px-4 py-2 rounded-xl transition-colors"
      >
        {t("notif.clearRead")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* dark:bg-gray-100 = #1a1a1a (elevated surface) */}
          <div className="bg-white dark:bg-gray-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900">{t("notif.clearRead.confirmTitle")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("notif.clearRead.confirmBody")}</p>
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-200/40">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200/40 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <div className="w-px bg-gray-100 dark:bg-gray-200/40" />
              <button
                onClick={confirm}
                disabled={isPending}
                className="flex-1 py-4 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
              >
                {isPending ? t("common.processing") : t("notif.clearRead.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
