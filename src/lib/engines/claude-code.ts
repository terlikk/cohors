import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  buildTaskPrompt,
  type Engine,
  type EngineTaskInput,
  type EngineTaskResult,
} from "@/lib/engines/types";

const execFileAsync = promisify(execFile);

/** Where Claude Code agents work — kept away from this app's own code. */
function workspaceDir(agentId: string): string {
  const dir = path.join(process.cwd(), "data", "workspace", agentId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Claude Code as an agent brain: zero-config if the user already has the
 * CLI installed and logged in with their subscription. Runs headless
 * (`claude -p`) and reports real cost from the CLI's JSON result.
 */
export const claudeCodeEngine: Engine = {
  key: "claude_code",

  async isAvailable() {
    try {
      await execFileAsync("claude", ["--version"], { timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  },

  async runTask(input: EngineTaskInput): Promise<EngineTaskResult> {
    const { system, user } = buildTaskPrompt(input);

    const { stdout } = await execFileAsync(
      "claude",
      [
        "-p",
        user,
        "--append-system-prompt",
        system,
        "--output-format",
        "json",
      ],
      {
        cwd: workspaceDir(input.agent.id),
        timeout: 15 * 60_000,
        maxBuffer: 32 * 1024 * 1024,
      },
    );

    const parsed = JSON.parse(stdout) as {
      is_error?: boolean;
      result?: string;
      total_cost_usd?: number;
    };
    if (parsed.is_error || !parsed.result) {
      throw new Error(`claude code engine: ${parsed.result ?? "no result"}`);
    }

    return { output: parsed.result.trim(), costUsd: parsed.total_cost_usd ?? 0 };
  },
};
