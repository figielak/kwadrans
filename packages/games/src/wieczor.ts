import type { GameResult, PlayerId } from "./core.ts";
import { gamePoints } from "./turniej.ts";

interface GameRow {
  key: string;
  nick: string;
  place: number;
}

/** Historia zostaje na serwerze. Kluczem osoby jest nickKey, nigdy id sesji. */
export interface Evening {
  games: { gameId: string; rows: (GameRow & { points: number })[] }[];
  nicks: Record<string, string>;
}

export interface EveningRow {
  key: string;
  nick: string;
  points: number;
  /** Samodzielne pierwsze miejsca, jak w turnieju. */
  wins: number;
}

export interface EveningTitle {
  title: string;
  nick: string;
  detail: string;
}

/** Miejsca do punktacji: gotowe miejsca, miejsca wyniku, ranking, potem zwycięzca i wspólne drugie miejsce. */
export function placesFromResult(result: GameResult | null, places: Record<PlayerId, number> | null, seats: PlayerId[]): Record<PlayerId, number> | null {
  if (seats.length < 2 || !result || (!result.ranking && !result.winner)) return null;
  return Object.fromEntries(seats.map((id) => [id,
    places?.[id] ?? result.places?.[id] ?? (result.ranking ? result.ranking.indexOf(id) + 1 : id === result.winner ? 1 : 2),
  ]));
}

/** Dopisuje ukończoną partię; punktacja jest wspólna z turniejem. */
export function addGame(evening: Evening, gameId: string, rows: GameRow[]): Evening {
  if (rows.length < 2) return evening;
  // Punktujemy miejsca w partii, zanim połączymy różne sesje tej samej osoby pod nickKey.
  const ids = rows.map((_, i) => String(i));
  const points = gamePoints(Object.fromEntries(rows.map((row, i) => [ids[i], row.place])), ids);
  return {
    nicks: { ...evening.nicks, ...Object.fromEntries(rows.map(({ key, nick }) => [key, nick])) },
    games: [...evening.games, { gameId, rows: rows.map((row, i) => ({ ...row, points: points[ids[i]] })) }],
  };
}

const byStanding = (a: EveningRow, b: EveningRow) => b.points - a.points || b.wins - a.wins;

/** Gotowa tabela wszystkich uczestników wieczoru, także tych, którzy wyszli. Pełny remis zachowuje kolejność dołączenia. */
export function eveningTable(evening: Evening): EveningRow[] {
  const table = new Map<string, EveningRow>();
  for (const game of evening.games) {
    const first = game.rows.filter((row) => row.place === 1);
    for (const row of game.rows) {
      const total = table.get(row.key) ?? { key: row.key, nick: evening.nicks[row.key], points: 0, wins: 0 };
      table.set(row.key, { ...total, points: total.points + row.points, wins: total.wins + Number(first.length === 1 && row.place === 1) });
    }
  }
  return [...table.values()].sort(byStanding);
}

/** Najwyżej jeden tytuł każdego rodzaju; remisy rozstrzyga kolejność tabeli. */
export function titles(evening: Evening): EveningTitle[] {
  if (evening.games.length < 2) return [];
  const table = eveningTable(evening);
  const runs = new Map<string, number>();
  const bestRuns = new Map<string, number>();
  const totals = new Map<string, number>();
  const deficits = new Map<string, number>();
  for (const game of evening.games) {
    const first = new Set(game.rows.filter((row) => row.place === 1).map((row) => row.key));
    for (const row of game.rows) totals.set(row.key, (totals.get(row.key) ?? 0) + row.points);
    const lead = Math.max(...totals.values());
    for (const { key } of table) {
      const run = first.has(key) ? (runs.get(key) ?? 0) + 1 : 0;
      runs.set(key, run);
      bestRuns.set(key, Math.max(bestRuns.get(key) ?? 0, run));
      // Osoba jeszcze nie grała: nie ma straty do odrobienia.
      if (totals.has(key)) deficits.set(key, Math.max(deficits.get(key) ?? 0, lead - totals.get(key)!));
    }
  }
  const result: EveningTitle[] = [];
  const award = (title: string, candidates: EveningRow[], value: (row: EveningRow) => number, suffix = "") => {
    const best = [...candidates].sort((a, b) => value(b) - value(a))[0];
    if (best && value(best) > 0) result.push({ title, nick: best.nick, detail: `${value(best)}${suffix}` });
  };
  award("Najwięcej zwycięstw", table, (row) => row.wins);
  award("Najlepsza seria", table, (row) => bestRuns.get(row.key) ?? 0);
  award("Największy powrót", table.filter((row) => byStanding(row, table[0]) === 0), (row) => deficits.get(row.key) ?? 0, " pkt");
  return result;
}
