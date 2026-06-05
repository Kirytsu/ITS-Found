/**
 * src/app/layout.tsx — Root layout
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITS Found",
  description:
    "Sistem pelaporan dan pencarian barang hilang & temuan di lingkungan kampus Institut Teknologi Sepuluh Nopember.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
