import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AntiNanti - AI Time Management & Social Penalty Ecosystem",
  description: "Aplikasi manajemen waktu proaktif berbasis AI untuk memecah tugas besar menjadi micro-tasks dan memicu sanksi sosial email partner jika tenggat waktu dilanggar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
