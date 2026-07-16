import Link from "next/link";
import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getAgent, listAgentTasks } from "@/lib/repo";

export const dynamic = "force-dynamic";

const TASK_DOT: Record<string, string> = {
  running: "#34c759",
  awaiting_approval: "#ff9500",
  queued: "#c7c7cc",
  done: "#c7c7cc",
  failed: "#ff3b30",
};

export default async function AgentStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const tasks = listAgentTasks(id, 50);
  const current = tasks.find((task) => task.status === "running");
  const awaiting = tasks.filter((task) => task.status === "awaiting_approval");
  const queued = tasks.filter((task) => task.status === "queued");
  const history = tasks.filter(
    (task) => task.status === "done" || task.status === "failed",
  );

  return (
    <div className="grid gap-5 md:min-h-0 md:flex-1 md:grid-cols-2">
      <div className="flex flex-col gap-4 md:min-h-0 md:overflow-y-auto">
        {/* Co teraz robi */}
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-[13px] font-semibold text-ink">
            {t.pages.agent.nowHeading}
          </h2>
          {current ? (
            <div className="mt-2.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span
                  className="status-dot status-dot--live"
                  style={{ color: "#34c759" }}
                />
                {current.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink/75">
                {current.description}
              </p>
              <Link
                href={`/orders/${current.orderId}`}
                className="mt-2 inline-block text-[12.5px] text-accent hover:underline"
              >
                {t.pages.robota.seePlan} →
              </Link>
            </div>
          ) : awaiting.length > 0 ? (
            <div className="mt-2.5 flex flex-col gap-2">
              {awaiting.map((task) => (
                <p
                  key={task.id}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <span
                    className="status-dot status-dot--live"
                    style={{ color: "#ff9500" }}
                  />
                  <span className="font-semibold">{task.title}</span>
                  <span className="text-[12px] text-ink-muted">
                    — {t.pages.agent.awaitingNote}
                  </span>
                </p>
              ))}
              <Link
                href="/odbior"
                className="text-[12.5px] text-accent hover:underline"
              >
                {t.pages.pulpit.goto} →
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">
              {t.pages.agent.nowIdle}
            </p>
          )}
        </section>

        {/* Kolejka */}
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-[13px] font-semibold text-ink">
            {t.pages.agent.queueHeading}
          </h2>
          {queued.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              {t.pages.agent.queueEmpty}
            </p>
          ) : (
            <ol className="mt-2 flex flex-col gap-1.5">
              {queued.map((task, i) => (
                <li key={task.id} className="flex items-baseline gap-2 text-sm">
                  <span className="font-mono text-[11.5px] text-ink-muted">
                    {i + 1}.
                  </span>
                  <span className="text-ink">{task.title}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Budżet */}
        <section className="flex items-center rounded-2xl border border-line bg-panel px-5 py-3.5 text-sm">
          <span className="text-ink">{t.pages.agent.budgetRow}</span>
          <span className="ml-auto font-mono text-[13px] text-ink-muted">
            <b className="font-semibold text-ink">
              ${agent.monthCostUsd.toFixed(2)}
            </b>{" "}
            / ${agent.monthBudgetUsd.toFixed(0)}
          </span>
        </section>
      </div>

      {/* Historia */}
      <div className="flex flex-col gap-3 md:min-h-0">
        <h2 className="text-[15px] font-semibold text-ink">
          {t.pages.agent.workHeading}
        </h2>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-line bg-panel px-5 py-5 text-sm text-ink-muted">
            {t.pages.agent.workEmpty}
          </p>
        ) : (
          <div className="rounded-2xl border border-line bg-panel md:min-h-0 md:flex-1 md:overflow-y-auto">
            {history.map((task, i) => (
              <Link
                key={task.id}
                href={`/orders/${task.orderId}`}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-panel-2/50 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <span
                  className="status-dot"
                  style={{ color: TASK_DOT[task.status] ?? "#c7c7cc" }}
                />
                <span className="min-w-0 flex-1 truncate text-ink">
                  {task.title}
                </span>
                <span className="shrink-0 font-mono text-[11.5px] text-ink-muted">
                  {t.plan.taskStatuses[task.status]}
                  {task.costUsd !== undefined && ` · $${task.costUsd.toFixed(2)}`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
