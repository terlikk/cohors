import { getEngine } from "@/lib/engines";
import { t } from "@/lib/i18n";
import type { PlannedTask } from "@/lib/planner";
import {
  addJournalEvent,
  addTeamMessage,
  createAgent,
  createOrderWithPlan,
  getAgentOnboarding,
  listAgents,
} from "@/lib/repo";
import type { Agent, ChatMessage, RoleKey } from "@/lib/types";

/**
 * The manager agent ("Szef zespołu"): given a goal from the boss it can
 * hire new agents and lay out a task plan for the whole team. The plan
 * still goes through the boss's approval like any other order.
 */

interface ManagerDecision {
  reply: string;
  hires: Array<{
    name: string;
    role: string;
    customRoleLabel?: string;
    jobDescription: string;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    assignTo: string;
    dependsOn: number[];
  }>;
}

const KNOWN_ROLES: RoleKey[] = [
  "manager",
  "marketing",
  "developer",
  "research",
  "copywriting",
  "support",
];

function buildManagerInstruction(team: Agent[], goal: string): string {
  const roster = team
    .map(
      (a) =>
        `- ${a.name} (${a.customRoleLabel ?? t.roles[a.role]}): ${a.jobDescription}`,
    )
    .join("\n");

  return (
    `The boss just wrote to you:\n"${goal}"\n\n` +
    `Current team:\n${roster || "- (no one yet besides you)"}\n\n` +
    `As the team manager decide what to do. You can hire new agents and assign tasks ` +
    `(to existing team members or to your new hires). If the message is just a question ` +
    `or small talk, simply reply.\n\n` +
    `Respond with ONLY a JSON object, no other text:\n` +
    `{\n` +
    `  "reply": "your short answer to the boss in Polish",\n` +
    `  "hires": [{"name": "...", "role": "marketing|developer|research|copywriting|support|custom", "customRoleLabel": "only when role=custom", "jobDescription": "one sentence in Polish, second person"}],\n` +
    `  "tasks": [{"title": "short Polish title", "description": "what to deliver, Polish, second person", "assignTo": "agent name (existing or newly hired)", "dependsOn": [indices of tasks this depends on]}]\n` +
    `}\n` +
    `Keep hires minimal (0-4) and tasks concrete (0-6). Empty arrays are fine.`
  );
}

function parseDecision(text: string): ManagerDecision | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as ManagerDecision;
    if (typeof parsed.reply !== "string") return null;
    return {
      reply: parsed.reply,
      hires: Array.isArray(parsed.hires) ? parsed.hires : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };
  } catch {
    return null;
  }
}

function mockDecision(goal: string): ManagerDecision {
  return {
    reply: `Przyjąłem cel: „${goal}”. Zatrudniam dwie osoby i rozpisuję plan — czeka na Twoją akceptację.`,
    hires: [
      {
        name: "Karol",
        role: "marketing",
        jobDescription: "Tworzysz reklamy i kreacje pod cele sprzedażowe.",
      },
      {
        name: "Pola",
        role: "custom",
        customRoleLabel: "Publikacja",
        jobDescription: "Publikujesz gotowe kreacje w kanałach firmy.",
      },
    ],
    tasks: [
      {
        title: "Przygotuj kreacje reklamowe",
        description: `Przygotuj komplet reklam pod cel: „${goal}”.`,
        assignTo: "Karol",
        dependsOn: [],
      },
      {
        title: "Zaplanuj publikację kreacji",
        description: "Przygotuj harmonogram i treści publikacji gotowych kreacji.",
        assignTo: "Pola",
        dependsOn: [0],
      },
    ],
  };
}

export async function runManagerPipeline(
  manager: Agent,
  goal: string,
  history: ChatMessage[],
): Promise<{ reply: string; costUsd: number }> {
  let decision: ManagerDecision | null = null;
  let costUsd = 0;

  if (process.env.AGENT_MOCK_ENGINE === "1") {
    decision = mockDecision(goal);
  } else {
    const engine = getEngine(manager.engine);
    const historyPart = history
      .slice(-10)
      .map((m) => `${m.from === "boss" ? "Boss" : manager.name}: ${m.text}`)
      .join("\n");
    const result = await engine.runTask({
      agent: manager,
      onboarding: getAgentOnboarding(manager.id),
      task: {
        title: "Decyzja szefa zespołu",
        description: buildManagerInstruction(
          listAgents().filter((a) => a.id !== manager.id),
          goal,
        ),
      },
      orderText: goal,
      dependencyResults: historyPart
        ? [{ title: "Ostatnie wiadomości", result: historyPart }]
        : [],
    });
    costUsd = result.costUsd;
    decision = parseDecision(result.output);
    if (!decision) return { reply: result.output, costUsd };
  }

  // 1. Hire requested agents.
  const nameToId = new Map(
    listAgents().map((a) => [a.name.toLocaleLowerCase("pl"), a.id]),
  );
  for (const hire of decision.hires) {
    if (!hire.name || !hire.jobDescription) continue;
    if (nameToId.has(hire.name.toLocaleLowerCase("pl"))) continue;
    const role = KNOWN_ROLES.includes(hire.role as RoleKey)
      ? (hire.role as RoleKey)
      : "custom";
    const id = createAgent({
      name: hire.name,
      role,
      customRoleLabel:
        role === "custom" ? (hire.customRoleLabel ?? hire.role) : undefined,
      jobDescription: hire.jobDescription,
      engine: manager.engine,
      monthBudgetUsd: 10,
      onboarding: [],
    });
    nameToId.set(hire.name.toLocaleLowerCase("pl"), id);
    const roleLabel =
      role === "custom" ? (hire.customRoleLabel ?? hire.role) : t.roles[role];
    addJournalEvent({
      agentId: manager.id,
      kind: "hired",
      text: t.journalTexts.managerHired(manager.name, hire.name, roleLabel),
    });
    addTeamMessage({
      agentId: manager.id,
      authorName: manager.name,
      role: "manager",
      text: `Witam w zespole ${hire.name} (${roleLabel}). 👋`,
    });
  }

  // 2. Lay out the plan (still requires the boss's approval).
  const planned: PlannedTask[] = [];
  const plannedIdxByOriginal = new Map<number, number>();
  decision.tasks.forEach((task, originalIdx) => {
    const agentId = nameToId.get(task.assignTo?.toLocaleLowerCase("pl") ?? "");
    if (!agentId || !task.title) return;
    plannedIdxByOriginal.set(originalIdx, planned.length);
    planned.push({
      title: task.title,
      description: task.description || task.title,
      agentId,
      dependsOn: task.dependsOn ?? [],
    });
  });
  // dependsOn indices referenced the original list; remap to the kept one.
  for (const task of planned) {
    task.dependsOn = task.dependsOn
      .map((d) => plannedIdxByOriginal.get(d))
      .filter((d): d is number => d !== undefined);
  }
  if (planned.length > 0) {
    createOrderWithPlan({ text: goal, planner: "llm", tasks: planned });
    addJournalEvent({
      agentId: manager.id,
      kind: "plan_ready",
      text: t.journalTexts.managerPlanned(manager.name, planned.length),
      costUsd: costUsd > 0 ? costUsd : undefined,
    });
    addTeamMessage({
      agentId: manager.id,
      authorName: manager.name,
      role: "manager",
      text: `Cel: „${goal}”. Rozpisałem plan (${planned.length} zad.) — czeka na akceptację szefa, potem ruszamy.`,
    });
  }

  return { reply: decision.reply, costUsd };
}
