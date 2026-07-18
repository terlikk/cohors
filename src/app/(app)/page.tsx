import Link from "next/link";
import { Journal } from "@/components/Journal";
import { PageHead } from "@/components/PageHead";
import { t } from "@/lib/i18n";
import {
  listAgents,
  listAwaitingTasks,
  listJournal,
  listPendingOrders,
} from "@/lib/repo";
import { roleColor, statusColor, statusIsLive } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PulpitPage() {
  const agents = listAgents();
  const journal = listJournal(8);
  const pendingOrders = listPendingOrders();
  const awaitingTasks = listAwaitingTasks();

  return (
    <>
      <PageHead
        title={t.pages.pulpit.title}
        subtitle={t.pages.pulpit.subtitle}
        action={
          <Link
            href="/robota"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t.pages.pulpit.cta}
          </Link>
        }
      />

      {awaitingTasks.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-5 py-3.5">
          <span
            className="status-dot status-dot--live"
            style={{ color: "#ff9500" }}
          />
          <b className="text-sm text-ink">
            {t.pages.pulpit.awaiting(awaitingTasks.length)}
          </b>
          <Link
            href="/odbior"
            className="ml-auto rounded-full bg-panel-2 px-4 py-2 text-[13px] font-semibold text-ink transition hover:brightness-95"
          >
            {t.pages.pulpit.goto}
          </Link>
        </div>
      )}

      {pendingOrders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-panel px-5 py-3.5 transition hover:border-accent"
        >
          <span
            className="status-dot status-dot--live"
            style={{ color: "#ff9500" }}
          />
          <span className="min-w-0 flex-1">
            <b className="block text-sm text-ink">{t.plan.awaitingCardTitle}</b>
            <span className="block truncate text-[13px] text-ink-muted">
              „{order.text}” · {t.plan.taskCount(order.taskCount)}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white">
            {t.plan.awaitingCardCta}
          </span>
        </Link>
      ))}

      <div className="grid gap-5 md:min-h-0 md:flex-1 md:grid-cols-[1fr_360px]">
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-panel px-4 py-10 text-center">
          <p className="max-w-sm text-sm text-ink-muted">{t.team.empty}</p>
          <Link
            href="/zatrudnij"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t.team.hireFirst}
          </Link>
        </div>
      ) : (
        <div className="grid content-start gap-3 sm:grid-cols-2 md:min-h-0 md:overflow-y-auto">
          {agents.map((a) => (
            <Link
              key={a.id}
              href={`/agenci/${a.id}`}
              className="flex flex-col gap-2.5 rounded-2xl border border-line bg-panel p-4 transition hover:border-[#c9c9cf]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white"
                  style={{ background: roleColor[a.role] }}
                >
                  {a.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {a.name}
                  </p>
                  <p
                    className="truncate text-[11.5px]"
                    style={{ color: roleColor[a.role] }}
                  >
                    {a.customRoleLabel ?? t.roles[a.role]}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <span
                    className={`status-dot ${statusIsLive(a.status) ? "status-dot--live" : ""}`}
                    style={{ color: statusColor[a.status], width: 7, height: 7 }}
                  />
                  {t.statuses[a.status]}
                </div>
              </div>
              <p className="min-h-[2.2em] text-[12.5px] text-ink/75">
                {a.currentTask ?? a.jobDescription}
              </p>
            </Link>
          ))}
        </div>
      )}

        <div className="md:min-h-0 md:overflow-y-auto">
          <Journal events={journal} agents={agents} showHeading={false} />
        </div>
      </div>
    </>
  );
}
