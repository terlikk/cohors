"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

export function AgentTabs({ agentId }: { agentId: string }) {
  const pathname = usePathname();
  const base = `/agenci/${agentId}`;
  const tabs = [
    { href: base, label: t.pages.agent.tabs.status },
    { href: `${base}/czat`, label: t.pages.agent.tabs.czat },
    { href: `${base}/pliki`, label: t.pages.agent.tabs.pliki },
    { href: `${base}/profil`, label: t.pages.agent.tabs.profil },
    { href: `${base}/opcje`, label: t.pages.agent.tabs.opcje },
  ];

  return (
    <nav className="flex gap-1.5">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              active
                ? "bg-ink text-bg"
                : "bg-panel-2 text-ink hover:brightness-95"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
