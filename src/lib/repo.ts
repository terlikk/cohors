import { db } from "@/lib/db";
import type {
  Agent,
  AgentStatus,
  EngineKey,
  JournalEvent,
  JournalKind,
  RoleKey,
} from "@/lib/types";

interface AgentRow {
  id: string;
  name: string;
  role: string;
  custom_role_label: string | null;
  job_description: string;
  engine: string;
  status: string;
  current_task: string | null;
  month_budget_usd: number;
  created_at: string;
}

interface JournalRow {
  id: string;
  at: string;
  agent_id: string | null;
  kind: string;
  text: string;
  cost_usd: number | null;
}

function toAgent(r: AgentRow): Agent {
  return {
    id: r.id,
    name: r.name,
    role: r.role as RoleKey,
    customRoleLabel: r.custom_role_label ?? undefined,
    jobDescription: r.job_description,
    engine: r.engine as EngineKey,
    status: r.status as AgentStatus,
    currentTask: r.current_task ?? undefined,
    monthCostUsd: monthCost(r.id),
    monthBudgetUsd: r.month_budget_usd,
  };
}

function monthCost(agentId: string): number {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(cost_usd), 0) AS total
       FROM journal WHERE agent_id = ? AND at >= ? AND cost_usd IS NOT NULL`,
    )
    .get(agentId, monthStart.toISOString()) as { total: number };
  return row.total;
}

export function listAgents(): Agent[] {
  const rows = db
    .prepare(`SELECT * FROM agents ORDER BY created_at ASC`)
    .all() as AgentRow[];
  return rows.map(toAgent);
}

export function listJournal(limit = 30): JournalEvent[] {
  const rows = db
    .prepare(`SELECT * FROM journal ORDER BY at DESC, rowid DESC LIMIT ?`)
    .all(limit) as JournalRow[];
  return rows.map((r) => ({
    id: r.id,
    at: r.at,
    agentId: r.agent_id ?? undefined,
    kind: r.kind as JournalKind,
    text: r.text,
    costUsd: r.cost_usd ?? undefined,
  }));
}

export function addJournalEvent(input: {
  agentId?: string;
  kind: JournalKind;
  text: string;
  costUsd?: number;
}): void {
  db.prepare(
    `INSERT INTO journal (id, at, agent_id, kind, text, cost_usd)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    new Date().toISOString(),
    input.agentId ?? null,
    input.kind,
    input.text,
    input.costUsd ?? null,
  );
}

export function createAgent(input: {
  name: string;
  role: RoleKey | "custom";
  customRoleLabel?: string;
  jobDescription: string;
  engine: EngineKey;
  monthBudgetUsd: number;
  onboarding: Array<{ question: string; answer: string }>;
}): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const insert = db.transaction(() => {
    db.prepare(
      `INSERT INTO agents (id, name, role, custom_role_label, job_description, engine, status, month_budget_usd, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'idle', ?, ?)`,
    ).run(
      id,
      input.name,
      input.role,
      input.customRoleLabel ?? null,
      input.jobDescription,
      input.engine,
      input.monthBudgetUsd,
      now,
    );

    const answerStmt = db.prepare(
      `INSERT INTO agent_answers (id, agent_id, question, answer, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    );
    for (const qa of input.onboarding) {
      if (qa.answer.trim() === "") continue;
      answerStmt.run(crypto.randomUUID(), id, qa.question, qa.answer, now);
    }
  });
  insert();

  return id;
}
