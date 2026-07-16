import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { ApiaryMark, Hexagon } from "@/components/Hexagon";
import { StatusDot } from "@/components/StatusDot";
import { roleColor, ROLE_BY_KEY } from "@/lib/roles";
import { WORKER_STATUS_LABEL, type WorkerStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const workers = db.select().from(schema.workers).all();
  const events = db
    .select()
    .from(schema.events)
    .orderBy(desc(schema.events.createdAt))
    .limit(20)
    .all();

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <ApiaryMark />
          <div>
            <h1 className="text-xl leading-none">Apiary</h1>
            <p className="label-mono mt-1">twoja pasieka agentów AI</p>
          </div>
        </Link>
        <div className="label-mono flex items-center gap-2">
          <StatusDot status="free" />
          {workers.length} robotnic
        </div>
      </header>

      {/* 1. Order field */}
      <section className="panel-raised mb-6 p-4 sm:p-5">
        <label className="label-mono mb-2 block">Wydaj rozkaz pasiece</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            disabled
            placeholder="np. W czwartek premiera nowej wersji apki — ogarnijcie promocję i sprawdźcie technikalia…"
            className="min-h-[64px] flex-1 resize-none rounded-xl border border-hive-border bg-hive-bg/60 px-3 py-2.5 text-wax placeholder:text-wax-dim/70 focus:outline-none"
          />
          <button disabled className="btn-honey self-end opacity-60">
            Rozbij na zadania
          </button>
        </div>
        <p className="mt-2 text-xs text-wax-dim">
          Pole ożyje w kolejnym etapie — najpierw zatrudnimy robotnice.
        </p>
      </section>

      {/* 2. Waiting for the beekeeper */}
      <Section title="Czeka na pszczelarza" accent>
        <EmptyState text="Nic nie czeka na Twoją decyzję. Gdy robotnica skończy zadanie, jej wynik pojawi się tutaj do zatwierdzenia." />
      </Section>

      {/* 3. The honeycomb of workers */}
      <Section
        title="Plaster"
        action={
          <button disabled className="btn-ghost opacity-60">
            + Zatrudnij robotnicę
          </button>
        }
      >
        {workers.length === 0 ? (
          <EmptyState text="Pasieka jest jeszcze pusta. Zatrudnianie robotnic uruchomimy w Etapie 1." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {workers.map((w) => (
              <WorkerCell key={w.id} name={w.name} role={w.role} status={w.status as WorkerStatus} />
            ))}
          </div>
        )}
      </Section>

      {/* 4. The hive journal */}
      <Section title="Dziennik ula">
        {events.length === 0 ? (
          <EmptyState text="Cicho w ulu. Tu na żywo zobaczysz kto co zaczął, skończył i ile to kosztowało." />
        ) : (
          <ul className="divide-y divide-hive-border">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="label-mono shrink-0">{e.type}</span>
                <span className="text-wax">{e.message}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <footer className="mt-10 text-center text-xs text-wax-dim">
        Apiary · open source (MIT) · fundament (Etap 0)
      </footer>
    </main>
  );
}

function Section({
  title,
  children,
  action,
  accent = false,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base">
          {accent && <StatusDot status="waiting" size={8} />}
          {title}
        </h2>
        {action}
      </div>
      <div className="panel p-4">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-wax-dim">{text}</p>;
}

function WorkerCell({
  name,
  role,
  status,
}: {
  name: string;
  role: string;
  status: WorkerStatus;
}) {
  const template = ROLE_BY_KEY[role as keyof typeof ROLE_BY_KEY];
  return (
    <div className="panel-raised flex flex-col items-center gap-2 p-4">
      <Hexagon color={roleColor(role)}>{template?.glyph ?? "★"}</Hexagon>
      <div className="text-center">
        <div className="font-medium">{name}</div>
        <div className="label-mono">{template?.label ?? role}</div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-wax-dim">
        <StatusDot status={status} size={7} />
        {WORKER_STATUS_LABEL[status]}
      </div>
    </div>
  );
}
