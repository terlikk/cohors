import type { Metadata, Viewport } from "next";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Sidebar } from "@/components/Sidebar";
import { t } from "@/lib/i18n";
import {
  listAgents,
  listAwaitingTasks,
  listPendingOrders,
  monthTotalCostUsd,
} from "@/lib/repo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twój zespół agentów AI",
  description:
    "Open-source'owy system do zarządzania zespołem agentów AI: zatrudniasz, wydajesz polecenia, zatwierdzasz wyniki.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const agents = listAgents();
  const awaitingCount =
    listAwaitingTasks().length + listPendingOrders().length;
  const monthSpend = monthTotalCostUsd();

  return (
    <html lang="pl">
      <body className="antialiased">
        <AutoRefresh />
        <div className="flex min-h-dvh flex-col md:flex-row">
          <Sidebar
            agents={agents.map((a) => ({
              id: a.id,
              name: a.name,
              roleLabel: a.customRoleLabel ?? t.roles[a.role],
              status: a.status,
            }))}
            awaitingCount={awaitingCount}
            monthSpend={monthSpend}
          />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
