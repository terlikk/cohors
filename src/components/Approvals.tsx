import { t } from "@/lib/i18n";
import { roleColor } from "@/lib/roles";
import type { Agent, Approval } from "@/lib/types";

export function Approvals({
  approvals,
  agents,
}: {
  approvals: Approval[];
  agents: Agent[];
}) {
  const agentById = (id: string) => agents.find((a) => a.id === id);

  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t.approvals.heading}
        </h2>
        {approvals.length > 0 && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
            {approvals.length}
          </span>
        )}
      </div>

      {approvals.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-panel px-4 py-5 text-sm text-ink-muted">
          {t.approvals.empty}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {approvals.map((ap) => {
            const agent = agentById(ap.agentId);
            return (
              <article
                key={ap.id}
                className="flex flex-col rounded-2xl border border-accent/25 bg-panel p-4 sm:p-5"
              >
                <header className="flex items-center gap-2">
                  <span
                    className="status-dot status-dot--live"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <h3 className="font-semibold text-ink">{ap.title}</h3>
                </header>
                {agent && (
                  <p className="mt-1 text-xs text-ink-muted">
                    {t.approvals.from}{" "}
                    <span style={{ color: roleColor[agent.role] }}>
                      {agent.name} ·{" "}
                      {agent.customRoleLabel ?? t.roles[agent.role]}
                    </span>
                  </p>
                )}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/90">
                  {ap.preview}
                </p>
                <footer className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-gradient-to-b from-accent-2 to-accent px-4 py-2.5 font-display text-sm font-semibold text-[#241900] transition hover:brightness-110"
                  >
                    {t.approvals.approve}
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-display text-sm text-ink transition hover:border-accent/50"
                  >
                    {t.approvals.requestChanges}
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
