"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import { planOrder } from "@/lib/planner";
import {
  addJournalEvent,
  addMessage,
  addTeamMessage,
  approveOrder,
  approveTask,
  createAgent,
  createOrderWithPlan,
  deleteAgent,
  getAgent,
  getOrder,
  getSetting,
  getTask,
  listAgents,
  listOrderTasks,
  maybeCompleteOrder,
  replaceOrderPlan,
  requestTaskChanges,
  setSetting,
  setTaskStatus,
  updateAgentSettings,
} from "@/lib/repo";

/** POSTs a published deliverable to the boss's configured webhook. */
async function publishToWebhook(payload: {
  order: string;
  task: string;
  agent: string;
  role: string;
  result: string;
}): Promise<boolean> {
  const url = getSetting("publish_webhook");
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "cohors", ...payload }),
    });
    return res.ok;
  } catch (err) {
    console.error("publish webhook failed:", err);
    return false;
  }
}

export async function setPublishWebhookAction(
  formData: FormData,
): Promise<void> {
  setSetting("publish_webhook", String(formData.get("webhook") ?? "").trim());
  revalidatePath("/odbior");
}
import type { EngineKey, RoleKey } from "@/lib/types";

const ROLES: RoleKey[] = [
  "manager",
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

  revalidatePath("/pulpit");
  redirect("/pulpit");
}

/** First-run flow: hires the team manager and lands in their chat. */
export async function hireBossAction(
  _prev: HireFormState,
  formData: FormData,
): Promise<HireFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: t.hire.errors.nameRequired };

  const engine = String(formData.get("engine") ?? "") as EngineKey;
  const engineUrl = String(formData.get("engineUrl") ?? "").trim();
  const budget = Number(formData.get("budget") ?? 10);

  const questions = t.onboardingQuestions.manager;
  const onboarding = questions.map((question, i) => ({
    question,
    answer: String(formData.get(`answer_${i}`) ?? "").trim(),
  }));

  const id = createAgent({
    name,
    role: "manager",
    jobDescription: t.hireBoss.defaultJob,
    engine: ENGINES.includes(engine) ? engine : "claude_code",
    engineConfig: engine === "http" && engineUrl ? { url: engineUrl } : undefined,
    monthBudgetUsd: Number.isFinite(budget) && budget > 0 ? budget : 10,
    onboarding,
  });

  addJournalEvent({
    kind: "hired",
    text: t.journalTexts.hired(name, t.roles.manager),
  });

  const goal = onboarding[1]?.answer;
  addMessage(
    id,
    "agent",
    goal ? t.hireBoss.greetingWithGoal(goal) : t.hireBoss.greeting,
  );

  revalidatePath("/pulpit");
  redirect(`/agenci/${id}/czat`);
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

  revalidatePath("/pulpit");
  redirect(`/orders/${orderId}`);
}

export async function approvePlan(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const order = getOrder(orderId);
  if (!order || order.status !== "awaiting_approval") return;

  approveOrder(orderId);
  addJournalEvent({ kind: "plan_approved", text: t.journalTexts.planApproved });
  const boss = listAgents().find((a) => a.role === "manager");
  addTeamMessage({
    agentId: boss?.id ?? null,
    authorName: boss?.name ?? "Zespół",
    role: "manager",
    text: "Plan zatwierdzony przez szefa — ruszamy do pracy! 🚀",
  });
  revalidatePath("/pulpit");
  revalidatePath("/kanal");
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

  revalidatePath("/pulpit");
  revalidatePath(`/orders/${orderId}`);
  return {};
}

export async function approveTaskAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const publish = String(formData.get("publish") ?? "") === "1";
  const task = getTask(taskId);
  if (!task || task.status !== "awaiting_approval") return;

  const agent = getAgent(task.agentId);
  const order = getOrder(task.orderId);
  approveTask(taskId);
  addJournalEvent({
    agentId: task.agentId,
    kind: "approved",
    text: t.journalTexts.taskApproved(agent?.name ?? "?", task.title),
  });
  // The agent announces the finished, approved piece of work.
  addTeamMessage({
    agentId: task.agentId,
    authorName: agent?.name ?? "?",
    role: agent?.role,
    text: `✅ Zrobione i zatwierdzone: „${task.title}”.`,
  });

  // Publish the approved result to the configured webhook, if requested.
  if (publish) {
    const sent = await publishToWebhook({
      order: order?.text ?? "",
      task: task.title,
      agent: agent?.name ?? "",
      role: agent ? (agent.customRoleLabel ?? agent.role) : "",
      result: task.result ?? "",
    });
    addJournalEvent({
      agentId: task.agentId,
      kind: "approved",
      text: sent
        ? `Wysłano dalej: „${task.title}”`
        : `Nie udało się wysłać „${task.title}” (sprawdź webhook)`,
    });
    if (sent) {
      addTeamMessage({
        agentId: task.agentId,
        authorName: agent?.name ?? "?",
        role: agent?.role,
        text: `📤 Wysłane w świat: „${task.title}”.`,
      });
    }
  }

  const completed = maybeCompleteOrder(task.orderId);
  const manager = listAgents().find((a) => a.role === "manager");
  if (completed) {
    addJournalEvent({
      kind: "order_done",
      text: t.journalTexts.orderDone(order?.text ?? "", completed.totalCostUsd),
    });
    addTeamMessage({
      agentId: manager?.id ?? null,
      authorName: manager?.name ?? "Zespół",
      role: "manager",
      text: `Rozkaz „${order?.text ?? ""}” wykonany w całości. 🎉 Koszt: $${completed.totalCostUsd.toFixed(2)}.`,
    });
  } else {
    // Milestone: how far along is the whole order.
    const orderTasks = listOrderTasks(task.orderId);
    const done = orderTasks.filter((tk) => tk.status === "done").length;
    if (orderTasks.length > 1) {
      addTeamMessage({
        agentId: manager?.id ?? null,
        authorName: manager?.name ?? "Zespół",
        role: "manager",
        text: `📍 Kamień milowy: ${done}/${orderTasks.length} zadań gotowych w „${order?.text ?? ""}”.`,
      });
    }
  }
  revalidatePath("/pulpit");
  revalidatePath("/kanal");
}

/** Puts a failed task back into the queue for another attempt. */
export async function retryTaskAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const task = getTask(taskId);
  if (!task || task.status !== "failed") return;
  setTaskStatus(taskId, "queued");
  revalidatePath("/pulpit");
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
  addTeamMessage({
    agentId: task.agentId,
    authorName: agent?.name ?? "?",
    role: agent?.role,
    text: `↩︎ Biorę „${task.title}” do poprawki wg uwag szefa: „${comment}”.`,
  });
  revalidatePath("/pulpit");
  revalidatePath("/kanal");
  return {};
}

export async function sendChatMessage(formData: FormData): Promise<void> {
  const agentId = String(formData.get("agentId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!text || !getAgent(agentId)) return;
  addMessage(agentId, "boss", text);
  revalidatePath(`/agenci/${agentId}`);
}

/** Boss posts a message to the shared team channel. */
export async function sendTeamMessage(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  addTeamMessage({ authorName: "Ty", role: null, text });
  revalidatePath("/kanal");
}

/** Agent reports its current status to the team channel on demand. */
export async function requestAgentStatus(formData: FormData): Promise<void> {
  const agentId = String(formData.get("agentId") ?? "");
  const agent = getAgent(agentId);
  if (!agent) return;

  const text = agent.currentTask
    ? `Status: pracuję nad „${agent.currentTask}”.`
    : agent.status === "waiting_for_boss"
      ? "Status: mam gotowy wynik — czeka na Twój odbiór."
      : "Status: wolny, czekam na zadania.";

  addTeamMessage({
    agentId: agent.id,
    authorName: agent.name,
    role: agent.role,
    text,
  });
  revalidatePath("/kanal");
  revalidatePath(`/agenci/${agentId}`);
}

export interface AgentSettingsState {
  saved?: boolean;
}

export async function updateAgentSettingsAction(
  _prev: AgentSettingsState,
  formData: FormData,
): Promise<AgentSettingsState> {
  const agentId = String(formData.get("agentId") ?? "");
  const agent = getAgent(agentId);
  if (!agent) return {};

  const budget = Number(formData.get("budget") ?? agent.monthBudgetUsd);
  const engine = String(formData.get("engine") ?? agent.engine) as EngineKey;
  const engineUrl = String(formData.get("engineUrl") ?? "").trim();

  updateAgentSettings(agentId, {
    monthBudgetUsd:
      Number.isFinite(budget) && budget > 0 ? budget : agent.monthBudgetUsd,
    engine: ENGINES.includes(engine) ? engine : agent.engine,
    engineConfig:
      engine === "http" && engineUrl ? { url: engineUrl } : agent.engineConfig,
  });

  revalidatePath(`/agenci/${agentId}`);
  return { saved: true };
}

export async function fireAgentAction(formData: FormData): Promise<void> {
  const agentId = String(formData.get("agentId") ?? "");
  const agent = getAgent(agentId);
  if (!agent) return;

  deleteAgent(agentId);
  addJournalEvent({
    kind: "fired",
    text: t.journalTexts.fired(
      agent.name,
      agent.customRoleLabel ?? t.roles[agent.role],
    ),
  });
  revalidatePath("/pulpit");
  redirect("/agenci");
}
