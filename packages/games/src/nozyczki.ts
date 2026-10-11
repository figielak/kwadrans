import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

export const SHAPES = 5;
/** Wierzchołki wielokąta: tyle, żeby brzeg wyglądał gładko, a stan został mały. */
export const VERTICES = 64;
/** Odstęp kształtu od krawędzi pola, w ułamkach boku. */
export const MARGIN = 0.05;
/** Najkrótszy ruch palca, w ułamkach boku pola: przy krótszym kierunek prostej byłby przypadkowy. */
export const MIN_CUT = 0.05;
/** Najmniejsza część kształtu po cięciu (ułamek pola): poniżej prosta minęła kształt albo ledwie go drasnęła. */
export const MIN_PART = 0.01;
/** Kara za kształt po limicie czasu, w punktach procentowych: tyle co cięcie obok kształtu. */
export const MAX_ERROR = 50;
/**
 * Kształt: promień = baza z BASE_MIN-BASE_MAX (rozmiar też jest losowy) × (1 + suma WAVES fal cos(kθ + faza) o amplitudach AMP_MIN-AMP_MAX). Fala k = 1 przesuwa środek ciężkości,
 * wyższe dają wypustki; każda ma niezerową amplitudę, więc nie ma symetrii, a suma amplitud poniżej 1 trzyma promień nad zerem.
 * Do strojenia na telefonie.
 */
const BASE_MIN = 0.2;
const BASE_MAX = 0.26;
const WAVES = 4;
const AMP_MIN = 0.08;
const AMP_MAX = 0.16;

/** Pozycja na polu, 0-1 w obu osiach. */
export type Point = { x: number; y: number };
/** Prosta przez punkt dotknięcia i punkt puszczenia palca. */
export type Cut = { a: Point; b: Point };

/** Pusta lista = limit czasu (MAX_ERROR za każdy kształt). */
export type Move = { type: "result"; cuts: Cut[] };

export interface State {
  players: PlayerId[];
  shapes: Point[][];
  /** Suma błędów w dziesiątych częściach punktu procentowego (int). */
  results: Record<PlayerId, number>;
  cuts: Record<PlayerId, Cut[]>;
}

export type View = State;

/** Pole wielokąta (wzór sznurowadłowy), niezależnie od kierunku obiegu. */
export const area = (shape: Point[]): number => Math.abs(shape.reduce((sum, p, i) => sum + p.x * shape[(i + 1) % shape.length].y - shape[(i + 1) % shape.length].x * p.y, 0)) / 2;

/** Część wielokąta po jednej stronie prostej (Sutherland-Hodgman dla jednej półpłaszczyzny); `sign` wybiera stronę. */
function clip(shape: Point[], { a, b }: Cut, sign: number): Point[] {
  const side = (p: Point) => sign * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
  return shape.flatMap((p, i) => {
    const q = shape[(i + 1) % shape.length];
    const [sp, sq] = [side(p), side(q)];
    const cross = sp * sq < 0 ? [{ x: p.x + ((q.x - p.x) * sp) / (sp - sq), y: p.y + ((q.y - p.y) * sp) / (sp - sq) }] : [];
    return sp >= 0 ? [p, ...cross] : cross;
  });
}

/**
 * Obie strony kształtu po cięciu. Przy kształcie wklęsłym jedna strona może być kilkoma kawałkami połączonymi wzdłuż prostej
 * odcinkami o zerowej szerokości: pole i tak wychodzi dobrze, a na ekranie nie widać ich (wypełnienie bez obrysu).
 */
export const split = (shape: Point[], cut: Cut): [Point[], Point[]] => [clip(shape, cut, 1), clip(shape, cut, -1)];

/** Udział jednej strony prostej w polu kształtu, 0-1 (druga strona to reszta). */
export const share = (shape: Point[], cut: Cut): number => area(clip(shape, cut, 1)) / area(shape);

/** Błąd cięcia w punktach procentowych: o ile udział części odbiega od połowy (części 53% i 47% = 3). */
export const error = (shape: Point[], cut: Cut): number => Math.abs(share(shape, cut) - 0.5) * 100;

/** Czy ruch jest cięciem: dość długi, żeby wyznaczyć prostą, i naprawdę dzieli kształt. NaN i nieskończoność odpadają na porównaniach. */
export function accepts(shape: Point[], cut: Cut): boolean {
  const part = share(shape, cut);
  return Math.hypot(cut.b.x - cut.a.x, cut.b.y - cut.a.y) >= MIN_CUT && Math.min(part, 1 - part) >= MIN_PART;
}

function shape(rng: () => number): Point[] {
  const waves = Array.from({ length: WAVES }, () => ({ amp: AMP_MIN + rng() * (AMP_MAX - AMP_MIN), phase: rng() * 2 * Math.PI }));
  const base = BASE_MIN + rng() * (BASE_MAX - BASE_MIN);
  const raw = Array.from({ length: VERTICES }, (_, i) => {
    const angle = (i / VERTICES) * 2 * Math.PI;
    const r = base * waves.reduce((sum, w, k) => sum + w.amp * Math.cos((k + 1) * angle + w.phase), 1);
    return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
  });
  // Losowe miejsce w polu, na ile pozwala rozmiar: środek kafla nie podpowiada, gdzie jest połowa.
  const shift = (values: number[]) => MARGIN - Math.min(...values) + rng() * (1 - 2 * MARGIN - (Math.max(...values) - Math.min(...values)));
  const dx = shift(raw.map((p) => p.x));
  const dy = shift(raw.map((p) => p.y));
  const round = (v: number) => Math.round(v * 1000) / 1000;
  return raw.map((p) => ({ x: round(p.x + dx), y: round(p.y + dy) }));
}

const point = z.object({ x: z.number(), y: z.number() });

// ponytail: kształty są w widoku od startu (jak odcinki w Środku), da się podejrzeć i policzyć; między znajomymi wystarczy.
export const nozyczki: GameDefinition<State, Move> = {
  id: "nozyczki",
  name: "Nożyczki",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 60,
  moveSchema: z.object({ type: z.literal("result"), cuts: z.array(z.object({ a: point, b: point })).max(SHAPES) }),

  setup: (players, rng) => ({
    players,
    shapes: Array.from({ length: SHAPES }, () => shape(rng)),
    results: {},
    cuts: {},
  }),

  validateMove: (state, player, { cuts }) =>
    state.players.includes(player) && !(player in state.results) && (cuts.length === 0 || (cuts.length === SHAPES && cuts.every((cut, i) => accepts(state.shapes[i], cut)))),

  applyMove: (state, player, { cuts }) => {
    const sum = cuts.length ? state.shapes.reduce((s, sh, i) => s + error(sh, cuts[i]), 0) : SHAPES * MAX_ERROR;
    return {
      ...state,
      results: { ...state.results, [player]: Math.round(sum * 10) },
      cuts: { ...state.cuts, [player]: cuts },
    };
  },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", cuts: [] }),
};
