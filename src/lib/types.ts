export type RoleKey =
  | "marketing"
  | "developer"
  | "research"
  | "copywriting"
  | "support"
  | "custom";

export type AgentStatus = "working" | "waiting_for_boss" | "idle";

/** Which "brain" executes the agent's work. */
export type EngineKey = "claude_code" | "anthropic_api" | "codex" | "http";

export interface Agent {
  id: string;
  name: string;
  role: RoleKey;
  /** Label of a user-defined role when role === "custom". */
  customRoleLabel?: string;
  /** Plain-language job description written by the boss when hiring. */
  jobDescription: string;
  engine: EngineKey;
  status: AgentStatus;
  /** What the agent is doing right now, in the UI language. */
  currentTask?: string;
  /** Cost spent this month, in USD. */
  monthCostUsd: number;
  /** Monthly budget limit, in USD. */
  monthBudgetUsd: number;
}

export interface Approval {
  id: string;
  agentId: string;
  /** Short title of the deliverable waiting for the boss. */
  title: string;
  /** Preview of what the agent wants to ship. */
  preview: string;
  createdAt: string;
}

export type OrderStatus = "awaiting_approval" | "approved" | "rejected";

export type TaskStatus =
  | "proposed"
  | "queued"
  | "running"
  | "awaiting_approval"
  | "done"
  | "failed";

export interface Order {
  id: string;
  text: string;
  status: OrderStatus;
  /** Which planner produced the current plan. */
  planner: "llm" | "heuristic" | "direct";
  createdAt: string;
}

export interface Task {
  id: string;
  orderId: string;
  agentId: string;
  title: string;
  description: string;
  /** IDs of tasks that must finish before this one starts. */
  dependsOn: string[];
  status: TaskStatus;
  sort: number;
  costUsd?: number;
  createdAt: string;
}

export type JournalKind =
  | "order_submitted"
  | "plan_ready"
  | "plan_approved"
  | "plan_changes"
  | "task_started"
  | "task_finished"
  | "waiting_approval"
  | "approved"
  | "changes_requested"
  | "hired";

export interface JournalEvent {
  id: string;
  /** ISO timestamp. */
  at: string;
  agentId?: string;
  kind: JournalKind;
  text: string;
  costUsd?: number;
}
