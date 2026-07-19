import { getEngine } from "@/lib/engines";
import { t } from "@/lib/i18n";
import { runManagerPipeline } from "@/lib/manager";
import {
  addJournalEvent,
  addMessage,
  addTeamMessage,
  getAgent,
  getAgentOnboarding,
  getDependencyResults,
  getLatestTeamMessage,
  getOrder,
  lastEventIsBudgetStop,
  listAgents,
  listAgentsAwaitingChatReply,
  listAgentTasks,
  listEligibleTasks,
  listMessages,
  listTeamMessages,
  saveTaskResult,
  setTaskStatus,
} from "@/lib/repo";
import type { Agent, Task } from "@/lib/types";

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

    // Chat: reply to every agent whose newest message is from the boss.
    for (const agentId of listAgentsAwaitingChatReply()) {
      const agent = getAgent(agentId);
      if (!agent) continue;
      if (agent.monthCostUsd >= agent.monthBudgetUsd) {
        if (!lastEventIsBudgetStop(agent.id)) {
          addJournalEvent({
            agentId: agent.id,
            kind: "budget_stopped",
            text: t.journalTexts.budgetStopped(agent.name, agent.monthBudgetUsd),
          });
        }
        continue;
      }
      started++;
      await replyInChat(agent);
    }

    // Team channel: if the boss's message is the newest, an agent replies.
    const responder = pickTeamResponder();
    if (responder && responder.monthCostUsd < responder.monthBudgetUsd) {
      started++;
      await replyInTeamChannel(responder);
    }

    return { started };
  } finally {
    globalForExecutor.__ticking = false;
  }
}

/** Who should answer on the team channel — null if no reply is due. */
function pickTeamResponder(): Agent | null {
  const last = getLatestTeamMessage();
  if (!last || last.agentId !== null) return null; // newest isn't from the boss
  const agents = listAgents();
  if (agents.length === 0) return null;
  // Directly addressed by name? ("Celina, ...") → that agent answers.
  const addressed = agents.find((a) =>
    new RegExp(`(^|\\s)${a.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      last.text.slice(0, 40),
    ),
  );
  return addressed ?? agents.find((a) => a.role === "manager") ?? agents[0];
}

async function replyInTeamChannel(agent: Agent): Promise<void> {
  const history = listTeamMessages(16);
  const lastBoss = [...history].reverse().find((m) => m.agentId === null);
  if (!lastBoss) return;

  const historyPart = history
    .map((m) => `${m.authorName}: ${m.text}`)
    .join("\n");

  try {
    const engine = getEngine(agent.engine);
    const result = await engine.runTask({
      agent,
      onboarding: getAgentOnboarding(agent.id),
      task: {
        title: "Odpowiedź na czacie zespołu",
        description:
          `You are ${agent.name}, in the team's group chat with the boss and other agents. ` +
          `The boss just wrote: "${lastBoss.text}". Reply briefly and naturally in Polish (1-2 sentences), ` +
          `as this agent talking in a team channel. If the boss gives you something to do, acknowledge it ` +
          `and say you'll take care of it. Do not repeat the message back.\n\nRecent channel:\n${historyPart}`,
      },
      orderText: lastBoss.text,
      dependencyResults: [],
    });

    addTeamMessage({
      agentId: agent.id,
      authorName: agent.name,
      role: agent.role,
      text: result.output.trim(),
    });
    if (result.costUsd > 0) {
      addJournalEvent({
        agentId: agent.id,
        kind: "chat",
        text: t.journalTexts.chatCost(agent.name),
        costUsd: result.costUsd,
      });
    }
  } catch (err) {
    console.error(`team-channel reply for agent ${agent.id} failed:`, err);
  }
}

async function replyInChat(agent: Agent): Promise<void> {
  const history = listMessages(agent.id, 20);
  const lastBoss = [...history].reverse().find((m) => m.from === "boss");
  if (!lastBoss) return;

  try {
    let reply: string;
    let costUsd: number;

    if (agent.role === "manager") {
      ({ reply, costUsd } = await runManagerPipeline(
        agent,
        lastBoss.text,
        history,
      ));
    } else {
      const tasksSummary = listAgentTasks(agent.id, 6)
        .map((task) => `- ${task.title}: ${t.plan.taskStatuses[task.status]}`)
        .join("\n");
      const historyPart = history
        .slice(-10)
        .map((m) => `${m.from === "boss" ? "Boss" : agent.name}: ${m.text}`)
        .join("\n");
      const engine = getEngine(agent.engine);
      const result = await engine.runTask({
        agent,
        onboarding: getAgentOnboarding(agent.id),
        task: {
          title: "Odpowiedz szefowi na czacie",
          description:
            `The boss wrote to you in the team chat. Reply briefly and concretely in Polish, ` +
            `like an employee reporting to their boss. If asked for a report or status, use ` +
            `your task list below.\n\nYour recent tasks:\n${tasksSummary || "- (none yet)"}\n\n` +
            `Recent conversation:\n${historyPart}`,
        },
        orderText: lastBoss.text,
        dependencyResults: [],
      });
      reply = result.output;
      costUsd = result.costUsd;
    }

    addMessage(agent.id, "agent", reply);
    if (costUsd > 0) {
      addJournalEvent({
        agentId: agent.id,
        kind: "chat",
        text: t.journalTexts.chatCost(agent.name),
        costUsd,
      });
    }
  } catch (err) {
    console.error(`chat reply for agent ${agent.id} failed:`, err);
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
  addTeamMessage({
    agentId: agent.id,
    authorName: agent.name,
    role: agent.role,
    text: `Zaczynam: „${task.title}”.`,
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
    addMessage(
      agent.id,
      "agent",
      t.journalTexts.taskDelivered(agent.name, task.title).replace(`${agent.name} `, "") ,
    );
    addJournalEvent({
      agentId: agent.id,
      kind: "waiting_approval",
      text: t.journalTexts.taskDelivered(agent.name, task.title),
      costUsd: result.costUsd > 0 ? result.costUsd : undefined,
    });
    addTeamMessage({
      agentId: agent.id,
      authorName: agent.name,
      role: agent.role,
      text: `Oddałem do odbioru: „${task.title}”. Czeka na akceptację szefa.`,
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
