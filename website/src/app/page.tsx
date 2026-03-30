"use client";

import { useState } from "react";
import {
  Printer,
  Upload,
  BarChart3,
  Zap,
  Eye,
  ShoppingCart,
  Users,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Check,
  Bot,
  Layers,
  Cpu,
  Camera,
  AlertTriangle,
  TrendingUp,
  Package,
} from "lucide-react";

/* ───────────────── NAV ───────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Funkcje", href: "#features" },
    { label: "Jak to działa", href: "#how" },
    { label: "Integracje", href: "#integrations" },
    { label: "Cennik", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Print<span className="text-teal-400">Flow</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#pricing"
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Zacznij za darmo
          </a>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#0B1120]/95 px-6 pb-6 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-slate-400 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white"
          >
            Zacznij za darmo
          </a>
        </div>
      )}
    </nav>
  );
}

/* ───────────────── HERO ───────────────── */
function Hero() {
  return (
    <section className="grid-pattern relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm text-teal-400">
          <Zap className="h-4 w-4" />
          <span>Platforma do zarządzania farmą drukarek 3D</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          Twoja farma drukarek.{" "}
          <span className="gradient-text">Pełna kontrola.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
          Od uploadu STL po wysyłkę gotowego wydruku. Auto-wycena, inteligentne
          kolejkowanie, AI quality control i live monitoring — wszystko w jednym
          panelu.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#pricing"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-semibold text-white transition hover:opacity-90"
          >
            Wypróbuj PrintFlow
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </a>
          <a
            href="#how"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
          >
            Jak to działa?
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "< 5 min", label: "Upload → wycena" },
            { value: "AI", label: "Wykrywanie błędów" },
            { value: "24/7", label: "Live monitoring" },
            { value: "∞", label: "Drukarek w flocie" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
            >
              <div className="text-2xl font-bold text-amber-400 md:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FEATURES ───────────────── */
const features = [
  {
    icon: Upload,
    title: "Upload & Auto-Wycena",
    desc: "Klient wrzuca STL/3MF → auto-slicing, wycena z amortyzacją drukarki, podgląd 3D w przeglądarce.",
    accent: "teal",
  },
  {
    icon: BarChart3,
    title: "Fleet Dashboard",
    desc: "Live status każdej drukarki: idle / printing / error. Mapa farmy, historia awarii, success rate.",
    accent: "teal",
  },
  {
    icon: Cpu,
    title: "Smart Scheduling",
    desc: "Auto-assign do wolnej drukarki — matching po materiale, rozmiarze blatu, nozzle, jakości.",
    accent: "amber",
  },
  {
    icon: Camera,
    title: "Live Monitoring",
    desc: "Podgląd z kamer, progress %, temperatury, ETA — wszystko w real-time przez WebSockets.",
    accent: "teal",
  },
  {
    icon: Bot,
    title: "AI Quality Control",
    desc: "Spaghetti & warping detection — YOLO model, auto-pause przy wykryciu defektu. Zero zmarnowanego filamentu.",
    accent: "amber",
  },
  {
    icon: ShoppingCart,
    title: "Panel Klienta",
    desc: "Zamówienie → Stripe → tracking na żywo. Historia zamówień, ponowne zamówienie jednym klikiem.",
    accent: "teal",
  },
  {
    icon: Layers,
    title: "E-commerce Plugin",
    desc: "Shopify & WooCommerce — klient zamawia w sklepie → zlecenie automatycznie w PrintFlow.",
    accent: "amber",
  },
  {
    icon: Users,
    title: "Multi-Tenant SaaS",
    desc: "Row-level security, billing per tenant, role: admin / operator / klient. Self-hosted lub chmura.",
    accent: "teal",
  },
];

function Features() {
  const colorMap: Record<string, string> = {
    teal: "from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20",
  };

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Funkcje
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Wszystko czego potrzebuje{" "}
            <span className="gradient-text">Twoja farma</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Jeden system, który zastępuje 5 narzędzi. Od uploadu modelu po
            wysyłkę paczki.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-hover group rounded-2xl border border-white/5 bg-white/[0.02] p-6"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl border bg-gradient-to-b p-3 ${colorMap[f.accent]}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── HOW IT WORKS ───────────────── */
const steps = [
  {
    num: "01",
    title: "Upload modelu",
    desc: "Klient wrzuca plik STL/3MF. System waliduje geometrię i generuje podgląd 3D.",
    icon: Upload,
  },
  {
    num: "02",
    title: "Auto-wycena & slicing",
    desc: "PrusaSlicer/OrcaSlicer w Dockerze. Automatyczna kalkulacja: czas + materiał + amortyzacja + marża.",
    icon: TrendingUp,
  },
  {
    num: "03",
    title: "Smart scheduling",
    desc: "Algorytm przypisuje zlecenie do optymalnej drukarki. Matching po materiale, nozzle, rozmiarze blatu.",
    icon: Cpu,
  },
  {
    num: "04",
    title: "Druk & monitoring",
    desc: "Live podgląd z kamer, AI spaghetti detection, auto-pause przy defekcie. Zero waste.",
    icon: Eye,
  },
  {
    num: "05",
    title: "Wysyłka & tracking",
    desc: "Wydruk gotowy → powiadomienie → klient śledzi paczkę. Historia zamówień, re-order jednym klikiem.",
    icon: Package,
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Proces
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Jak to <span className="gradient-text">działa?</span>
          </h2>
        </div>

        <div className="mt-16 space-y-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="group flex gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-teal-500/20 hover:bg-white/[0.04] md:p-8"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-amber-500/10 text-xl font-bold text-teal-400">
                    {s.num}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-teal-400" />
                    <h3 className="text-xl font-semibold text-white">
                      {s.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-slate-400">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── INTEGRATIONS ───────────────── */
function Integrations() {
  const integrations = [
    {
      name: "Klipper / Moonraker",
      desc: "REST + WebSocket — pełna kontrola",
      priority: "P1",
    },
    {
      name: "OctoPrint",
      desc: "REST API — szerokie wsparcie",
      priority: "P1",
    },
    {
      name: "Bambu Lab",
      desc: "Cloud API — seria X1/P1",
      priority: "P2",
    },
    {
      name: "Prusa Connect",
      desc: "API — seria MK4/XL",
      priority: "P2",
    },
    {
      name: "Shopify",
      desc: "Plugin e-commerce",
      priority: "P2",
    },
    {
      name: "WooCommerce",
      desc: "Plugin WordPress",
      priority: "P2",
    },
  ];

  return (
    <section id="integrations" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Integracje
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Łączy się z <span className="gradient-text">Twoim sprzętem</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Klipper, OctoPrint, Bambu Lab, Prusa Connect — i ciągle rośnie.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="card-hover flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/10 to-amber-500/10">
                <Printer className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{int.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      int.priority === "P1"
                        ? "bg-teal-500/10 text-teal-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {int.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{int.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── AI SECTION ───────────────── */
function AISection() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-teal-500/5">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-16">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm text-amber-400">
                <Bot className="h-4 w-4" />
                AI-Powered
              </div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                AI pilnuje jakości.{" "}
                <span className="text-amber-400">Ty śpisz spokojnie.</span>
              </h2>
              <p className="mt-4 text-slate-400">
                Model YOLO wykrywa spaghetti, warping i inne defekty w
                real-time. Auto-pause przy problemie = zero zmarnowanego
                filamentu i czasu.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Spaghetti detection — druk poszedł nie tak? Stop.",
                  "Warping alert — pierwszy layer się odkleił? Wiesz natychmiast.",
                  "Timelapse — każdy wydruk udokumentowany klatka po klatce.",
                  "Smart scheduling — AI optymalizuje kolejkę pod czas i materiał.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="glow-amber relative flex h-64 w-full items-center justify-center rounded-2xl border border-amber-500/10 bg-white/[0.02] md:h-80">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-16 w-16 text-amber-400/50" />
                  <p className="mt-4 text-sm text-slate-500">
                    🔴 Spaghetti detected
                  </p>
                  <p className="text-sm text-slate-600">
                    Drukarka #3 — auto-paused
                  </p>
                  <div className="mt-4 inline-flex rounded-lg bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
                    AI Confidence: 97.3%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── PRICING ───────────────── */
const plans = [
  {
    name: "Starter",
    price: "0 zł",
    period: "/msc",
    desc: "Do 3 drukarek. Idealne na start.",
    features: [
      "3 drukarki",
      "Upload & auto-wycena",
      "Podstawowe kolejkowanie",
      "Panel klienta",
      "Email support",
    ],
    cta: "Zacznij za darmo",
    highlight: false,
  },
  {
    name: "Pro",
    price: "199 zł",
    period: "/msc",
    desc: "Dla poważnych farm. Wszystko co trzeba.",
    features: [
      "20 drukarek",
      "AI spaghetti detection",
      "Live monitoring & kamery",
      "Smart scheduling",
      "E-commerce plugin",
      "Priorytetowy support",
    ],
    cta: "Wybierz Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Indywidualnie",
    period: "",
    desc: "Nieograniczona flota. Self-hosted opcja.",
    features: [
      "∞ drukarek",
      "Wszystko z Pro",
      "Self-hosted deployment",
      "Custom integracje",
      "SLA & dedykowany support",
      "API publiczne",
    ],
    cta: "Kontakt",
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Cennik
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Prosty <span className="gradient-text">cennik</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Zacznij za darmo. Skaluj kiedy jesteś gotowy.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`card-hover relative rounded-2xl border p-8 ${
                p.highlight
                  ? "glow-teal border-teal-500/30 bg-gradient-to-b from-teal-500/5 to-transparent"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500 to-amber-500 px-4 py-1 text-xs font-semibold text-white">
                  Najpopularniejszy
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {p.price}
                </span>
                <span className="text-slate-500">{p.period}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{p.desc}</p>

              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 flex-shrink-0 text-teal-400" />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition ${
                  p.highlight
                    ? "bg-gradient-to-r from-teal-500 to-amber-500 text-white hover:opacity-90"
                    : "border border-white/10 text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FAQ ───────────────── */
function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    {
      q: "Jakie drukarki są wspierane?",
      a: "Na start: Klipper/Moonraker i OctoPrint (REST API + WebSocket). W fazie 2: Bambu Lab (Cloud API) i Prusa Connect. Architektura jest modularna — łatwo dodać nowe bridge'e.",
    },
    {
      q: "Czy mogę hostować PrintFlow na swoim serwerze?",
      a: "Tak! PrintFlow to SaaS + self-hosted. Docker Compose → produkcja na Twoim serwerze. Albo korzystasz z naszej chmury — zero konfiguracji.",
    },
    {
      q: "Jak działa AI quality control?",
      a: "Model YOLO analizuje stream z kamer w real-time. Wykrywa spaghetti, warping, layer separation. Przy wykryciu defektu → auto-pause drukarki + alert na telefon.",
    },
    {
      q: "Ile kosztuje wdrożenie?",
      a: "Starter jest darmowy (do 3 drukarek). Pro od 199 zł/msc za 20 drukarek z pełnym AI i monitoringiem. Enterprise — indywidualnie pod Twoją flotę.",
    },
    {
      q: "Czy auto-wycena uwzględnia amortyzację drukarki?",
      a: "Tak — i to nas wyróżnia. Kalkulacja: czas druku × stawka + materiał (waga × cena/kg) + amortyzacja drukarki + Twoja marża. Nikt inny tego nie ma.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Pytania i <span className="gradient-text">odpowiedzi</span>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-white/[0.02] transition hover:border-white/10"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-medium text-white">{faq.q}</span>
                <ChevronRight
                  className={`h-5 w-5 flex-shrink-0 text-slate-500 transition ${
                    openIdx === i ? "rotate-90" : ""
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-5 text-slate-400">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── CTA ───────────────── */
function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glow-teal relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-transparent to-amber-500/10 p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Gotowy na <span className="gradient-text">PrintFlow</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Dołącz do farm, które przestały tracić czas i filament. Zacznij za
              darmo — upgrade kiedy chcesz.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#pricing"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-amber-500 px-8 py-4 text-lg font-semibold text-white transition hover:opacity-90"
              >
                Zacznij za darmo
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FOOTER ───────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Print<span className="text-teal-400">Flow</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 PrintFlow. Zarządzaj farmą drukarek 3D jak pro.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────── PAGE ───────────────── */
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AISection />
      <Integrations />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
