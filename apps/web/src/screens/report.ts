import type { ReportGame } from "@kwadrans/games";

/** „75%”; bez mianownika „brak”. */
export const percent = (n: number, of: number) => (of > 0 ? `${Math.round((n / of) * 100)}%` : "brak");

/** „45 s”, „4 min 30 s”, „12 min”; null to „brak”. */
export function duration(seconds: number | null): string {
  if (seconds === null) return "brak";
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${min} min ${rest} s` : `${min} min`;
}

/** Liczba z jednym miejscem po przecinku, bez zbędnego „,0”. */
export const one = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

/**
 * Najwyżej dwie krótkie uwagi o grze, która może nie zasługiwać na miejsce: mało ukończonych, częste porzucanie wyboru,
 * przegrywanie głosowań. Progi są celowo proste; liczą się tylko przy kilku próbach, żeby jedna partia nie robiła alarmu.
 */
export function warnings(g: ReportGame): string[] {
  const out: string[] = [];
  if (g.matches >= 5 && g.completed / g.matches < 0.6) out.push("często przerywana");
  if (g.picked >= 5 && g.dropped / g.picked >= 0.5) out.push("wybierana i porzucana");
  if (g.voteShown >= 5 && g.voteWon / g.voteShown < 0.15) out.push("przegrywa głosowania");
  if (g.solo + g.introLeft >= 5 && g.introLeft / Math.max(1, g.matches) >= 0.3) out.push("porzucana na instrukcji");
  return out.slice(0, 2);
}
