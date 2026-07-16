import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Worker bees — the AI agents in the hive.
 * A worker's ROLE (marketing, dev, ...) is decoupled from its ENGINE (the
 * "brain": anthropic / claude-code / codex / http) so brains can be swapped
 * without losing the role, persona or history.
 */
export const workers = sqliteTable("workers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // RoleKey
  /** Free-text job description written by the beekeeper. */
  jobDescription: text("job_description").notNull().default(""),
  /** Context the worker built during onboarding (JSON: answers, notes). */
  context: text("context").notNull().default("{}"),
  /** Engine type: "anthropic" | "claude-code" | "codex" | "http". */
  engineType: text("engine_type").notNull().default("anthropic"),
  /** Engine-specific config (JSON: model, endpoint, etc.). */
  engineConfig: text("engine_config").notNull().default("{}"),
  status: text("status").notNull().default("onboarding"), // WorkerStatus
  /** Monthly spending cap in USD. */
  monthlyBudgetUsd: real("monthly_budget_usd").notNull().default(10),
  /** USD spent in the current budget period. */
  spentUsd: real("spent_usd").notNull().default(0),
  createdAt: integer("created_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Orders — a plain-language command from the beekeeper to the whole hive.
 * The planner decomposes an order into tasks; the beekeeper approves the plan
 * before anything runs.
 */
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  rawText: text("raw_text").notNull(),
  /** "planning" | "awaiting_plan_approval" | "running" | "done" | "cancelled". */
  status: text("status").notNull().default("planning"),
  /** The proposed plan (JSON) before/after approval. */
  plan: text("plan"),
  createdAt: integer("created_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Tasks — a unit of work assigned to a single worker. Tasks may depend on other
 * tasks (dependsOn), so research output can flow into a marketing task.
 */
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  orderId: text("order_id"), // null for direct messages to one worker
  workerId: text("worker_id"),
  title: text("title").notNull(),
  instructions: text("instructions").notNull().default(""),
  status: text("status").notNull().default("pending"), // TaskStatus
  /** JSON array of task ids this task depends on. */
  dependsOn: text("depends_on").notNull().default("[]"),
  /** The worker's produced result (text / JSON). */
  result: text("result"),
  /** Beekeeper feedback when a result is sent back for revision. */
  feedback: text("feedback"),
  costUsd: real("cost_usd").notNull().default(0),
  createdAt: integer("created_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Events — the live journal of the hive. Everything that happens leaves a trace
 * here: hires, task starts/finishes, approvals, costs, budget stops.
 */
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  workerId: text("worker_id"),
  taskId: text("task_id"),
  message: text("message").notNull(),
  costUsd: real("cost_usd").notNull().default(0),
  createdAt: integer("created_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Worker = typeof workers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Event = typeof events.$inferSelect;
