"use client";

import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2 overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.04] py-2 pl-5 pr-2">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 font-mono text-[13px] text-white/80">
        <span className="mr-2 select-none text-white/30">$</span>
        {command}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            /* clipboard unavailable — user can select manually */
          }
        }}
        className="shrink-0 rounded-full bg-white px-5 py-2.5 text-[12.5px] font-semibold text-black transition hover:bg-white/90"
      >
        {copied ? "Skopiowane ✓" : "Kopiuj"}
      </button>
    </div>
  );
}
