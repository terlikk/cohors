import type { AgentStatus, RoleKey } from "@/lib/types";

/** Theme colors for each role (see globals.css @theme). */
export const roleColor: Record<RoleKey, string> = {
  marketing: "var(--color-role-marketing)",
  developer: "var(--color-role-developer)",
  research: "var(--color-role-research)",
  copywriting: "var(--color-role-copywriting)",
  support: "var(--color-role-support)",
  custom: "var(--color-accent)",
};

export const statusColor: Record<AgentStatus, string> = {
  working: "#34c759",
  waiting_for_boss: "#ff9500",
  idle: "#c7c7cc",
};

export const statusIsLive = (s: AgentStatus) => s !== "idle";
