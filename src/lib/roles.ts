/**
 * Role templates — the "job openings" a beekeeper can hire for.
 * Each role is independent of the engine ("brain") that executes the work.
 */

export type RoleKey =
  | "marketing"
  | "dev"
  | "research"
  | "copy"
  | "support"
  | "custom";

export interface RoleTemplate {
  key: RoleKey;
  /** Polish label shown in the UI. */
  label: string;
  /** Short one-liner describing the craft. */
  tagline: string;
  /** Tailwind color token (see tailwind.config.ts -> colors.role). */
  color: string;
  /** Emoji-free glyph used on the hexagon avatar. */
  glyph: string;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    key: "marketing",
    label: "Marketing",
    tagline: "Kampanie, social media, promocja",
    color: "#F07050",
    glyph: "MK",
  },
  {
    key: "dev",
    label: "Programista",
    tagline: "Kod, testy, wdrożenia",
    color: "#B99AF5",
    glyph: "DV",
  },
  {
    key: "research",
    label: "Research",
    tagline: "Analiza rynku i konkurencji",
    color: "#6FC9E8",
    glyph: "RS",
  },
  {
    key: "copy",
    label: "Copywriting",
    tagline: "Teksty, newslettery, treści",
    color: "#F0A818",
    glyph: "CW",
  },
  {
    key: "support",
    label: "Support",
    tagline: "Obsługa klienta, odpowiedzi",
    color: "#7DD87D",
    glyph: "SP",
  },
  {
    key: "custom",
    label: "Własna rola",
    tagline: "Zdefiniuj stanowisko po swojemu",
    color: "#F5E6C4",
    glyph: "★",
  },
];

export const ROLE_BY_KEY: Record<RoleKey, RoleTemplate> = Object.fromEntries(
  ROLE_TEMPLATES.map((r) => [r.key, r]),
) as Record<RoleKey, RoleTemplate>;

export function roleColor(key: string): string {
  return ROLE_BY_KEY[key as RoleKey]?.color ?? "#F5E6C4";
}
