import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gladius — twój zespół agentów AI",
  description:
    "Open-source'owy system do zarządzania zespołem agentów AI: zatrudniasz, wydajesz polecenia, zatwierdzasz wyniki.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
