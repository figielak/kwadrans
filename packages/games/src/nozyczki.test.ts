import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { accepts, area, type Cut, error, nozyczki as game, MARGIN, MAX_ERROR, MIN_CUT, MIN_PART, type Move, type Point, SHAPES, share, split, type State, VERTICES } from "./nozyczki.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy naraz, każdy dostaje te same 5 kształtów: gęste wielokąty (VERTICES wierzchołków) w marginesie pola, bez symetrii,
// - odpowiedź to 5 cięć; cięcie to prosta przez dwa punkty (dotknięcie i puszczenie), przedłużona w obie strony,
// - błąd kształtu = |udział jednej strony prostej w polu kształtu − 50%| w punktach procentowych; kierunek ruchu bez znaczenia,
// - cięcie krótsze niż MIN_CUT albo zostawiające część mniejszą niż MIN_PART pola nie jest odpowiedzią (ruch odrzucony),
// - wynik = suma błędów w dziesiątych częściach punktu (int), mniejsza wyżej; pusta odpowiedź (limit czasu) to 5 × MAX_ERROR,
//   czyli więcej niż najgorsza uczciwa partia.

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (cuts: Cut[]): Move => ({ type: "result", cuts });
/** Pozioma prosta przez całe pole na wysokości `y`. */
const level = (y: number): Cut => ({ a: { x: 0, y }, b: { x: 1, y } });
/** Pozioma prosta, po której jednej stronie zostaje `part` pola kształtu (bisekcja; udział zmienia się z wysokością monotonicznie). */
function cutAt(shape: Point[], part: number): Cut {
  let [lo, hi] = [0, 1];
  const rising = share(shape, level(1)) > share(shape, level(0));
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (share(shape, level(mid)) < part === rising) lo = mid;
    else hi = mid;
  }
  return level((lo + hi) / 2);
}
/** Każdy kształt przecięty z błędem `points` punktów procentowych. */
const off = (s: State, points: number) => s.shapes.map((shape) => cutAt(shape, 0.5 + points / 100));
const perfect = (s: State) => off(s, 0);

const SQUARE: Point[] = [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }];
/** Litera L o polu 0,75: kwadrat bez prawej górnej ćwiartki. */
const L: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 1 }, { x: 0, y: 1 }];

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje odpowiedzi`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("definicja: 1-6 graczy, limit 60 s, świeża gra trwa", () => {
  expect(game.id).toBe("nozyczki");
  expect(game.minPlayers).toBe(1);
  expect(game.maxPlayers).toBe(6);
  expect(game.turnSeconds).toBe(60);
  expect(game.isOver(game.setup([A], createRng(1)))).toBeNull();
});

test("5 kształtów w marginesie pola, duże i różne, rewanż ma inne wyzwanie", () => {
  expect(SHAPES).toBe(5);
  const areas: number[] = [];
  const centered: number[] = [];
  for (let seed = 1; seed <= 20; seed++) {
    const s = game.setup([A, B], createRng(seed));
    expect(s.shapes).toHaveLength(SHAPES);
    for (const shape of s.shapes) {
      expect(shape).toHaveLength(VERTICES);
      for (const { x, y } of shape) {
        for (const v of [x, y]) {
          // Zaokrąglenie do 3 miejsc może wypchnąć punkt o pół tysięcznej.
          expect(v).toBeGreaterThanOrEqual(MARGIN - 0.001);
          expect(v).toBeLessThanOrEqual(1 - MARGIN + 0.001);
          expect(Math.round(v * 1000)).toBeCloseTo(v * 1000, 6);
        }
      }
      areas.push(area(shape));
      centered.push(error(shape, level(0.5)));
    }
  }
  // Kształt jest dość duży, żeby oceniać go okiem, a nie celować palcem.
  expect(Math.min(...areas)).toBeGreaterThan(0.12);
  expect(Math.max(...areas) - Math.min(...areas)).toBeGreaterThan(0.03);
  // Środek kafla nie podpowiada: prosta przez niego przeciętnie wyraźnie nie trafia w połowę.
  expect(centered.reduce((sum, e) => sum + e, 0) / centered.length).toBeGreaterThan(4);
  const s = game.setup([A, B], createRng(1));
  expect(game.waitingFor(s)).toEqual([A, B]);
  expect(game.setup([A, B], createRng(1))).toEqual(s);
  expect(game.setup([A, B], createRng(2)).shapes).not.toEqual(s.shapes);
});

describe("pole i udział", () => {
  test("pole wielokąta, także wklęsłego, niezależnie od kierunku obiegu", () => {
    expect(area(SQUARE)).toBeCloseTo(0.36);
    expect(area(L)).toBeCloseTo(0.75);
    expect(area([...L].reverse())).toBeCloseTo(0.75);
  });
  test("kwadrat: w połowie błąd 0, w jednej czwartej 25", () => {
    expect(error(SQUARE, level(0.5))).toBeCloseTo(0);
    expect(error(SQUARE, { a: { x: 0.2, y: 0.2 }, b: { x: 0.8, y: 0.8 } })).toBeCloseTo(0);
    expect(error(SQUARE, level(0.35))).toBeCloseTo(25);
    expect(error(SQUARE, level(0.65))).toBeCloseTo(25);
  });
  test("prosta jest przedłużona: krótki ruch w środku kształtu tnie tak samo jak długi", () =>
    expect(error(SQUARE, { a: { x: 0.45, y: 0.35 }, b: { x: 0.55, y: 0.35 } })).toBeCloseTo(25));
  test("kierunek ruchu nie zmienia błędu, a udziały obu stron dają razem całość", () => {
    const cut: Cut = { a: { x: 0.1, y: 0.3 }, b: { x: 0.9, y: 0.6 } };
    const back: Cut = { a: cut.b, b: cut.a };
    expect(error(L, back)).toBeCloseTo(error(L, cut));
    expect(share(L, cut) + share(L, back)).toBeCloseTo(1);
  });
  test("części po obu stronach prostej mają razem pole kształtu", () => {
    const [left, right] = split(L, { a: { x: 0.1, y: 0.3 }, b: { x: 0.9, y: 0.6 } });
    expect(area(left) + area(right)).toBeCloseTo(0.75);
    expect(area(left)).toBeGreaterThan(0.1);
    expect(area(right)).toBeGreaterThan(0.1);
  });
  test("kształt wklęsły: pionowo przez środek L części to 2/3 i 1/3", () => {
    const cut: Cut = { a: { x: 0.5, y: 0 }, b: { x: 0.5, y: 1 } };
    expect(Math.max(share(L, cut), 1 - share(L, cut))).toBeCloseTo(2 / 3);
    expect(error(L, cut)).toBeCloseTo(100 / 6);
  });
  test("prosta tnąca na trzy kawałki: kawałki po tej samej stronie się sumują", () => {
    // x + y = 1,2 odcina po trójkącie o polu 0,045 z obu ramion L.
    const cut: Cut = { a: { x: 0.2, y: 1 }, b: { x: 1, y: 0.2 } };
    expect(Math.min(share(L, cut), 1 - share(L, cut))).toBeCloseTo(0.09 / 0.75);
  });
  test("prosta obok kształtu: jedna strona ma wszystko, błąd 50", () => {
    expect(error(SQUARE, level(0.1))).toBeCloseTo(50);
    expect(error(SQUARE, level(0.1))).toBe(MAX_ERROR);
  });
});

describe("co jest cięciem", () => {
  const s = game.setup([A, B], createRng(1));
  const shape = s.shapes[0];
  test("prosta obok kształtu nie jest odpowiedzią", () => expect(accepts(shape, level(0.01))).toBe(false));
  test("mniejsza część tuż ponad MIN_PART przechodzi, tuż poniżej nie", () => {
    expect(accepts(shape, cutAt(shape, MIN_PART + 0.002))).toBe(true);
    expect(accepts(shape, cutAt(shape, 1 - MIN_PART - 0.002))).toBe(true);
    expect(accepts(shape, cutAt(shape, MIN_PART - 0.002))).toBe(false);
    expect(accepts(shape, cutAt(shape, 1 - MIN_PART + 0.002))).toBe(false);
  });
  test("ruch tuż dłuższy niż MIN_CUT przechodzi, tuż krótszy nie", () => {
    const { a } = cutAt(shape, 0.5);
    const short = (length: number): Cut => ({ a: { x: 0.5, y: a.y }, b: { x: 0.5 + length, y: a.y } });
    expect(accepts(shape, short(MIN_CUT + 0.001))).toBe(true);
    expect(accepts(shape, short(MIN_CUT - 0.001))).toBe(false);
    expect(accepts(shape, short(0))).toBe(false);
  });
  test("najgorsze uczciwe cięcie kosztuje mniej niż runda po limicie czasu", () =>
    expect(error(shape, cutAt(shape, MIN_PART + 0.002))).toBeLessThan(MAX_ERROR));
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  const ok = perfect(s);
  const last = (cut: unknown) => [...ok.slice(0, SHAPES - 1), cut as Cut];
  test.each([
    ["za mało", ok.slice(0, SHAPES - 1)],
    ["za dużo", [...ok, ok[0]]],
    ["cięcie obok kształtu", last(level(0.01))],
    ["za krótki ruch", last({ a: { x: 0.5, y: 0.5 }, b: { x: 0.51, y: 0.5 } })],
    ["NaN", last({ a: { x: Number.NaN, y: 0.5 }, b: { x: 1, y: 0.5 } })],
    ["nieskończoność", last({ a: { x: 0, y: 0.5 }, b: { x: Number.POSITIVE_INFINITY, y: 0.5 } })],
  ])("odrzucone: %s", (_, cuts) => expect(game.validateMove(s, A, result(cuts))).toBe(false));
  test("punkty poza polem przechodzą (palec zjechał z kafla), liczy się prosta", () =>
    expect(game.validateMove(s, A, result(last({ a: { x: -0.2, y: ok[SHAPES - 1].a.y }, b: { x: 1.3, y: ok[SHAPES - 1].a.y } })))).toBe(true));
  test("obcy gracz", () => expect(game.validateMove(s, C, result(ok))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result(ok)), A, result(ok))).toBe(false));
  test("pusta odpowiedź", () => expect(game.validateMove(s, A, result([]))).toBe(true));
  test("po końcu gry", () => {
    const done = send(send(s, A, result(ok)), B, result(ok));
    expect(game.validateMove(done, A, result(ok))).toBe(false);
    expect(game.validateMove(done, B, result([]))).toBe(false);
  });

  test("schemat odrzuca śmieci z sieci", () => {
    const parses = (m: unknown) => game.moveSchema.safeParse(m).success;
    expect(parses(result(ok))).toBe(true);
    expect(parses(result([]))).toBe(true);
    expect(parses({ type: "result" })).toBe(false);
    expect(parses({ type: "result", cuts: [{ a: { x: "0", y: 0 }, b: { x: 1, y: 1 } }] })).toBe(false);
    expect(parses({ type: "result", cuts: [{ a: { x: 0, y: 0 } }] })).toBe(false);
    expect(parses({ type: "result", cuts: [{ x: 0, y: 0 }] })).toBe(false);
    expect(parses({ type: "result", cuts: Array(SHAPES + 1).fill(ok[0]) })).toBe(false);
    expect(parses({ type: "skok" })).toBe(false);
  });
});

describe("koniec", () => {
  test("bezbłędnie = 0, pusta = 5 × MAX_ERROR, cięcia zostają w stanie", () => {
    let s = game.setup([A, B], createRng(1));
    const before = JSON.stringify(s);
    const next = send(s, A, result(perfect(s)));
    expect(JSON.stringify(s), "applyMove nie zmienia poprzedniego stanu").toBe(before);
    s = send(next, B, result([]));
    expect(s.results).toEqual({ [A]: 0, [B]: SHAPES * MAX_ERROR * 10 });
    expect(s.cuts[A]).toEqual(perfect(s));
    expect(game.isOver(s)).toEqual({ winner: A, ranking: [A, B] });
    expect(game.waitingFor(s)).toEqual([]);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });

  test("błędy się sumują w dziesiątych punktu, mniejsza suma wygrywa (także gdy to nie pierwszy gracz)", () => {
    let s = game.setup([A, B, C], createRng(1));
    expect(game.isOver(s)).toBeNull();
    s = send(s, A, result(off(s, 3)));
    expect(game.waitingFor(s)).toEqual([B, C]);
    s = send(s, B, result(off(s, -1)));
    s = send(s, C, result(off(s, 2)));
    expect(s.results).toEqual({ [A]: 150, [B]: 50, [C]: 100 });
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
    expect(game.places!(s)).toEqual({ [A]: 3, [B]: 1, [C]: 2 });
  });

  test("remis: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(off(s, 2)));
    s = send(s, B, result(off(s, 2)));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("gra solo kończy się rankingiem bez zwycięzcy", () => {
    const s = game.setup([A], createRng(1));
    expect(game.isOver(send(s, A, result(perfect(s))))).toEqual({ ranking: [A] });
  });

  test("po limicie czasu pusta odpowiedź, czyli najgorszy możliwy wynik", () => {
    const s = game.setup([A, B], createRng(1));
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(move).toEqual(result([]));
    // Rywal tnie najgorzej, jak się da: ledwie drasnął każdy kształt.
    const worst = send(s, B, result(s.shapes.map((shape) => cutAt(shape, MIN_PART + 0.002))));
    const done = send(worst, A, move);
    expect(done.results[B]).toBeLessThan(done.results[A]);
    expect(game.isOver(done)).toEqual({ winner: B, ranking: [B, A] });
  });
});

test.each([C])("P4-032/F4-009: wygrywa także %s", (winner) => {
  let s = game.setup([A, B, C], createRng(1));
  for (const p of [A, B, C]) {
    s = send(s, p, result(p === winner ? perfect(s) : []));
  }
  expect(game.isOver(s)?.winner).toBe(winner);
  expect(game.waitingFor(s)).toEqual([]);
});
