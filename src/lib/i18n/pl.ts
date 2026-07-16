import type { AgentStatus, JournalKind, RoleKey } from "@/lib/types";

/**
 * Polish UI dictionary. Adding a language = adding a sibling file with the
 * same shape and switching the import in `src/lib/i18n/index.ts`.
 */
export const pl = {
  brand: {
    // The project runs under a working title until the name is decided.
    name: "(bez nazwy)",
    tagline: "twój zespół agentów AI",
  },
  order: {
    heading: "Wydaj rozkaz zespołowi",
    placeholder:
      "Np. „W czwartek premiera nowej wersji apki — ogarnijcie promocję i sprawdźcie technikalia”",
    submit: "Wydaj rozkaz",
    hint: "Rozkaz zostanie rozbity na zadania i przydzielony właściwym agentom. Zobaczysz plan do akceptacji, zanim ktokolwiek zacznie.",
  },
  approvals: {
    heading: "Do odbioru",
    empty: "Nic nie czeka na Twoją decyzję. Zespół pracuje.",
    approve: "Zatwierdź",
    requestChanges: "Uwagi",
    from: "od",
  },
  team: {
    heading: "Zespół",
    hire: "Zatrudnij agenta",
    budget: "budżet",
    thisMonth: "w tym miesiącu",
  },
  journal: {
    heading: "Dziennik",
    empty: "Jeszcze nic się nie wydarzyło.",
  },
  roles: {
    marketing: "Marketing",
    developer: "Programista",
    research: "Research",
    copywriting: "Copywriting",
    support: "Support",
  } satisfies Record<RoleKey, string>,
  statuses: {
    working: "pracuje",
    waiting_for_boss: "czeka na Ciebie",
    idle: "wolny",
  } satisfies Record<AgentStatus, string>,
  journalKinds: {
    task_started: "start zadania",
    task_finished: "koniec zadania",
    waiting_approval: "do odbioru",
    approved: "zatwierdzone",
    changes_requested: "uwagi szefa",
    hired: "zatrudnienie",
  } satisfies Record<JournalKind, string>,
  demoBanner:
    "Etap 1 — szkielet interfejsu na danych przykładowych. Nic tu jeszcze nie jest prawdziwe.",
};

export type Dictionary = typeof pl;
