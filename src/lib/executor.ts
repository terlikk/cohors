import { getEngine } from "@/lib/engines";
import { t } from "@/lib/i18n";
import {
  addJournalEvent,
  getAgent,
  getAgentOnboarding,
  getDependencyResults,
  getOrder,
  lastEventIsBudgetStop,
  listEligibleTasks,
  saveTaskResult,
  setTaskStatus,
} from "@/lib/repo";
import type { Task } from "@/lib/types";

/**
 * The hive's heartbeat: every tick picks up queued tasks whose dependencies
 * are met, runs them through their agent's engine, and delivers results to
 * the boss's approval queue. One task per agent at a time.
 */

const globalForExecutor = globalThis as unknown as {
  __ticking?: boolean;
  __heartbeat?: ReturnType<typeof setInterval>;
};

export async function tick(): Promise<{ started: number }> {
  if (globalForExecutor.__ticking) return { started: 0 };
  globalForExecutor.__ticking = true;

  try {
    const eligible = listEligibleTasks();
    let started = 0;

    for (const task of eligible) {
      const agent = getAgent(task.agentId);
      if (!agent) continue;

      // Budget guard: over the monthly limit the agent stops automatically.
      if (agent.monthCostUsd >= agent.monthBudgetUsd) {
        if (!lastEventIsBudgetStop(agent.id)) {
          addJournalEvent({
            agentId: agent.id,
            kind: "budget_stopped",
            text: t.journalTexts.budgetStopped(
              agent.name,
              agent.monthBudgetUsd,
            ),
          });
        }
        continue;
      }

      started++;
      await runTask(task);
    }

    return { started };
  } finally {
    globalForExecutor.__ticking = false;
  }
}

async function runTask(task: Task): Promise<void> {
  const agent = getAgent(task.agentId);
  const order = getOrder(task.orderId);
  if (!agent || !order) return;

  setTaskStatus(task.id, "running");
  addJournalEvent({
    agentId: agent.id,
    kind: "task_started",
    text: t.journalTexts.taskStarted(agent.name, task.title),
  });

  try {
    const engine = getEngine(agent.engine);
    const result = await engine.runTask({
      agent,
      onboarding: getAgentOnboarding(agent.id),
      task: { title: task.title, description: task.description },
      orderText: order.text,
      dependencyResults: getDependencyResults(task),
      revision:
        task.feedback.length > 0 && task.result
          ? { previousResult: task.result, comments: task.feedback }
          : undefined,
    });

    saveTaskResult(task.id, result.output, result.costUsd);
    addJournalEvent({
      agentId: agent.id,
      kind: "waiting_approval",
      text: t.journalTexts.taskDelivered(agent.name, task.title),
      costUsd: result.costUsd > 0 ? result.costUsd : undefined,
    });
  } catch (err) {
    console.error(`task ${task.id} failed:`, err);
    setTaskStatus(task.id, "failed");
    addJournalEvent({
      agentId: agent.id,
      kind: "task_failed",
      text: t.journalTexts.taskFailed(
        agent.name,
        task.title,
        err instanceof Error ? err.message.slice(0, 120) : "unknown error",
      ),
    });
  }
}

/** Starts the in-process scheduler (self-hosted mode). Idempotent. */
export function startHeartbeat(): void {
  if (globalForExecutor.__heartbeat) return;
  const intervalMs = Number(process.env.HEARTBEAT_MS ?? 15_000);
  globalForExecutor.__heartbeat = setInterval(() => {
    void tick().catch((err) => console.error("heartbeat tick failed:", err));
  }, intervalMs);
  console.log(`agent heartbeat started (every ${intervalMs / 1000}s)`);
}
