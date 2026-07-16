import { t } from "@/lib/i18n";
import { roleColor } from "@/lib/roles";
import type { Agent, JournalEvent } from "@/lib/types";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  });
}

export function Journal({
  events,
  agents,
  showHeading = true,
}: {
  events: JournalEvent[];
  agents: Agent[];
  showHeading?: boolean;
}) {
  const agentById = (id?: string) => agents.find((a) => a.id === id);

  return (
    <section>
      {showHeading && (
        <h2 className="font-display text-lg font-semibold text-ink">
          {t.journal.heading}
        </h2>
      )}
      {events.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-panel px-4 py-5 text-sm text-ink-muted">
          {t.journal.empty}
        </p>
      ) : (
        <ol className="mt-3 overflow-hidden rounded-2xl border border-line bg-panel">
          {events.map((e, i) => {
            const agent = agentById(e.agentId);
            return (
              <li
                key={e.id}
                className={`flex items-baseline gap-3 px-4 py-3 sm:px-5 ${
                  i > 0 ? "border-t border-line/60" : ""
                }`}
              >
                <span className="font-mono text-xs text-ink-muted">
                  {formatTime(e.at)}
                </span>
                <span
                  className="hidden shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide sm:inline"
                  style={{
                    color: agent
                      ? roleColor[agent.role]
                      : "var(--color-accent)",
                    background:
                      "color-mix(in srgb, currentColor 12%, transparent)",
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
      )}
    </section>
  );
}
