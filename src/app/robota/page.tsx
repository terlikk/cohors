import Link from "next/link";
import { OrderBox } from "@/components/OrderBox";
import { PageHead } from "@/components/PageHead";
import { t } from "@/lib/i18n";
import { listOrders } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function RobotaPage({
  searchParams,
}: {
  searchParams: Promise<{ do?: string }>;
}) {
  const { do: addressee } = await searchParams;
  const orders = listOrders();

  return (
    <>
      <PageHead title={t.pages.robota.title} subtitle={t.pages.robota.subtitle} />
      <OrderBox initialText={addressee ? `${addressee}, ` : undefined} />

      <h2 className="mt-2 text-[15px] font-semibold text-ink">
        {t.pages.robota.historyHeading}
      </h2>
      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-panel px-5 py-5 text-sm text-ink-muted">
          {t.pages.robota.empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          {orders.map((order, i) => (
            <div
              key={order.id}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                „{order.text}”
              </span>
              <span className="shrink-0 font-mono text-[11.5px] text-ink-muted">
                {t.plan.taskCount(order.taskCount)} ·{" "}
                {t.pages.robota.statuses[order.status]}
              </span>
              <Link
                href={`/orders/${order.id}`}
                className="shrink-0 rounded-full bg-panel-2 px-4 py-2 text-[13px] font-semibold text-ink transition hover:brightness-95"
              >
                {t.pages.robota.seePlan}
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
