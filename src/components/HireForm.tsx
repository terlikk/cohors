"use client";

import { useActionState, useState } from "react";
import { hireAgent, type HireFormState } from "@/app/actions";
import { t } from "@/lib/i18n";
import { roleColor } from "@/lib/roles";
import type { EngineKey, RoleKey } from "@/lib/types";

const ROLE_OPTIONS: RoleKey[] = [
  "marketing",
  "developer",
  "research",
  "copywriting",
  "support",
  "custom",
];
const ENGINE_OPTIONS: EngineKey[] = [
  "claude_code",
  "anthropic_api",
  "codex",
  "http",
];

export function HireForm({
  engineAvailability,
}: {
  engineAvailability: Record<EngineKey, boolean>;
}) {
  const [role, setRole] = useState<RoleKey>("marketing");
  const [name, setName] = useState("");
  const [engine, setEngine] = useState<EngineKey>(
    engineAvailability.claude_code ? "claude_code" : "anthropic_api",
  );
  const [state, formAction, pending] = useActionState<HireFormState, FormData>(
    hireAgent,
    {},
  );

  const questions = t.onboardingQuestions[role];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Step 1 — role */}
      <section className="rounded-2xl border border-line bg-panel p-4 sm:p-6">
        <h2 className="font-display text-sm font-semibold text-ink">
          1 · {t.hire.stepRole}
        </h2>
        <p className="mt-1 text-xs text-ink-muted">{t.hire.stepRoleHint}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ROLE_OPTIONS.map((r) => (
            <label
              key={r}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                role === r
                  ? "border-accent bg-panel-2"
                  : "border-line bg-panel-2/50 hover:border-accent/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="sr-only"
              />
              <span
                className="block text-sm font-semibold"
                style={{ color: roleColor[r] }}
              >
                {t.roles[r]}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                {t.roleDescriptions[r]}
              </span>
            </label>
          ))}
        </div>
        {role === "custom" && (
          <div className="mt-3">
            <label className="text-xs text-ink-muted" htmlFor="customRoleLabel">
              {t.hire.customRoleLabel}
            </label>
            <input
              id="customRoleLabel"
              name="customRoleLabel"
              placeholder={t.hire.customRolePlaceholder}
              className="mt-1 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* Step 2 — name, job description, engine, budget */}
      <section className="rounded-2xl border border-line bg-panel p-4 sm:p-6">
        <h2 className="font-display text-sm font-semibold text-ink">
          2 · {t.hire.stepDetails}
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-ink-muted" htmlFor="name">
              {t.hire.nameLabel}
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.hire.namePlaceholder}
              className="mt-1 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted" htmlFor="jobDescription">
              {t.hire.jobLabel}
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              rows={3}
              placeholder={t.hire.jobPlaceholder}
              className="mt-1 w-full resize-y rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <span className="text-xs text-ink-muted">{t.hire.engineLabel}</span>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {ENGINE_OPTIONS.map((e) => (
                <label
                  key={e}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-panel-2/50 p-3 transition hover:border-accent/40 has-[:checked]:border-accent has-[:checked]:bg-panel-2"
                >
                  <input
                    type="radio"
                    name="engine"
                    value={e}
                    checked={engine === e}
                    onChange={() => setEngine(e)}
                    className="mt-1 accent-[#0071e3]"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      {t.engines[e]}
                      {e !== "http" && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                            engineAvailability[e]
                              ? "bg-role-support/15 text-role-support"
                              : "bg-panel text-ink-muted"
                          }`}
                        >
                          {engineAvailability[e]
                            ? t.engineDetected
                            : t.engineNotDetected}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                      {t.engineDescriptions[e]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {engine === "http" && (
              <div className="mt-2">
                <label className="text-xs text-ink-muted" htmlFor="engineUrl">
                  {t.engineHttpUrlLabel}
                </label>
                <input
                  id="engineUrl"
                  name="engineUrl"
                  type="url"
                  placeholder={t.engineHttpUrlPlaceholder}
                  className="mt-1 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
                />
              </div>
            )}
          </div>
          <div className="max-w-xs">
            <label className="text-xs text-ink-muted" htmlFor="budget">
              {t.hire.budgetLabel}
            </label>
            <input
              id="budget"
              name="budget"
              type="number"
              min={1}
              step={1}
              defaultValue={10}
              className="mt-1 w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-mono text-ink focus:border-accent focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-muted/80">
              {t.hire.budgetHint}
            </p>
          </div>
        </div>
      </section>

      {/* Step 3 — onboarding questions */}
      <section className="rounded-2xl border border-line bg-panel p-4 sm:p-6">
        <h2 className="font-display text-sm font-semibold text-ink">
          3 · {name.trim() || t.roles[role]} {t.hire.stepOnboarding}
        </h2>
        <p className="mt-1 text-xs text-ink-muted">{t.hire.stepOnboardingHint}</p>
        <div className="mt-4 flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={q}>
              <label className="text-sm text-ink/90" htmlFor={`answer_${i}`}>
                {q}{" "}
                <span className="text-xs text-ink-muted">{t.hire.optional}</span>
              </label>
              <textarea
                id={`answer_${i}`}
                name={`answer_${i}`}
                rows={2}
                className="mt-1 w-full resize-y rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          ))}
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl border border-role-marketing/40 bg-role-marketing/10 px-4 py-2.5 text-sm text-role-marketing">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-3.5 font-display text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? t.hire.submitting : t.hire.submit}
      </button>
    </form>
  );
}
