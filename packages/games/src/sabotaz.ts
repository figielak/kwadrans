import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

export const ROUNDS = 6;
export const SAFE_CARDS = 3;
export const TRAP_CARDS = 1;
export const INITIAL_SECONDS = 30;
export const TURN_SECONDS = 60;
export const SUMMARY_SECONDS = 15;
export const SUCCESS_POINTS = 2;
export const TRAP_POINTS = 1;

export type Kind = "safe" | "trap";
export type Phase = "initial" | "place" | "bid" | "reveal" | "summary" | "over";
export type Hand = Record<Kind, number>;
export type Reveal = { owner: PlayerId; kind: Kind };
export type Outcome = "success" | "own-trap" | "foreign-trap";

/** Zakończona runda: jawna dla wszystkich, trwająca nigdy tu nie trafia. */
export type RoundRecord = {
  round: number;
  leader: PlayerId;
  bid: number;
  reveals: Reveal[];
  outcome: Outcome;
  trapOwner: PlayerId | null;
  /** Pełne stosy od dołu do góry, razem z kartami odkrytymi. */
  stacks: Record<PlayerId, Kind[]>;
  hands: Record<PlayerId, Hand>;
  gains: Record<PlayerId, number>;
  totals: Record<PlayerId, number>;
};

export type State = {
  players: PlayerId[];
  nonce: number;
  round: number;
  phase: Phase;
  decision: number;
  hands: Record<PlayerId, Hand>;
  /** Od dołu do góry, bez usuwania odkrytych: zakrytą resztę wyznacza liczba wpisów w `reveals`. */
  stacks: Record<PlayerId, Kind[]>;
  ready: PlayerId[];
  current: PlayerId | null;
  leader: PlayerId | null;
  bid: number | null;
  passed: PlayerId[];
  reveals: Reveal[];
  totals: Record<PlayerId, number>;
  history: RoundRecord[];
};

type Stamp = { nonce: number; round: number };
type Decided = Stamp & { decision: number };

/** `decision` w `place` jest wymagane tylko poza pierwszą kartą; pilnuje tego validateMove, bo o fazie schemat nie wie. */
export type Move =
  | ({ type: "place"; kind: Kind; decision?: number } & Stamp)
  | ({ type: "bid"; amount: number } & Decided)
  | ({ type: "pass" } & Decided)
  | ({ type: "reveal"; owner: PlayerId } & Decided)
  | ({ type: "next" } & Stamp);

export type View = {
  players: PlayerId[];
  nonce: number;
  round: number;
  phase: Phase;
  decision: number;
  turn: PlayerId | null;
  ready: PlayerId[];
  handSizes: Record<PlayerId, number>;
  /** Tylko karty wciąż zakryte. */
  stackSizes: Record<PlayerId, number>;
  /** Własna ręka i własne zakryte karty od dołu; obserwator i obcy id mają null. */
  me: { hand: Hand; stack: Kind[] } | null;
  leader: PlayerId | null;
  bid: number | null;
  passed: PlayerId[];
  reveals: Reveal[];
  totals: Record<PlayerId, number>;
  history: RoundRecord[];
};

const stamp = { nonce: z.number().int().nonnegative(), round: z.number().int().nonnegative() };
const decided = { ...stamp, decision: z.number().int().nonnegative() };

const moveSchema: z.ZodType<Move> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("place"), kind: z.enum(["safe", "trap"]), ...stamp, decision: decided.decision.optional() }),
  z.object({ type: z.literal("bid"), amount: z.number().int(), ...decided }),
  z.object({ type: z.literal("pass"), ...decided }),
  z.object({ type: z.literal("reveal"), owner: z.string().min(1).max(64), ...decided }),
  z.object({ type: z.literal("next"), ...stamp }),
]);

const perPlayer = <T>(players: PlayerId[], value: (player: PlayerId) => T): Record<PlayerId, T> =>
  Object.fromEntries(players.map((p) => [p, value(p)]));

const handSize = (hand: Hand) => hand.safe + hand.trap;
const cardsOnTable = (state: State) => state.players.reduce((sum, p) => sum + state.stacks[p].length, 0);
const covered = (state: State, owner: PlayerId, reveals = state.reveals) => state.stacks[owner].length - reveals.filter((r) => r.owner === owner).length;
const foreignStacks = (state: State, reveals = state.reveals) => state.players.filter((p) => p !== state.leader && covered(state, p, reveals) > 0);

function newRound(state: Pick<State, "players" | "nonce" | "totals" | "history">, round: number): State {
  const { players } = state;
  return {
    ...state,
    round,
    phase: "initial",
    decision: 0,
    hands: perPlayer(players, () => ({ safe: SAFE_CARDS, trap: TRAP_CARDS })),
    stacks: perPlayer(players, () => []),
    ready: [],
    current: null,
    leader: null,
    bid: null,
    passed: [],
    reveals: [],
  };
}

/** Karta z ręki na wierzch własnego stosu. */
function withCard(state: State, player: PlayerId, kind: Kind): State {
  const hand = state.hands[player];
  return {
    ...state,
    hands: { ...state.hands, [player]: { ...hand, [kind]: hand[kind] - 1 } },
    stacks: { ...state.stacks, [player]: [...state.stacks[player], kind] },
  };
}

/** Następna osoba po `player` w kolejności miejsc, która może jeszcze licytować. */
function nextBidder(state: State, player: PlayerId, leader: PlayerId, passed: PlayerId[]): PlayerId {
  const { players } = state;
  const from = players.indexOf(player);
  const seats = players.map((_, i) => players[(from + 1 + i) % players.length]);
  return seats.find((p) => p !== leader && !passed.includes(p))!;
}

function settle(state: State, reveals: Reveal[]): State {
  const leader = state.leader!;
  const last = reveals[reveals.length - 1];
  const trapOwner = last.kind === "trap" ? last.owner : null;
  const outcome: Outcome = trapOwner === null ? "success" : trapOwner === leader ? "own-trap" : "foreign-trap";
  const gains = perPlayer(state.players, (p) => {
    if (outcome === "success") return p === leader ? SUCCESS_POINTS : 0;
    return outcome === "foreign-trap" && p === trapOwner ? TRAP_POINTS : 0;
  });
  const totals = perPlayer(state.players, (p) => state.totals[p] + gains[p]);
  const record: RoundRecord = {
    round: state.round,
    leader,
    bid: state.bid!,
    reveals,
    outcome,
    trapOwner,
    stacks: state.stacks,
    hands: state.hands,
    gains,
    totals,
  };
  return {
    ...state,
    phase: state.round === ROUNDS - 1 ? "over" : "summary",
    current: null,
    ready: [],
    reveals,
    totals,
    history: [...state.history, record],
  };
}

/** Odkrywa wszystko, co wymuszone: własny stos i ostatni cudzy. Staje na wyborze lidera albo rozstrzyga próbę. */
function advance(state: State, reveals: Reveal[]): State {
  const leader = state.leader!;
  const done = reveals.length === state.bid || reveals[reveals.length - 1]?.kind === "trap";
  if (done) return settle(state, reveals);
  const foreign = foreignStacks(state, reveals);
  if (covered(state, leader, reveals) === 0 && foreign.length !== 1) return { ...state, phase: "reveal", current: leader, reveals };
  const owner = covered(state, leader, reveals) > 0 ? leader : foreign[0];
  return advance(state, [...reveals, { owner, kind: state.stacks[owner][covered(state, owner, reveals) - 1] }]);
}

const isKind = (kind: unknown): kind is Kind => kind === "safe" || kind === "trap";

export const sabotaz: GameDefinition<State, Move> = {
  id: "sabotaz",
  name: "Sabotaż",
  minPlayers: 3,
  maxPlayers: 6,
  moveSchema,

  setup(players, rng) {
    return newRound({ players: [...players], nonce: Math.floor(rng() * 2 ** 32), totals: perPlayer(players, () => 0), history: [] }, 0);
  },

  validateMove(state, player, move) {
    if (!state.players.includes(player) || move.nonce !== state.nonce || move.round !== state.round) return false;
    if (state.phase === "initial") {
      return move.type === "place" && move.decision === undefined && !state.ready.includes(player) && isKind(move.kind) && state.hands[player][move.kind] > 0;
    }
    if (state.phase === "summary") return move.type === "next" && !state.ready.includes(player);
    if (state.phase === "over" || state.current !== player || !("decision" in move) || move.decision !== state.decision) return false;
    if (state.phase === "place") {
      if (move.type === "place") return isKind(move.kind) && state.hands[player][move.kind] > 0;
      return move.type === "bid" && Number.isInteger(move.amount) && move.amount >= 1 && move.amount <= cardsOnTable(state);
    }
    if (state.phase === "bid") {
      if (move.type === "pass") return true;
      return move.type === "bid" && Number.isInteger(move.amount) && move.amount > state.bid! && move.amount <= cardsOnTable(state);
    }
    return move.type === "reveal" && foreignStacks(state).includes(move.owner);
  },

  applyMove(state, player, move) {
    switch (move.type) {
      case "place": {
        const placed = withCard(state, player, move.kind);
        if (state.phase === "initial") {
          const ready = [...state.ready, player];
          if (ready.length < state.players.length) return { ...placed, ready };
          return { ...placed, ready: [], phase: "place", current: state.players[state.round % state.players.length] };
        }
        const seat = state.players.indexOf(player);
        return { ...placed, decision: state.decision + 1, current: state.players[(seat + 1) % state.players.length] };
      }
      case "bid":
        return {
          ...state,
          phase: "bid",
          decision: state.decision + 1,
          leader: player,
          bid: move.amount,
          current: nextBidder(state, player, player, state.passed),
        };
      case "pass": {
        const passed = [...state.passed, player];
        const after = { ...state, decision: state.decision + 1, passed };
        if (passed.length === state.players.length - 1) return advance(after, []);
        return { ...after, current: nextBidder(state, player, state.leader!, passed) };
      }
      case "reveal": {
        const kind = state.stacks[move.owner][covered(state, move.owner) - 1];
        return advance({ ...state, decision: state.decision + 1 }, [...state.reveals, { owner: move.owner, kind }]);
      }
      case "next": {
        const ready = [...state.ready, player];
        return ready.length < state.players.length ? { ...state, ready } : newRound(state, state.round + 1);
      }
    }
  },

  playerView(state, player): View {
    const { players } = state;
    return {
      players,
      nonce: state.nonce,
      round: state.round,
      phase: state.phase,
      decision: state.decision,
      turn: state.current,
      ready: state.ready,
      handSizes: perPlayer(players, (p) => handSize(state.hands[p])),
      stackSizes: perPlayer(players, (p) => covered(state, p)),
      me: players.includes(player) ? { hand: state.hands[player], stack: state.stacks[player].slice(0, covered(state, player)) } : null,
      leader: state.leader,
      bid: state.bid,
      passed: state.passed,
      reveals: state.reveals,
      totals: state.totals,
      history: state.history,
    };
  },

  ...ranked<State, number>((state) => (state.phase === "over" ? state.totals : {}), (a, b) => b - a),

  waitingFor(state) {
    if (state.phase === "over") return [];
    if (state.phase === "initial" || state.phase === "summary") return state.players.filter((p) => !state.ready.includes(p));
    return [state.current!];
  },

  turn(state) {
    const base = `${state.nonce}:${state.round}:${state.phase}`;
    if (state.phase === "initial") return { key: base, seconds: INITIAL_SECONDS };
    if (state.phase === "summary" || state.phase === "over") return { key: base, seconds: SUMMARY_SECONDS };
    return { key: `${base}:${state.decision}`, seconds: TURN_SECONDS };
  },

  timeoutMove(state, _player, rng) {
    const at = { nonce: state.nonce, round: state.round };
    const decided = { ...at, decision: state.decision };
    switch (state.phase) {
      case "initial":
        return { type: "place", kind: "safe", ...at };
      case "place":
        return { type: "bid", amount: 1, ...decided };
      case "bid":
        return { type: "pass", ...decided };
      case "reveal": {
        const legal = foreignStacks(state);
        return { type: "reveal", owner: legal.length === 1 ? legal[0] : legal[Math.floor(rng() * legal.length)], ...decided };
      }
      default:
        return { type: "next", ...at };
    }
  },
};
