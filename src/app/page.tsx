import { Approvals } from "@/components/Approvals";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Journal } from "@/components/Journal";
import { OrderBox } from "@/components/OrderBox";
import { Team } from "@/components/Team";
import { isDemo } from "@/lib/db";
import { t } from "@/lib/i18n";
import {
  listAgents,
  listAwaitingTasks,
  listJournal,
  listPendingOrders,
  monthTotalCostUsd,
} from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const agents = listAgents();
  const journal = listJournal();
  const pendingOrders = listPendingOrders();
  const awaitingTasks = listAwaitingTasks();
  const monthSpend = monthTotalCostUsd();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <AutoRefresh />
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-white">
          ?
        </div>
        <div>
          <h1 className="font-display text-base font-semibold leading-tight text-ink">
            {t.brand.name}
          </h1>
          <p className="text-xs text-ink-muted">{t.brand.tagline}</p>
        </div>
        {monthSpend > 0 && (
          <div className="ml-auto text-right">
            <p className="font-mono text-sm text-ink">${monthSpend.toFixed(2)}</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-muted">
              {t.stats.monthSpend}
            </p>
          </div>
        )}
      </header>

      <p className="rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs text-ink-muted">
        {isDemo ? t.demoBanner : t.stageBanner}
      </p>

      <OrderBox />
      <Approvals
        awaitingTasks={awaitingTasks}
        pendingOrders={pendingOrders}
        agents={agents}
      />
      <Team agents={agents} />
      <Journal events={journal} agents={agents} />

      <footer className="mt-auto pt-4 text-center font-mono text-[11px] text-ink-muted/70">
        open source · MIT
      </footer>
    </div>
  );
}
