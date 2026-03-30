import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PrintFlow — Zarządzaj farmą drukarek 3D jak pro",
  description:
    "SaaS platforma do zarządzania farmą drukarek 3D. Od upload STL po wysyłkę. Auto-wycena, AI quality control, live monitoring.",
  keywords: [
    "druk 3D",
    "farma drukarek",
    "zarządzanie drukarkami",
    "3D printing",
    "SaaS",
    "auto-wycena",
    "PrintFlow",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
