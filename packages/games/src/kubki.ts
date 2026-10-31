import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

export const ROUNDS = 20;
export const SHOW_MS = 1000;
export const CUPS = 3;
const SWAPS_START = 4;
const SWAP_MS_START = 500;
const SWAP_MS_STEP = 25;
const SWAP_MS_MIN = 150;

export type Round = { ball: number; swaps: number[][] };
export type Move = { type: "result"; picks: number[] };

export interface State {
  players: PlayerId[];
  rounds: Round[];
  results: Record<PlayerId, number>;
}

export type View = State;

export const swapCount = (round: number) => SWAPS_START + round;
export const swapMs = (round: number) => Math.max(SWAP_MS_MIN, SWAP_MS_START - SWAP_MS_STEP * round);

/** Gdzie kulka jest po tasowaniu: idzie za kubkiem, pod którym leży. */
export const ballAt = ({ ball, swaps }: Round) => swaps.reduce((at, [a, b]) => (at === a ? b : at === b ? a : at), ball);

/** Para to dwa miejsca bez trzeciego; ta sama para dwa razy z rzędu cofałaby zamianę, więc trzecie miejsce musi się zmienić. */
function swapsFor(rng: () => number, count: number): number[][] {
  const swaps: number[][] = [];
  let skipped = -1;
  for (let i = 0; i < count; i++) {
    let skip = Math.floor(rng() * CUPS);
    if (skip === skipped) skip = (skip + 1 + Math.floor(rng() * (CUPS - 1))) % CUPS;
    skipped = skip;
    const pair = [0, 1, 2].filter((place) => place !== skip);
    swaps.push(rng() < 0.5 ? pair : pair.reverse());
  }
  return swaps;
}

export const kubki: GameDefinition<State, Move> = {
  id: "kubki",
  name: "Trzy kubki",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 180,
  moveSchema: z.object({
    type: z.literal("result"),
    picks: z.array(z.number().int()).max(ROUNDS),
  }),

  setup: (players, rng) => ({
    players,
    rounds: Array.from({ length: ROUNDS }, (_, r) => ({ ball: Math.floor(rng() * CUPS), swaps: swapsFor(rng, swapCount(r)) })),
    results: {},
  }),

  validateMove: (state, player, move) =>
    state.players.includes(player) && !(player in state.results) && move.picks.length <= ROUNDS && move.picks.every((pick) => pick >= 0 && pick < CUPS),

  applyMove: (state, player, move) => {
    const hits = move.picks.findIndex((pick, i) => pick !== ballAt(state.rounds[i]));
    return { ...state, results: { ...state.results, [player]: hits === -1 ? move.picks.length : hits } };
  },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => b - a, { lower: false, score: (rounds) => rounds }),

  waitingFor: (state) => state.players.filter((player) => !(player in state.results)),

  timeoutMove: () => ({ type: "result", picks: [] }),
};
