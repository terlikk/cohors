import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  buildTaskPrompt,
  type Engine,
  type EngineTaskInput,
  type EngineTaskResult,
} from "@/lib/engines/types";

const execFileAsync = promisify(execFile);

/**
 * Codex CLI as an agent brain (experimental): works when the user has
 * `codex` installed and logged in with their ChatGPT account. Cost is not
 * reported by the CLI, so it is tracked as 0 with usage visible in the
 * user's OpenAI account.
 */
export const codexEngine: Engine = {
  key: "codex",

  async isAvailable() {
    try {
      await execFileAsync("codex", ["--version"], { timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  },

  async runTask(input: EngineTaskInput): Promise<EngineTaskResult> {
    const { system, user } = buildTaskPrompt(input);

    const { stdout } = await execFileAsync(
      "codex",
      ["exec", "--skip-git-repo-check", `${system}\n\n${user}`],
      { timeout: 15 * 60_000, maxBuffer: 32 * 1024 * 1024 },
    );

    const output = stdout.trim();
    if (!output) throw new Error("codex engine: empty output");
    return { output, costUsd: 0 };
  },
};
