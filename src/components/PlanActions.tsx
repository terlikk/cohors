"use client";

import { useActionState, useState } from "react";
import {
  approvePlan,
  requestPlanChanges,
  type ChangesFormState,
} from "@/app/actions";
import { t } from "@/lib/i18n";

export function PlanActions({ orderId }: { orderId: string }) {
  const [showChanges, setShowChanges] = useState(false);
  const [state, changesAction, changesPending] = useActionState<
    ChangesFormState,
    FormData
  >(requestPlanChanges, {});

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <form action={approvePlan} className="flex-1">
          <input type="hidden" name="orderId" value={orderId} />
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-accent-2 to-accent px-6 py-3.5 font-display text-base font-semibold text-[#241900] transition hover:brightness-110"
          >
            {t.plan.approve}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowChanges((v) => !v)}
          className={`flex-1 rounded-xl border px-6 py-3.5 font-display text-base transition ${
            showChanges
              ? "border-accent bg-panel-2 text-ink"
              : "border-line bg-panel-2 text-ink hover:border-accent/50"
          }`}
        >
          {t.plan.requestChanges}
        </button>
      </div>

      {showChanges && (
        <form
          action={changesAction}
          className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-4"
        >
          <input type="hidden" name="orderId" value={orderId} />
          <textarea
            name="comment"
            rows={3}
            placeholder={t.plan.changesPlaceholder}
            className="w-full resize-y rounded-xl border border-line bg-panel-2 px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
          />
          {state.error && (
            <p className="text-sm text-role-marketing">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={changesPending}
            className="self-end rounded-xl border border-accent/50 bg-panel-2 px-5 py-2.5 font-display text-sm text-accent transition hover:bg-accent/10 disabled:opacity-60"
          >
            {changesPending ? t.plan.changesSubmitting : t.plan.changesSubmit}
          </button>
        </form>
      )}
    </div>
  );
}
