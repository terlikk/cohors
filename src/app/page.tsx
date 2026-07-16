import Link from "next/link";
import { ApiaryMark, Hexagon } from "@/components/Hexagon";
import { HoneycombCluster } from "@/components/Honeycomb";
import { ROLE_TEMPLATES } from "@/lib/roles";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="label-mono inline-flex items-center gap-2 rounded-full border border-hive-border bg-hive-panel px-3 py-1">
              open source · MIT · działa u Ciebie
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] sm:text-5xl">
              Zatrudnij <span className="text-honey-light">rój</span> agentów AI.
              <br />
              Rządź jak pszczelarz.
            </h1>
            <p className="mt-5 max-w-md text-lg text-wax-dim">
              Apiary to pasieka, w której agenci AI są Twoimi robotnicami —
              marketing, programista, research, copy, support. Ty tylko
              zatrudniasz, wydajesz rozkazy po ludzku i zatwierdzasz wyniki.
              Reszta dzieje się sama.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#pobierz" className="btn-honey">
                Pobierz i uruchom →
              </a>
              <Link href="/hive" className="btn-ghost">
                Zobacz podgląd
              </Link>
            </div>
            <p className="label-mono mt-6">
              pobierasz przez terminal &nbsp;·&nbsp; ul chodzi na Twoim
              localhost &nbsp;·&nbsp; dane zostają u Ciebie
            </p>
          </div>

          <div className="order-first md:order-last">
            <HoneycombCluster />
          </div>
        </div>
      </section>

      {/* Metaphor strip */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="panel grid gap-px overflow-hidden sm:grid-cols-3">
          <MetaphorItem
            k="Ty"
            v="Pszczelarz"
            d="Szef, który zatrudnia i zatwierdza — bez technicznej konfiguracji."
          />
          <MetaphorItem
            k="Agenci"
            v="Robotnice"
            d="Pracownicy z rolami: każda ma swój fach i swój kontekst."
          />
          <MetaphorItem
            k="System"
            v="Pasieka"
            d="Pracuje w tle, w rytmie — a Ty widzisz wszystko na żywo."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="jak" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Jak to działa"
          title="Cztery kroki, zero konfiguracji"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StepCard
            n="01"
            title="Zatrudnij"
            body="Wybierasz rolę, nadajesz imię i opisujesz stanowisko jednym zdaniem. Nowa robotnica sama dopytuje o resztę — jak pracownik pierwszego dnia."
          />
          <StepCard
            n="02"
            title="Wydaj rozkaz"
            body="Piszesz po ludzku, np. „w czwartek premiera — ogarnijcie promocję i technikalia”. Ul rozbija to na zadania i przydziela właściwym robotnicom."
          />
          <StepCard
            n="03"
            title="Zatwierdź plan"
            body="Widzisz plan zanim cokolwiek ruszy: Dawaj albo Zmień. Zadania mogą zależeć od siebie — research karmi marketing automatycznie."
          />
          <StepCard
            n="04"
            title="Ul pracuje sam"
            body="Robotnice budzą się cyklicznie, biorą zadania i zgłaszają wyniki do akceptacji. Nic nie wychodzi na zewnątrz bez Twojego tapnięcia."
          />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Co potrafi pasieka"
          title="Wygodnie dla człowieka, nie dla programisty"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Rozkazy po ludzku"
            body="Jedno pole: „Wydaj rozkaz pasiece”. Rozbijanie na zadania i przydział dzieją się same."
          />
          <Feature
            title="Ty zatwierdzasz wszystko"
            body="Post, newsletter, wdrożenie kodu — nic bez zgody pszczelarza. Jedno tapnięcie z telefonu."
          />
          <Feature
            title="Praca w rytmie"
            body="Heartbeat: agenci budzą się, sprawdzają kolejkę i biorą robotę. Niczego nie odpalasz ręcznie."
          />
          <Feature
            title="Budżety pod kontrolą"
            body="Miesięczny limit w dolarach na agenta. Po przekroczeniu robotnica sama staje, a Ty dostajesz sygnał."
          />
          <Feature
            title="Wymienne mózgi"
            body="Pod spodem: API Anthropic, Claude Code, Codex albo własny agent przez HTTP. Silnik podmienisz bez utraty roli."
          />
          <Feature
            title="Wszystko widać"
            body="Kolejka decyzji na górze, plaster robotnic ze statusami i żywy dziennik: kto co zrobił i ile to kosztowało."
          />
        </div>
      </section>

      {/* Roles */}
      <section id="role" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Role w ulu"
          title="Każda robotnica ma swój fach"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ROLE_TEMPLATES.map((r) => (
            <div
              key={r.key}
              className="panel flex flex-col items-center gap-3 p-5 text-center"
            >
              <Hexagon color={r.color}>{r.glyph}</Hexagon>
              <div>
                <div className="font-medium">{r.label}</div>
                <div className="mt-1 text-xs text-wax-dim">{r.tagline}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — download & run locally */}
      <section id="pobierz" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="panel-raised flex flex-col items-center gap-5 p-8 text-center sm:p-12">
          <ApiaryMark size={40} />
          <h2 className="max-w-lg text-2xl sm:text-3xl">
            Pobierz i postaw własny ul na swoim komputerze
          </h2>
          <p className="max-w-md text-wax-dim">
            Apiary chodzi lokalnie, u Ciebie — bez baz do stawiania, bez
            serwerów. Każdy ma swój własny ul i swój dashboard, a dane nie
            wychodzą na zewnątrz. Trzy komendy w terminalu i gotowe.
          </p>
          <pre className="label-mono overflow-x-auto rounded-xl border border-hive-border bg-hive-bg px-5 py-3 text-left text-wax">
            <code>{`git clone https://github.com/terlikk/printflow apiary\ncd apiary\nnpm install\nnpm run dev`}</code>
          </pre>
          <p className="label-mono">
            → otwórz http://localhost:3000 i zatrudnij pierwszą robotnicę
          </p>
          <a
            href="https://github.com/terlikk/printflow"
            className="btn-honey"
          >
            Zobacz kod na GitHub →
          </a>
        </div>
      </section>

      <footer className="border-t border-hive-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-wax-dim sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <ApiaryMark size={20} />
            <span>Apiary</span>
          </div>
          <span className="label-mono">open source · MIT · zbudowane dla ludzi</span>
        </div>
      </footer>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-10 border-b border-hive-border/70 bg-hive-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <ApiaryMark />
          <span className="text-lg">Apiary</span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-wax-dim">
          <a href="#jak" className="hidden hover:text-wax sm:inline">
            Jak działa
          </a>
          <a href="#role" className="hidden hover:text-wax sm:inline">
            Role
          </a>
          <a href="#pobierz" className="btn-honey px-3.5 py-2 text-sm">
            Pobierz
          </a>
        </div>
      </div>
    </nav>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-7">
      <div className="label-mono text-honey">{eyebrow}</div>
      <h2 className="mt-1 text-2xl sm:text-3xl">{title}</h2>
    </div>
  );
}

function MetaphorItem({
  k,
  v,
  d,
}: {
  k: string;
  v: string;
  d: string;
}) {
  return (
    <div className="bg-hive-panel p-6">
      <div className="label-mono">{k}</div>
      <div className="mt-1 font-display text-xl text-honey-light">{v}</div>
      <p className="mt-2 text-sm text-wax-dim">{d}</p>
    </div>
  );
}

function StepCard({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="panel p-5">
      <div className="label-mono text-honey">{n}</div>
      <h3 className="mt-2 text-lg">{title}</h3>
      <p className="mt-2 text-sm text-wax-dim">{body}</p>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel p-5">
      <h3 className="text-lg">{title}</h3>
      <p className="mt-2 text-sm text-wax-dim">{body}</p>
    </div>
  );
}
