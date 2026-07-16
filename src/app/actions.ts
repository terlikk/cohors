"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import { planOrder } from "@/lib/planner";
import {
  addJournalEvent,
  approveOrder,
  approveTask,
  createAgent,
  createOrderWithPlan,
  getAgent,
  getOrder,
  getTask,
  listAgents,
  listOrderTasks,
  maybeCompleteOrder,
  replaceOrderPlan,
  requestTaskChanges,
  setTaskStatus,
} from "@/lib/repo";
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

  const engineUrl = String(formData.get("engineUrl") ?? "").trim();
  createAgent({
    name,
    role,
    customRoleLabel: role === "custom" ? customRoleLabel : undefined,
    jobDescription,
    engine: ENGINES.includes(engine) ? engine : "claude_code",
    engineConfig: engine === "http" && engineUrl ? { url: engineUrl } : undefined,
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

export interface OrderFormState {
  error?: string;
}

export async function submitOrder(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const text = String(formData.get("order") ?? "").trim();
  if (!text) return { error: t.order.errors.empty };

  const agents = listAgents();
  if (agents.length === 0) return { error: t.order.errors.noAgents };

  const plan = await planOrder(text, agents);
  const orderId = createOrderWithPlan({
    text,
    planner: plan.planner,
    tasks: plan.tasks,
  });

  addJournalEvent({ kind: "order_submitted", text: t.journalTexts.orderSubmitted(text) });
  const names = [
    ...new Set(
      plan.tasks
        .map((task) => agents.find((a) => a.id === task.agentId)?.name)
        .filter((n): n is string => !!n),
    ),
  ];
  addJournalEvent({
    kind: "plan_ready",
    text: t.journalTexts.planReady(plan.tasks.length, names),
    costUsd: plan.costUsd > 0 ? plan.costUsd : undefined,
  });

  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}

export async function approvePlan(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const order = getOrder(orderId);
  if (!order || order.status !== "awaiting_approval") return;

  approveOrder(orderId);
  addJournalEvent({ kind: "plan_approved", text: t.journalTexts.planApproved });
  revalidatePath("/");
  revalidatePath(`/orders/${orderId}`);
}

export interface ChangesFormState {
  error?: string;
}

export async function requestPlanChanges(
  _prev: ChangesFormState,
  formData: FormData,
): Promise<ChangesFormState> {
  const orderId = String(formData.get("orderId") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return { error: t.plan.changesPlaceholder };

  const order = getOrder(orderId);
  if (!order || order.status !== "awaiting_approval") return {};

  const agents = listAgents();
  const previousPlan = listOrderTasks(orderId)
    .map(
      (task, i) =>
        `${i + 1}. ${task.title} → ${agents.find((a) => a.id === task.agentId)?.name ?? "?"}`,
    )
    .join("\n");

  const plan = await planOrder(order.text, agents, { previousPlan, comment });
  replaceOrderPlan(orderId, plan.planner, plan.tasks);

  addJournalEvent({
    kind: "plan_changes",
    text: t.journalTexts.planChanges(comment),
    costUsd: plan.costUsd > 0 ? plan.costUsd : undefined,
  });

  revalidatePath("/");
  revalidatePath(`/orders/${orderId}`);
  return {};
}

export async function approveTaskAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const task = getTask(taskId);
  if (!task || task.status !== "awaiting_approval") return;

  const agent = getAgent(task.agentId);
  approveTask(taskId);
  addJournalEvent({
    agentId: task.agentId,
    kind: "approved",
    text: t.journalTexts.taskApproved(agent?.name ?? "?", task.title),
  });

  const completed = maybeCompleteOrder(task.orderId);
  if (completed) {
    const order = getOrder(task.orderId);
    addJournalEvent({
      kind: "order_done",
      text: t.journalTexts.orderDone(order?.text ?? "", completed.totalCostUsd),
    });
  }
  revalidatePath("/");
}

/** Puts a failed task back into the queue for another attempt. */
export async function retryTaskAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const task = getTask(taskId);
  if (!task || task.status !== "failed") return;
  setTaskStatus(taskId, "queued");
  revalidatePath("/");
  revalidatePath(`/orders/${task.orderId}`);
}

export interface TaskChangesFormState {
  error?: string;
}

export async function requestTaskChangesAction(
  _prev: TaskChangesFormState,
  formData: FormData,
): Promise<TaskChangesFormState> {
  const taskId = String(formData.get("taskId") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return { error: t.approvals.feedbackPlaceholder };

  const task = getTask(taskId);
  if (!task || task.status !== "awaiting_approval") return {};

  const agent = getAgent(task.agentId);
  requestTaskChanges(taskId, comment);
  addJournalEvent({
    agentId: task.agentId,
    kind: "changes_requested",
    text: t.journalTexts.taskChanges(agent?.name ?? "?", task.title, comment),
  });
  revalidatePath("/");
  return {};
}
