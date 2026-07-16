import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getAgent, getAgentOnboarding } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const onboarding = getAgentOnboarding(id);

  return (
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:overflow-y-auto">
      <section className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="text-[13px] font-semibold text-ink">
          {t.pages.agent.jobHeading}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/85">
          „{agent.jobDescription}”
        </p>
      </section>

      {onboarding.length > 0 && (
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-[13px] font-semibold text-ink">
            {t.pages.agent.onboardingHeading}
          </h2>
          <dl className="mt-2 flex flex-col gap-2.5">
            {onboarding.map((qa) => (
              <div key={qa.question}>
                <dt className="text-[12px] text-ink-muted">{qa.question}</dt>
                <dd className="m-0 text-sm text-ink/85">{qa.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
