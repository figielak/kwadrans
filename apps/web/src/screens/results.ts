import { compareRecords, type GameResult, type RecordOrder, type RecordRow, type RoomView, standing } from "@kwadrans/games";

type Phase = RoomView["phase"];

export const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface HeroScore {
  best: number;
  tie: number | null;
}

export interface HeroRow {
  id: string;
  place: number;
  score?: string;
  gap?: string;
}

export interface Hero {
  title: string;
  rows: HeroRow[];
}

interface HeroInput {
  result: GameResult | null;
  /** Miejsca z serwera (`game.places`); bez nich `result.places`, potem pozycja. */
  places: Record<string, number> | null;
  seats: string[];
  /** Wynik gracza w jednostkach rekordu. Czytany tylko przy rankingu: w walkowerze gracz mógł wyniku nie oddać. */
  scoreOf?: (id: string) => HeroScore;
  gap?: (gap: { gap: number; onTie: boolean }) => string;
  format?: (best: number) => string;
  me: string;
  nick: (id: string) => string;
}

/** Różnica do osoby wyżej: w głównym wyniku, przy równym w drugim kryterium. Brak liczby po którejś stronie to brak różnicy. */
function gapBetween(above: HeroScore | null, below: HeroScore | null) {
  if (!above || !below) return null;
  if (above.best !== below.best) return { gap: Math.abs(above.best - below.best), onTie: false };
  if (above.tie === null || below.tie === null || above.tie === below.tie) return null;
  return { gap: Math.abs(above.tie - below.tie), onTie: true };
}

/**
 * Wynik partii do pokazania ludziom: tytuł i po wierszu na gracza, wyłącznie ze stanu.
 * null: partia jednoosobowa. Warunek patrzy na wynik, nie na `seats`, bo po walkowerze też zostaje jedna osoba, a bohater ma być.
 */
export function heroResult({ result, places, seats, scoreOf, gap, format, me, nick }: HeroInput): Hero | null {
  if (!result) return null;
  const { winner, ranking } = result;
  if (!winner && ranking?.length === 1) return null;

  const order = ranking ?? (winner ? [winner, ...seats.filter((id) => id !== winner)] : []);
  const placeOf = (id: string, i: number) => places?.[id] ?? result.places?.[id] ?? (ranking ? i + 1 : id === winner ? 1 : 2);
  const entries = order
    .map((id, i) => {
      const score = ranking && scoreOf ? scoreOf(id) : null;
      return { id, place: placeOf(id, i), score: score && Number.isFinite(score.best) ? score : null };
    })
    .sort((a, b) => a.place - b.place);

  const rows = entries.map(({ id, place, score }, i): HeroRow => {
    const above = entries[i - 1];
    const between = above && above.place !== place ? gapBetween(above.score, score) : null;
    const text = between && (gap?.(between) ?? String(between.gap));
    return {
      id,
      place,
      ...(score && { score: format?.(score.best) ?? String(score.best) }),
      // Zaokrąglenie potrafi dać „0,0 s”: różnicy bez niezerowej cyfry nie pokazujemy.
      ...(text && /[1-9]/.test(text) && { gap: text.startsWith("o ") ? text : `o ${text}` }),
    };
  });

  return { title: winner ? (winner === me ? "Wygrywasz!" : `Wygrywa ${nick(winner)}`) : "Remis", rows };
}

/** Kolejność odsłony: od ostatniego miejsca do pierwszego. */
export const revealOrder = <R,>(rows: R[]): R[] => [...rows].reverse();

/** Odsłona tylko, gdy partia skończyła się na oczach gracza i jest co odsłaniać: odświeżenie w `over` pokazuje całość od razu. */
export const shouldReveal = (prev: Phase | null, phase: Phase, count: number) => prev === "playing" && phase === "over" && count >= 3;

/** Najmniejszy błąd partii, ze wszystkich rund i graczy; przy remisie (także u jednej osoby) nie ma jednej najlepszej chwili. */
export function bestRound(rows: { id: string; errors: number[] }[]) {
  const cells = rows.flatMap(({ id, errors }) => errors.map((error, round) => ({ round, id, error })));
  const lowest = Math.min(...cells.map((c) => c.error));
  const best = cells.filter((c) => c.error === lowest);
  return best.length === 1 ? best[0] : null;
}

/** Porównanie partii z rankingiem sprzed niej. `before` null: strona odświeżona albo rekordy nie zdążyły dojść, więc o rekordzie nie wiadomo. */
export function recordChange(before: RecordRow[] | null, nick: string, order: RecordOrder, now: { best: number; tie: number | null }, score: HeroScore) {
  const was = before && standing(before, nick, order);
  return {
    was,
    fresh: !!before && (!was || compareRecords(order)(now, was) < 0),
    // Ile zabrakło do własnego rekordu: w głównym wyniku albo, przy równym, w drugim kryterium.
    missed: gapBetween(now, score),
  };
}

/**
 * Panel rekordów przy bohaterze: `full`, gdy padł rekord, awans albo pierwszy wynik, inaczej jedna linia.
 * null: obserwator albo wynik, którego nie ma w rankingu.
 */
export function recordSummary({ before, after, nick, order, score, format, gap }: {
  before: RecordRow[] | null;
  after: RecordRow[];
  nick: string;
  order: RecordOrder;
  score: HeroScore | undefined;
  format: (score: HeroScore) => string;
  gap: (gap: { gap: number; onTie: boolean }) => string;
}): { full: true } | { line: string } | null {
  const now = score ? standing(after, nick, order) : null;
  if (!now || !score) return null;
  const { was, fresh, missed } = recordChange(before, nick, order, now, score);
  if (fresh || (was && was.place > now.place)) return { full: true };
  const short = missed && gap(missed);
  if (short && /[1-9]/.test(short)) return { line: `Do Twojego rekordu zabrakło ${short}` };
  return { line: `${before && !missed ? "Wyrównany rekord" : "Twój rekord"}: ${format(now)}` };
}
