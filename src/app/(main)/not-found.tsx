"use client";

/**
 * src/app/(main)/not-found.tsx
 * Custom 404 Not Found page
 */
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-8">
      {/* 404 Header */}
      <div className="text-center flex flex-col items-center gap-6">
        <div className="text-6xl sm:text-8xl font-bold text-gray-200">404</div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Maaf, halaman yang Anda cari tidak ada atau telah dihapus.
          </p>
        </div>
      </div>

      {/* Illustration */}
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Search size={64} className="text-gray-300" strokeWidth={1.5} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-sm">
        <Link href="/" className="flex-1">
          <button className="w-full px-6 py-3 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
            <Home size={18} />
            Kembali ke Beranda
          </button>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex-1 px-6 py-3 rounded-full border border-gray-300 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
      </div>

      {/* Helpful Links */}
      <div className="mt-8 flex flex-col gap-2 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Navigasi Cepat</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/lost">
            <span className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Cari Laporan Kehilangan
            </span>
          </Link>
          <span className="hidden sm:inline text-gray-300">•</span>
          <Link href="/found">
            <span className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Cari Laporan Penemuan
            </span>
          </Link>
          <span className="hidden sm:inline text-gray-300">•</span>
          <Link href="/my-reports">
            <span className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Laporan Saya
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
