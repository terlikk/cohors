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
    name: "Cohors",
    tagline: "twój zespół agentów AI",
  },
  nav: {
    groupWork: "Praca",
    groupTeam: "Zespół",
    pulpit: "Pulpit",
    robota: "Daj robotę",
    kanal: "Czat zespołu",
    mapa: "Mapa zadań",
    odbior: "Do odbioru",
    dziennik: "Dziennik",
    agents: "Wszyscy agenci",
    hire: "Zatrudnij agenta",
    monthSpend: (v: string) => `${v} w tym miesiącu`,
  },
  pages: {
    pulpit: {
      title: "Pulpit",
      subtitle: "Co się dzieje w Twoim zespole — na żywo.",
      awaiting: (n: number) =>
        n === 1
          ? "1 wynik czeka na Twoją decyzję"
          : `${n} ${n < 5 ? "wyniki czekają" : "wyników czeka"} na Twoją decyzję`,
      goto: "Przejdź",
      cta: "Daj robotę",
    },
    robota: {
      title: "Daj robotę",
      subtitle:
        "Napisz po ludzku — rozbijemy to na zadania i przydzielimy zespołowi.",
      historyHeading: "Polecenia",
      empty: "Jeszcze żadnych poleceń.",
      seePlan: "Zobacz plan",
      statuses: {
        awaiting_approval: "plan do akceptacji",
        approved: "w toku",
        done: "wykonane ✓",
        rejected: "odrzucone",
      },
    },
    odbior: {
      title: "Do odbioru",
      subtitle: "Nic nie wychodzi na zewnątrz bez Twojej zgody.",
    },
    dziennik: {
      title: "Dziennik",
      subtitle: "Kto co zaczął, skończył i ile to kosztowało.",
    },
    agents: {
      title: "Wszyscy agenci",
      subtitle: "Twój zespół — statusy, budżety, role.",
    },
    agent: {
      tabs: {
        status: "Status",
        czat: "Czat",
        pliki: "Pliki",
        profil: "Profil",
        opcje: "Opcje",
      },
      toolsHeading: "Narzędzia",
      toolsHint: "Czego ten agent może użyć, żeby naprawdę wykonać pracę.",
      filesHeading: "Pliki agenta",
      filesHint: "Pliki, które agent utworzył podczas pracy — kliknij, żeby pobrać.",
      filesEmpty:
        "Ten agent nie zapisał jeszcze żadnych plików. Gdy podczas zadania coś utworzy (dokument, grafikę, dane), pojawi się tutaj.",
      showStatus: "Pokaż status",
      statusPosted: "Status wysłany na czat zespołu.",
      nowHeading: "Co teraz robi",
      nowIdle: "Nic w tej chwili — wolny i czeka na zadania.",
      nowSince: "w toku",
      queueHeading: "W kolejce",
      queueEmpty: "Kolejka pusta.",
      awaitingNote: "oddane, czeka na Twój odbiór",
      optionsBudget: "Miesięczny budżet (USD)",
      optionsEngine: "Silnik (mózg agenta)",
      optionsSave: "Zapisz zmiany",
      optionsSaved: "Zapisano.",
      fire: "Zwolnij agenta",
      fireNote:
        "Usuwa agenta razem z jego zadaniami i czatem. Tej operacji nie można cofnąć.",
      budgetRow: "Budżet miesięczny",
      jobHeading: "Opis stanowiska",
      onboardingHeading: "Z onboardingu",
      workHeading: "Ostatnia praca",
      workEmpty: "Jeszcze bez zadań.",
      writeTo: (name: string) => `Napisz do: ${name}`,
      engineLabel: "silnik",
    },
  },
  order: {
    heading: "Wydaj rozkaz zespołowi",
    placeholder:
      "Np. „W czwartek premiera nowej wersji apki — ogarnijcie promocję i sprawdźcie technikalia”",
    submit: "Wydaj rozkaz",
    submitting: "Rozdzielam zadania…",
    hint: "Rozkaz zostanie rozbity na zadania i przydzielony właściwym agentom. Zobaczysz plan do akceptacji, zanim ktokolwiek zacznie. Możesz też pisać wprost do agenta: „Bartek, napraw błąd logowania”.",
    errors: {
      empty: "Napisz, co zespół ma zrobić.",
      noAgents: "Najpierw zatrudnij przynajmniej jednego agenta.",
    },
  },
  plan: {
    title: "Plan działania",
    back: "← Daj robotę",
    orderLabel: "Rozkaz",
    approve: "Dawaj",
    requestChanges: "Zmień",
    changesPlaceholder:
      "Napisz, co zmienić — np. „newsletter niepotrzebny, dodaj posta na LinkedIn”",
    changesSubmit: "Popraw plan",
    changesSubmitting: "Poprawiam plan…",
    approvedNote:
      "Plan zatwierdzony — agenci pracują. Wyniki znajdziesz na pulpicie w sekcji „Do odbioru”.",
    doneNote: "Rozkaz wykonany w całości. ✔",
    rejectedNote: "Plan odrzucony.",
    retryTask: "Spróbuj ponownie",
    dependsOn: "po:",
    taskCount: (n: number) =>
      `${n} ${n === 1 ? "zadanie" : n < 5 ? "zadania" : "zadań"}`,
    plannerBadge: {
      llm: "plan ułożony przez AI",
      heuristic: "plan wstępny (bez AI — podłącz klucz, by planować mądrzej)",
      direct: "polecenie bezpośrednie",
    },
    awaitingCardTitle: "Plan czeka na Twoją akceptację",
    awaitingCardCta: "Zobacz plan",
    taskStatuses: {
      proposed: "w planie",
      queued: "w kolejce",
      running: "w toku",
      awaiting_approval: "do odbioru",
      done: "zrobione",
      failed: "nieudane",
    },
  },
  planner: {
    heuristicTaskTitle: {
      marketing: "Ogarnij promocję",
      developer: "Sprawdź technikalia",
      research: "Przygotuj analizę",
      copywriting: "Napisz teksty",
      support: "Przygotuj odpowiedzi dla klientów",
    },
    heuristicTaskDescription: (order: string) =>
      `Zajmij się swoją częścią rozkazu szefa: „${order}”. Działaj w ramach swojej roli i opisu stanowiska.`,
  },
  approvals: {
    heading: "Do odbioru",
    empty: "Nic nie czeka na Twoją decyzję.",
    approve: "Zatwierdź",
    approveAndPublish: "Zatwierdź i wyślij",
    requestChanges: "Uwagi",
    from: "od",
    publishLabel: "Publikacja (webhook)",
    publishHint:
      "Po „Zatwierdź i wyślij” wynik trafi na ten adres (Zapier/Make/własny) — a stamtąd na Instagram, maila itd. Zostaw puste, żeby wyłączyć.",
    publishPlaceholder: "https://hooks.zapier.com/…",
    publishSave: "Zapisz",
    publishSaved: "Zapisano.",
    showMore: "Pokaż całość",
    showLess: "Zwiń",
    feedbackPlaceholder:
      "Napisz, co poprawić — wynik wróci do agenta i dostaniesz nową wersję.",
    feedbackSubmit: "Odeślij do poprawki",
    revisionBadge: (n: number) => `poprawka #${n}`,
  },
  team: {
    heading: "Zespół",
    hire: "Zatrudnij agenta",
    empty:
      "Nie masz jeszcze zespołu. Zacznij od zatrudnienia Szefa zespołu — opiszesz mu cel, a on sam zatrudni resztę agentów i przygotuje plan do Twojej akceptacji.",
    hireFirst: "Zatrudnij szefa zespołu",
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
      "Silnik możesz później zmienić bez utraty roli i historii.",
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
  map: {
    title: "Mapa zadań",
    subtitle:
      "Plan jako graf: zadania, kto je robi i co zależy od czego. Najedź na węzeł, żeby podświetlić powiązania.",
    empty: "Jeszcze żadnego rozkazu. Daj zespołowi robotę, a plan pojawi się tu jako mapa.",
    noTasks: "Ten rozkaz nie ma jeszcze zadań.",
  },
  channel: {
    title: "Czat zespołu",
    subtitle:
      "Wspólny kanał — agenci meldują, co robią, szef ogłasza plany. Możesz napisać do całego zespołu.",
    placeholder: "Napisz do całego zespołu…",
    send: "Wyślij",
    empty:
      "Tu pojawią się wiadomości zespołu — kto co zaczął i oddał. Zatrudnij szefa i daj mu cel, żeby ruszyło.",
    you: "Ty",
  },
  hireBoss: {
    title: "Zatrudnij szefa zespołu",
    subtitle:
      "Twój pierwszy agent. Opowiedz mu o firmie i celach — on zatrudni resztę zespołu, rozdzieli zadania i będzie kierować pracą. Ty tylko akceptujesz plany i wyniki.",
    nameLabel: "Jak ma się nazywać?",
    namePlaceholder: "Np. Wiktor",
    submit: "Zatrudnij szefa",
    submitting: "Zatrudniam…",
    footnote:
      "Wszystkie odpowiedzi trafią do jego profilu — możesz je potem uzupełnić na czacie.",
    defaultJob:
      "Kierujesz całym zespołem: zatrudniasz agentów, rozdzielasz zadania i realizujesz cele firmy.",
    greetingWithGoal: (goal: string) =>
      `Cześć, szefie! Przeczytałem wszystko o firmie. Rozumiem, że cel to: „${goal}”. Napisz mi go tutaj (albo doprecyzuj) — zatrudnię odpowiednich agentów i przygotuję plan do Twojej akceptacji.`,
    greeting:
      "Cześć, szefie! Jestem gotowy do pracy. Opisz mi cel — np. „Wygeneruj 10 000 zł sprzedaży w miesiąc” — a zatrudnię odpowiednich agentów i przygotuję plan do Twojej akceptacji.",
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
  engineDetected: "wykryty ✓",
  engineNotDetected: "niewykryty",
  engineHttpUrlLabel: "Adres URL Twojego agenta",
  engineHttpUrlPlaceholder: "https://twoj-agent.example.com/run",
  roles: {
    manager: "Szef zespołu",
    marketing: "Marketing",
    developer: "Programista",
    research: "Research",
    copywriting: "Copywriting",
    support: "Support",
    custom: "Własna rola",
  } satisfies Record<RoleKey, string>,
  roleDescriptions: {
    manager: "przyjmuje cele, zatrudnia agentów i kieruje zespołem",
    marketing: "kampanie, social media, promocja",
    developer: "kod, testy, poprawki, wdrożenia",
    research: "analizy, konkurencja, trendy",
    copywriting: "teksty, newslettery, opisy",
    support: "odpowiedzi klientom, FAQ",
    custom: "opisz stanowisko po swojemu",
  } satisfies Record<RoleKey, string>,
  onboardingQuestions: {
    manager: [
      "Czym zajmuje się firma i co sprzedaje?",
      "Jaki jest najważniejszy cel na najbliższy miesiąc?",
      "Jakim miesięcznym budżetem na zespół dysponuję?",
      "Czego absolutnie nie wolno robić bez Twojej zgody?",
    ],
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
    chat: "czat",
    order_submitted: "rozkaz",
    plan_ready: "plan gotowy",
    plan_approved: "plan zatwierdzony",
    plan_changes: "uwagi do planu",
    order_done: "rozkaz wykonany",
    fired: "zwolnienie",
    task_started: "start zadania",
    task_finished: "koniec zadania",
    task_failed: "błąd zadania",
    budget_stopped: "stop budżetowy",
    waiting_approval: "do odbioru",
    approved: "zatwierdzone",
    changes_requested: "uwagi szefa",
    hired: "zatrudnienie",
  } satisfies Record<JournalKind, string>,
  journalTexts: {
    hired: (name: string, role: string) => `${name} (${role}) dołącza do zespołu`,
    fired: (name: string, role: string) => `${name} (${role}) odchodzi z zespołu`,
    orderSubmitted: (text: string) =>
      `Szef wydał rozkaz: „${text.length > 80 ? `${text.slice(0, 77)}…` : text}”`,
    planReady: (n: number, agentNames: string[]) =>
      `Plan gotowy: ${n} ${n === 1 ? "zadanie" : n < 5 ? "zadania" : "zadań"} dla: ${agentNames.join(", ")}`,
    planApproved: "Szef zatwierdził plan — zadania trafiły do kolejek",
    planChanges: (comment: string) =>
      `Szef odesłał plan z uwagami: „${comment.length > 60 ? `${comment.slice(0, 57)}…` : comment}”`,
    taskStarted: (agent: string, title: string) =>
      `${agent} zaczyna: „${title}”`,
    taskDelivered: (agent: string, title: string) =>
      `${agent} oddaje do odbioru: „${title}”`,
    taskFailed: (agent: string, title: string, reason: string) =>
      `${agent} — zadanie „${title}” nie powiodło się (${reason})`,
    taskApproved: (agent: string, title: string) =>
      `Szef zatwierdził: „${title}” (${agent})`,
    taskChanges: (agent: string, title: string, comment: string) =>
      `Szef odesłał „${title}” do ${agent} z uwagami: „${comment.length > 50 ? `${comment.slice(0, 47)}…` : comment}”`,
    chatCost: (agent: string) => `${agent} odpowiada na czacie`,
    managerHired: (manager: string, hired: string, role: string) =>
      `${manager} zatrudnia: ${hired} (${role})`,
    managerPlanned: (manager: string, n: number) =>
      `${manager} przygotował plan: ${n} ${n === 1 ? "zadanie" : n < 5 ? "zadania" : "zadań"} — czeka na Twoją akceptację`,
    budgetStopped: (agent: string, budget: number) =>
      `${agent} zatrzymana — wyczerpany miesięczny budżet $${budget.toFixed(0)}`,
    orderDone: (text: string, cost: number) =>
      `Rozkaz wykonany w całości: „${text.length > 60 ? `${text.slice(0, 57)}…` : text}” (koszt $${cost.toFixed(2)})`,
  },
  stats: {
    monthSpend: "wydatki w tym miesiącu",
  },
  chat: {
    heading: "Czat",
    placeholder: "Napisz do agenta — zapytaj o raport, doprecyzuj zadanie…",
    send: "Wyślij",
    empty: "Jeszcze żadnych wiadomości. Napisz pierwszy.",
    you: "Ty",
    thinking: "odpisuje…",
    managerHint:
      "To szef zespołu: opisz mu cel (np. „wygeneruj 10 000 zł sprzedaży w miesiąc”), a sam zatrudni agentów i przygotuje plan do Twojej akceptacji.",
  },
  demoBanner:
    "Wersja demo na przykładowych danych — zmiany nie zapisują się na stałe.",
  stageBanner:
    "Wersja rozwojowa — wszystko, co widzisz, działa naprawdę. Nazwa produktu w drodze.",
};

export type Dictionary = typeof pl;
