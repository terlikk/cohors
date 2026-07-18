"use client";

import { useActionState } from "react";
import {
  fireAgentAction,
  updateAgentSettingsAction,
  type AgentSettingsState,
} from "@/app/actions";
import { t } from "@/lib/i18n";
import type { Agent, EngineKey } from "@/lib/types";

const ENGINE_OPTIONS: EngineKey[] = [
  "claude_code",
  "anthropic_api",
  "codex",
  "http",
];

export function AgentOptions({ agent }: { agent: Agent }) {
  const [state, saveAction, saving] = useActionState<
    AgentSettingsState,
    FormData
  >(updateAgentSettingsAction, {});

  return (
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:overflow-y-auto">
      <form
        action={saveAction}
        className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5"
      >
        <input type="hidden" name="agentId" value={agent.id} />

        <div className="max-w-[220px]">
          <label className="text-[13px] font-semibold text-ink" htmlFor="budget">
            {t.pages.agent.optionsBudget}
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min={1}
            step={1}
            defaultValue={agent.monthBudgetUsd}
            className="mt-1.5 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-ink-muted">{t.hire.budgetHint}</p>
        </div>

        <div>
          <span className="text-[13px] font-semibold text-ink">
            {t.pages.agent.optionsEngine}
          </span>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {ENGINE_OPTIONS.map((e) => (
              <label
                key={e}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-panel-2/50 px-3 py-2.5 text-sm transition hover:border-accent/40 has-[:checked]:border-accent has-[:checked]:bg-panel-2"
              >
                <input
                  type="radio"
                  name="engine"
                  value={e}
                  defaultChecked={agent.engine === e}
                  className="accent-[#0071e3]"
                />
                {t.engines[e]}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">{t.hire.engineHint}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {t.pages.agent.optionsSave}
          </button>
          {state.saved && (
            <span className="text-[13px] text-role-support">
              {t.pages.agent.optionsSaved}
            </span>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-role-marketing/30 bg-panel p-5">
        <h2 className="text-[13px] font-semibold text-role-marketing">
          {t.pages.agent.fire}
        </h2>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          {t.pages.agent.fireNote}
        </p>
        <form action={fireAgentAction} className="mt-3">
          <input type="hidden" name="agentId" value={agent.id} />
          <button
            type="submit"
            className="rounded-full border border-role-marketing/50 px-5 py-2.5 text-[13px] font-semibold text-role-marketing transition hover:bg-role-marketing/10"
          >
            {t.pages.agent.fire}
          </button>
        </form>
      </div>
    </div>
  );
}
