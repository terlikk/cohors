import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { MapGraph, type MapNode } from "@/components/MapGraph";
import { t } from "@/lib/i18n";
import { listAgents, listOrders, listOrderTasks } from "@/lib/repo";
import { roleColor } from "@/lib/roles";

export const metadata = { title: t.map.title };
export const dynamic = "force-dynamic";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderParam } = await searchParams;
  const orders = listOrders();

  if (orders.length === 0) {
    return (
      <>
        <PageHead title={t.map.title} subtitle={t.map.subtitle} />
        <div className="rounded-2xl border border-line bg-panel p-8 text-center text-sm text-ink-muted">
          {t.map.empty}
        </div>
      </>
    );
  }

  const selected = orders.find((o) => o.id === orderParam) ?? orders[0];
  const tasks = listOrderTasks(selected.id);
  const agents = new Map(listAgents().map((a) => [a.id, a]));

  const nodes: MapNode[] = tasks.map((task) => {
    const agent = agents.get(task.agentId);
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      agentName: agent?.name ?? "?",
      color: agent ? roleColor[agent.role] : "#0a84ff",
      dependsOn: task.dependsOn,
    };
  });

  return (
    <>
      <PageHead title={t.map.title} subtitle={t.map.subtitle} />

      {orders.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/mapa?order=${o.id}`}
              className={`max-w-[280px] truncate rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                o.id === selected.id
                  ? "bg-ink text-bg"
                  : "border border-line bg-panel-2 text-ink hover:brightness-110"
              }`}
            >
              „{o.text}"
            </Link>
          ))}
        </div>
      )}

      {nodes.length === 0 ? (
        <div className="rounded-2xl border border-line bg-panel p-8 text-center text-sm text-ink-muted">
          {t.map.noTasks}
        </div>
      ) : (
        <MapGraph nodes={nodes} />
      )}
    </>
  );
}
