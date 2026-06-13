/**
 * src/app/layout.tsx — Root layout
 */
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "@/app/components/providers/Providers";
import { getLocale } from "@/lib/i18n/server";

// UI voice — designed in Indonesia (Tokotype), a deliberate local choice for an ITS app.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

// Display/heritage accent for the wordmark and hero — optical serif (variable font).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

// Runs before paint — applies the stored theme so there's no light flash on load.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={`${jakarta.variable} ${fraunces.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "ITS Found",
  description:
    "Sistem pelaporan dan pencarian barang hilang & temuan di lingkungan kampus Institut Teknologi Sepuluh Nopember.",
  // Icon resolved automatically from src/app/icon.svg (branded PackageSearch glyph).
};
