import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prediksi Harga Beras",
  description: "Created By Kelompok 3 Kelas C",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
