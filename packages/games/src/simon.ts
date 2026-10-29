import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

/** Dłuższej serii nikt nie powtórzy. */
const LENGTH = 100;

export type Move = { type: "result" | "progress"; score: number };

export interface State {
  players: PlayerId[];
  /** Kolory 0-3, ta sama sekwencja dla wszystkich. */
  sequence: number[];
  /** Najdłuższa powtórzona seria. */
  results: Record<PlayerId, number>;
  /** Ostatnia zaliczona seria; rośnie niezależnie od lokalnej, właśnie pokazywanej serii. */
  progress: Record<PlayerId, number>;
}

export type View = State;

// ponytail: wynik liczony na kliencie (sekwencja i tak jest w widoku), serwer sprawdza tylko zakres.
export const simon: GameDefinition<State, Move> = {
  id: "simon",
  name: "Sekwencja",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 300,
  turn: () => ({ key: "run", seconds: 300 }),
  moveSchema: z.object({ type: z.enum(["result", "progress"]), score: z.number().int() }),

  setup: (players, rng) => ({
    players,
    sequence: Array.from({ length: LENGTH }, () => Math.floor(rng() * 4)),
    results: {},
    progress: {},
  }),

  validateMove: (state, player, { score }) =>
    state.players.includes(player) && !(player in state.results) && Number.isInteger(score) &&
    score >= (state.progress?.[player] ?? 0) && score <= state.sequence.length,

  applyMove: (state, player, move) => move.type === "progress"
    ? { ...state, progress: { ...state.progress, [player]: move.score } }
    : { ...state, results: { ...state.results, [player]: move.score } },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => b - a, { lower: false, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: (state, player) => ({ type: "result", score: state.progress?.[player] ?? 0 }),
};
