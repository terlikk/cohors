"use client";

import { useActionState, useState } from "react";
import {
  approveTaskAction,
  requestTaskChangesAction,
  type TaskChangesFormState,
} from "@/app/actions";
import { t } from "@/lib/i18n";
import { roleColor } from "@/lib/roles";
import type { Agent, Task } from "@/lib/types";

const PREVIEW_CHARS = 420;

export function TaskApprovalCard({
  task,
  agent,
}: {
  task: Task;
  agent?: Agent;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [state, feedbackAction, feedbackPending] = useActionState<
    TaskChangesFormState,
    FormData
  >(requestTaskChangesAction, {});

  const result = task.result ?? "";
  const isLong = result.length > PREVIEW_CHARS;
  const shown = expanded || !isLong ? result : `${result.slice(0, PREVIEW_CHARS)}…`;

  return (
    <article className="flex flex-col rounded-2xl border border-accent/25 bg-panel p-4 sm:p-5">
      <header className="flex items-center gap-2">
        <span
          className="status-dot status-dot--live"
          style={{ color: "#ff9500" }}
        />
        <h3 className="font-semibold text-ink">{task.title}</h3>
        {task.feedback.length > 0 && (
          <span className="ml-auto rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            {t.approvals.revisionBadge(task.feedback.length)}
          </span>
        )}
      </header>
      {agent && (
        <p className="mt-1 text-xs text-ink-muted">
          {t.approvals.from}{" "}
          <span style={{ color: roleColor[agent.role] }}>
            {agent.name} · {agent.customRoleLabel ?? t.roles[agent.role]}
          </span>
          {task.costUsd !== undefined && (
            <span className="font-mono"> · ${task.costUsd.toFixed(2)}</span>
          )}
        </p>
      )}

      <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
        {shown}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 self-start text-xs text-accent hover:underline"
        >
          {expanded ? t.approvals.showLess : t.approvals.showMore}
        </button>
      )}

      <footer className="mt-4 flex gap-2">
        <form action={approveTaskAction} className="flex-1">
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            className="w-full rounded-full bg-accent px-4 py-2.5 font-display text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t.approvals.approve}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowFeedback((v) => !v)}
          className={`flex-1 rounded-full border px-4 py-2.5 font-display text-sm text-ink transition ${
            showFeedback
              ? "border-accent bg-panel-2"
              : "border-line bg-panel-2 hover:border-accent/50"
          }`}
        >
          {t.approvals.requestChanges}
        </button>
      </footer>

      {showFeedback && (
        <form action={feedbackAction} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="taskId" value={task.id} />
          <textarea
            name="comment"
            rows={2}
            placeholder={t.approvals.feedbackPlaceholder}
            className="w-full resize-y rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
          />
          {state.error && (
            <p className="text-xs text-role-marketing">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={feedbackPending}
            className="self-end rounded-full border border-accent/50 bg-panel-2 px-4 py-2 font-display text-xs text-accent transition hover:bg-accent/10 disabled:opacity-60"
          >
            {t.approvals.feedbackSubmit}
          </button>
        </form>
      )}
    </article>
  );
}
