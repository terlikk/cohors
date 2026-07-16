import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { Team } from "@/components/Team";
import { t } from "@/lib/i18n";
import { listAgents } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AgenciPage() {
  const agents = listAgents();

  return (
    <>
      <PageHead
        title={t.pages.agents.title}
        subtitle={t.pages.agents.subtitle}
        action={
          <Link
            href="/zatrudnij"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t.team.hire}
          </Link>
        }
      />
      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
        <Team agents={agents} showHeading={false} />
      </div>
    </>
  );
}
