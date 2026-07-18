"use client";

import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import type { TaskStatus } from "@/lib/types";

export interface MapNode {
  id: string;
  title: string;
  status: TaskStatus;
  agentName: string;
  color: string;
  dependsOn: string[];
}

const NODE_W = 214;
const NODE_H = 84;
const COL_GAP = 92;
const ROW_GAP = 22;

const STATUS_COLOR: Record<TaskStatus, string> = {
  proposed: "#8e8e93",
  queued: "#8e8e93",
  running: "#30d158",
  awaiting_approval: "#ff9f0a",
  done: "#0a84ff",
  failed: "#ff453a",
};

export function MapGraph({ nodes }: { nodes: MapNode[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const { pos, edges, W, H } = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const depthCache = new Map<string, number>();
    const depth = (id: string, seen = new Set<string>()): number => {
      if (depthCache.has(id)) return depthCache.get(id)!;
      if (seen.has(id)) return 0;
      seen.add(id);
      const deps = (byId.get(id)?.dependsOn ?? []).filter((d) => byId.has(d));
      const d = deps.length ? Math.max(...deps.map((x) => depth(x, seen))) + 1 : 0;
      depthCache.set(id, d);
      return d;
    };

    const cols = new Map<number, MapNode[]>();
    for (const n of nodes) {
      const d = depth(n.id);
      if (!cols.has(d)) cols.set(d, []);
      cols.get(d)!.push(n);
    }

    const pos = new Map<string, { x: number; y: number }>();
    let maxRows = 0;
    let maxCol = 0;
    for (const [d, list] of cols) {
      maxCol = Math.max(maxCol, d);
      maxRows = Math.max(maxRows, list.length);
      list.forEach((n, row) => {
        pos.set(n.id, { x: d * (NODE_W + COL_GAP), y: row * (NODE_H + ROW_GAP) });
      });
    }

    const edges: Array<{ from: string; to: string; d: string }> = [];
    for (const n of nodes) {
      const to = pos.get(n.id);
      if (!to) continue;
      for (const dep of n.dependsOn) {
        const from = pos.get(dep);
        if (!from) continue;
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const dx = Math.max(40, (x2 - x1) / 2);
        edges.push({
          from: dep,
          to: n.id,
          d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`,
        });
      }
    }

    return {
      pos,
      edges,
      W: (maxCol + 1) * (NODE_W + COL_GAP) - COL_GAP,
      H: Math.max(1, maxRows) * (NODE_H + ROW_GAP) - ROW_GAP,
    };
  }, [nodes]);

  const lit = (id: string) => hover === id;
  const edgeLit = (e: { from: string; to: string }) =>
    hover === null || hover === e.from || hover === e.to;

  return (
    <div className="relative flex flex-col rounded-2xl border border-line bg-panel md:min-h-0 md:flex-1">
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel-2 text-lg text-ink hover:brightness-110"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel-2 text-lg text-ink hover:brightness-110"
        >
          +
        </button>
      </div>

      <div className="min-h-[320px] overflow-auto p-6 md:min-h-0 md:flex-1">
        <div style={{ width: W * zoom, height: H * zoom }}>
          <div
            className="relative"
            style={{ width: W, height: H, transform: `scale(${zoom})`, transformOrigin: "0 0" }}
          >
            <svg
              className="pointer-events-none absolute inset-0"
              width={W}
              height={H}
              style={{ overflow: "visible" }}
            >
              {edges.map((e, i) => (
                <path
                  key={i}
                  d={e.d}
                  fill="none"
                  stroke={edgeLit(e) ? "#0a84ff" : "#3a3a42"}
                  strokeWidth={edgeLit(e) && hover ? 2.5 : 1.5}
                  opacity={edgeLit(e) ? 1 : 0.35}
                />
              ))}
            </svg>

            {nodes.map((n) => {
              const p = pos.get(n.id);
              if (!p) return null;
              return (
                <div
                  key={n.id}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  className="absolute flex cursor-default flex-col justify-between rounded-xl border bg-panel-2 p-3 transition"
                  style={{
                    left: p.x,
                    top: p.y,
                    width: NODE_W,
                    height: NODE_H,
                    borderColor: lit(n.id) ? n.color : "var(--color-line)",
                    boxShadow: lit(n.id) ? `0 0 0 1px ${n.color}` : "none",
                    opacity: hover && !lit(n.id) ? 0.55 : 1,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: STATUS_COLOR[n.status] }}
                    />
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-wide"
                      style={{ color: STATUS_COLOR[n.status] }}
                    >
                      {t.plan.taskStatuses[n.status]}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[12.5px] font-semibold leading-tight text-ink">
                    {n.title}
                  </p>
                  <p className="truncate text-[11px] font-medium" style={{ color: n.color }}>
                    {n.agentName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
