import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { t } from "@/lib/i18n";
import { getAgent, getAgentOnboarding, listAgentTasks } from "@/lib/repo";
import { roleColor, statusColor, statusIsLive } from "@/lib/roles";

export const dynamic = "force-dynamic";

const TASK_DOT: Record<string, string> = {
  running: "#34c759",
  awaiting_approval: "#ff9500",
  queued: "#c7c7cc",
  done: "#c7c7cc",
  failed: "#ff3b30",
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const tasks = listAgentTasks(id);
  const onboarding = getAgentOnboarding(id);
  const roleLabel = agent.customRoleLabel ?? t.roles[agent.role];

  return (
    <>
      <PageHead
        title={agent.name}
        subtitle={undefined}
        action={
          <Link
            href={`/robota?do=${encodeURIComponent(agent.name)}`}
            className="rounded-full bg-panel-2 px-5 py-2.5 text-[13px] font-semibold text-ink transition hover:brightness-95"
          >
            {t.pages.agent.writeTo(agent.name)}
          </Link>
        }
      />
      <p className="-mt-3 flex flex-wrap items-center gap-x-2 text-[13.5px] text-ink-muted">
        <span style={{ color: roleColor[agent.role] }}>{roleLabel}</span>
        <span>· {t.engines[agent.engine]}</span>
        <span className="inline-flex items-center gap-1.5">
          ·{" "}
          <span
            className={`status-dot ${statusIsLive(agent.status) ? "status-dot--live" : ""}`}
            style={{ color: statusColor[agent.status], width: 7, height: 7 }}
          />{" "}
          {t.statuses[agent.status]}
        </span>
      </p>

      <div className="flex items-center rounded-2xl border border-line bg-panel px-5 py-3.5 text-sm">
        <span className="text-ink">{t.pages.agent.budgetRow}</span>
        <span className="ml-auto font-mono text-[13px] text-ink-muted">
          <b className="font-semibold text-ink">
            ${agent.monthCostUsd.toFixed(2)}
          </b>{" "}
          / ${agent.monthBudgetUsd.toFixed(0)}
        </span>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="text-[13px] font-semibold text-ink">
          {t.pages.agent.jobHeading}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/85">
          „{agent.jobDescription}”
        </p>
      </div>

      {onboarding.length > 0 && (
        <div className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-[13px] font-semibold text-ink">
            {t.pages.agent.onboardingHeading}
          </h2>
          <dl className="mt-2 flex flex-col gap-2.5">
            {onboarding.map((qa) => (
              <div key={qa.question}>
                <dt className="text-[12px] text-ink-muted">{qa.question}</dt>
                <dd className="m-0 text-sm text-ink/85">{qa.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <h2 className="mt-1 text-[15px] font-semibold text-ink">
        {t.pages.agent.workHeading}
      </h2>
      {tasks.length === 0 ? (
        <p className="rounded-2xl border border-line bg-panel px-5 py-5 text-sm text-ink-muted">
          {t.pages.agent.workEmpty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          {tasks.map((task, i) => (
            <Link
              key={task.id}
              href={`/orders/${task.orderId}`}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-panel-2/50 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span
                className={`status-dot ${
                  task.status === "running" || task.status === "awaiting_approval"
                    ? "status-dot--live"
                    : ""
                }`}
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
    </>
  );
}
