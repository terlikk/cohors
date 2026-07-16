import { HireBossForm } from "@/components/HireBossForm";
import { HireForm } from "@/components/HireForm";
import { PageHead } from "@/components/PageHead";
import { detectEngines } from "@/lib/engines";
import { t } from "@/lib/i18n";
import { listAgents } from "@/lib/repo";

export const metadata = { title: t.hire.title };
export const dynamic = "force-dynamic";

export default async function ZatrudnijPage() {
  const engineAvailability = await detectEngines();
  const firstRun = listAgents().length === 0;

  if (firstRun) {
    return (
      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
        <HireBossForm engineAvailability={engineAvailability} />
      </div>
    );
  }

  return (
    <>
      <PageHead title={t.hire.title} subtitle={t.hire.stepRoleHint} />
      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
        <HireForm engineAvailability={engineAvailability} />
      </div>
    </>
  );
}
