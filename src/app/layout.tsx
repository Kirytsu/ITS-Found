/**
 * src/app/layout.tsx — Root layout
 */
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/components/providers/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "ITS Found",
  description:
    "Sistem pelaporan dan pencarian barang hilang & temuan di lingkungan kampus Institut Teknologi Sepuluh Nopember.",
  icons: { icon: "/favicon.ico" },
};
