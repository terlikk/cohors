import { Hexagon } from "./Hexagon";
import { ROLE_TEMPLATES } from "@/lib/roles";

/**
 * A decorative honeycomb cluster for the hero — the five craft roles arranged
 * like cells in a comb, with the honey queen-cell at the center.
 */
export function HoneycombCluster() {
  const roles = ROLE_TEMPLATES.filter((r) => r.key !== "custom");
  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      <div className="flex flex-col items-center gap-2">
        {/* top row */}
        <div className="flex gap-2">
          <Cell role={roles[0]} />
          <Cell role={roles[1]} />
        </div>
        {/* middle row, offset like a real comb */}
        <div className="-my-4 flex gap-2">
          <Cell role={roles[2]} />
          <Queen />
          <Cell role={roles[3]} />
        </div>
        {/* bottom row */}
        <div className="flex gap-2">
          <Cell role={roles[4]} />
        </div>
      </div>
    </div>
  );
}

function Cell({ role }: { role: (typeof ROLE_TEMPLATES)[number] }) {
  return (
    <div className="flex flex-col items-center">
      <Hexagon size={84} color={role.color}>
        {role.glyph}
      </Hexagon>
    </div>
  );
}

function Queen() {
  return (
    <div
      className="hex grid place-items-center"
      style={{
        width: 84,
        height: 84,
        backgroundImage: "linear-gradient(135deg, #F0A818, #FFC94A)",
        boxShadow: "0 10px 30px -8px rgba(240,168,24,0.7)",
      }}
    >
      <span className="font-display text-lg font-bold text-hive-bg">Ap</span>
    </div>
  );
}
