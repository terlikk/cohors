# Cohors

> **Cohors** — your team of AI agents.

An open-source system for running a **team of AI agents** the way you run a
small company: you hire workers with roles, give orders in plain language,
and approve everything before it goes out into the world. No technical
configuration — hiring, talking, approving. Everything else happens by
itself.

**Interface language: Polish** (i18n-ready). Code and docs: English.

## What works today

- **Hiring like recruitment** — pick a role template (marketing, developer,
  research, copywriting, support, or custom), give the agent a name and a
  one-sentence job description; the agent asks its own onboarding questions
  like a new employee on day one.
- **Orders in plain language** — one input box for the whole team. The
  planner breaks an order into tasks with dependencies and assigns them to
  the right agents; you approve the plan ("Dawaj / Zmień") before anyone
  starts. Address one agent directly ("Bartek, napraw błąd logowania") to
  skip decomposition.
- **Agents actually work** — a heartbeat picks up queued tasks, runs them
  through each agent's engine, and delivers results to your approval queue.
  Approving a result unlocks tasks that depend on it (research feeds
  marketing); comments send it back for a revision with your feedback.
- **The boss approves everything outgoing** — nothing is published or
  deployed without a tap on "Zatwierdź".
- **Budgets with an automatic stop** — monthly per-agent limits in USD,
  real cost tracking per task, an agent over budget stops working.
- **Live dashboard** — team statuses (pracuje / czeka na Ciebie / wolna),
  the event journal, and monthly spend update in place.

## Agent brains (engines)

A role is separate from the engine that powers it — you choose the brain
when hiring and can mix them across the team:

| Engine | Status | Notes |
| --- | --- | --- |
| **Claude Code** | ✅ working | Zero config if you have the CLI installed and logged in (subscription). Detected automatically; real cost reported per task. |
| **Anthropic API** | ✅ working | Paste `ANTHROPIC_API_KEY` into `.env` and it works. Ideal for office roles. |
| **Codex CLI** | 🧪 experimental | Uses `codex exec` when the CLI is installed and logged in. |
| **Custom HTTP** | ✅ working | POSTs the task to your endpoint; respond with `{ "output": "...", "costUsd": 0.1 }`. |

The order planner also uses the Anthropic API when a key is present
(structured outputs); without one it falls back to a simple keyword
heuristic so the product stays usable.

## Quick start

Requirements: Node.js 20+.

```bash
git clone https://github.com/terlikk/cohors && cd cohors
npm run app     # installs, builds, and starts on http://localhost:3000
```

`npm run app` runs a small launcher (`bin/cli.mjs`) that checks your
environment, installs dependencies, builds, starts the server, and prints
the dashboard link. No database or server setup — data lives in a local
SQLite file (`data/app.db`). Optional configuration in `.env` (see
`.env.example`). For development: `npm run dev`.

## Hosted / demo mode

On Vercel the app runs with an in-memory demo database (no persistent disk)
and the heartbeat is driven by Vercel Cron hitting `/api/heartbeat`
(see `vercel.json`). Self-hosting locally is the primary, fully-featured
mode — engines like Claude Code need your machine anyway.

## Architecture (short version)

Next.js 15 (App Router) + TypeScript + Tailwind 4, better-sqlite3 for
storage, server actions for mutations. Key modules:

- `src/lib/planner.ts` — order → task plan (LLM with JSON-schema output, or
  heuristic fallback)
- `src/lib/engines/` — the `Engine` interface + implementations sharing one
  persona/context prompt builder
- `src/lib/executor.ts` — the heartbeat: eligible-task selection, budget
  guard, run, deliver
- `src/lib/repo.ts` — all SQL, one place
- `src/lib/i18n/` — UI dictionary (Polish first; add a language by adding a
  file)

## License

[MIT](LICENSE)
