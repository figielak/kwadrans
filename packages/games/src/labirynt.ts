import { z } from "zod";
import type { GameDefinition, PlayerId } from "./core.ts";

/** Tryby do wyboru w lobby; `walls` to ścianki na gracza przy 2, 3 i 4 osobach. */
export const MODES = [
  { id: "szybki", name: "Szybki", hint: "7×7, mniej ścianek, partia na kilka minut", size: 7, walls: [6, 4, 3] },
  { id: "klasyczny", name: "Klasyczny", hint: "9×9, 10 ścianek na dwie osoby", size: 9, walls: [10, 7, 5], default: true },
];
const DEFAULT = MODES.find((m) => m.default)!;

export type Cell = { x: number; y: number };
export type Wall = { x: number; y: number; dir: "h" | "v" };
export type Move = ({ type: "step" } & Cell) | ({ type: "wall" } & Wall) | { type: "pass" };

/** Strona planszy, z której startuje pionek; cel to strona naprzeciw. Zgodnie z ruchem wskazówek od dołu. */
export type Side = "bottom" | "left" | "top" | "right";

export interface State {
  mode: string;
  size: number;
  players: PlayerId[];
  sides: Side[];
  pawns: Cell[];
  wallsLeft: number[];
  /** Postawione ścianki z miejscem gracza, który je postawił. */
  walls: (Wall & { by: number })[];
  turn: number;
  last: Move | null;
  winner: number | null;
}

export type View = State;

const moveSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("step"), x: z.number().int(), y: z.number().int() }),
  z.object({ type: z.literal("wall"), x: z.number().int(), y: z.number().int(), dir: z.enum(["h", "v"]) }),
  z.object({ type: z.literal("pass") }),
]);

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

const SIDES: Record<number, Side[]> = { 2: ["bottom", "top"], 3: ["bottom", "left", "top"], 4: ["bottom", "left", "top", "right"] };

const inside = (size: number, x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size;

export const atGoal = (size: number, side: Side, { x, y }: Cell) =>
  side === "bottom" ? y === 0 : side === "top" ? y === size - 1 : side === "left" ? x === size - 1 : x === 0;

/** Czy ścianka stoi między polem (x, y) a sąsiednim w kierunku (dx, dy). */
function blocked(walls: Set<string>, x: number, y: number, dx: number, dy: number) {
  if (dy === 1) return walls.has(`h${x},${y}`) || walls.has(`h${x - 1},${y}`);
  if (dy === -1) return walls.has(`h${x},${y - 1}`) || walls.has(`h${x - 1},${y - 1}`);
  if (dx === 1) return walls.has(`v${x},${y}`) || walls.has(`v${x},${y - 1}`);
  return walls.has(`v${x - 1},${y}`) || walls.has(`v${x - 1},${y - 1}`);
}

const wallSet = (walls: Wall[]) => new Set(walls.map((w) => `${w.dir}${w.x},${w.y}`));

/** Odległość każdego pola od celu strony po ściankach (pionki nie przeszkadzają); Infinity = brak drogi. */
function distances(size: number, walls: Set<string>, side: Side) {
  const dist = Array<number>(size * size).fill(Infinity);
  const queue: Cell[] = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (atGoal(size, side, { x, y })) {
        dist[y * size + x] = 0;
        queue.push({ x, y });
      }
  for (let i = 0; i < queue.length; i++) {
    const { x, y } = queue[i];
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inside(size, nx, ny) || blocked(walls, x, y, dx, dy) || dist[ny * size + nx] !== Infinity) continue;
      dist[ny * size + nx] = dist[y * size + x] + 1;
      queue.push({ x: nx, y: ny });
    }
  }
  return dist;
}

/** Pola, na które pionek gracza `seat` może teraz stanąć (z przeskokami). */
export function pawnMoves(state: State, seat: number): Cell[] {
  const { size, pawns } = state;
  const walls = wallSet(state.walls);
  const pawnAt = (x: number, y: number) => pawns.some((p) => p.x === x && p.y === y);
  const free = (x: number, y: number) => inside(size, x, y) && !pawnAt(x, y);
  const { x, y } = pawns[seat];
  const out: Cell[] = [];
  for (const [dx, dy] of DIRS) {
    const nx = x + dx;
    const ny = y + dy;
    if (!inside(size, nx, ny) || blocked(walls, x, y, dx, dy)) continue;
    if (!pawnAt(nx, ny)) {
      out.push({ x: nx, y: ny });
    } else if (free(nx + dx, ny + dy) && !blocked(walls, nx, ny, dx, dy)) {
      out.push({ x: nx + dx, y: ny + dy });
    } else {
      // Za pionkiem ścianka, krawędź albo pionek: skośnie obok niego.
      for (const [ex, ey] of [[dy, dx], [-dy, -dx]]) {
        if (free(nx + ex, ny + ey) && !blocked(walls, nx, ny, ex, ey) && !out.some((c) => c.x === nx + ex && c.y === ny + ey)) out.push({ x: nx + ex, y: ny + ey });
      }
    }
  }
  return out;
}

/** Dlaczego ścianki nie da się postawić: „taken” (nachodzi albo krzyżuje się), „blocks” (odcina komuś drogę); null = można. */
export function wallError(state: State, wall: Wall): "taken" | "blocks" | null {
  const { size } = state;
  const { x, y, dir } = wall;
  if (x < 0 || y < 0 || x > size - 2 || y > size - 2) return "taken";
  const walls = wallSet(state.walls);
  const clash =
    dir === "h"
      ? [`h${x - 1},${y}`, `h${x},${y}`, `h${x + 1},${y}`, `v${x},${y}`]
      : [`v${x},${y - 1}`, `v${x},${y}`, `v${x},${y + 1}`, `h${x},${y}`];
  if (clash.some((k) => walls.has(k))) return "taken";
  walls.add(`${dir}${x},${y}`);
  const cut = state.sides.some((side, i) => distances(size, walls, side)[state.pawns[i].y * size + state.pawns[i].x] === Infinity);
  return cut ? "blocks" : null;
}

export const labirynt: GameDefinition<State, Move> = {
  id: "labirynt",
  name: "Labirynt",
  minPlayers: 2,
  maxPlayers: 4,
  turnSeconds: 60,
  moveSchema,
  modes: MODES.map(({ id, name, hint, default: d }) => ({ id, name, hint, default: d })),

  setup(players, _rng, mode) {
    const rules = MODES.find((m) => m.id === mode) ?? DEFAULT;
    const { size } = rules;
    const mid = Math.floor(size / 2);
    const sides = SIDES[players.length];
    const start: Record<Side, Cell> = { bottom: { x: mid, y: size - 1 }, left: { x: 0, y: mid }, top: { x: mid, y: 0 }, right: { x: size - 1, y: mid } };
    return {
      mode: rules.id,
      size,
      players: [...players],
      sides,
      pawns: sides.map((s) => start[s]),
      wallsLeft: sides.map(() => rules.walls[players.length - 2]),
      walls: [],
      turn: 0,
      last: null,
      winner: null,
    };
  },

  validateMove(state, player, move) {
    if (state.winner !== null || state.players[state.turn] !== player) return false;
    const moves = pawnMoves(state, state.turn);
    if (move.type === "pass") return moves.length === 0;
    if (move.type === "step") return moves.some((c) => c.x === move.x && c.y === move.y);
    return state.wallsLeft[state.turn] > 0 && wallError(state, move) === null;
  },

  applyMove(state, _player, move) {
    const seat = state.turn;
    const next = { ...state, turn: (seat + 1) % state.players.length, last: move };
    if (move.type === "step") {
      const cell = { x: move.x, y: move.y };
      next.pawns = state.pawns.map((p, i) => (i === seat ? cell : p));
      if (atGoal(state.size, state.sides[seat], cell)) next.winner = seat;
    } else if (move.type === "wall") {
      next.walls = [...state.walls, { x: move.x, y: move.y, dir: move.dir, by: seat }];
      next.wallsLeft = state.wallsLeft.map((n, i) => (i === seat ? n - 1 : n));
    }
    return next;
  },

  playerView: (state): View => state,

  isOver: (state) => (state.winner === null ? null : { winner: state.players[state.winner] }),

  waitingFor: (state) => (state.winner === null ? [state.players[state.turn]] : []),

  timeoutMove(state) {
    const seat = state.turn;
    const dist = distances(state.size, wallSet(state.walls), state.sides[seat]);
    const best = pawnMoves(state, seat).sort((a, b) => dist[a.y * state.size + a.x] - dist[b.y * state.size + b.x])[0];
    return best ? { type: "step", ...best } : { type: "pass" };
  },
};
