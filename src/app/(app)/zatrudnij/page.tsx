import { HireForm } from "@/components/HireForm";
import { PageHead } from "@/components/PageHead";
import { detectEngines } from "@/lib/engines";
import { t } from "@/lib/i18n";

export const metadata = { title: t.hire.title };
export const dynamic = "force-dynamic";

export default async function ZatrudnijPage() {
  const engineAvailability = await detectEngines();

  return (
    <>
      <PageHead title={t.hire.title} subtitle={t.hire.stepRoleHint} />
      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
        <HireForm engineAvailability={engineAvailability} />
      </div>
    </>
  );
}
