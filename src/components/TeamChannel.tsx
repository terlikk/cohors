"use client";

import { sendTeamMessage } from "@/app/actions";
import { t } from "@/lib/i18n";
import { roleColor } from "@/lib/roles";
import type { RoleKey } from "@/lib/types";
import type { TeamMessage } from "@/lib/repo";

function colorFor(role: string | null): string {
  if (!role) return "#0a84ff";
  return roleColor[role as RoleKey] ?? "#0a84ff";
}

export function TeamChannel({ messages }: { messages: TeamMessage[] }) {
  return (
    <section className="flex flex-col rounded-2xl border border-line bg-panel p-5 md:min-h-0 md:flex-1">
      <div className="flex min-h-[300px] flex-col gap-3 overflow-y-auto md:min-h-0 md:flex-1">
        {messages.length === 0 && (
          <p className="py-3 text-sm text-ink-muted">{t.channel.empty}</p>
        )}
        {messages.map((m) => {
          const isBoss = m.agentId === null;
          return (
            <div
              key={m.id}
              className={`flex max-w-[85%] flex-col gap-1 ${
                isBoss ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <span
                className="px-1 text-[11px] font-semibold"
                style={{ color: isBoss ? "#0a84ff" : colorFor(m.role) }}
              >
                {m.authorName}
              </span>
              <div
                className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isBoss ? "bg-accent text-white" : "bg-panel-2 text-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <form action={sendTeamMessage} className="mt-3 flex gap-2">
        <input
          name="text"
          autoComplete="off"
          placeholder={t.channel.placeholder}
          className="flex-1 rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
        >
          {t.channel.send}
        </button>
      </form>
    </section>
  );
}
