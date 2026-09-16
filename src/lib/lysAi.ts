/** Lysprodukter AI'en må sætte op i kundens lokale. */
export const LYS_AI_IDS = [
  "lyskaeder",
  "lyskaeder_farvet",
  "uplight",
  "uplight_4",
  "lyseffekt",
  "lys",
  "discokugle",
] as const;

export type LysAiId = (typeof LYS_AI_IDS)[number];

export function isLysAiId(id: string): id is LysAiId {
  return (LYS_AI_IDS as readonly string[]).includes(id);
}

/** Standardvalg når AI'en får lov at sammensætte selv. */
export const LYS_AI_ANBEFALING: LysAiId[] = ["lyskaeder", "uplight_4", "lyseffekt"];

export function rensLysIds(ids: unknown): LysAiId[] {
  if (!Array.isArray(ids)) return [...LYS_AI_ANBEFALING];
  const unikke = [...new Set(ids.filter((id): id is string => typeof id === "string").filter(isLysAiId))];
  return unikke.length ? unikke.slice(0, 5) : [...LYS_AI_ANBEFALING];
}
