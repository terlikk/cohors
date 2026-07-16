import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Local zero-config store: a single SQLite file in ./data.
 * On Vercel (preview/demo deployments) there is no persistent disk, so we
 * fall back to an in-memory database seeded with demo data.
 */

const IS_DEMO = !!process.env.VERCEL;

function open(): Database.Database {
  let db: Database.Database;
  if (IS_DEMO) {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
  } else {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, "app.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      custom_role_label TEXT,
      job_description TEXT NOT NULL,
      engine TEXT NOT NULL DEFAULT 'claude_code',
      engine_config TEXT,
      status TEXT NOT NULL DEFAULT 'idle',
      current_task TEXT,
      month_budget_usd REAL NOT NULL DEFAULT 10,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_answers (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'awaiting_approval',
      planner TEXT NOT NULL DEFAULT 'heuristic',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      depends_on TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'proposed',
      sort INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL,
      result TEXT,
      feedback TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal (
      id TEXT PRIMARY KEY,
      at TEXT NOT NULL,
      agent_id TEXT,
      kind TEXT NOT NULL,
      text TEXT NOT NULL,
      cost_usd REAL
    );
  `);

  if (IS_DEMO) seedDemo(db);
  return db;
}

function seedDemo(db: Database.Database) {
  const now = new Date().toISOString();
  const insertAgent = db.prepare(
    `INSERT INTO agents (id, name, role, job_description, engine, status, current_task, month_budget_usd, created_at)
     VALUES (@id, @name, @role, @job, @engine, @status, @task, @budget, @created)`,
  );
  const agents = [
    {
      id: "demo-a1",
      name: "Marysia",
      role: "marketing",
      job: "Prowadzisz nasz Instagram, ton luźny, wszystko pokazujesz przed publikacją.",
      engine: "anthropic_api",
      status: "working",
      task: "Kampania przed czwartkową premierą",
      budget: 20,
      created: now,
    },
    {
      id: "demo-a2",
      name: "Bartek",
      role: "developer",
      job: "Dbasz o jakość kodu aplikacji i naprawiasz zgłoszone błędy.",
      engine: "claude_code",
      status: "waiting_for_boss",
      task: "Poprawka błędu logowania — gotowa do odbioru",
      budget: 40,
      created: now,
    },
    {
      id: "demo-a3",
      name: "Ola",
      role: "research",
      job: "Śledzisz konkurencję i trendy, raportujesz krótko i konkretnie.",
      engine: "anthropic_api",
      status: "working",
      task: "Analiza konkurencji: 5 podobnych aplikacji",
      budget: 15,
      created: now,
    },
  ];
  for (const a of agents) insertAgent.run(a);

  const insertEvent = db.prepare(
    `INSERT INTO journal (id, at, agent_id, kind, text, cost_usd)
     VALUES (@id, @at, @agentId, @kind, @text, @cost)`,
  );
  const events = [
    {
      id: "demo-e1",
      at: now,
      agentId: "demo-a2",
      kind: "waiting_approval",
      text: "Bartek zgłosił poprawkę logowania do odbioru",
      cost: 0.36,
    },
    {
      id: "demo-e2",
      at: now,
      agentId: "demo-a3",
      kind: "task_started",
      text: "Ola zaczęła analizę konkurencji (5 aplikacji)",
      cost: null,
    },
    {
      id: "demo-e3",
      at: now,
      agentId: null,
      kind: "approved",
      text: "Szef zatwierdził plan: „Premiera w czwartek” (4 zadania, 3 agentów)",
      cost: null,
    },
  ];
  for (const e of events) insertEvent.run(e);
}

/** Survive Next.js dev-mode module reloads with a single connection. */
const globalForDb = globalThis as unknown as { __db?: Database.Database };

export const db: Database.Database = globalForDb.__db ?? open();
globalForDb.__db = db;

export const isDemo = IS_DEMO;
