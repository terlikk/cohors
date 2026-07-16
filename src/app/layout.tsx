import type { Metadata, Viewport } from "next";
import { Unbounded, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apiary — twoja pasieka agentów AI",
  description:
    "Zarządzaj zespołem agentów AI jak pszczelarz robotnicami: zatrudniasz, wydajesz rozkazy po ludzku, zatwierdzasz wyniki.",
};

export const viewport: Viewport = {
  themeColor: "#161006",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={`${unbounded.variable} ${instrument.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
