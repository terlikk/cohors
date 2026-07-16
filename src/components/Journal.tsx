import { t } from "@/lib/i18n";
import { agentById, journal } from "@/lib/mock";
import { roleColor } from "@/lib/roles";

export function Journal() {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-ink">
        {t.journal.heading}
      </h2>
      <ol className="mt-3 overflow-hidden rounded-2xl border border-line bg-panel">
        {journal.map((e, i) => {
          const agent = agentById(e.agentId);
          return (
            <li
              key={e.id}
              className={`flex items-baseline gap-3 px-4 py-3 sm:px-5 ${
                i > 0 ? "border-t border-line/60" : ""
              }`}
            >
              <span className="font-mono text-xs text-ink-muted">{e.at}</span>
              <span
                className="hidden shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide sm:inline"
                style={{
                  color: agent ? roleColor[agent.role] : "var(--color-accent)",
                  background: "color-mix(in srgb, currentColor 12%, transparent)",
                }}
              >
                {t.journalKinds[e.kind]}
              </span>
              <span className="flex-1 text-sm text-ink/90">{e.text}</span>
              {e.costUsd !== undefined && (
                <span className="font-mono text-xs text-ink-muted">
                  ${e.costUsd.toFixed(2)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
