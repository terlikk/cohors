"use client";

import { useActionState, useState } from "react";
import { hireBossAction, type HireFormState } from "@/app/actions";
import { t } from "@/lib/i18n";
import { roleColor } from "@/lib/roles";
import type { EngineKey } from "@/lib/types";

const ENGINE_OPTIONS: EngineKey[] = [
  "claude_code",
  "anthropic_api",
  "codex",
  "http",
];

export function HireBossForm({
  engineAvailability,
}: {
  engineAvailability: Record<EngineKey, boolean>;
}) {
  const [engine, setEngine] = useState<EngineKey>(
    engineAvailability.claude_code ? "claude_code" : "anthropic_api",
  );
  const [state, formAction, pending] = useActionState<HireFormState, FormData>(
    hireBossAction,
    {},
  );

  return (
    <div className="flex justify-center">
      <form
        action={formAction}
        className="flex w-full max-w-[580px] flex-col gap-4 pb-6"
      >
        <div className="pt-2 text-center">
          <div
            className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ background: roleColor.manager }}
          >
            S
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-ink">
            {t.hireBoss.title}
          </h1>
          <p className="mx-auto mt-1.5 max-w-[440px] text-[13px] text-ink-muted">
            {t.hireBoss.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 sm:p-6">
          <div>
            <label className="text-[13px] font-semibold text-ink" htmlFor="name">
              {t.hireBoss.nameLabel}
            </label>
            <input
              id="name"
              name="name"
              autoFocus
              placeholder={t.hireBoss.namePlaceholder}
              className="mt-1.5 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
          </div>

          {t.onboardingQuestions.manager.map((q, i) => (
            <div key={q}>
              <label
                className="text-[13px] font-semibold text-ink"
                htmlFor={`answer_${i}`}
              >
                <span
                  className="mr-1.5 font-mono text-[11px]"
                  style={{ color: roleColor.manager }}
                >
                  {i + 1}
                </span>
                {q}
              </label>
              <textarea
                id={`answer_${i}`}
                name={`answer_${i}`}
                rows={2}
                className="mt-1.5 w-full resize-y rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          ))}

          <div className="flex flex-col gap-4 border-t border-line pt-4">
            <div>
              <span className="text-[13px] font-semibold text-ink">
                {t.hire.engineLabel}
              </span>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                {ENGINE_OPTIONS.map((e) => (
                  <label
                    key={e}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-panel-2/50 px-3 py-2.5 text-sm transition hover:border-accent/40 has-[:checked]:border-accent has-[:checked]:bg-panel-2"
                  >
                    <input
                      type="radio"
                      name="engine"
                      value={e}
                      checked={engine === e}
                      onChange={() => setEngine(e)}
                      className="accent-[#0071e3]"
                    />
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                      {t.engines[e]}
                      {e !== "http" && engineAvailability[e] && (
                        <span className="rounded-full bg-role-support/15 px-1.5 py-0.5 font-mono text-[10px] text-role-support">
                          {t.engineDetected}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              {engine === "http" && (
                <input
                  name="engineUrl"
                  type="url"
                  placeholder={t.engineHttpUrlPlaceholder}
                  className="mt-2 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
                />
              )}
            </div>
            <div className="max-w-[200px]">
              <label
                className="text-[13px] font-semibold text-ink"
                htmlFor="budget"
              >
                {t.hire.budgetLabel}
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                min={1}
                step={1}
                defaultValue={10}
                className="mt-1.5 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {state.error && (
            <p className="rounded-xl border border-role-marketing/40 bg-role-marketing/10 px-4 py-2.5 text-sm text-role-marketing">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? t.hireBoss.submitting : t.hireBoss.submit}
          </button>
          <p className="text-center text-[11.5px] text-ink-muted">
            {t.hireBoss.footnote}
          </p>
        </div>
      </form>
    </div>
  );
}
