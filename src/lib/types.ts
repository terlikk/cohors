export type RoleKey =
  | "marketing"
  | "developer"
  | "research"
  | "copywriting"
  | "support";

export type AgentStatus = "working" | "waiting_for_boss" | "idle";

export interface Agent {
  id: string;
  name: string;
  role: RoleKey;
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

export type JournalKind =
  | "task_started"
  | "task_finished"
  | "waiting_approval"
  | "approved"
  | "changes_requested"
  | "hired";

export interface JournalEvent {
  id: string;
  at: string;
  agentId?: string;
  kind: JournalKind;
  text: string;
  costUsd?: number;
}
