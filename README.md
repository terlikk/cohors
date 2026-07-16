<div align="center">

# 🐝 Apiary

**Manage a team of AI agents the way a beekeeper manages worker bees.**

You are the beekeeper. Your AI agents are the worker bees — each with a real
role (marketing, developer, research, copywriting, support). You hire them,
give orders in plain language, and approve what goes out. Everything else runs
by itself, inside the hive.

Built for non-technical people: less configuration, more conversation.

`MIT licensed` · `Polish UI (more languages later)`

</div>

---

## Why Apiary

Inspired by tools like Paperclip, but aimed at humans who don't want to
configure anything. You don't wire up prompts and pipelines — you **hire**,
you **give orders like a boss**, and you **approve results**. The hive handles
decomposition, scheduling, dependencies, costs and budgets.

- **Hiring, not configuration.** Pick a role, name your bee, describe the job
  in one sentence. The new hire asks onboarding questions like a real employee
  on day one.
- **Orders in plain language.** Type one command for the whole hive; it's
  broken into tasks and assigned to the right bees — with dependencies, so
  research feeds marketing automatically. You approve the plan first.
- **You approve everything that leaves the hive.** Nothing is published,
  emailed or deployed without a tap of approval.
- **Bees work on their own,** waking on a heartbeat to pick up ready tasks.
- **Budgets keep costs in check.** Per-agent monthly caps with automatic stop.
- **Swappable brains.** Each bee runs on an engine — Anthropic API (works out
  of the box), Claude Code, Codex, or any custom agent over HTTP — and the
  brain can be swapped without losing the role or history.

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

That's it — no database to set up and no servers to stand up. A local SQLite
file is created automatically on first run. To let the bees actually think,
copy `.env.example` to `.env` and paste an Anthropic API key:

```bash
cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY=...
```

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript** | One process serves UI **and** API |
| Database | **SQLite + Drizzle ORM** | A single file, created on start — zero setup |
| Styling | **Tailwind CSS** | The warm "inside the hive" theme + honeycomb hexes |
| Live updates | **Server-Sent Events** | Live journal and statuses, no extra services |
| Scheduling | **In-process heartbeat** | Bees wake on a tick — nothing to run by hand |
| Brains | **Engine adapters** | `anthropic` (built), `claude-code` / `codex` / `http` (extension points) |

## Roadmap

Apiary is built in stages:

- [x] **Stage 0 — Foundation.** Project scaffold, honey design system,
  hexagon components, zero-config database, empty dashboard shell.
- [ ] **Stage 1 — Hiring.** Role templates + onboarding Q&A.
- [ ] **Stage 2 — Orders → plan → execution.** Planner decomposition, plan
  approval, heartbeat execution with task dependencies.
- [ ] **Stage 3 — Approvals + journal.** "Waiting for the beekeeper" queue,
  approve / comment feedback loop, live journal.
- [ ] **Stage 4 — Budgets.** Per-task cost accounting, monthly caps, auto-stop.
- [ ] **Stage 5 — Engines + polish.** Claude Code / Codex / HTTP adapters,
  mobile refinements.

## License

[MIT](./LICENSE)
