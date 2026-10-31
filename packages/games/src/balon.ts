import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, shuffle } from "./core.ts";

export const BALLOONS = 10;
/** Balon wytrzymuje od `MIN_SAFE` do `MAX_SAFE` stuknięć; następne go rozrywa. */
export const MIN_SAFE = 11;
export const MAX_SAFE = 20;
/**
 * Wytrzymałości balonów: zawsze ten sam komplet, tasowany między partiami. Gracz decyduje, kiedy przestać,
 * więc sama stała suma różnych rozkładów nie wyrównywała ryzyka (dawniej 1-30 o sumie 155).
 */
const LIMITS = Array.from({ length: BALLOONS }, (_, i) => MIN_SAFE + i);
/** Suma wytrzymałości w każdej partii: tyle da się najwyżej zgarnąć. */
export const TOTAL = 155;

/** Suma zgarniętych punktów i liczba pękniętych balonów. */
export type Result = { score: number; popped: number };
/** `pumps[i]` to liczba stuknięć w balonie `i`; pusta lista = limit czasu. */
export type Move = { type: "result"; pumps: number[] } | { type: "progress"; done: number };

export interface State {
  players: PlayerId[];
  /** Wytrzymałość każdego balonu, ta sama dla wszystkich. */
  limits: number[];
  results: Record<PlayerId, Result>;
  pumps: Record<PlayerId, number[]>;
  /** Ile balonów gracz już zakończył (1-9), zgłaszane przez klienta; tylko do podglądu u rywali. */
  progress: Record<PlayerId, number>;
}

export type View = State;

const TURN_SECONDS = 120;

/** Balon ze stuknięciami ponad wytrzymałość pękł i daje 0; brakujący balon (limit czasu) liczy się jak pęknięty. */
export function score(limits: number[], pumps: number[]): Result {
  const kept = limits.map((limit, i) => (pumps[i] <= limit ? pumps[i] : null));
  return { score: kept.reduce<number>((sum, n) => sum + (n ?? 0), 0), popped: kept.filter((n) => n === null).length };
}

// ponytail: wytrzymałości są w widoku od startu (partia toczy się na kliencie), da się je podejrzeć; między znajomymi wystarczy.
// Uczciwa wersja to ruch na każde stuknięcie i `playerView` bez `limits`.
export const balon: GameDefinition<State, Move> = {
  id: "balon",
  name: "Balon",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: TURN_SECONDS,
  // Stały klucz: ruch progress nie odnawia limitu, nawet gdy gra już tylko jedna osoba.
  turn: () => ({ key: "run", seconds: TURN_SECONDS }),
  moveSchema: z.discriminatedUnion("type", [
    z.object({ type: z.literal("result"), pumps: z.array(z.number().int()).max(BALLOONS) }),
    z.object({ type: z.literal("progress"), done: z.number().int() }),
  ]),

  setup: (players, rng) => ({
    players,
    limits: shuffle(LIMITS, rng),
    results: {},
    pumps: {},
    progress: {},
  }),

  validateMove: (state, player, move) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    (move.type === "progress"
      ? move.done >= 1 && move.done < BALLOONS
      : move.pumps.length === 0 || (move.pumps.length === BALLOONS && move.pumps.every((n) => n >= 0 && n <= MAX_SAFE + 1))),

  applyMove: (state, player, move) =>
    move.type === "progress"
      ? { ...state, progress: { ...state.progress, [player]: move.done } }
      : { ...state, results: { ...state.results, [player]: score(state.limits, move.pumps) }, pumps: { ...state.pumps, [player]: move.pumps } },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => b.score - a.score || a.popped - b.popped, { lower: false, score: (r) => r.score, tie: { lower: true, score: (r) => r.popped } }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", pumps: [] }),
};
