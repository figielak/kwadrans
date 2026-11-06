import type { GameResult, RoomView } from "@kwadrans/games";

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
