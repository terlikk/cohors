import type { Metadata } from "next";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { CopyCommand } from "@/components/landing/CopyCommand";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Gladius — twój zespół agentów AI",
  description:
    "Open source. Działa lokalnie na Twoim komputerze. Zatrudniasz agentów, wydajesz polecenia po polsku, zatwierdzasz wyniki.",
};

const INSTALL_CMD =
  "git clone https://github.com/terlikk/gladius && cd gladius && npm run app";

function TerminalDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0c] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-white/30">
          terminal — twój komputer
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-white/70">
        <span className="text-white/35">$</span> npm run app{"\n"}
        {"\n"}
        <span className="text-[#a78bfa]">
          {"   █▀▀ █░░ ▄▀█ █▀▄ █ █░█ █▀"}
          {"\n"}
          {"   █▄█ █▄▄ █▀█ █▄▀ █ █▄█ ▄█"}
        </span>
        {"\n"}
        <span className="text-white/30">
          {"   Gladius — twój zespół agentów AI · open source · MIT"}
        </span>
        {"\n\n"}
        <span className="text-[#30d158]">{"   ✓"}</span> Środowisko sprawdzone{"  "}
        <span className="text-white/30">node v22 · npm 10</span>
        {"\n"}
        <span className="text-[#30d158]">{"   ✓"}</span> Zależności zainstalowane{"  "}
        <span className="text-white/30">14.2s</span>
        {"\n"}
        <span className="text-[#30d158]">{"   ✓"}</span> Aplikacja zbudowana{"  "}
        <span className="text-white/30">31.8s</span>
        {"\n"}
        <span className="text-[#30d158]">{"   ✓"}</span> Uruchamiam serwer{"  "}
        <span className="text-white/30">1.1s</span>
        {"\n\n"}
        {"   ╭────────────────────────────────────────────╮\n"}
        {"   │  "}
        <span className="font-semibold text-white">
          Gotowe. Zespół czeka na szefa.
        </span>
        {"            │\n"}
        {"   │                                            │\n"}
        {"   │  Twój dashboard:                           │\n"}
        {"   │  "}
        <span className="font-semibold text-[#64d2ff]">
          → http://localhost:3000
        </span>
        {"                  │\n"}
        {"   │                                            │\n"}
        {"   │  "}
        <span className="text-white/30">Zatrzymanie: Ctrl+C</span>
        {"                       │\n"}
        {"   ╰────────────────────────────────────────────╯\n"}
        <span className="inline-block h-[14px] w-[7px] animate-pulse bg-white/60 align-middle" />
      </pre>
    </div>
  );
}

const FEATURES: Array<[string, string]> = [
  [
    "Szef, który sam buduje zespół",
    "Zatrudniasz jednego agenta-szefa, opowiadasz mu o firmie i celu. On zatrudnia resztę, rozdziela zadania i pilnuje terminów.",
  ],
  [
    "Nic nie wychodzi bez Ciebie",
    "Każdy plan i każdy wynik czeka w „Do odbioru” na Twoją akceptację. Odsyłasz z uwagami — agent poprawia.",
  ],
  [
    "Budżety, które się pilnują same",
    "Każdy agent ma miesięczny budżet w dolarach. Po jego przekroczeniu praca staje automatycznie.",
  ],
  [
    "Twój komputer, Twoje klucze",
    "Działa w 100% lokalnie. Jako mózg podłączasz Claude Code, Codex, API Anthropic albo własny endpoint HTTP.",
  ],
];

export default function PobierzPage() {
  return (
    <div className="bg-[#030303] text-white">
      <HeroGeometric
        badge="open source · MIT · działa lokalnie"
        title1="Twój zespół"
        title2="agentów AI"
        description="Zatrudniasz agentów, wydajesz polecenia po polsku i zatwierdzasz wyniki. Cała reszta dzieje się sama — na Twoim komputerze, z Twoimi kluczami."
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pobierz"
            className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Pobierz za darmo
          </a>
          <a
            href="https://github.com/terlikk/gladius"
            className="rounded-full border border-white/[0.15] px-7 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
          >
            Kod na GitHubie
          </a>
        </div>
      </HeroGeometric>

      <section id="pobierz" className="relative mx-auto max-w-4xl px-4 py-24 md:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          Pobieranie? Jedna komenda.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[15px] font-light text-white/40">
          Bez konta, bez chmury, bez instalatorów. Wklej w terminal — po
          chwili dostaniesz link do swojego dashboardu na localhost.
        </p>

        <div className="mt-10">
          <CopyCommand command={INSTALL_CMD} />
        </div>

        <div className="mt-6">
          <TerminalDemo />
        </div>

        <p className="mt-5 text-center font-mono text-[11.5px] text-white/25">
          wymagania: Node 20+ · git · klucz Anthropic albo zalogowany Claude
          Code / Codex
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
            >
              <h3 className="text-[15px] font-semibold text-white/90">
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] font-light leading-relaxed text-white/40">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-[12.5px] text-white/30">
          <span>
            {t.brand.name} · {t.brand.tagline}
          </span>
          <span className="font-mono">open source · MIT</span>
        </div>
      </footer>
    </div>
  );
}
