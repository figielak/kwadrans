import { z } from "zod";
import { type GameDefinition, type PlayerId, rankPlaces, rankResults } from "./core.ts";

/** Limit tury w sekundach. */
export const TURN_SECONDS = 60;

/** Tryby do wyboru w lobby; `size` to liczba kwadratów na bok (kropek jest o jeden więcej). */
export const MODES = [
  { id: "mala", name: "Mała", hint: "3×3 kwadraty, krótka partia", size: 3 },
  { id: "srednia", name: "Średnia", hint: "5×5 kwadratów", size: 5, default: true },
  { id: "duza", name: "Duża", hint: "7×7 kwadratów, długa partia", size: 7 },
];
const DEFAULT = MODES.find((m) => m.default)!;

export type Move = { edge: number };

export interface State {
  players: PlayerId[];
  /** Liczba kwadratów na bok. */
  size: number;
  /** Losowa wartość z `setup`; ekran montuje się od nowa przy rewanżu. */
  nonce: number;
  /** Narysowane kreski: poziome `y*n+x`, potem pionowe `n*(n+1)+y*(n+1)+x`. */
  edges: boolean[];
  /** Miejsce właściciela kwadratu (wiersz po wierszu) albo null. */
  boxes: (number | null)[];
  /** Miejsce gracza na ruchu. */
  turn: number;
  /** Ostatnia kreska, kto ją narysował i które kwadraty zamknęła. */
  last: { edge: number; seat: number; boxes: number[] } | null;
}

export type View = State;

/** Liczba kresek planszy o `n` kwadratach na bok. */
export const edgeCount = (n: number) => 2 * n * (n + 1);

/** Końce kreski jako punkty kratki kropek: [[x1, y1], [x2, y2]]. */
export function edgeEnds(n: number, edge: number): [[number, number], [number, number]] {
  const horizontal = n * (n + 1);
  if (edge < horizontal) {
    const y = Math.floor(edge / n);
    const x = edge % n;
    return [[x, y], [x + 1, y]];
  }
  const rest = edge - horizontal;
  const y = Math.floor(rest / (n + 1));
  const x = rest % (n + 1);
  return [[x, y], [x, y + 1]];
}

/** Cztery kreski kwadratu `box`: góra, dół, lewa, prawa. */
export function boxEdges(n: number, box: number): [number, number, number, number] {
  const x = box % n;
  const y = Math.floor(box / n);
  const left = n * (n + 1) + y * (n + 1) + x;
  return [y * n + x, (y + 1) * n + x, left, left + 1];
}

const moveSchema = z.object({ edge: z.number().int() });

const isFree = (state: State, edge: number) => Number.isInteger(edge) && edge >= 0 && edge < state.edges.length && !state.edges[edge];
const over = (state: State) => state.edges.every(Boolean);
const counts = (state: State) => state.players.map((_, seat) => state.boxes.filter((b) => b === seat).length);
const byBoxes = (a: number, b: number) => b - a;
const resultsOf = (state: State) => Object.fromEntries(state.players.map((p, i) => [p, counts(state)[i]]));

export const kropkiIKreski: GameDefinition<State, Move> = {
  id: "kropki-i-kreski",
  name: "Kropki i kreski",
  minPlayers: 2,
  maxPlayers: 4,
  turnSeconds: TURN_SECONDS,
  moveSchema,
  modes: MODES.map(({ id, name, hint, default: d }) => ({ id, name, hint, default: d })),

  setup(players, rng, mode) {
    const { size } = MODES.find((m) => m.id === mode) ?? DEFAULT;
    return {
      players: [...players],
      size,
      nonce: Math.floor(rng() * 2 ** 31),
      edges: Array(edgeCount(size)).fill(false),
      boxes: Array(size * size).fill(null),
      turn: 0,
      last: null,
    };
  },

  validateMove: (state, player, move) => !over(state) && state.players[state.turn] === player && isFree(state, move.edge),

  applyMove(state, _player, move) {
    const edges = state.edges.map((e, i) => e || i === move.edge);
    const closed = state.boxes
      .map((owner, box) => (owner === null && boxEdges(state.size, box).every((e) => edges[e]) ? box : -1))
      .filter((box) => box >= 0);
    const boxes = state.boxes.map((owner, box) => (closed.includes(box) ? state.turn : owner));
    return {
      ...state,
      edges,
      boxes,
      turn: closed.length > 0 ? state.turn : (state.turn + 1) % state.players.length,
      last: { edge: move.edge, seat: state.turn, boxes: closed },
    };
  },

  playerView: (state): View => state,

  isOver: (state) => (over(state) ? rankResults(state.players, resultsOf(state), byBoxes) : null),

  places: (state) => rankPlaces(state.players, resultsOf(state), byBoxes),

  waitingFor: (state) => (over(state) ? [] : [state.players[state.turn]]),

  timeoutMove(state, _player, rng) {
    const free = state.edges.flatMap((taken, i) => (taken ? [] : [i]));
    return { edge: free[Math.floor(rng() * free.length)] };
  },
};
