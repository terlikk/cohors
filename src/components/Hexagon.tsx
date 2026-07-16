import type { ReactNode } from "react";

/**
 * A honeycomb hexagon — the recognizable mark of Apiary. Used for the logo and
 * for worker-bee avatars. The glyph or children sit centered inside the cell,
 * ringed in the role color.
 */
export function Hexagon({
  size = 56,
  color = "#F0A818",
  children,
  className = "",
}: {
  size?: number;
  color?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`hex relative grid place-items-center ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(150deg, ${color}22, ${color}0a)`,
        boxShadow: `inset 0 0 0 1.5px ${color}66`,
      }}
    >
      <div
        className="font-mono font-semibold"
        style={{ color, fontSize: size * 0.3 }}
      >
        {children}
      </div>
    </div>
  );
}

/** The Apiary logo mark: a small filled honeycomb hex. */
export function ApiaryMark({ size = 30 }: { size?: number }) {
  return (
    <div
      className="hex"
      style={{
        width: size,
        height: size,
        backgroundImage: "linear-gradient(135deg, #F0A818, #FFC94A)",
        boxShadow: "0 4px 14px -4px rgba(240,168,24,0.7)",
      }}
    />
  );
}
