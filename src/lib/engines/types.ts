import type { Agent, EngineKey } from "@/lib/types";
import { toolsForRole } from "@/lib/tools";

/** Everything an engine needs to do one unit of an agent's work. */
export interface EngineTaskInput {
  agent: Agent;
  /** Onboarding Q&A collected when the agent was hired. */
  onboarding: Array<{ question: string; answer: string }>;
  task: { title: string; description: string };
  /** The original boss order this task came from. */
  orderText: string;
  /** Approved results of tasks this one depends on. */
  dependencyResults: Array<{ title: string; result: string }>;
  /** Previous attempt + boss comments when the boss requested changes. */
  revision?: { previousResult: string; comments: string[] };
}

export interface EngineTaskResult {
  /** The deliverable, shown to the boss for approval. */
  output: string;
  /** Real or estimated cost of this run in USD. */
  costUsd: number;
}

export interface Engine {
  key: EngineKey | "mock";
  /** Whether this engine can run on this machine right now. */
  isAvailable(): Promise<boolean>;
  runTask(input: EngineTaskInput): Promise<EngineTaskResult>;
}

/** Shared prompt builder so every engine gets the same persona and context. */
export function buildTaskPrompt(input: EngineTaskInput): {
  system: string;
  user: string;
} {
  const { agent, onboarding, task, orderText, dependencyResults, revision } =
    input;

  const onboardingPart =
    onboarding.length > 0
      ? `\n\nCompany context from your onboarding:\n${onboarding
          .map((qa) => `- ${qa.question} → ${qa.answer}`)
          .join("\n")}`
      : "";

  const tools = toolsForRole(agent.role);
  const toolsPart =
    tools.length > 0
      ? `\n\nTools you can use — use them for real to do the work: ${tools
          .map((t) => `${t.label} (${t.hint})`)
          .join("; ")}. ` +
        `When you create files, save them in your current working directory so the boss can download them.`
      : "";

  const system =
    `You are ${agent.name}, an employee of a small company. ` +
    `Your job description, written by the boss: "${agent.jobDescription}". ` +
    `You work independently and deliver finished work for the boss to review. ` +
    `Nothing you produce is published or deployed automatically — the boss approves everything first, ` +
    `so always produce the complete, final deliverable (not a plan of what you would do). ` +
    `Write the deliverable in Polish unless the task clearly requires another language.` +
    toolsPart +
    onboardingPart;

  const depsPart =
    dependencyResults.length > 0
      ? `\n\nMaterials from your teammates (already approved by the boss):\n${dependencyResults
          .map((d) => `### ${d.title}\n${d.result}`)
          .join("\n\n")}`
      : "";

  const revisionPart = revision
    ? `\n\nYou already submitted a version of this deliverable and the boss sent it back.\nYour previous version:\n---\n${revision.previousResult}\n---\nBoss's comments (address all of them):\n${revision.comments
        .map((c) => `- ${c}`)
        .join("\n")}`
    : "";

  const user =
    `The boss's original order: "${orderText}"\n\n` +
    `Your task: ${task.title}\n${task.description}` +
    depsPart +
    revisionPart +
    `\n\nDeliver the finished work now.`;

  return { system, user };
}
