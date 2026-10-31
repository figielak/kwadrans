import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

/** Po tylu ms licznik znika i gracz liczy w głowie. */
export const VISIBLE_MS = 3000;
/** Cel w ms, ten sam w każdej partii, żeby wyniki dało się porównać (dawne partie mają w stanie swój losowy cel 6-14 s). */
export const TARGET_MS = 10_000;

/** Odchyłka od celu w ms; brak dotknięcia liczy się jak najgorszy wynik. */
export type Move = { type: "result"; deviation: number; stopped?: number };

export interface State {
  players: PlayerId[];
  /** Cel w ms: `TARGET_MS`; w dawnych zapisach pełne sekundy 6-14 s. Walidacja i ekran zawsze czytają go ze stanu. */
  target: number;
  /** Nic nie losuje, tylko odróżnia partie (rewanż montuje grę na kliencie od nowa). */
  nonce: number;
  results: Record<PlayerId, number>;
  /** Czas zatrzymania; brak mapy lub wpisu w dawnych zapisach i po timeoucie. */
  stops?: Record<PlayerId, number>;
}

export type View = State;

// ponytail: pomiar na kliencie, da się podrobić; między znajomymi wystarczy.
export const stoper: GameDefinition<State, Move> = {
  id: "stoper",
  name: "Stoper",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 60,
  moveSchema: z.object({ type: z.literal("result"), deviation: z.number(), stopped: z.number().int().min(0).optional() }),

  setup: (players, rng) => ({ players, target: TARGET_MS, nonce: Math.floor(rng() * 2 ** 32), results: {}, stops: {} }),

  validateMove: (state, player, { deviation, stopped }) =>
    state.players.includes(player) && !(player in state.results) && Number.isInteger(deviation) && deviation >= 0 && deviation <= state.target &&
    (stopped === undefined || (Number.isInteger(stopped) && stopped >= 0 && stopped <= 2 * state.target && Math.abs(stopped - state.target) === deviation)),

  applyMove: (state, player, { deviation, stopped }) => ({
    ...state,
    results: { ...state.results, [player]: deviation },
    ...(stopped === undefined ? {} : { stops: { ...state.stops, [player]: stopped } }),
  }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: (state) => ({ type: "result", deviation: state.target }),
};
