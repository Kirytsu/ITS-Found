/**
 * src/app/(auth)/layout.tsx
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ITS Found — Autentikasi",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ITS Found</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Penemuan Barang ITS</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
