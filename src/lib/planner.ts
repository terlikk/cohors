import Anthropic from "@anthropic-ai/sdk";
import { t } from "@/lib/i18n";
import type { Agent } from "@/lib/types";

/**
 * Turns a plain-language order from the boss into a task plan assigned to
 * the hired agents. Two strategies:
 *
 * - LLM planner (Anthropic API, structured outputs) when credentials are
 *   available — understands arbitrary orders and dependencies.
 * - Heuristic planner as an always-working fallback — keyword-based role
 *   matching so the product remains usable without any API key.
 *
 * Orders addressed to a single agent by name ("Bartek, napraw błąd
 * logowania") skip decomposition entirely.
 */

export interface PlannedTask {
  title: string;
  description: string;
  agentId: string;
  /** Indices into the returned task list. */
  dependsOn: number[];
}

export interface PlanResult {
  tasks: PlannedTask[];
  planner: "llm" | "heuristic" | "direct";
  costUsd: number;
}

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

/** USD per 1M tokens (input, output). */
const PRICING: Record<string, { in: number; out: number }> = {
  "claude-opus-4-8": { in: 5, out: 25 },
  "claude-opus-4-7": { in: 5, out: 25 },
  "claude-sonnet-5": { in: 3, out: 15 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-haiku-4-5": { in: 1, out: 5 },
};

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = PRICING[model] ?? PRICING["claude-opus-4-8"];
  return (inputTokens * p.in + outputTokens * p.out) / 1_000_000;
}

function hasAnthropicAuth(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/** "Bartek, napraw błąd logowania" → task for Bartek, no decomposition. */
function detectDirectOrder(text: string, agents: Agent[]): PlanResult | null {
  const m = text.match(/^\s*([\p{L}][\p{L}\d_-]*)\s*[,:–—]\s*(.{3,})$/su);
  if (!m) return null;
  const agent = agents.find(
    (a) => a.name.toLocaleLowerCase("pl") === m[1].toLocaleLowerCase("pl"),
  );
  if (!agent) return null;
  const rest = m[2].trim();
  return {
    planner: "direct",
    costUsd: 0,
    tasks: [
      {
        title: rest.length > 60 ? `${rest.slice(0, 57)}…` : rest,
        description: rest,
        agentId: agent.id,
        dependsOn: [],
      },
    ],
  };
}

/** Keyword → role matching so the loop works without any API key. */
function planHeuristic(text: string, agents: Agent[]): PlanResult {
  const lower = text.toLocaleLowerCase("pl");
  const roleKeywords: Array<{ role: string; words: string[] }> = [
    {
      role: "marketing",
      words: ["promocj", "kampani", "marketing", "social", "instagram", "reklam", "post"],
    },
    {
      role: "developer",
      words: ["technikali", "test", "kod", "błąd", "błęd", "bug", "wdroż", "deploy", "aplikacj"],
    },
    {
      role: "research",
      words: ["konkurencj", "analiz", "research", "trend", "rynek", "raport"],
    },
    {
      role: "copywriting",
      words: ["newsletter", "tekst", "artykuł", "opis", "mail", "treść"],
    },
    {
      role: "support",
      words: ["klient", "support", "pytani", "faq", "zgłoszeni"],
    },
  ];

  const tasks: PlannedTask[] = [];
  let researchIdx = -1;

  for (const { role, words } of roleKeywords) {
    if (!words.some((w) => lower.includes(w))) continue;
    const agent = agents.find((a) => a.role === role);
    if (!agent) continue;
    const idx = tasks.length;
    if (role === "research") researchIdx = idx;
    tasks.push({
      title: t.planner.heuristicTaskTitle[role as keyof typeof t.planner.heuristicTaskTitle],
      description: t.planner.heuristicTaskDescription(text),
      agentId: agent.id,
      dependsOn: [],
    });
  }

  // Research output feeds creative work, mirroring how a real team works.
  if (researchIdx >= 0) {
    for (let i = 0; i < tasks.length; i++) {
      const role = agents.find((a) => a.id === tasks[i].agentId)?.role;
      if (role === "marketing" || role === "copywriting") {
        tasks[i].dependsOn.push(researchIdx);
      }
    }
  }

  if (tasks.length === 0) {
    tasks.push({
      title: text.length > 60 ? `${text.slice(0, 57)}…` : text,
      description: t.planner.heuristicTaskDescription(text),
      agentId: agents[0].id,
      dependsOn: [],
    });
  }

  return { tasks, planner: "heuristic", costUsd: 0 };
}

async function planWithClaude(
  text: string,
  agents: Agent[],
  feedback?: { previousPlan: string; comment: string },
): Promise<PlanResult> {
  const client = new Anthropic();

  const roster = agents
    .map(
      (a, i) =>
        `${i}. ${a.name} — ${a.customRoleLabel ?? t.roles[a.role]}. Job description: "${a.jobDescription}"`,
    )
    .join("\n");

  const schema = {
    type: "object",
    properties: {
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short task title in Polish" },
            description: {
              type: "string",
              description:
                "What exactly the agent should do and deliver, in Polish, second person",
            },
            agentIndex: {
              type: "integer",
              description: "Index of the assigned agent from the roster",
            },
            dependsOn: {
              type: "array",
              items: { type: "integer" },
              description:
                "Indices of tasks in this list whose results this task needs",
            },
          },
          required: ["title", "description", "agentIndex", "dependsOn"],
          additionalProperties: false,
        },
      },
    },
    required: ["tasks"],
    additionalProperties: false,
  } as const;

  const feedbackPart = feedback
    ? `\n\nThe boss reviewed a previous version of the plan and requested changes.\nPrevious plan:\n${feedback.previousPlan}\nBoss's comment: "${feedback.comment}"\nProduce a revised plan that addresses the comment.`
    : "";

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    output_config: {
      format: { type: "json_schema", schema },
    },
    system:
      "You are the operations coordinator of a small company whose workers are AI agents. " +
      "You break the boss's plain-language order into concrete tasks and assign each task " +
      "to the most suitable agent from the roster. Rules: use only agents from the roster; " +
      "keep the plan minimal (1-6 tasks); express dependencies when one task genuinely needs " +
      "another task's output; write titles and descriptions in Polish, addressing the agent " +
      "in second person.",
    messages: [
      {
        role: "user",
        content: `Agent roster:\n${roster}\n\nBoss's order:\n"${text}"${feedbackPart}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("planner: no text block in response");
  }
  const parsed = JSON.parse(textBlock.text) as {
    tasks: Array<{
      title: string;
      description: string;
      agentIndex: number;
      dependsOn: number[];
    }>;
  };

  const tasks: PlannedTask[] = parsed.tasks
    .filter((task) => agents[task.agentIndex])
    .map((task) => ({
      title: task.title,
      description: task.description,
      agentId: agents[task.agentIndex].id,
      dependsOn: task.dependsOn.filter(
        (d) => d >= 0 && d < parsed.tasks.length,
      ),
    }));

  if (tasks.length === 0) throw new Error("planner: empty plan");

  return {
    tasks,
    planner: "llm",
    costUsd: estimateCostUsd(
      DEFAULT_MODEL,
      response.usage.input_tokens,
      response.usage.output_tokens,
    ),
  };
}

export async function planOrder(
  text: string,
  agents: Agent[],
  feedback?: { previousPlan: string; comment: string },
): Promise<PlanResult> {
  const direct = detectDirectOrder(text, agents);
  if (direct) return direct;

  if (hasAnthropicAuth()) {
    try {
      return await planWithClaude(text, agents, feedback);
    } catch (err) {
      console.error("LLM planner failed, falling back to heuristic:", err);
    }
  }
  return planHeuristic(text, agents);
}
