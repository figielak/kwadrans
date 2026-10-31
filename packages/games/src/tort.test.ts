import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { type Cake, CAKES, error, tort as game, MAX_ERROR, type Move, type State } from "./tort.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy naraz, każdy dostaje te same 5 tortów: liczby kawałków 3-7 (każda raz, w losowej kolejności)
//   i jedno gotowe cięcie pod losowym kątem (int 0-359°),
// - odpowiedź to dla każdego tortu `pieces − 1` kątów cięć w stopniach (0 ≤ kąt < 360),
// - błąd tortu = suma |kawałek − 360°/n| / 2 w procentach całego tortu (ile trzeba by przełożyć, żeby było równo);
//   kolejność cięć na liście nie ma znaczenia,
// - wynik = suma błędów w dziesiątych częściach procenta (int), mniejsza wyżej; pusta odpowiedź (limit czasu) to 5 × MAX_ERROR,
//   czyli więcej niż najgorsza uczciwa partia.

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (cuts: number[][]): Move => ({ type: "result", cuts });
/** Idealne cięcia tortu: co 360°/n od gotowego. */
const even = ({ pieces, first }: Cake) => Array.from({ length: pieces - 1 }, (_, i) => (first + ((i + 1) * 360) / pieces) % 360);
const perfect = (s: State) => s.cakes.map(even);
/** Każdy tort z jednym cięciem przesuniętym tak, żeby błąd wyniósł `percent` procent tortu. */
const off = (s: State, percent: number) =>
  s.cakes.map((cake) => {
    const [head, ...rest] = even(cake);
    return [(head + percent * 3.6) % 360, ...rest];
  });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje odpowiedzi`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("definicja: 1-6 graczy, limit 120 s, świeża gra trwa", () => {
  expect(game.id).toBe("tort");
  expect(game.minPlayers).toBe(1);
  expect(game.maxPlayers).toBe(6);
  expect(game.turnSeconds).toBe(120);
  expect(game.isOver(game.setup([A], createRng(1)))).toBeNull();
});

test("5 tortów, liczby kawałków 3-7 każda raz, gotowe cięcie w całych stopniach, rewanż ma inne wyzwanie", () => {
  expect(CAKES).toBe(5);
  const orders = new Set<string>();
  const firsts = new Set<number>();
  for (let seed = 1; seed <= 20; seed++) {
    const s = game.setup([A, B], createRng(seed));
    expect(s.cakes).toHaveLength(CAKES);
    expect(s.cakes.map((c) => c.pieces).sort()).toEqual([3, 4, 5, 6, 7]);
    for (const { first } of s.cakes) {
      expect(Number.isInteger(first)).toBe(true);
      expect(first).toBeGreaterThanOrEqual(0);
      expect(first).toBeLessThan(360);
      firsts.add(first);
    }
    orders.add(s.cakes.map((c) => c.pieces).join());
  }
  // Kolejność tortów i kąt gotowego cięcia są losowe.
  expect(orders.size).toBeGreaterThan(10);
  expect(firsts.size).toBeGreaterThan(50);
  const s = game.setup([A, B], createRng(1));
  expect(game.waitingFor(s)).toEqual([A, B]);
  expect(game.setup([A, B], createRng(1))).toEqual(s);
  expect(game.setup([A, B], createRng(2)).cakes).not.toEqual(s.cakes);
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  const ok = perfect(s);
  /** Ostatni tort z pierwszym cięciem podmienionym na `angle`. */
  const last = (angle: unknown) => [...ok.slice(0, CAKES - 1), [angle as number, ...ok[CAKES - 1].slice(1)]];
  test.each([
    ["za mało tortów", ok.slice(0, CAKES - 1)],
    ["za dużo tortów", [...ok, ok[0]]],
    ["za mało cięć w torcie", [...ok.slice(0, CAKES - 1), ok[CAKES - 1].slice(1)]],
    ["za dużo cięć w torcie", [...ok.slice(0, CAKES - 1), [...ok[CAKES - 1], 10]]],
    ["kąt ujemny", last(-0.1)],
    ["kąt 360", last(360)],
    ["NaN", last(Number.NaN)],
    ["nieskończoność", last(Number.POSITIVE_INFINITY)],
  ])("odrzucone: %s", (_, cuts) => expect(game.validateMove(s, A, result(cuts))).toBe(false));
  test("brzegi zakresu przechodzą: 0 i tuż poniżej 360, także niecałkowite", () => {
    expect(game.validateMove(s, A, result(last(0)))).toBe(true);
    expect(game.validateMove(s, A, result(last(359.99)))).toBe(true);
  });
  test("dwa cięcia w tym samym miejscu są dozwolone", () =>
    expect(game.validateMove(s, A, result(s.cakes.map((c) => Array(c.pieces - 1).fill(c.first))))).toBe(true));
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
    expect(parses({ type: "result", cuts: [["90"]] })).toBe(false);
    expect(parses({ type: "result", cuts: [90] })).toBe(false);
    expect(parses({ type: "result", cuts: Array(CAKES + 1).fill([90]) })).toBe(false);
    expect(parses({ type: "result", cuts: [Array(7).fill(90)] })).toBe(false);
    expect(parses({ type: "skok" })).toBe(false);
  });
});

describe("błąd tortu", () => {
  const cake: Cake = { pieces: 4, first: 0 };
  test("równy podział = 0", () => {
    expect(error(cake, [90, 180, 270])).toBeCloseTo(0);
    expect(error({ pieces: 3, first: 100 }, [220, 340])).toBeCloseTo(0);
  });
  test("ile tortu trzeba przełożyć: cięcie przesunięte o 36° to 10%", () => {
    expect(error(cake, [126, 180, 270])).toBeCloseTo(10);
    expect(error(cake, [54, 180, 270])).toBeCloseTo(10);
  });
  test("kolejność cięć na liście nie ma znaczenia", () => expect(error(cake, [270, 100, 180])).toBeCloseTo(error(cake, [100, 180, 270])));
  test("obrót całego tortu nic nie zmienia, także przez 0°/360°", () => {
    const turned = (by: number) => error({ pieces: 4, first: by }, [100, 180, 270].map((a) => (a + by) % 360));
    expect(turned(200)).toBeCloseTo(error(cake, [100, 180, 270]));
    expect(turned(350)).toBeCloseTo(error(cake, [100, 180, 270]));
  });
  test("gotowe cięcie się liczy: równe odstępy własnych cięć nie wystarczą", () => {
    // 3 kawałki, gotowe na 0°: cięcia 60° i 180° dają kawałki 60, 120, 180.
    expect(error({ pieces: 3, first: 0 }, [60, 180])).toBeCloseTo(((60 + 0 + 60) / 2 / 360) * 100);
  });
  test.each([3, 4, 5, 6, 7])("wszystkie cięcia w jednym miejscu to (n − 1)/n tortu: %i kawałków", (pieces) => {
    const worst = error({ pieces, first: 45 }, Array(pieces - 1).fill(45));
    expect(worst).toBeCloseTo(((pieces - 1) / pieces) * 100);
    // Najgorszy uczciwy tort kosztuje mniej niż tort po limicie czasu.
    expect(worst).toBeLessThan(MAX_ERROR);
  });
});

describe("koniec", () => {
  test("bezbłędnie = 0, pusta = 5 × MAX_ERROR, cięcia zostają w stanie", () => {
    let s = game.setup([A, B], createRng(1));
    const before = JSON.stringify(s);
    const next = send(s, A, result(perfect(s)));
    expect(JSON.stringify(s), "applyMove nie zmienia poprzedniego stanu").toBe(before);
    s = send(next, B, result([]));
    expect(s.results).toEqual({ [A]: 0, [B]: CAKES * MAX_ERROR * 10 });
    expect(s.cuts[A]).toEqual(perfect(s));
    expect(game.isOver(s)).toEqual({ winner: A, ranking: [A, B] });
    expect(game.waitingFor(s)).toEqual([]);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });

  test("błędy się sumują w dziesiątych procenta, mniejsza suma wygrywa (także gdy to nie pierwszy gracz)", () => {
    let s = game.setup([A, B, C], createRng(1));
    expect(game.isOver(s)).toBeNull();
    s = send(s, A, result(off(s, 3)));
    expect(game.waitingFor(s)).toEqual([B, C]);
    s = send(s, B, result(off(s, 1)));
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
    // Rywal kroi najgorzej, jak się da: wszystkie cięcia na gotowym.
    const worst = send(s, B, result(s.cakes.map((c) => Array(c.pieces - 1).fill(c.first))));
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
