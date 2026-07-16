import Link from "next/link";
import { TaskApprovalCard } from "@/components/TaskApprovalCard";
import { t } from "@/lib/i18n";
import type { Agent, Order, Task } from "@/lib/types";

export function Approvals({
  awaitingTasks,
  pendingOrders,
  agents,
}: {
  awaitingTasks: Task[];
  pendingOrders: Array<Order & { taskCount: number }>;
  agents: Agent[];
}) {
  const agentById = (id: string) => agents.find((a) => a.id === id);
  const total = awaitingTasks.length + pendingOrders.length;

  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t.approvals.heading}
        </h2>
        {total > 0 && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
            {total}
          </span>
        )}
      </div>

      {pendingOrders.length > 0 && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {pendingOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-panel p-4 transition hover:border-accent sm:p-5"
            >
              <span
                className="status-dot status-dot--live shrink-0"
                style={{ color: "var(--color-accent)" }}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">
                  {t.plan.awaitingCardTitle}
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-muted">
                  „{order.text}” · {t.plan.taskCount(order.taskCount)}
                </span>
              </span>
              <span className="shrink-0 rounded-xl bg-gradient-to-b from-accent-2 to-accent px-4 py-2 font-display text-xs font-semibold text-[#241900]">
                {t.plan.awaitingCardCta}
              </span>
            </Link>
          ))}
        </div>
      )}

      {awaitingTasks.length > 0 && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {awaitingTasks.map((task) => (
            <TaskApprovalCard
              key={task.id}
              task={task}
              agent={agentById(task.agentId)}
            />
          ))}
        </div>
      )}

      {total === 0 && (
        <p className="mt-3 rounded-2xl border border-line bg-panel px-4 py-5 text-sm text-ink-muted">
          {t.approvals.empty}
        </p>
      )}
    </section>
  );
}
