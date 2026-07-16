import { Approvals } from "@/components/Approvals";
import { Journal } from "@/components/Journal";
import { OrderBox } from "@/components/OrderBox";
import { Team } from "@/components/Team";
import { isDemo } from "@/lib/db";
import { t } from "@/lib/i18n";
import { listAgents, listJournal, listPendingOrders } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const agents = listAgents();
  const journal = listJournal();
  const pendingOrders = listPendingOrders();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-accent-2 to-accent font-display text-lg font-bold text-[#241900]">
          ?
        </div>
        <div>
          <h1 className="font-display text-base font-semibold leading-tight text-ink">
            {t.brand.name}
          </h1>
          <p className="text-xs text-ink-muted">{t.brand.tagline}</p>
        </div>
      </header>

      <p className="rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs text-ink-muted">
        {isDemo ? t.demoBanner : t.stageBanner}
      </p>

      <OrderBox />
      <Approvals approvals={[]} pendingOrders={pendingOrders} agents={agents} />
      <Team agents={agents} />
      <Journal events={journal} agents={agents} />

      <footer className="mt-auto pt-4 text-center font-mono text-[11px] text-ink-muted/70">
        open source · MIT
      </footer>
    </div>
  );
}
