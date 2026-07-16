import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Zero-config database.
 *
 * The SQLite file is created automatically on first run and the schema is
 * bootstrapped with `CREATE TABLE IF NOT EXISTS`, so a non-technical user never
 * has to run migrations or stand up a database server — starting the app is
 * enough.
 */

const DB_PATH = process.env.APIARY_DB_PATH ?? "./data/apiary.db";

function bootstrap(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      job_description TEXT NOT NULL DEFAULT '',
      context TEXT NOT NULL DEFAULT '{}',
      engine_type TEXT NOT NULL DEFAULT 'anthropic',
      engine_config TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'onboarding',
      monthly_budget_usd REAL NOT NULL DEFAULT 10,
      spent_usd REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      raw_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planning',
      plan TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      worker_id TEXT,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      depends_on TEXT NOT NULL DEFAULT '[]',
      result TEXT,
      feedback TEXT,
      cost_usd REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      worker_id TEXT,
      task_id TEXT,
      message TEXT NOT NULL,
      cost_usd REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_worker ON tasks (worker_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
    CREATE INDEX IF NOT EXISTS idx_events_created ON events (created_at);
  `);
}

// Reuse a single connection across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  __apiaryDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function createDb() {
  if (!existsSync(dirname(DB_PATH))) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
  }
  const sqlite = new Database(DB_PATH);
  bootstrap(sqlite);
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.__apiaryDb ?? createDb();
if (process.env.NODE_ENV !== "production") {
  globalForDb.__apiaryDb = db;
}

export { schema };
