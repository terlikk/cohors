import { anthropicEngine } from "@/lib/engines/anthropic";
import { claudeCodeEngine } from "@/lib/engines/claude-code";
import { codexEngine } from "@/lib/engines/codex";
import { httpEngine } from "@/lib/engines/http";
import type { Engine, EngineTaskInput, EngineTaskResult } from "@/lib/engines/types";
import type { EngineKey } from "@/lib/types";

/** Deterministic fake engine for tests and demos (AGENT_MOCK_ENGINE=1). */
const mockEngine: Engine = {
  key: "mock",
  async isAvailable() {
    return true;
  },
  async runTask(input: EngineTaskInput): Promise<EngineTaskResult> {
    await new Promise((r) => setTimeout(r, 500));
    const revisionNote = input.revision
      ? `\n\n(Poprawiona wersja po uwagach szefa: ${input.revision.comments.join("; ")})`
      : "";
    return {
      output: `Przykładowy wynik zadania „${input.task.title}” przygotowany przez ${input.agent.name}.${revisionNote}`,
      costUsd: 0.01,
    };
  },
};

const ENGINES: Record<EngineKey, Engine> = {
  claude_code: claudeCodeEngine,
  anthropic_api: anthropicEngine,
  codex: codexEngine,
  http: httpEngine,
};

export function getEngine(key: EngineKey): Engine {
  if (process.env.AGENT_MOCK_ENGINE === "1") return mockEngine;
  return ENGINES[key];
}

export async function detectEngines(): Promise<Record<EngineKey, boolean>> {
  const entries = await Promise.all(
    (Object.keys(ENGINES) as EngineKey[]).map(
      async (key) => [key, await ENGINES[key].isAvailable()] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<EngineKey, boolean>;
}
