import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, shuffle } from "./core.ts";

/** Liczby kawałków kolejnych tortów; każda raz w partii, w losowej kolejności. */
const PIECES = [3, 4, 5, 6, 7];
export const CAKES = PIECES.length;
/** Kara za tort po limicie czasu, w % tortu; więcej niż najgorszy uczciwy (wszystkie cięcia w jednym miejscu = (n − 1)/n). */
export const MAX_ERROR = 100;

/** `first`: kąt gotowego cięcia w stopniach. */
export type Cake = { pieces: number; first: number };

/** Dla każdego tortu `pieces − 1` kątów cięć w stopniach. Pusta lista = limit czasu (MAX_ERROR za każdy tort). */
export type Move = { type: "result"; cuts: number[][] };

export interface State {
  players: PlayerId[];
  cakes: Cake[];
  /** Suma błędów w dziesiątych częściach procenta (int). */
  results: Record<PlayerId, number>;
  cuts: Record<PlayerId, number[][]>;
}

export type View = State;

/**
 * Błąd tortu w % całego tortu: tyle trzeba by przełożyć między kawałkami, żeby były równe (połowa sumy odchyłek od 360°/n).
 * Kawałki to odstępy między kolejnymi cięciami po okręgu, razem z gotowym.
 */
export function error({ pieces, first }: Cake, cuts: number[]): number {
  const angles = [first, ...cuts].sort((a, b) => a - b);
  const moved = angles.reduce((sum, a, i) => sum + Math.abs((i ? a - angles[i - 1] : a + 360 - angles[angles.length - 1]) - 360 / pieces), 0);
  return (moved / 2 / 360) * 100;
}

// ponytail: torty są w widoku od startu (jak odcinki w Środku), da się podejrzeć; między znajomymi wystarczy.
export const tort: GameDefinition<State, Move> = {
  id: "tort",
  name: "Tort",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 120,
  moveSchema: z.object({
    type: z.literal("result"),
    cuts: z.array(z.array(z.number()).max(Math.max(...PIECES) - 1)).max(CAKES),
  }),

  setup: (players, rng) => ({
    players,
    cakes: shuffle(PIECES, rng).map((pieces) => ({ pieces, first: Math.floor(rng() * 360) })),
    results: {},
    cuts: {},
  }),

  validateMove: (state, player, { cuts }) =>
    state.players.includes(player) && !(player in state.results) && // NaN i nieskończoność też tu odpadają: porównanie z NaN jest fałszywe.
    (cuts.length === 0 || (cuts.length === CAKES && cuts.every((list, i) => list.length === state.cakes[i].pieces - 1 && list.every((a) => a >= 0 && a < 360)))),

  applyMove: (state, player, { cuts }) => {
    const sum = cuts.length ? state.cakes.reduce((s, cake, i) => s + error(cake, cuts[i]), 0) : CAKES * MAX_ERROR;
    return {
      ...state,
      results: { ...state.results, [player]: Math.round(sum * 10) },
      cuts: { ...state.cuts, [player]: cuts },
    };
  },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", cuts: [] }),
};
