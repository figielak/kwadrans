import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, withSum } from "./core.ts";

export const ROUNDS = 5;
/** Zakres czasu świecenia pola w ms. */
export const MIN_MS = 1000;
export const MAX_MS = 5000;
/** Suma celów w każdej partii: odchyłka rośnie z długością celu, więc stała suma wyrównuje partie. */
export const TOTAL_MS = 15_000;

/** Czasy trzymania palca w ms, runda po rundzie; pusta lista = limit czasu. */
export type Move = { type: "result"; holds: number[] };

export interface State {
  players: PlayerId[];
  /** Czasy świecenia pola w ms, te same dla wszystkich. */
  targets: number[];
  /** Suma odchyłek w ms. */
  results: Record<PlayerId, number>;
  holds: Record<PlayerId, number[]>;
}

export type View = State;

/** Odchyłka rundy w ms, ucięta do celu: puszczenie od razu i trzymanie bez końca kosztują tyle samo. */
export const deviation = (target: number, hold: number) => Math.min(target, Math.abs(hold - target));

// ponytail: trzymanie mierzy klient (opóźnienie Wi-Fi zjadłoby pomiar), a cele są w widoku od startu; da się podrobić i podejrzeć,
// między znajomymi wystarczy. Serwer zna cele, więc sam liczy odchyłki z surowych czasów.
export const przytrzymaj: GameDefinition<State, Move> = {
  id: "przytrzymaj",
  name: "Przytrzymaj",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 120,
  moveSchema: z.object({ type: z.literal("result"), holds: z.array(z.number().int()).max(ROUNDS) }),

  setup: (players, rng) => ({
    players,
    targets: withSum(rng, ROUNDS, MIN_MS, MAX_MS, TOTAL_MS),
    results: {},
    holds: {},
  }),

  validateMove: (state, player, { holds }) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    (holds.length === 0 || holds.length === ROUNDS) &&
    holds.every((h) => Number.isInteger(h) && h >= 0 && h <= 2 * MAX_MS),

  applyMove: (state, player, { holds }) => ({
    ...state,
    // Pusta lista: `holds[i] ?? 0` daje w każdej rundzie pełną odchyłkę, czyli sumę celów.
    results: { ...state.results, [player]: state.targets.reduce((sum, target, i) => sum + deviation(target, holds[i] ?? 0), 0) },
    holds: { ...state.holds, [player]: holds },
  }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", holds: [] }),
};
