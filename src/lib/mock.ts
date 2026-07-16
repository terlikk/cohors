import type { Agent, Approval, JournalEvent } from "@/lib/types";

/** Sample data for the stage-1 UI skeleton. Replaced by the real store later. */

export const agents: Agent[] = [
  {
    id: "a1",
    name: "Marysia",
    role: "marketing",
    status: "working",
    currentTask: "Kampania przed czwartkową premierą",
    monthCostUsd: 4.21,
    monthBudgetUsd: 20,
  },
  {
    id: "a2",
    name: "Bartek",
    role: "developer",
    status: "waiting_for_boss",
    currentTask: "Poprawka błędu logowania — gotowa do odbioru",
    monthCostUsd: 11.4,
    monthBudgetUsd: 40,
  },
  {
    id: "a3",
    name: "Ola",
    role: "research",
    status: "working",
    currentTask: "Analiza konkurencji: 5 podobnych aplikacji",
    monthCostUsd: 2.05,
    monthBudgetUsd: 15,
  },
  {
    id: "a4",
    name: "Staszek",
    role: "copywriting",
    status: "idle",
    monthCostUsd: 0.88,
    monthBudgetUsd: 10,
  },
  {
    id: "a5",
    name: "Hania",
    role: "support",
    status: "idle",
    monthCostUsd: 0.0,
    monthBudgetUsd: 10,
  },
];

export const approvals: Approval[] = [
  {
    id: "ap1",
    agentId: "a2",
    title: "Poprawka błędu logowania",
    preview:
      "Naprawiłem walidację e-maila przy logowaniu (znaki „+” w adresie). Testy przechodzą. Chcę wdrożyć na produkcję.",
    createdAt: "2026-07-16T10:12:00Z",
  },
  {
    id: "ap2",
    agentId: "a1",
    title: "Post na Instagram — zapowiedź premiery",
    preview:
      "„W czwartek coś się zmieni 👀 Nowa wersja apki nadchodzi — szybsza, ładniejsza i z funkcją, o którą prosiliście najczęściej…” + grafika 1080×1350.",
    createdAt: "2026-07-16T09:47:00Z",
  },
];

export const journal: JournalEvent[] = [
  {
    id: "e1",
    at: "10:12",
    agentId: "a2",
    kind: "waiting_approval",
    text: "Bartek zgłosił poprawkę logowania do odbioru",
    costUsd: 0.36,
  },
  {
    id: "e2",
    at: "09:47",
    agentId: "a1",
    kind: "waiting_approval",
    text: "Marysia oddała post zapowiadający premierę",
    costUsd: 0.12,
  },
  {
    id: "e3",
    at: "09:31",
    agentId: "a3",
    kind: "task_started",
    text: "Ola zaczęła analizę konkurencji (5 aplikacji)",
  },
  {
    id: "e4",
    at: "09:30",
    agentId: "a1",
    kind: "task_started",
    text: "Marysia zaczęła planowanie kampanii premierowej",
  },
  {
    id: "e5",
    at: "09:12",
    kind: "approved",
    text: "Szef zatwierdził plan: „Premiera w czwartek” (4 zadania, 3 agentów)",
  },
  {
    id: "e6",
    at: "08:58",
    agentId: "a5",
    kind: "hired",
    text: "Hania (Support) dołączyła do zespołu",
  },
];

export const agentById = (id?: string) => agents.find((a) => a.id === id);
