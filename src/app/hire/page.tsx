import Link from "next/link";
import { HireForm } from "@/components/HireForm";
import { detectEngines } from "@/lib/engines";
import { t } from "@/lib/i18n";

export const metadata = { title: t.hire.title };
export const dynamic = "force-dynamic";

export default async function HirePage() {
  const engineAvailability = await detectEngines();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <Link href="/" className="text-xs text-ink-muted hover:text-accent">
          {t.hire.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          {t.hire.title}
        </h1>
      </header>
      <HireForm engineAvailability={engineAvailability} />
    </div>
  );
}
