import type { Metadata, Viewport } from "next";
import {
  Instrument_Sans,
  JetBrains_Mono,
  Unbounded,
} from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  variable: "--font-unbounded",
  weight: ["400", "600", "700"],
});

const instrument = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Twój zespół agentów AI",
  description:
    "Open-source'owy system do prowadzenia zespołu agentów AI jak małej firmy.",
};

export const viewport: Viewport = {
  themeColor: "#161006",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body
        className={`${unbounded.variable} ${instrument.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
