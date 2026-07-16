import Link from "next/link";
import { notFound } from "next/navigation";
import { retryTaskAction } from "@/app/actions";
import { PlanActions } from "@/components/PlanActions";
import { t } from "@/lib/i18n";
import { getOrder, listAgents, listOrderTasks } from "@/lib/repo";
import { roleColor } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const tasks = listOrderTasks(id);
  const agents = listAgents();
  const agentById = (aid: string) => agents.find((a) => a.id === aid);
  const taskNumber = new Map(tasks.map((task, i) => [task.id, i + 1]));

  return (
    <div className="flex w-full flex-col gap-5 md:h-full md:min-h-0">
      <header>
        <Link
          href="/robota"
          className="text-xs text-ink-muted hover:text-accent"
        >
          {t.plan.back}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          {t.plan.title}
        </h1>
        <p className="mt-1 font-mono text-xs text-ink-muted">
          {t.plan.taskCount(tasks.length)} · {t.plan.plannerBadge[order.planner]}
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-panel-2 p-4">
        <p className="text-xs uppercase tracking-widest text-ink-muted">
          {t.plan.orderLabel}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink">„{order.text}”</p>
      </section>

      <ol className="flex flex-col gap-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
        {tasks.map((task, i) => {
          const agent = agentById(task.agentId);
          return (
            <li
              key={task.id}
              className="rounded-2xl border border-line bg-panel p-4 sm:p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-ink-muted">
                  {i + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink">{task.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/85">
                    {task.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {agent && (
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-xs"
                        style={{
                          color: roleColor[agent.role],
                          background:
                            "color-mix(in srgb, currentColor 12%, transparent)",
                        }}
                      >
                        {agent.name} ·{" "}
                        {agent.customRoleLabel ?? t.roles[agent.role]}
                      </span>
                    )}
                    {task.dependsOn.length > 0 && (
                      <span className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-ink-muted">
                        {t.plan.dependsOn}{" "}
                        {task.dependsOn
                          .map((d) => `#${taskNumber.get(d) ?? "?"}`)
                          .join(", ")}
                      </span>
                    )}
                    {order.status !== "awaiting_approval" && (
                      <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent">
                        {t.plan.taskStatuses[task.status]}
                      </span>
                    )}
                    {task.status === "failed" && (
                      <form action={retryTaskAction}>
                        <input type="hidden" name="taskId" value={task.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-role-marketing/50 px-2.5 py-1 font-mono text-xs text-role-marketing transition hover:bg-role-marketing/10"
                        >
                          {t.plan.retryTask}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {order.status === "awaiting_approval" ? (
        <PlanActions orderId={order.id} />
      ) : (
        <p className="rounded-2xl border border-line bg-panel px-4 py-4 text-sm text-ink-muted">
          {order.status === "approved"
            ? t.plan.approvedNote
            : order.status === "done"
              ? t.plan.doneNote
              : t.plan.rejectedNote}
        </p>
      )}
    </div>
  );
}
