import Anthropic from "@anthropic-ai/sdk";
import { estimateCostUsd } from "@/lib/planner";
import {
  buildTaskPrompt,
  type Engine,
  type EngineTaskInput,
  type EngineTaskResult,
} from "@/lib/engines/types";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

/** Direct Anthropic API — paste a key and it works. Ideal for office roles. */
export const anthropicEngine: Engine = {
  key: "anthropic_api",

  async isAvailable() {
    return !!(
      process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
    );
  },

  async runTask(input: EngineTaskInput): Promise<EngineTaskResult> {
    const client = new Anthropic();
    const { system, user } = buildTaskPrompt(input);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const output = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!output) throw new Error("anthropic engine: empty response");

    return {
      output,
      costUsd: estimateCostUsd(
        MODEL,
        response.usage.input_tokens +
          (response.usage.cache_creation_input_tokens ?? 0),
        response.usage.output_tokens,
      ),
    };
  },
};
