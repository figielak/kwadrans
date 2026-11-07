import { z } from "zod";
import { type GameDefinition, type PlayerId, type Rng, rankPlaces, rankResults, shuffle } from "./core.ts";
import { PAIRS } from "./podrobka-dane.ts";

export const ROUNDS = 6;
export const WRITE_SECONDS = 30;
export const VOTE_SECONDS = 60;
export const SUMMARY_SECONDS = 15;
export const ANSWER_MAX = 30;
const DETECTION_MIN_VOTES = 2;
const CORRECT_VOTE_POINTS = 2;
const ESCAPE_POINTS = 3;

export type Move =
  | { type: "write"; nonce: number; round: number; answer: string; done: boolean }
  | { type: "vote"; nonce: number; round: number; target: PlayerId | null }
  | { type: "next"; nonce: number; round: number };
export type Phase = "write" | "vote" | "summary" | "over";
type Votes = Record<PlayerId, PlayerId | null>;
type Deal = { pairId: string; majority: string; other: string; hint: string; impostor: PlayerId };
export type RoundRecord = {
  round: number;
  majorityQuestion: string;
  otherQuestion: string;
  hint: string;
  impostor: PlayerId;
  answers: Record<PlayerId, string>;
  votes: Votes;
  tally: Record<PlayerId, number>;
  cancelled: boolean;
  missing: PlayerId[];
  detected: boolean;
  gain: Record<PlayerId, number>;
};
export type State = {
  players: PlayerId[];
  nonce: number;
  deals: Deal[];
  round: number;
  phase: Phase;
  drafts: Record<PlayerId, string>;
  done: PlayerId[];
  votes: Votes;
  ready: PlayerId[];
  totals: Record<PlayerId, number>;
  history: RoundRecord[];
};
/** Ukryte w danej fazie albo przed danym widzem pola to null. */
export type View = {
  players: PlayerId[];
  nonce: number;
  round: number;
  phase: Phase;
  done: PlayerId[];
  voted: PlayerId[];
  ready: PlayerId[];
  totals: Record<PlayerId, number>;
  history: RoundRecord[];
  hint: string | null;
  myQuestion: string | null;
  myDraft: string | null;
  majorityQuestion: string | null;
  answers: Record<PlayerId, string> | null;
  myVote: PlayerId | null;
};

const SECONDS: Record<Phase, number> = { write: WRITE_SECONDS, vote: VOTE_SECONDS, summary: SUMMARY_SECONDS, over: 0 };
const compare = (a: number, b: number) => b - a;
const zeroes = (players: PlayerId[]): Record<PlayerId, number> => Object.fromEntries(players.map((p) => [p, 0]));

/** Zewnętrzne białe znaki znikają, ciągi białych znaków stają się jedną spacją; litery zostają bez zmian. */
export const cleanAnswer = (text: string) => text.trim().replace(/\s+/g, " ");

/** Wykrycie: samodzielnie najwięcej głosów i co najmniej dwa. Trafny głos zwykłego gracza nie zależy od wykrycia. */
export function resolveVotes(players: PlayerId[], impostor: PlayerId, votes: Votes) {
  const tally = zeroes(players);
  for (const p of players) {
    const target = votes[p];
    if (target !== null) tally[target]++;
  }
  const top = Math.max(...players.map((p) => tally[p]));
  const detected = top >= DETECTION_MIN_VOTES && tally[impostor] === top && players.filter((p) => tally[p] === top).length === 1;
  const gain = Object.fromEntries(players.map((p) => {
    if (p === impostor) return [p, !detected && votes[p] !== null ? ESCAPE_POINTS : 0];
    return [p, votes[p] === impostor ? CORRECT_VOTE_POINTS : 0];
  }));
  return { tally, detected, gain };
}

function deal(players: PlayerId[], rng: Rng): Deal[] {
  return shuffle(PAIRS, rng).slice(0, ROUNDS).map((pair) => {
    const [majority, other] = rng() < 0.5 ? [pair.a, pair.b] : [pair.b, pair.a];
    return { pairId: pair.id, majority, other, hint: pair.hint, impostor: players[Math.floor(rng() * players.length)] };
  });
}

/** Wejście w odsłonę: tu i tylko tu liczą się punkty. Brak odpowiedzi to brak głosów, więc wszyscy mają 0. */
function reveal(state: State): State {
  const current = state.deals[state.round];
  const answers = Object.fromEntries(state.players.map((p) => [p, state.drafts[p] ?? ""]));
  const missing = state.players.filter((p) => answers[p] === "");
  const votes: Votes = Object.fromEntries(state.players.map((p) => [p, state.votes[p] ?? null]));
  const { tally, detected, gain } = resolveVotes(state.players, current.impostor, votes);
  const record: RoundRecord = {
    round: state.round,
    majorityQuestion: current.majority,
    otherQuestion: current.other,
    hint: current.hint,
    impostor: current.impostor,
    answers,
    votes,
    tally,
    cancelled: missing.length > 0,
    missing,
    detected,
    gain,
  };
  return {
    ...state,
    phase: state.round === ROUNDS - 1 ? "over" : "summary",
    totals: Object.fromEntries(state.players.map((p) => [p, state.totals[p] + gain[p]])),
    history: [...state.history, record],
  };
}

// Limit długości przez refine: `.max` w zod 4 nie liczy jednostek UTF-16 (emoji), a zasada i maxLength na ekranie tak.
const stamp = { nonce: z.number().int().min(0).max(2 ** 32 - 1), round: z.number().int().min(0).max(ROUNDS - 1) };
const moveSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("write"), ...stamp, answer: z.string().refine((answer) => answer.length <= ANSWER_MAX), done: z.boolean() }),
  z.object({ type: z.literal("vote"), ...stamp, target: z.string().nullable() }),
  z.object({ type: z.literal("next"), ...stamp }),
]);

export const podrobka: GameDefinition<State, Move> = {
  id: "podrobka",
  name: "Podróbka",
  minPlayers: 3,
  maxPlayers: 6,
  moveSchema,

  setup: (players, rng) => ({
    players,
    nonce: Math.floor(rng() * 2 ** 32),
    deals: deal(players, rng),
    round: 0,
    phase: "write",
    drafts: {},
    done: [],
    votes: {},
    ready: [],
    totals: zeroes(players),
    history: [],
  }),

  validateMove: (state, player, move, context) => {
    if (!state.players.includes(player) || !moveSchema.safeParse(move).success) return false;
    if (move.nonce !== state.nonce || move.round !== state.round) return false;
    const fromClock = context?.source === "timeout";
    if (move.type === "write") {
      if (state.phase !== "write" || state.done.includes(player)) return false;
      return !move.done || fromClock || cleanAnswer(move.answer) !== "";
    }
    if (move.type === "vote") {
      if (state.phase !== "vote" || Object.hasOwn(state.votes, player)) return false;
      return move.target === null ? fromClock : move.target !== player && state.players.includes(move.target);
    }
    return state.phase === "summary" && !state.ready.includes(player);
  },

  applyMove: (state, player, move) => {
    if (move.type === "write") {
      const drafts = { ...state.drafts, [player]: cleanAnswer(move.answer) };
      if (!move.done) return { ...state, drafts };
      const done = [...state.done, player];
      const next = { ...state, drafts, done };
      if (done.length < state.players.length) return next;
      return state.players.every((p) => drafts[p]) ? { ...next, phase: "vote" } : reveal(next);
    }
    if (move.type === "vote") {
      const next = { ...state, votes: { ...state.votes, [player]: move.target } };
      return Object.keys(next.votes).length < state.players.length ? next : reveal(next);
    }
    const ready = [...state.ready, player];
    if (ready.length < state.players.length) return { ...state, ready };
    return { ...state, round: state.round + 1, phase: "write", drafts: {}, done: [], votes: {}, ready: [] };
  },

  // Jawna lista pól: role, pary i cudze szkice zostają w stanie, a odsłonięte rundy są w publicznej historii.
  playerView: (state, player): View => {
    const current = state.deals[state.round];
    const playing = state.players.includes(player) && (state.phase === "write" || state.phase === "vote");
    const voting = state.phase === "vote";
    return {
      players: state.players,
      nonce: state.nonce,
      round: state.round,
      phase: state.phase,
      done: state.done,
      voted: state.players.filter((p) => Object.hasOwn(state.votes, p)),
      ready: state.ready,
      totals: state.totals,
      history: state.history,
      hint: playing ? current.hint : null,
      myQuestion: playing ? (player === current.impostor ? current.other : current.majority) : null,
      myDraft: playing ? (state.drafts[player] ?? "") : null,
      majorityQuestion: voting ? current.majority : null,
      answers: voting ? Object.fromEntries(state.players.map((p) => [p, state.drafts[p]])) : null,
      myVote: playing ? (state.votes[player] ?? null) : null,
    };
  },

  isOver: (state) => (state.phase === "over" ? rankResults(state.players, state.totals, compare) : null),
  places: (state) => rankPlaces(state.players, state.totals, compare),

  waitingFor: (state) => {
    if (state.phase === "write") return state.players.filter((p) => !state.done.includes(p));
    if (state.phase === "vote") return state.players.filter((p) => !Object.hasOwn(state.votes, p));
    if (state.phase === "summary") return state.players.filter((p) => !state.ready.includes(p));
    return [];
  },

  turn: (state) => ({ key: `${state.nonce}:${state.round}:${state.phase}`, seconds: SECONDS[state.phase] }),

  timeoutMove: (state, player) => {
    const stamped = { nonce: state.nonce, round: state.round };
    if (state.phase === "write") return { type: "write", ...stamped, answer: state.drafts[player] ?? "", done: true };
    if (state.phase === "vote") return { type: "vote", ...stamped, target: null };
    return { type: "next", ...stamped };
  },
};
