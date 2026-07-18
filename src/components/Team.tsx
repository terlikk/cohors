import Link from "next/link";
import { t } from "@/lib/i18n";
import { roleColor, statusColor, statusIsLive } from "@/lib/roles";
import type { Agent } from "@/lib/types";

export function Team({
  agents,
  showHeading = true,
}: {
  agents: Agent[];
  showHeading?: boolean;
}) {
  return (
    <section>
      {showHeading && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.team.heading}
          </h2>
          <Link
            href="/zatrudnij"
            className="rounded-full bg-panel-2 px-4 py-2 font-display text-xs text-ink transition hover:brightness-95"
          >
            + {t.team.hire}
          </Link>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-panel px-4 py-10 text-center">
          <p className="max-w-sm text-sm text-ink-muted">{t.team.empty}</p>
          <Link
            href="/zatrudnij"
            className="rounded-full bg-accent px-6 py-3 font-display text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t.team.hireFirst}
          </Link>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <Link
              key={a.id}
              href={`/agenci/${a.id}`}
              className="rounded-2xl border border-line bg-panel p-4 transition hover:border-[#c9c9cf]"
            >
              <header className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-lg font-semibold text-white"
                  style={{ background: roleColor[a.role] }}
                >
                  {a.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-ink">{a.name}</h3>
                  <p
                    className="truncate text-xs"
                    style={{ color: roleColor[a.role] }}
                  >
                    {a.customRoleLabel ?? t.roles[a.role]}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span
                    className={`status-dot ${statusIsLive(a.status) ? "status-dot--live" : ""}`}
                    style={{ color: statusColor[a.status] }}
                  />
                  <span className="text-xs text-ink-muted">
                    {t.statuses[a.status]}
                  </span>
                </div>
              </header>

              <p className="mt-3 min-h-[2.5rem] text-sm leading-snug text-ink/85">
                {a.currentTask ?? a.jobDescription}
              </p>

              <footer className="mt-3 border-t border-line pt-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-ink-muted">{t.team.thisMonth}</span>
                  <span className="text-ink">
                    ${a.monthCostUsd.toFixed(2)}
                    <span className="text-ink-muted">
                      {" "}
                      / ${a.monthBudgetUsd.toFixed(0)}
                    </span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.min(100, (a.monthCostUsd / a.monthBudgetUsd) * 100)}%`,
                    }}
                  />
                </div>
              </footer>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
