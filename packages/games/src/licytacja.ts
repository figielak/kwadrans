import { z } from "zod";
import { type GameDefinition, type PlayerId, type Rng, rankPlaces, rankResults, shuffle } from "./core.ts";

export const ROUNDS = 15;
export const HAND = 15;
export const CHOOSE_SECONDS = 20;
export const REVEAL_SECONDS = 10;
/** Nagrody, każda raz: od −5 do −1 i od +1 do +10 (razem +40). Kolejność tasuje `rng`. */
export const PRIZES: readonly number[] = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type Move =
  | { type: "play"; card: number; nonce: number; round: number }
  | { type: "next"; nonce: number; round: number };
export type Phase = "choose" | "reveal" | "over";
/** Rozstrzygnięta runda: pula w chwili rozstrzygnięcia, karty wszystkich, zniesione wartości i suma puli. */
export type RoundRecord = {
  round: number;
  pot: number[];
  plays: Record<PlayerId, number>;
  cancelled: number[];
  winner: PlayerId | null;
  value: number;
};
export type State = {
  players: PlayerId[];
  nonce: number;
  phase: Phase;
  round: number;
  /** Nieodkryte nagrody w kolejności odkrywania (tajne). */
  prizes: number[];
  /** Odkryte nagrody czekające na zwycięzcę, najnowsza na końcu. */
  pot: number[];
  hands: Record<PlayerId, number[]>;
  /** Zatwierdzone karty bieżącej rundy (tajne do rozstrzygnięcia). */
  choices: Record<PlayerId, number>;
  ready: PlayerId[];
  score: Record<PlayerId, number>;
  history: RoundRecord[];
};
export type View = Omit<State, "prizes" | "choices"> & { prizesLeft: number[]; myCard: number | null };

const stamp = { nonce: z.number().int().min(0).max(2 ** 32 - 1), round: z.number().int().min(1).max(ROUNDS) };
const moveSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("play"), card: z.number().int().min(1).max(HAND), ...stamp }),
  z.object({ type: z.literal("next"), ...stamp }),
]);

const compare = (a: number, b: number) => b - a;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Kto bierze pulę: równe karty się znoszą, znak najnowszej nagrody wyznacza kierunek. */
export function judge(pot: number[], plays: Record<PlayerId, number>): { winner: PlayerId | null; cancelled: number[] } {
  const counts = new Map<number, number>();
  for (const card of Object.values(plays)) counts.set(card, (counts.get(card) ?? 0) + 1);
  const cancelled = [...counts].filter(([, n]) => n > 1).map(([card]) => card).sort((a, b) => a - b);
  const single = Object.entries(plays).filter(([, card]) => counts.get(card) === 1);
  if (!single.length) return { winner: null, cancelled };
  const up = (pot.at(-1) ?? 0) > 0;
  const best = single.reduce((a, b) => (up ? (b[1] > a[1] ? b : a) : (b[1] < a[1] ? b : a)));
  return { winner: best[0], cancelled };
}

/** Ustala kolejność nagród (testy): pierwsza trafia do puli, reszta czeka. Tylko przed pierwszym ruchem. */
export function arrange(state: State, order: number[]): State {
  return { ...state, pot: order.slice(0, 1), prizes: order.slice(1) };
}

function resolve(state: State, plays: Record<PlayerId, number>): State {
  const { winner, cancelled } = judge(state.pot, plays);
  const value = sum(state.pot);
  const last = state.round === ROUNDS;
  const record: RoundRecord = { round: state.round, pot: state.pot, plays, cancelled, winner, value };
  return {
    ...state,
    phase: last ? "over" : "reveal",
    pot: winner !== null || last ? [] : state.pot,
    hands: Object.fromEntries(state.players.map((p) => [p, state.hands[p].filter((card) => card !== plays[p])])),
    choices: {},
    ready: [],
    score: winner === null ? state.score : { ...state.score, [winner]: state.score[winner] + value },
    history: [...state.history, record],
  };
}

/** Następna runda; w ostatniej każdy ma jedną kartę, więc rozstrzyga się od razu. */
function nextRound(state: State): State {
  const s: State = {
    ...state,
    phase: "choose",
    round: state.round + 1,
    pot: [...state.pot, state.prizes[0]],
    prizes: state.prizes.slice(1),
    choices: {},
    ready: [],
  };
  return s.round === ROUNDS ? resolve(s, Object.fromEntries(s.players.map((p) => [p, s.hands[p][0]]))) : s;
}

export const licytacja: GameDefinition<State, Move> = {
  id: "licytacja",
  name: "Licytacja na ślepo",
  minPlayers: 2,
  maxPlayers: 6,
  moveSchema,

  setup: (players, rng) => {
    const order = shuffle([...PRIZES], rng);
    return {
      players,
      nonce: Math.floor(rng() * 2 ** 32),
      phase: "choose",
      round: 1,
      prizes: order.slice(1),
      pot: order.slice(0, 1),
      hands: Object.fromEntries(players.map((p) => [p, Array.from({ length: HAND }, (_, i) => i + 1)])),
      choices: {},
      ready: [],
      score: Object.fromEntries(players.map((p) => [p, 0])),
      history: [],
    };
  },

  validateMove: (state, player, move) => {
    if (!state.players.includes(player) || !moveSchema.safeParse(move).success) return false;
    if (move.nonce !== state.nonce || move.round !== state.round) return false;
    if (move.type === "play") {
      return state.phase === "choose" && !Object.hasOwn(state.choices, player) && state.hands[player].includes(move.card);
    }
    return state.phase === "reveal" && !state.ready.includes(player);
  },

  applyMove: (state, player, move) => {
    if (move.type === "play") {
      const choices = { ...state.choices, [player]: move.card };
      return state.players.every((p) => Object.hasOwn(choices, p)) ? resolve(state, choices) : { ...state, choices };
    }
    const ready = state.players.filter((p) => p === player || state.ready.includes(p));
    return ready.length === state.players.length ? nextRound(state) : { ...state, ready };
  },

  playerView: (state, player): View => ({
    players: state.players,
    nonce: state.nonce,
    phase: state.phase,
    round: state.round,
    pot: state.pot,
    hands: state.hands,
    ready: state.phase === "choose" ? state.players.filter((p) => Object.hasOwn(state.choices, p)) : state.ready,
    score: state.score,
    history: state.history,
    prizesLeft: [...state.prizes].sort((a, b) => a - b),
    myCard: state.phase === "choose" && Object.hasOwn(state.choices, player) ? state.choices[player] : null,
  }),

  isOver: (state) => (state.phase === "over" ? rankResults(state.players, state.score, compare) : null),
  places: (state) => rankPlaces(state.players, state.score, compare),
  waitingFor: (state) => {
    if (state.phase === "choose") return state.players.filter((p) => !Object.hasOwn(state.choices, p));
    if (state.phase === "reveal") return state.players.filter((p) => !state.ready.includes(p));
    return [];
  },
  turn: (state) => ({
    key: `${state.nonce}:${state.round}:${state.phase}`,
    seconds: state.phase === "choose" ? CHOOSE_SECONDS : state.phase === "reveal" ? REVEAL_SECONDS : 0,
  }),
  timeoutMove: (state, player, rng) => {
    if (state.phase !== "choose") return { type: "next", nonce: state.nonce, round: state.round };
    const hand = state.hands[player];
    return { type: "play", card: hand[Math.floor(rng() * hand.length)], nonce: state.nonce, round: state.round };
  },
};
