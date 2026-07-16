import { Journal } from "@/components/Journal";
import { PageHead } from "@/components/PageHead";
import { t } from "@/lib/i18n";
import { listAgents, listJournal } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function DziennikPage() {
  const agents = listAgents();
  const journal = listJournal(200);

  return (
    <>
      <PageHead
        title={t.pages.dziennik.title}
        subtitle={t.pages.dziennik.subtitle}
      />
      <Journal events={journal} agents={agents} showHeading={false} />
    </>
  );
}
