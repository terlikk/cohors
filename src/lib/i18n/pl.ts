import type {
  AgentStatus,
  EngineKey,
  JournalKind,
  RoleKey,
} from "@/lib/types";

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
    comingSoon: "Rozkazy ruszą w etapie 3 — najpierw zatrudnij zespół.",
  },
  approvals: {
    heading: "Do odbioru",
    empty: "Nic nie czeka na Twoją decyzję.",
    approve: "Zatwierdź",
    requestChanges: "Uwagi",
    from: "od",
  },
  team: {
    heading: "Zespół",
    hire: "Zatrudnij agenta",
    empty:
      "Nie masz jeszcze żadnych agentów. Zatrudnij pierwszego — to dwie minuty.",
    hireFirst: "Zatrudnij pierwszego agenta",
    budget: "budżet",
    thisMonth: "w tym miesiącu",
  },
  journal: {
    heading: "Dziennik",
    empty: "Jeszcze nic się nie wydarzyło.",
  },
  hire: {
    title: "Zatrudnij agenta",
    back: "← Wróć do pulpitu",
    stepRole: "Kogo zatrudniasz?",
    stepRoleHint: "Wybierz rolę z szablonu albo opisz własną.",
    customRoleLabel: "Nazwa własnej roli",
    customRolePlaceholder: "Np. Księgowość, Sprzedaż, HR…",
    stepDetails: "Poznajcie się",
    nameLabel: "Imię agenta",
    namePlaceholder: "Np. Marysia, Bartek, Ola…",
    jobLabel: "Opis stanowiska — zwykłym zdaniem",
    jobPlaceholder:
      "Np. „Prowadzisz nasz Instagram, ton luźny, 3 posty tygodniowo, wszystko pokazuj mi przed publikacją”",
    engineLabel: "Mózg agenta",
    engineHint:
      "Silnik podłączymy w etapie 4 — na razie zapisujemy Twój wybór.",
    budgetLabel: "Miesięczny budżet (USD)",
    budgetHint: "Po przekroczeniu limitu agent automatycznie się zatrzyma.",
    stepOnboarding: "ma kilka pytań na start",
    stepOnboardingHint:
      "Jak nowy pracownik pierwszego dnia. Możesz pominąć pytanie — dopyta później.",
    submit: "Zatrudnij",
    submitting: "Zatrudniam…",
    next: "Dalej",
    prev: "Wstecz",
    optional: "(opcjonalnie)",
    errors: {
      nameRequired: "Nadaj agentowi imię.",
      jobRequired: "Napisz jedno zdanie o tym, czym ma się zajmować.",
      customRoleRequired: "Nazwij własną rolę.",
    },
  },
  engines: {
    claude_code: "Claude Code",
    anthropic_api: "API Anthropic",
    codex: "Codex",
    http: "Własny agent (HTTP)",
  } satisfies Record<EngineKey, string>,
  engineDescriptions: {
    claude_code:
      "Masz Claude Code z subskrypcją? Zero konfiguracji — wykryjemy go automatycznie.",
    anthropic_api: "Wklejasz klucz API, działa od razu. Idealne do ról biurowych.",
    codex: "Masz Codex z kontem ChatGPT? Podepniemy go jak Claude Code.",
    http: "Dowolny własny agent podpięty przez HTTP.",
  } satisfies Record<EngineKey, string>,
  roles: {
    marketing: "Marketing",
    developer: "Programista",
    research: "Research",
    copywriting: "Copywriting",
    support: "Support",
    custom: "Własna rola",
  } satisfies Record<RoleKey, string>,
  roleDescriptions: {
    marketing: "kampanie, social media, promocja",
    developer: "kod, testy, poprawki, wdrożenia",
    research: "analizy, konkurencja, trendy",
    copywriting: "teksty, newslettery, opisy",
    support: "odpowiedzi klientom, FAQ",
    custom: "opisz stanowisko po swojemu",
  } satisfies Record<RoleKey, string>,
  onboardingQuestions: {
    marketing: [
      "W jakiej branży działa firma i co dokładnie sprzedaje?",
      "Kto jest Waszym klientem? Do kogo mówimy?",
      "Jakie kanały już prowadzicie (Instagram, LinkedIn, TikTok…)?",
      "Kogo z konkurencji podglądać?",
    ],
    developer: [
      "Nad jakim projektem będę pracować (repo, technologie)?",
      "Jak wygląda droga od zmiany do wdrożenia (testy, review, deploy)?",
      "Czego mi nie wolno ruszać bez pytania?",
    ],
    research: [
      "Jakie tematy mam śledzić na stałe?",
      "Kto jest Waszą konkurencją — znasz nazwy?",
      "W jakiej formie chcesz raporty: krótko i wnioski, czy szczegółowo?",
    ],
    copywriting: [
      "Jakim tonem mówi Wasza marka (luźno, ekspercko, oficjalnie)?",
      "Do kogo piszemy? Kim jest czytelnik?",
      "Masz przykłady tekstów, które Ci się podobają?",
    ],
    support: [
      "Na jakie pytania klientów odpowiadamy najczęściej?",
      "Gdzie jest baza wiedzy / FAQ, z której mam korzystać?",
      "Kiedy mam eskalować sprawę do człowieka?",
    ],
    custom: [
      "Czym dokładnie mam się zajmować na co dzień?",
      "Czego potrzebuję wiedzieć o firmie, żeby dobrze zacząć?",
      "Po czym poznasz, że robię dobrą robotę?",
    ],
  } satisfies Record<RoleKey, string[]>,
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
  journalTexts: {
    hired: (name: string, role: string) => `${name} (${role}) dołącza do zespołu`,
  },
  demoBanner:
    "Wersja demo na przykładowych danych — zmiany nie zapisują się na stałe.",
  stageBanner:
    "Etap 2 — zatrudnianie działa naprawdę (lokalna baza). Rozkazy i wykonanie zadań w kolejnych etapach.",
};

export type Dictionary = typeof pl;
