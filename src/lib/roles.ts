import type { AgentStatus, RoleKey } from "@/lib/types";

/** Tailwind theme color names for each role (see globals.css @theme). */
export const roleColor: Record<RoleKey, string> = {
  marketing: "var(--color-role-marketing)",
  developer: "var(--color-role-developer)",
  research: "var(--color-role-research)",
  copywriting: "var(--color-role-copywriting)",
  support: "var(--color-role-support)",
};

export const statusColor: Record<AgentStatus, string> = {
  working: "#7dd87d",
  waiting_for_boss: "#f0a818",
  idle: "#6b5c36",
};

export const statusIsLive = (s: AgentStatus) => s !== "idle";
