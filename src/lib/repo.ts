import { db } from "@/lib/db";
import type { PlannedTask } from "@/lib/planner";
import type {
  Agent,
  AgentStatus,
  EngineKey,
  JournalEvent,
  JournalKind,
  Order,
  OrderStatus,
  RoleKey,
  Task,
  TaskStatus,
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

interface OrderRow {
  id: string;
  text: string;
  status: string;
  planner: string;
  created_at: string;
}

interface TaskRow {
  id: string;
  order_id: string;
  agent_id: string;
  title: string;
  description: string;
  depends_on: string;
  status: string;
  sort: number;
  cost_usd: number | null;
  created_at: string;
}

function toOrder(r: OrderRow): Order {
  return {
    id: r.id,
    text: r.text,
    status: r.status as OrderStatus,
    planner: r.planner as Order["planner"],
    createdAt: r.created_at,
  };
}

function toTask(r: TaskRow): Task {
  return {
    id: r.id,
    orderId: r.order_id,
    agentId: r.agent_id,
    title: r.title,
    description: r.description,
    dependsOn: JSON.parse(r.depends_on) as string[],
    status: r.status as TaskStatus,
    sort: r.sort,
    costUsd: r.cost_usd ?? undefined,
    createdAt: r.created_at,
  };
}

export function createOrderWithPlan(input: {
  text: string;
  planner: Order["planner"];
  tasks: PlannedTask[];
}): string {
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  const insert = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, text, status, planner, created_at)
       VALUES (?, ?, 'awaiting_approval', ?, ?)`,
    ).run(orderId, input.text, input.planner, now);
    insertPlanTasks(orderId, input.tasks, now);
  });
  insert();
  return orderId;
}

/** Replaces the proposed tasks of an order with a revised plan. */
export function replaceOrderPlan(
  orderId: string,
  planner: Order["planner"],
  tasks: PlannedTask[],
): void {
  const now = new Date().toISOString();
  const replace = db.transaction(() => {
    db.prepare(`DELETE FROM tasks WHERE order_id = ?`).run(orderId);
    db.prepare(
      `UPDATE orders SET status = 'awaiting_approval', planner = ? WHERE id = ?`,
    ).run(planner, orderId);
    insertPlanTasks(orderId, tasks, now);
  });
  replace();
}

function insertPlanTasks(
  orderId: string,
  tasks: PlannedTask[],
  now: string,
): void {
  // Planned tasks reference each other by index; translate to real IDs.
  const ids = tasks.map(() => crypto.randomUUID());
  const stmt = db.prepare(
    `INSERT INTO tasks (id, order_id, agent_id, title, description, depends_on, status, sort, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'proposed', ?, ?)`,
  );
  tasks.forEach((task, i) => {
    stmt.run(
      ids[i],
      orderId,
      task.agentId,
      task.title,
      task.description,
      JSON.stringify(task.dependsOn.map((d) => ids[d]).filter(Boolean)),
      i,
      now,
    );
  });
}

export function getOrder(id: string): Order | undefined {
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as
    | OrderRow
    | undefined;
  return row ? toOrder(row) : undefined;
}

export function listOrderTasks(orderId: string): Task[] {
  const rows = db
    .prepare(`SELECT * FROM tasks WHERE order_id = ? ORDER BY sort ASC`)
    .all(orderId) as TaskRow[];
  return rows.map(toTask);
}

export function listPendingOrders(): Array<Order & { taskCount: number }> {
  const rows = db
    .prepare(
      `SELECT o.*, COUNT(t.id) AS task_count
       FROM orders o LEFT JOIN tasks t ON t.order_id = o.id
       WHERE o.status = 'awaiting_approval'
       GROUP BY o.id ORDER BY o.created_at DESC`,
    )
    .all() as Array<OrderRow & { task_count: number }>;
  return rows.map((r) => ({ ...toOrder(r), taskCount: r.task_count }));
}

/** Boss approved the plan: tasks with no pending dependencies become queued. */
export function approveOrder(orderId: string): void {
  const approve = db.transaction(() => {
    db.prepare(`UPDATE orders SET status = 'approved' WHERE id = ?`).run(
      orderId,
    );
    db.prepare(
      `UPDATE tasks SET status = 'queued' WHERE order_id = ? AND status = 'proposed'`,
    ).run(orderId);
  });
  approve();
}
