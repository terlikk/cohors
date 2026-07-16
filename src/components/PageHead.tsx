import type { ReactNode } from "react";

export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[13.5px] text-ink-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
