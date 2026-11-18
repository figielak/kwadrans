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

/** „10.11.26”: data bez miesiąca słownie, mieści się w wąskiej kolumnie. */
export const shortDate = (at: number) => {
  const d = new Date(at);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).slice(2)}`;
};

export const SOURCE_LABEL: Record<string, string> = {
  host: "gospodarz",
  vote: "głosowanie",
  rematch: "rewanż",
  tournament: "turniej",
  list: "solo: lista",
  random: "solo: losowa",
  daily: "solo: wyzwanie dnia",
  records: "solo: rekordy",
  import: "sprzed historii",
};
export const KIND_LABEL: Record<string, string> = { solo: "solo", room: "pokój", tournament: "turniej", quick: "szybka seria" };
export const OUTCOME_LABEL: Record<string, string> = { completed: "ukończona", walkover: "walkower", aborted: "przerwana: wyjście", stopped: "przerwana: gospodarz" };
export const WEEKDAYS = ["pon", "wt", "śr", "czw", "pt", "sob", "nd"];

/** „3 h 20 min”, „45 min”: łączny czas gry. */
export function hoursMinutes(seconds: number): string {
  const min = Math.round(seconds / 60);
  const h = Math.floor(min / 60);
  return h ? `${h} h ${min % 60} min` : `${min} min`;
}

/** Kolumny tabeli gier, po których można sortować; brak wartości zawsze na końcu. */
export type GameSort = "name" | "matches" | "players" | "completed" | "rematches" | "median" | "voteWon" | "lastAt";
export function sortValue(g: ReportGame, key: GameSort, name: string): number | string | null {
  switch (key) {
    case "name":
      return name;
    case "matches":
      return g.matches;
    case "players":
      return g.players;
    case "completed":
      return g.matches ? g.completed / g.matches : null;
    case "rematches":
      return g.completed ? g.rematches / g.completed : null;
    case "median":
      return g.medianSeconds;
    case "voteWon":
      return g.voteShown ? g.voteWon / g.voteShown : null;
    case "lastAt":
      return g.lastAt;
  }
}
export function compareBy<T>(value: (item: T) => number | string | null, descending: boolean) {
  return (a: T, b: T) => {
    const x = value(a);
    const y = value(b);
    if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
    const order = typeof x === "string" ? x.localeCompare(String(y), "pl") : x - (y as number);
    return descending ? -order : order;
  };
}
