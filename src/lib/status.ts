/** Shared status vocabularies for worker bees and their tasks. */

export type WorkerStatus =
  | "onboarding" // just hired, still asking questions
  | "free" // idle, waiting for work
  | "working" // executing a task
  | "waiting" // produced a result, waiting for the beekeeper
  | "stopped"; // budget exceeded or manually paused

export type TaskStatus =
  | "pending" // created, dependencies not yet satisfied
  | "ready" // dependencies satisfied, waiting for a heartbeat
  | "running" // an engine is executing it
  | "awaiting_approval" // result produced, needs the beekeeper's decision
  | "approved" // beekeeper said "Dawaj"
  | "rejected" // sent back with feedback
  | "done"; // fully finished

/** Status dot colors used across the hive. */
export const STATUS_DOT: Record<WorkerStatus, string> = {
  onboarding: "#6FC9E8",
  free: "#5A4B28", // dim / at rest
  working: "#7DD87D", // green — working
  waiting: "#F0A818", // honey — waiting for you
  stopped: "#F07050", // red — stopped
};

export const WORKER_STATUS_LABEL: Record<WorkerStatus, string> = {
  onboarding: "Wdrożenie",
  free: "Wolna",
  working: "Pracuje",
  waiting: "Czeka na ciebie",
  stopped: "Zatrzymana",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Oczekuje",
  ready: "Gotowe do pracy",
  running: "W toku",
  awaiting_approval: "Czeka na pszczelarza",
  approved: "Zatwierdzone",
  rejected: "Do poprawy",
  done: "Zrobione",
};
