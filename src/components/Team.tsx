import { t } from "@/lib/i18n";
import { agents } from "@/lib/mock";
import { roleColor, statusColor, statusIsLive } from "@/lib/roles";

export function Team() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t.team.heading}
        </h2>
        <button
          type="button"
          className="rounded-xl border border-line bg-panel-2 px-4 py-2 font-display text-xs text-ink transition hover:border-accent/50"
        >
          + {t.team.hire}
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-line bg-panel p-4"
          >
            <header className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-lg font-semibold text-[#1c1408]"
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
                  {t.roles[a.role]}
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
              {a.currentTask ?? "—"}
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
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                  style={{
                    width: `${Math.min(100, (a.monthCostUsd / a.monthBudgetUsd) * 100)}%`,
                  }}
                />
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
