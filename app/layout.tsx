import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";

const font = Google_Sans_Flex({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neracca | Sistem Akuntansi untuk Bisnis",
  description:
    "Kelola informasi keuangan secara lengkap dalam satu sistem, mulai dari pencatatan transaksi hingga penyusunan laporan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={font.className}>{children}</body>
    </html>
  );
}