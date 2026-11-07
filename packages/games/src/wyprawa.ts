import { z } from "zod";
import { type GameDefinition, type PlayerId, type Rng, rankPlaces, rankResults, shuffle } from "./core.ts";

export const EXPEDITIONS = 5;
export const DECISION_SECONDS = 20;
export const SUMMARY_SECONDS = 15;
export const HAZARDS = ["osuwisko", "zalanie", "roj", "przepasc", "most"] as const;

export type Hazard = (typeof HAZARDS)[number];
export type Card = { kind: "treasure"; value: number } | { kind: "hazard"; hazard: Hazard };
export type Choice = "continue" | "return";
export type Move =
  | { type: "choose"; choice: Choice; nonce: number; expedition: number; reveal: number }
  | { type: "next"; nonce: number; expedition: number };
export type Phase = "decision" | "summary" | "over";
export type Resolution = {
  reveal: number;
  choices: Record<PlayerId, Choice>;
  returned: PlayerId[];
  share: number;
  banked: Record<PlayerId, number>;
  looseAfter: number;
};
export type ExpeditionRecord = {
  trail: Card[];
  gain: Record<PlayerId, number>;
  lost: Record<PlayerId, number>;
  discarded: number;
  end: "hazard" | "returned" | "empty";
  hazard: Hazard | null;
};
export type State = {
  players: PlayerId[];
  nonce: number;
  phase: Phase;
  expedition: number;
  reveal: number;
  deck: Card[];
  trail: Card[];
  onTrail: PlayerId[];
  bank: Record<PlayerId, number>;
  carried: Record<PlayerId, number>;
  loose: number;
  choices: Record<PlayerId, Choice>;
  ready: PlayerId[];
  last: Resolution | null;
  history: ExpeditionRecord[];
};
export type View = Omit<State, "deck" | "choices"> & { deckLeft: number; myChoice: Choice | null };

const zeroes = (players: PlayerId[]): Record<PlayerId, number> => Object.fromEntries(players.map((p) => [p, 0]));
const compare = (a: number, b: number) => b - a;

export function buildDeck(rng: Rng): Card[] {
  const treasures: Card[] = Array.from({ length: 15 }, (_, i) => ({ kind: "treasure", value: i + 1 }));
  const hazards: Card[] = HAZARDS.flatMap((hazard) => Array.from({ length: 3 }, (): Card => ({ kind: "hazard", hazard })));
  return shuffle([...treasures, ...hazards], rng);
}

/** Wszyscy wracający bankują jednocześnie, według tej samej reszty sprzed podziału. */
function bankReturns(state: State, returned: PlayerId[]) {
  const share = returned.length ? Math.floor(state.loose / returned.length) : 0;
  const banked = Object.fromEntries(returned.map((p) => [p, state.carried[p] + share]));
  const bank = { ...state.bank };
  const carried = { ...state.carried };
  for (const p of returned) {
    bank[p] += banked[p];
    carried[p] = 0;
  }
  return {
    state: { ...state, bank, carried, loose: state.loose - returned.length * share, onTrail: state.onTrail.filter((p) => !returned.includes(p)) },
    share,
    banked,
  };
}

function finish(state: State, end: ExpeditionRecord["end"], hazard: Hazard | null = null): State {
  const gain = Object.fromEntries(state.players.map((p) => [p, state.bank[p] - state.history.reduce((total, record) => total + record.gain[p], 0)]));
  const record: ExpeditionRecord = { trail: state.trail, gain, lost: state.carried, discarded: state.loose, end, hazard };
  return {
    ...state,
    phase: state.expedition === EXPEDITIONS - 1 ? "over" : "summary",
    onTrail: [],
    carried: zeroes(state.players),
    loose: 0,
    choices: {},
    ready: [],
    history: [...state.history, record],
  };
}

/** Odkrycie nie losuje: kolejność talii została ustalona na początku wyprawy. */
function reveal(state: State): State {
  const [card, ...deck] = state.deck;
  if (!card) return finish(bankReturns(state, state.onTrail).state, "empty");
  const trail = [...state.trail, card];
  const s = { ...state, deck, trail, reveal: trail.length };
  if (card.kind === "hazard") {
    return state.trail.some((c) => c.kind === "hazard" && c.hazard === card.hazard) ? finish(s, "hazard", card.hazard) : s;
  }
  const share = Math.floor(card.value / state.onTrail.length);
  const carried = { ...state.carried };
  for (const p of state.onTrail) carried[p] += share;
  return { ...s, carried, loose: state.loose + card.value % state.onTrail.length };
}

/** Otwiera bieżący numer wyprawy, zachowując banki i historię; także do ustalania talii w testach. */
export function openExpedition(state: State, deck: Card[]): State {
  return reveal({
    ...state,
    phase: "decision",
    deck: [...deck],
    trail: [],
    reveal: 0,
    onTrail: [...state.players],
    carried: zeroes(state.players),
    loose: 0,
    choices: {},
    ready: [],
    last: null,
  });
}

function resolve(state: State): State {
  // Kolejność graczy, a nie nadejścia wiadomości, ustala cały zapis rozstrzygnięcia.
  const choices = Object.fromEntries(state.onTrail.map((p) => [p, state.choices[p]]));
  const returned = state.onTrail.filter((p) => choices[p] === "return");
  const { state: bankedState, share, banked } = bankReturns(state, returned);
  const last: Resolution = { reveal: state.reveal, choices, returned, share, banked, looseAfter: bankedState.loose };
  const s = { ...bankedState, choices: {}, last };
  return s.onTrail.length ? reveal(s) : finish(s, "returned");
}

const stamp = { nonce: z.number().int().min(0).max(2 ** 32 - 1), expedition: z.number().int().min(0).max(EXPEDITIONS - 1) };
const moveSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("choose"), choice: z.enum(["continue", "return"]), ...stamp, reveal: z.number().int().min(1).max(20) }),
  z.object({ type: z.literal("next"), ...stamp }),
]);

export const wyprawa: GameDefinition<State, Move> = {
  id: "wyprawa",
  name: "Wyprawa",
  minPlayers: 2,
  maxPlayers: 6,
  moveSchema,

  setup: (players, rng) => openExpedition({
    players: [...players],
    nonce: Math.floor(rng() * 2 ** 32),
    phase: "decision",
    expedition: 0,
    reveal: 0,
    deck: [],
    trail: [],
    onTrail: [],
    bank: zeroes(players),
    carried: zeroes(players),
    loose: 0,
    choices: {},
    ready: [],
    last: null,
    history: [],
  }, buildDeck(rng)),

  validateMove: (state, player, move) => {
    if (!state.players.includes(player) || !moveSchema.safeParse(move).success) return false;
    if (move.nonce !== state.nonce || move.expedition !== state.expedition) return false;
    if (move.type === "choose") {
      return state.phase === "decision" && move.reveal === state.reveal && state.onTrail.includes(player) && !Object.hasOwn(state.choices, player);
    }
    return state.phase === "summary" && !state.ready.includes(player);
  },

  applyMove: (state, player, move, rng) => {
    if (move.type === "choose") {
      const s = { ...state, choices: { ...state.choices, [player]: move.choice } };
      return s.onTrail.every((p) => Object.hasOwn(s.choices, p)) ? resolve(s) : s;
    }
    const ready = state.players.filter((p) => p === player || state.ready.includes(p));
    return ready.length === state.players.length
      ? openExpedition({ ...state, expedition: state.expedition + 1 }, buildDeck(rng))
      : { ...state, ready };
  },

  playerView: (state, player): View => ({
    players: state.players,
    nonce: state.nonce,
    phase: state.phase,
    expedition: state.expedition,
    reveal: state.reveal,
    trail: state.trail,
    onTrail: state.onTrail,
    bank: state.bank,
    carried: state.carried,
    loose: state.loose,
    ready: state.phase === "decision" ? state.onTrail.filter((p) => Object.hasOwn(state.choices, p)) : state.ready,
    last: state.last,
    history: state.history,
    deckLeft: state.deck.length,
    myChoice: state.phase === "decision" && state.onTrail.includes(player) ? state.choices[player] ?? null : null,
  }),

  isOver: (state) => state.phase === "over" ? rankResults(state.players, state.bank, compare) : null,
  places: (state) => rankPlaces(state.players, state.bank, compare),
  waitingFor: (state) => {
    if (state.phase === "decision") return state.onTrail.filter((p) => !Object.hasOwn(state.choices, p));
    if (state.phase === "summary") return state.players.filter((p) => !state.ready.includes(p));
    return [];
  },
  turn: (state) => ({
    key: `${state.nonce}:${state.expedition}:${state.reveal}:${state.phase}`,
    seconds: state.phase === "decision" ? DECISION_SECONDS : state.phase === "summary" ? SUMMARY_SECONDS : 0,
  }),
  timeoutMove: (state) => state.phase === "decision"
    ? { type: "choose", choice: "return", nonce: state.nonce, expedition: state.expedition, reveal: state.reveal }
    : { type: "next", nonce: state.nonce, expedition: state.expedition },
};
