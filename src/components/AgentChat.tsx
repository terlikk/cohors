"use client";

import { sendChatMessage } from "@/app/actions";
import { t } from "@/lib/i18n";
import type { ChatMessage } from "@/lib/types";

export function AgentChat({
  agentId,
  agentName,
  messages,
  isManager,
}: {
  agentId: string;
  agentName: string;
  messages: ChatMessage[];
  isManager: boolean;
}) {
  const awaitingReply =
    messages.length > 0 && messages[messages.length - 1].from === "boss";

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-panel p-5 md:h-full md:min-h-0">
      <h2 className="text-[13px] font-semibold text-ink">{t.chat.heading}</h2>
      {isManager && (
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {t.chat.managerHint}
        </p>
      )}

      <div className="mt-3 flex max-h-[420px] flex-col gap-2.5 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1">
        {messages.length === 0 && (
          <p className="py-3 text-sm text-ink-muted">{t.chat.empty}</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.from === "boss"
                ? "self-end bg-accent text-white"
                : "self-start bg-panel-2 text-ink"
            }`}
          >
            {m.text}
          </div>
        ))}
        {awaitingReply && (
          <p className="flex items-center gap-2 self-start px-1 text-[12px] text-ink-muted">
            <span
              className="status-dot status-dot--live"
              style={{ color: "#c7c7cc", width: 6, height: 6 }}
            />
            {agentName} {t.chat.thinking}
          </p>
        )}
      </div>

      <form action={sendChatMessage} className="mt-3 flex gap-2">
        <input type="hidden" name="agentId" value={agentId} />
        <input
          name="text"
          autoComplete="off"
          placeholder={t.chat.placeholder}
          className="flex-1 rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
        >
          {t.chat.send}
        </button>
      </form>
    </section>
  );
}
