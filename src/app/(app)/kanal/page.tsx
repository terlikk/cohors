import { PageHead } from "@/components/PageHead";
import { TeamChannel } from "@/components/TeamChannel";
import { t } from "@/lib/i18n";
import { listTeamMessages } from "@/lib/repo";

export const metadata = { title: t.channel.title };
export const dynamic = "force-dynamic";

export default async function KanalPage() {
  const messages = listTeamMessages(150);

  return (
    <>
      <PageHead title={t.channel.title} subtitle={t.channel.subtitle} />
      <div className="flex md:min-h-0 md:flex-1 md:flex-col">
        <TeamChannel messages={messages} />
      </div>
    </>
  );
}
