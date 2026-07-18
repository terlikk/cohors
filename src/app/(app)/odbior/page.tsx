import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { TaskApprovalCard } from "@/components/TaskApprovalCard";
import { t } from "@/lib/i18n";
import { listAgents, listAwaitingTasks, listPendingOrders } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function OdbiorPage() {
  const agents = listAgents();
  const awaitingTasks = listAwaitingTasks();
  const pendingOrders = listPendingOrders();
  const agentById = (id: string) => agents.find((a) => a.id === id);
  const total = awaitingTasks.length + pendingOrders.length;

  return (
    <>
      <PageHead title={t.pages.odbior.title} subtitle={t.pages.odbior.subtitle} />

      <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:overflow-y-auto">
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

      {awaitingTasks.map((task) => (
        <TaskApprovalCard key={task.id} task={task} agent={agentById(task.agentId)} />
      ))}

      {total === 0 && (
        <p className="rounded-2xl border border-line bg-panel px-5 py-5 text-sm text-ink-muted">
          {t.approvals.empty}
        </p>
      )}
      </div>
    </>
  );
}
