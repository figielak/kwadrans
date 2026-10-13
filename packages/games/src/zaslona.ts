import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, withSum } from "./core.ts";

export const ROUNDS = 8;
/** Tyle ms kulkę widać, zanim zniknie za zasłoną. */
export const MIN_VISIBLE = 800;
export const MAX_VISIBLE = 2000;
/** Tyle ms kulka jedzie za zasłoną do mety. */
export const MIN_HIDDEN = 1000;
export const MAX_HIDDEN = 4000;
/** Suma `hidden` w każdej partii: odchyłka rośnie z czasem za zasłoną, więc stała suma wyrównuje partie. */
export const TOTAL_HIDDEN = 20_000;

export type Round = { visible: number; hidden: number };
/** Czasy dotknięć w ms od zniknięcia kulki, runda po rundzie; pusta lista = limit czasu. */
export type Move = { type: "result"; taps: number[] };

export interface State {
  players: PlayerId[];
  /** Rundy, te same dla wszystkich. */
  rounds: Round[];
  /** Suma odchyłek w ms. */
  results: Record<PlayerId, number>;
  taps: Record<PlayerId, number[]>;
}

export type View = State;

/** Odchyłka rundy w ms, ucięta do czasu za zasłoną: dotknięcie od razu i brak dotknięcia kosztują tyle samo. */
export const deviation = (hidden: number, tap: number) => Math.min(hidden, Math.abs(tap - hidden));

const between = (rng: () => number, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

// ponytail: czas dotknięcia mierzy klient (opóźnienie Wi-Fi zjadłoby pomiar), a rundy są w widoku od startu; da się podrobić i podejrzeć,
// między znajomymi wystarczy. Serwer zna `hidden`, więc sam liczy odchyłki z surowych czasów.
export const zaslona: GameDefinition<State, Move> = {
  id: "zaslona",
  name: "Za zasłoną",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 120,
  moveSchema: z.object({ type: z.literal("result"), taps: z.array(z.number().int()).max(ROUNDS) }),

  setup: (players, rng) => {
    const hidden = withSum(rng, ROUNDS, MIN_HIDDEN, MAX_HIDDEN, TOTAL_HIDDEN);
    return { players, rounds: hidden.map((h) => ({ visible: between(rng, MIN_VISIBLE, MAX_VISIBLE), hidden: h })), results: {}, taps: {} };
  },

  validateMove: (state, player, { taps }) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    (taps.length === 0 || taps.length === ROUNDS) &&
    taps.every((t) => Number.isInteger(t) && t >= 0 && t <= 2 * MAX_HIDDEN),

  applyMove: (state, player, { taps }) => ({
    ...state,
    // Pusta lista: `taps[i] ?? 0` daje w każdej rundzie pełną odchyłkę, czyli sumę `hidden`.
    results: { ...state.results, [player]: state.rounds.reduce((sum, r, i) => sum + deviation(r.hidden, taps[i] ?? 0), 0) },
    taps: { ...state.taps, [player]: taps },
  }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", taps: [] }),
};
