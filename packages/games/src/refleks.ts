import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

/** Stała liczba zmian koloru: przy stałym czasie gry losowe opóźnienia zmieniałyby liczbę możliwych trafień. */
export const ROUNDS = 12;
const MIN_REACTION_MS = 100;
/** Czas rundy po falstarcie albo reakcji wolniejszej niż 1 s; zarazem najgorszy możliwy wynik. */
export const PENALTY_MS = 1000;

/** Czasy reakcji w kolejnych rundach (kara = `PENALTY_MS`); pusta lista = limit czasu. */
export type Move = { type: "result"; times: number[] };

export interface State {
  players: PlayerId[];
  /** Czas od początku czekania do zmiany koloru, ten sam dla wszystkich. */
  delays: number[];
  /** Średnia reakcja w ms. */
  results: Record<PlayerId, number>;
  times: Record<PlayerId, number[]>;
}

export type View = State;

// ponytail: reakcje mierzy klient (opóźnienie Wi-Fi zjadłoby pomiar), da się je podrobić;
// między znajomymi wystarczy, serwer odrzuca tylko nierealne wartości.
export const refleks: GameDefinition<State, Move> = {
  id: "refleks",
  name: "Refleks",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 60,
  moveSchema: z.object({ type: z.literal("result"), times: z.array(z.number().int()).max(ROUNDS) }),

  setup: (players, rng) => ({
    players,
    delays: Array.from({ length: ROUNDS }, () => Math.round(1000 + rng() * 2000)),
    results: {},
    times: {},
  }),

  validateMove: (state, player, { times }) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    (times.length === 0 || (times.length === ROUNDS && times.every((t) => t >= MIN_REACTION_MS && t <= PENALTY_MS))),

  applyMove: (state, player, { times }) => ({
    ...state,
    results: { ...state.results, [player]: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : PENALTY_MS },
    times: { ...state.times, [player]: times },
  }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", times: [] }),
};
