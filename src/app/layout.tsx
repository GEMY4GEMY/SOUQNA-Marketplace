import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOUQNA | سوقنا",
  description: "سوقك المحلي للبيع والشراء والخدمات في الفيوم",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
