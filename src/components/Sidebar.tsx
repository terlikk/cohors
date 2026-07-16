"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
import { statusColor } from "@/lib/roles";
import type { AgentStatus } from "@/lib/types";

export interface SidebarAgent {
  id: string;
  name: string;
  roleLabel: string;
  status: AgentStatus;
}

function NavItem({
  href,
  label,
  active,
  count,
  dotColor,
}: {
  href: string;
  label: string;
  active: boolean;
  count?: number;
  dotColor?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-[13.5px] transition md:w-full ${
        active
          ? "bg-ink font-semibold text-white"
          : "bg-panel-2 text-ink hover:bg-line md:bg-transparent md:hover:bg-panel-2"
      }`}
    >
      {dotColor && (
        <span
          className="h-[7px] w-[7px] shrink-0 rounded-full"
          style={{ background: dotColor }}
        />
      )}
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`ml-auto rounded-full px-2 font-mono text-[10.5px] ${
            active ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({
  agents,
  awaitingCount,
  monthSpend,
}: {
  agents: SidebarAgent[];
  awaitingCount: number;
  monthSpend: number;
}) {
  const pathname = usePathname();
  const is = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="w-full border-b border-line bg-panel px-3.5 py-4 md:sticky md:top-0 md:flex md:h-dvh md:w-[236px] md:shrink-0 md:flex-col md:gap-6 md:overflow-y-auto md:border-b-0 md:border-r md:py-6">
      <div className="px-3">
        <p className="text-[15px] font-bold leading-tight tracking-tight text-ink">
          {t.brand.name}
        </p>
        <p className="text-[11.5px] text-ink-muted">{t.brand.tagline}</p>
      </div>

      <nav className="mt-3 flex flex-row flex-wrap gap-1.5 md:mt-0 md:flex-col md:gap-6">
        <div className="flex flex-row flex-wrap gap-1.5 md:flex-col md:gap-0.5">
          <h4 className="hidden px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted/70 md:block">
            {t.nav.groupWork}
          </h4>
          <NavItem href="/" label={t.nav.pulpit} active={is("/")} />
          <NavItem
            href="/robota"
            label={t.nav.robota}
            active={is("/robota") || is("/orders")}
          />
          <NavItem
            href="/odbior"
            label={t.nav.odbior}
            active={is("/odbior")}
            count={awaitingCount}
          />
          <NavItem href="/dziennik" label={t.nav.dziennik} active={is("/dziennik")} />
        </div>

        <div className="flex flex-row flex-wrap gap-1.5 md:flex-col md:gap-0.5">
          <h4 className="hidden px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted/70 md:block">
            {t.nav.groupTeam}
          </h4>
          <NavItem
            href="/agenci"
            label={t.nav.agents}
            active={pathname === "/agenci"}
          />
          <NavItem href="/zatrudnij" label={t.nav.hire} active={is("/zatrudnij")} />
          {agents.map((a) => (
            <NavItem
              key={a.id}
              href={`/agenci/${a.id}`}
              label={`${a.name} · ${a.roleLabel}`}
              active={pathname.startsWith(`/agenci/${a.id}`)}
              dotColor={statusColor[a.status]}
            />
          ))}
        </div>
      </nav>

      <div className="mt-3 hidden px-3 font-mono text-[10.5px] leading-relaxed text-ink-muted/70 md:mt-auto md:block">
        {t.nav.monthSpend(`$${monthSpend.toFixed(2)}`)}
        <br />
        open source · MIT
      </div>
    </aside>
  );
}
