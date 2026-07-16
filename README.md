# 🐝 (working title)

> **Note:** the project name is not decided yet — this repository runs under a
> temporary working title. Rename is planned before the first public release.

An open-source system for running a **team of AI agents** the way you run a
small company: you hire workers with roles (marketing, developer, research,
copywriting, support), give orders in plain language, and approve everything
that goes out into the world. No technical configuration — hiring, talking,
approving. Everything else happens by itself.

## Core ideas

- **Hiring, not configuring** — pick a role template, give the agent a name
  and a one-sentence job description; the agent asks its own onboarding
  questions like a new employee on day one.
- **Orders in plain language** — one input box for the whole team; the system
  breaks an order down into tasks (with dependencies) and assigns them to the
  right agents. You approve the plan before anyone starts.
- **The boss approves everything outgoing** — publishing, sending, deploying:
  nothing leaves the system without a one-tap approval. Rejections with
  comments go back to the agent for another pass.
- **Agents work on their own rhythm** — each agent wakes up on a heartbeat,
  checks its queue, works or sleeps. The dashboard shows everything live.
- **Budgets with an automatic stop** — monthly per-agent limits in dollars,
  cost tracking per task.
- **Swappable "brains"** — a role is separate from the engine that powers it:
  Anthropic API, Claude Code, Codex, or any custom agent over HTTP.

## Status

Early development. Architecture proposal and roadmap live in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (coming with the first
milestone).

- Interface language: Polish first (i18n-ready for more)
- Code and docs: English
- License: [MIT](LICENSE)
