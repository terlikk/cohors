import {
  buildTaskPrompt,
  type Engine,
  type EngineTaskInput,
  type EngineTaskResult,
} from "@/lib/engines/types";

/**
 * Custom agent over HTTP: POSTs the task to a user-provided endpoint and
 * expects `{ "output": string, "costUsd"?: number }` back.
 */
export const httpEngine: Engine = {
  key: "http",

  async isAvailable() {
    return true; // availability depends on the per-agent URL, checked at run time
  },

  async runTask(input: EngineTaskInput): Promise<EngineTaskResult> {
    const url = input.agent.engineConfig?.url;
    if (!url) throw new Error("http engine: agent has no endpoint URL");

    const { system, user } = buildTaskPrompt(input);
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agent: {
          name: input.agent.name,
          role: input.agent.role,
          jobDescription: input.agent.jobDescription,
        },
        task: input.task,
        orderText: input.orderText,
        system,
        prompt: user,
      }),
      signal: AbortSignal.timeout(15 * 60_000),
    });
    if (!response.ok) {
      throw new Error(`http engine: endpoint returned ${response.status}`);
    }

    const data = (await response.json()) as {
      output?: string;
      costUsd?: number;
    };
    if (!data.output) throw new Error("http engine: response has no output");
    return { output: data.output, costUsd: data.costUsd ?? 0 };
  },
};
