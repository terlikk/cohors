import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "Cohors — twój zespół agentów AI",
  description:
    "Open source. Działa lokalnie. Zatrudniasz agentów, wydajesz polecenia po polsku i zatwierdzasz wyniki.",
};

export default function HomePage() {
  return <Landing />;
}
