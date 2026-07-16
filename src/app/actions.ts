"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import { addJournalEvent, createAgent } from "@/lib/repo";
import type { EngineKey, RoleKey } from "@/lib/types";

const ROLES: RoleKey[] = [
  "marketing",
  "developer",
  "research",
  "copywriting",
  "support",
  "custom",
];
const ENGINES: EngineKey[] = ["claude_code", "anthropic_api", "codex", "http"];

export interface HireFormState {
  error?: string;
}

export async function hireAgent(
  _prev: HireFormState,
  formData: FormData,
): Promise<HireFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as RoleKey;
  const customRoleLabel = String(formData.get("customRoleLabel") ?? "").trim();
  const jobDescription = String(formData.get("jobDescription") ?? "").trim();
  const engine = String(formData.get("engine") ?? "") as EngineKey;
  const budget = Number(formData.get("budget") ?? 10);

  if (!name) return { error: t.hire.errors.nameRequired };
  if (!jobDescription) return { error: t.hire.errors.jobRequired };
  if (!ROLES.includes(role)) return { error: t.hire.errors.nameRequired };
  if (role === "custom" && !customRoleLabel)
    return { error: t.hire.errors.customRoleRequired };

  const questions = t.onboardingQuestions[role];
  const onboarding = questions.map((question, i) => ({
    question,
    answer: String(formData.get(`answer_${i}`) ?? "").trim(),
  }));

  const roleLabel = role === "custom" ? customRoleLabel : t.roles[role];

  createAgent({
    name,
    role,
    customRoleLabel: role === "custom" ? customRoleLabel : undefined,
    jobDescription,
    engine: ENGINES.includes(engine) ? engine : "claude_code",
    monthBudgetUsd: Number.isFinite(budget) && budget > 0 ? budget : 10,
    onboarding,
  });

  addJournalEvent({
    kind: "hired",
    text: t.journalTexts.hired(name, roleLabel),
  });

  revalidatePath("/");
  redirect("/");
}
