import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { listAgentFiles } from "@/lib/files";
import { getAgent } from "@/lib/repo";

export const dynamic = "force-dynamic";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function AgentFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const files = listAgentFiles(id);

  return (
    <div className="flex flex-col gap-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
      <div>
        <h2 className="text-[13px] font-semibold text-ink">
          {t.pages.agent.filesHeading}
        </h2>
        <p className="mt-1 text-[12px] text-ink-muted">
          {t.pages.agent.filesHint}
        </p>
      </div>

      {files.length === 0 ? (
        <div className="rounded-2xl border border-line bg-panel p-6 text-center text-sm text-ink-muted">
          {t.pages.agent.filesEmpty}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          {files.map((file) => (
            <a
              key={file.rel}
              href={`/api/files/${id}?path=${encodeURIComponent(file.rel)}`}
              className="flex items-center gap-3 border-t border-line px-4 py-3 text-sm transition first:border-t-0 hover:bg-panel-2"
            >
              <span className="min-w-0 flex-1 truncate text-ink">
                {file.rel}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                {humanSize(file.size)}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-accent">
                Pobierz
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
