"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CopyCommand } from "@/components/landing/CopyCommand";

const INSTALL_CMD =
  "git clone https://github.com/terlikk/cohors && cd cohors && npm run app";

function Shape({
  className,
  delay,
  gradient,
  rotate,
  w,
  h,
}: {
  className: string;
  delay: number;
  gradient: string;
  rotate: number;
  w: number;
  h: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -120, rotate: rotate - 12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.2, delay, ease: [0.23, 0.86, 0.39, 0.96] }}
      className={`absolute ${className}`}
      style={{ width: w, height: h }}
    >
      <div
        className={`h-full w-full rounded-full border-2 border-white/[0.12] bg-gradient-to-r ${gradient} to-transparent backdrop-blur-[2px]`}
      />
    </motion.div>
  );
}

const TABS = ["Co to jest", "Podgląd", "Przykłady", "Zalety", "Pobierz"] as const;
type Tab = (typeof TABS)[number];

export function Landing() {
  const [tab, setTab] = useState<Tab>("Co to jest");

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#030303] text-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Shape className="left-[-8%] top-[8%]" delay={0.2} rotate={12} w={560} h={130} gradient="from-indigo-500/[0.15]" />
        <Shape className="right-[-6%] top-[62%]" delay={0.35} rotate={-15} w={480} h={120} gradient="from-rose-500/[0.15]" />
        <Shape className="left-[6%] bottom-[4%]" delay={0.3} rotate={-8} w={280} h={80} gradient="from-violet-500/[0.15]" />
        <Shape className="right-[14%] top-[6%]" delay={0.45} rotate={18} w={190} h={60} gradient="from-amber-500/[0.15]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/70" />

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-[15px] font-bold tracking-tight">Cohors</span>
        <a
          href="https://github.com/terlikk/cohors"
          className="rounded-full border border-white/15 px-4 py-1.5 text-[12.5px] font-medium text-white/70 transition hover:bg-white/[0.06]"
        >
          GitHub
        </a>
      </header>

      {/* center */}
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        >
          <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
            Twój zespół
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 bg-clip-text text-transparent">
            agentów AI
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-4 max-w-md text-[15px] font-light leading-relaxed text-white/45"
        >
          Zatrudniasz agentów, wydajesz polecenia po polsku, zatwierdzasz
          wyniki. Reszta dzieje się sama — lokalnie, na Twoim komputerze.
        </motion.p>

        {/* tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                tab === t
                  ? "bg-white text-black"
                  : "border border-white/12 text-white/65 hover:bg-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* panel */}
        <div className="mt-5 w-full">
          <Panel tab={tab} onDownload={() => setTab("Pobierz")} />
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-center gap-2 px-6 py-5 text-[11.5px] text-white/30">
        <span>Cohors</span>
        <span>·</span>
        <span>open source · MIT</span>
      </footer>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left">
      {children}
    </div>
  );
}

function Panel({ tab, onDownload }: { tab: Tab; onDownload: () => void }) {
  if (tab === "Co to jest") {
    const points = [
      "Zatrudniasz agentów z rolami — opisujesz zwykłym zdaniem, kogo potrzebujesz.",
      "Dajesz cel. Agent-szef sam dobiera zespół i rozdziela zadania.",
      "Agenci pracują sami; Ty zatwierdzasz każdy plan i wynik, zanim cokolwiek wyjdzie.",
      "Wszystko na Twoim komputerze, z Twoimi kluczami.",
    ];
    return (
      <Card>
        <p className="mb-3 text-[15px] font-semibold text-white/90">
          Zarządzasz zespołem agentów AI jak małą firmą.
        </p>
        <ul className="flex flex-col gap-2.5">
          {points.map((p) => (
            <li key={p} className="flex gap-2.5 text-[13.5px] font-light text-white/55">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
              {p}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  if (tab === "Podgląd") {
    return (
      <Card>
        <div className="overflow-hidden rounded-xl border border-white/[0.08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dashboard-preview.png"
            alt="Dashboard Cohors — zespół agentów, statusy i dziennik zdarzeń"
            className="block w-full"
          />
        </div>
        <p className="mt-3 text-center text-[12.5px] font-light text-white/40">
          Tak wygląda dashboard — uruchamiasz go lokalnie po pobraniu.
          Zatrudniasz agentów, wydajesz cel, zatwierdzasz wyniki.
        </p>
      </Card>
    );
  }

  if (tab === "Przykłady") {
    const ex = [
      ["„Wygeneruj 10 000 zł sprzedaży w miesiąc”", "Szef zatrudnia marketingowca i osobę od publikacji, układa plan kampanii — czeka na Twoją zgodę."],
      ["„Bartek, napraw błąd logowania”", "Programista bierze zadanie od ręki i oddaje poprawkę do odbioru."],
      ["„Zbadaj 5 konkurentów i zrób podsumowanie”", "Research przygotowuje analizę; marketing dostaje ją jako materiał do kampanii."],
    ];
    return (
      <div className="flex flex-col gap-2.5">
        {ex.map(([q, a]) => (
          <Card key={q}>
            <p className="font-mono text-[12.5px] text-white/85">{q}</p>
            <p className="mt-1.5 text-[13px] font-light leading-relaxed text-white/45">
              → {a}
            </p>
          </Card>
        ))}
      </div>
    );
  }

  if (tab === "Zalety") {
    const adv = [
      ["Działa lokalnie", "Twój komputer, Twoje klucze. Zero chmury."],
      ["Nic nie wychodzi bez Ciebie", "Akceptujesz każdy plan i każdy wynik."],
      ["Budżety z auto-stopem", "Limit w USD na agenta; po przekroczeniu praca staje."],
      ["Silnik do wyboru", "Claude Code, Codex, API Anthropic albo własny HTTP."],
      ["Po polsku i open source", "Licencja MIT — cały kod jest Twój."],
    ];
    return (
      <Card>
        <ul className="flex flex-col divide-y divide-white/[0.06]">
          {adv.map(([h, d]) => (
            <li key={h} className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="text-[13.5px] font-semibold text-white/90 sm:w-52 sm:shrink-0">
                {h}
              </span>
              <span className="text-[13px] font-light text-white/45">{d}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  // Pobierz
  const steps = [
    ["1", "Wklej komendę w terminal:"],
    ["2", "Cohors sam się zainstaluje, zbuduje i uruchomi."],
    ["3", "W terminalu dostaniesz link do dashboardu (localhost) — otwórz go i zacznij zatrudniać."],
  ];
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[12px] text-white/80">
            1
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[13.5px] text-white/70">Wklej komendę w terminal:</p>
            <CopyCommand command={INSTALL_CMD} />
          </div>
        </div>
        {steps.slice(1).map(([n, s]) => (
          <div key={n} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[12px] text-white/80">
              {n}
            </span>
            <p className="flex-1 pt-0.5 text-[13.5px] font-light leading-relaxed text-white/60">
              {s}
            </p>
          </div>
        ))}
        <p className="mt-1 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-white/30">
          wymagania: Node 20+ · git · Claude Code lub klucz API Anthropic
        </p>
      </div>
    </Card>
  );
}
