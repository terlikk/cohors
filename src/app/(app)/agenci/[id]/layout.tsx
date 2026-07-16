import { notFound } from "next/navigation";
import { AgentTabs } from "@/components/AgentTabs";
import { t } from "@/lib/i18n";
import { getAgent } from "@/lib/repo";
import { roleColor, statusColor, statusIsLive } from "@/lib/roles";

export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const roleLabel = agent.customRoleLabel ?? t.roles[agent.role];

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {agent.name}
          </h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13.5px] text-ink-muted">
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
        </div>
        <AgentTabs agentId={agent.id} />
      </header>
      {children}
    </>
  );
}
