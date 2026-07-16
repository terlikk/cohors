import { STATUS_DOT, type WorkerStatus } from "@/lib/status";

/**
 * A pulsing status dot: green = working, honey = waiting for you,
 * dim = free/at rest, red = stopped.
 */
export function StatusDot({
  status,
  size = 9,
}: {
  status: WorkerStatus;
  size?: number;
}) {
  const color = STATUS_DOT[status];
  const animate = status === "working" || status === "waiting";
  return (
    <span
      className={`inline-block rounded-full ${animate ? "animate-pulseDot" : ""}`}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size}px ${color}aa`,
      }}
    />
  );
}
