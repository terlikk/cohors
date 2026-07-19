import type { RoleKey } from "@/lib/types";

/**
 * Tools each role can reach. These are surfaced to the agent in its prompt
 * (so, on Claude Code, it actually uses its file/terminal/web tools) and
 * shown on the agent's profile. Files an agent produces land in its own
 * workspace and appear in its "Pliki" tab.
 */
export interface Tool {
  key: string;
  label: string;
  /** One-line hint injected into the agent's instructions. */
  hint: string;
}

export const TOOLS: Record<string, Tool> = {
  files: {
    key: "files",
    label: "Pliki",
    hint: "twórz i zapisuj pliki (dokumenty, teksty, dane) w swoim katalogu roboczym",
  },
  web: {
    key: "web",
    label: "Przeglądarka",
    hint: "przeglądaj i czytaj strony w sieci, żeby pracować na prawdziwych danych",
  },
  terminal: {
    key: "terminal",
    label: "Terminal",
    hint: "uruchamiaj polecenia w terminalu",
  },
  code: {
    key: "code",
    label: "Kod",
    hint: "pisz, uruchamiaj i poprawiaj kod",
  },
  image: {
    key: "image",
    label: "Grafika",
    hint: "przygotuj pliki graficzne / makiety kreacji i zapisz je jako pliki",
  },
  delegate: {
    key: "delegate",
    label: "Delegowanie",
    hint: "rozdzielaj zadania między członków zespołu",
  },
};

export const roleTools: Record<RoleKey, string[]> = {
  manager: ["delegate", "files", "web"],
  marketing: ["web", "image", "files"],
  developer: ["terminal", "code", "files", "web"],
  research: ["web", "files"],
  copywriting: ["web", "files"],
  support: ["web", "files"],
  custom: ["web", "files"],
};

export function toolsForRole(role: RoleKey): Tool[] {
  return (roleTools[role] ?? []).map((k) => TOOLS[k]).filter(Boolean);
}
