/**
 * src/app/(auth)/layout.tsx
 */
import type { Metadata } from "next";
import BrandMark from "@/components/ui/BrandMark";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "ITS Found — Autentikasi",
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 overflow-hidden">
      {/* Ambient ITS-navy glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[40rem] rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8 gap-3">
          <BrandMark size="lg" />
          <p className="text-sm text-gray-500">{t("auth.tagline")}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-900/5 border border-gray-100 p-6 animate-fade-rise">
          {children}
        </div>
      </div>
    </div>
  );
}
