"use client";

import { motion } from "framer-motion";
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
      {children}
    </p>
  );
}

const POINTS = [
  "Zatrudniasz agentów z rolami — opisujesz zwykłym zdaniem, kogo potrzebujesz.",
  "Dajesz cel. Agent-szef sam dobiera zespół i rozdziela zadania.",
  "Agenci pracują sami; Ty zatwierdzasz każdy plan i wynik, zanim cokolwiek wyjdzie.",
  "Wszystko na Twoim komputerze, z Twoimi kluczami.",
];

const SHOTS: Array<[string, string]> = [
  ["p03", "Pulpit — co się dzieje w zespole na żywo: agenci, statusy, dziennik."],
  ["p05", "Plan — zadania i zależności; akceptujesz, zanim ktoś zacznie."],
  ["p07", "Do odbioru — wynik agenta czeka na Twoją zgodę albo uwagi."],
  ["p02", "Czat z szefem — dajesz cel po polsku, on buduje zespół."],
];

const EXAMPLES: Array<[string, string]> = [
  ["„Ogarnij całą premierę produktu — strona, reklamy, maile i 30 postów”", "Szef zatrudnia copywritera, grafika, marketingowca i osobę od reklam. Dostajesz komplet materiałów gotowych do publikacji — Ty tylko klikasz „zatwierdź”."],
  ["„Zrób ze mnie markę na Instagramie — 30 dni contentu z harmonogramem”", "Zespół planuje cały miesiąc, pisze teksty, projektuje posty i układa kalendarz publikacji. Ty przeglądasz i akceptujesz."],
  ["„Znajdź 50 idealnych klientów i napisz do każdego z osobna”", "Research buduje listę firm i kontaktów, copywriter pisze 50 spersonalizowanych wiadomości — zatwierdzasz przed wysyłką."],
];

const FLOW: Array<[string, string]> = [
  ["Dajesz cel", "Piszesz szefowi jedno zdanie po polsku — np. „ogarnij premierę produktu”."],
  ["Szef buduje zespół", "Sam dobiera i zatrudnia potrzebnych agentów (copy, grafik, marketing…) i rozdziela zadania."],
  ["Dostajesz plan do akceptacji", "Widzisz zadania i zależności między nimi. Klikasz „Dawaj” albo odsyłasz do zmiany."],
  ["Agenci pracują sami", "Po kolei, autonomicznie, w ramach budżetu — bez Twojego udziału."],
  ["Wyniki czekają na Twoją zgodę", "Każda gotowa rzecz ląduje w „Do odbioru”. Zatwierdzasz albo odsyłasz z uwagami."],
  ["Rozkaz wykonany", "Wszystko zatwierdzone — z podsumowaniem i realnym kosztem w dzienniku."],
];

const ADV: Array<[string, string]> = [
  ["Działa lokalnie", "Twój komputer, Twoje klucze. Zero chmury."],
  ["Nic nie wychodzi bez Ciebie", "Akceptujesz każdy plan i każdy wynik."],
  ["Budżety z auto-stopem", "Limit w USD na agenta; po przekroczeniu praca staje."],
  ["Silnik do wyboru", "Claude Code, Codex, API Anthropic albo własny HTTP."],
  ["Po polsku i open source", "Licencja MIT — cały kod jest Twój."],
];

export function Landing() {
  return (
    <div className="bg-[#030303] text-white">
      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-[15px] font-bold tracking-tight">Cohors</span>
        <a
          href="https://github.com/terlikk/cohors"
          className="rounded-full border border-white/15 px-4 py-1.5 text-[12.5px] font-medium text-white/70 transition hover:bg-white/[0.06]"
        >
          GitHub
        </a>
      </header>

      {/* hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-5 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Shape className="left-[-8%] top-[10%]" delay={0.2} rotate={12} w={560} h={130} gradient="from-indigo-500/[0.15]" />
          <Shape className="right-[-6%] top-[58%]" delay={0.35} rotate={-15} w={480} h={120} gradient="from-rose-500/[0.15]" />
          <Shape className="left-[6%] bottom-[6%]" delay={0.3} rotate={-8} w={280} h={80} gradient="from-violet-500/[0.15]" />
          <Shape className="right-[16%] top-[8%]" delay={0.45} rotate={18} w={190} h={60} gradient="from-amber-500/[0.15]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303]" />

        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
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
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-5 max-w-md text-[15px] font-light leading-relaxed text-white/45 sm:text-base"
          >
            Zatrudniasz agentów, wydajesz polecenia po polsku, zatwierdzasz
            wyniki. Reszta dzieje się sama — lokalnie, na Twoim komputerze.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="#pobierz" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
              Pobierz za darmo
            </a>
            <a href="https://github.com/terlikk/cohors" className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]">
              Kod na GitHubie
            </a>
          </motion.div>
        </div>
      </section>

      {/* co to robi */}
      <section className="mx-auto max-w-2xl px-5 py-16">
        <Label>Co to robi</Label>
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Zarządzasz zespołem agentów AI jak małą firmą.
        </h2>
        <ul className="mx-auto mt-7 flex max-w-xl flex-col gap-3">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-3 text-[14.5px] font-light text-white/55">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* jak to wygląda */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <Label>Jak to wygląda</Label>
        <div className="grid gap-5 sm:grid-cols-2">
          {SHOTS.map(([file, caption]) => (
            <figure key={file} className="flex flex-col gap-2.5">
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0b0d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  src={`/panels/${file}.png`}
                  alt={caption}
                  className="block w-full"
                />
              </div>
              <figcaption className="px-1 text-[12.5px] font-light leading-relaxed text-white/45">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* przykłady */}
      <section className="mx-auto max-w-2xl px-5 py-16">
        <Label>Zlecasz jednym zdaniem</Label>
        <h2 className="mb-7 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Jedno zdanie. Cały zespół rusza do roboty.
        </h2>
        <div className="flex flex-col gap-3">
          {EXAMPLES.map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="font-mono text-[12.5px] text-white/85">{q}</p>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed text-white/45">→ {a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* co się dzieje potem */}
      <section className="mx-auto max-w-2xl px-5 py-16">
        <Label>Co się dzieje, gdy dasz zadanie</Label>
        <h2 className="mb-9 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Od jednego zdania do gotowego wyniku.
        </h2>
        <ol className="relative ml-2 flex flex-col gap-7 border-l border-white/[0.1] pl-7">
          {FLOW.map(([title, desc], i) => (
            <li key={title} className="relative">
              <span className="absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[#0b0b0d] font-mono text-[11px] font-semibold text-white/80">
                {i + 1}
              </span>
              <p className="text-[15px] font-semibold text-white/90">{title}</p>
              <p className="mt-1 text-[13.5px] font-light leading-relaxed text-white/45">
                {desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* zalety */}
      <section className="mx-auto max-w-2xl px-5 py-16">
        <Label>Dlaczego Cohors</Label>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <ul className="flex flex-col divide-y divide-white/[0.06]">
            {ADV.map(([h, d]) => (
              <li key={h} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="text-[14px] font-semibold text-white/90 sm:w-56 sm:shrink-0">{h}</span>
                <span className="text-[13.5px] font-light text-white/45">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* pobierz */}
      <section id="pobierz" className="mx-auto max-w-2xl px-5 py-16">
        <Label>Pobierz</Label>
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Jedna komenda.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-[14px] font-light text-white/45">
          Bez konta i bez chmury. Wklej w terminal — dostaniesz link do
          dashboardu na localhost.
        </p>
        <div className="mt-7">
          <CopyCommand command={INSTALL_CMD} />
        </div>
        <ol className="mt-5 flex flex-col gap-3">
          {[
            "Cohors sam się zainstaluje, zbuduje i uruchomi.",
            "W terminalu dostaniesz link do dashboardu (localhost).",
            "Otwórz go i zacznij zatrudniać agentów.",
          ].map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[12px] text-white/80">
                {i + 1}
              </span>
              <span className="flex-1 pt-0.5 text-[14px] font-light leading-relaxed text-white/60">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center font-mono text-[11px] text-white/30">
          wymagania: Node 20+ · git · Claude Code lub klucz API Anthropic
        </p>
      </section>

      <footer className="flex items-center justify-center gap-2 border-t border-white/[0.06] px-6 py-8 text-[11.5px] text-white/30">
        <span>Cohors</span>
        <span>·</span>
        <span>open source · MIT</span>
      </footer>
    </div>
  );
}
