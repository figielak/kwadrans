import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { dziesiatki as game, hasPair, type Move, SIDE, type State, take, TARGET, type View } from "./dziesiatki.ts";
import { DURATION_MS } from "./quiz.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - wszyscy dostają tę samą planszę 4×4 z liczbami 1-9 i te same dostawy nowych liczb,
// - para to dwa pola dające razem 10; w ich miejsce wchodzą dwie kolejne liczby z dostaw,
// - dwie liczby jednej dostawy nigdy nie dają razem 10,
// - na planszy zawsze jest para: gdy dostawa jej nie daje, drugie nowe pole dopasowuje się do pierwszego pola spoza dwójki,
// - klient oddaje czasy par (całkowite 0-30000 ms, razem max 30 s) i liczbę pomyłek,
// - ranking: więcej par wyżej, remis rozstrzyga niższa średnia.

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (times: number[], errors = 0): Move => ({ type: "result", times, errors });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

const viewOf = (seed: number) => game.playerView(game.setup([A, B], createRng(seed)), A) as View;
const SEEDS = Array.from({ length: 200 }, (_, k) => k + 1);
const digit = (n: number) => Number.isInteger(n) && n >= 1 && n <= 9;
/** Pierwsza para na planszy: [a, b]. */
function findPair(board: number[]): [number, number] {
  for (let a = 0; a < board.length; a++) for (let b = a + 1; b < board.length; b++) if (board[a] + board[b] === TARGET) return [a, b];
  throw new Error("brak pary");
}

test("definicja: 1-6 graczy, limit 90 s, świeża gra trwa", () => {
  expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["dziesiatki", 1, 6, 90]);
  expect([SIDE, TARGET]).toEqual([4, 10]);
  const s = game.setup([A, B], createRng(1));
  expect(game.isOver(s)).toBeNull();
  expect(game.waitingFor(s)).toEqual([A, B]);
});

describe("plansza i dostawy", () => {
  test("plansza 4×4 z liczbami 1-9, dostawy też 1-9", () => {
    const { board, refills } = viewOf(1);
    expect(board).toHaveLength(SIDE * SIDE);
    expect(board.every(digit)).toBe(true);
    expect(refills.every(digit)).toBe(true);
  });

  test("dostaw wystarczy na 30 s", () => expect((viewOf(1).refills.length / 2) * 150).toBeGreaterThanOrEqual(DURATION_MS));

  test("ten sam seed daje tę samą planszę i dostawy, inny seed (rewanż) inne", () => {
    expect(viewOf(1)).toEqual(viewOf(1));
    expect(viewOf(1).board).not.toEqual(viewOf(2).board);
    expect(viewOf(1).refills).not.toEqual(viewOf(2).refills);
  });

  test("na planszy startowej zawsze jest para", () => {
    for (const seed of SEEDS) expect(hasPair(viewOf(seed).board), `seed ${seed}`).toBe(true);
  });

  test("dwie liczby jednej dostawy nigdy nie dają razem 10", () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const { refills } = viewOf(seed);
      for (let n = 0; n < refills.length; n += 2) expect(refills[n] + refills[n + 1], `seed ${seed}, dostawa ${n / 2}`).not.toBe(TARGET);
    }
  });

  test("wszystkie liczby 1-9 się zdarzają", () => expect(new Set(viewOf(1).refills).size).toBe(9));
});

describe("para", () => {
  test("hasPair: para to dwa różne pola dające razem 10", () => {
    expect(hasPair([1, 9])).toBe(true);
    expect(hasPair([5, 5])).toBe(true);
    expect(hasPair([5, 1, 2, 3])).toBe(false);
    expect(hasPair([1, 2, 3, 4, 1, 2, 3, 4])).toBe(false);
  });

  test("w miejsce pary wchodzą dwie nowe liczby, reszta planszy zostaje", () => {
    const board = [1, 9, 3, 7, 2, 2];
    const before = [...board];
    expect(take(board, 0, 1, 4, 4)).toEqual([4, 4, 3, 7, 2, 2]);
    expect(take(board, 3, 2, 8, 1)).toEqual([1, 9, 1, 8, 2, 2]);
    expect(board, "wejście bez zmian").toEqual(before);
  });

  test("gdy dostawa nie daje żadnej pary, drugie nowe pole dopasowuje się do pierwszego pola spoza dwójki", () => {
    expect(take([1, 9, 2, 3], 0, 1, 1, 1)).toEqual([1, 8, 2, 3]);
    expect(take([4, 3, 7, 1], 1, 2, 2, 2)).toEqual([4, 2, 6, 1]);
    // Pierwsze pole spoza dwójki to nie zawsze pole 0.
    expect(take([3, 7, 1, 2], 1, 0, 1, 1)).toEqual([9, 1, 1, 2]);
  });

  test("na planszy zawsze jest para, jakkolwiek gracz wybiera", () => {
    for (const seed of SEEDS) {
      const { board: start, refills } = viewOf(seed);
      const rng = createRng(seed);
      let board = start;
      for (let n = 0; n < refills.length / 2; n++) {
        // Losowa z dostępnych par, w losowej kolejności dotknięć.
        const pairs: [number, number][] = [];
        for (let a = 0; a < board.length; a++) for (let b = 0; b < board.length; b++) if (a !== b && board[a] + board[b] === TARGET) pairs.push([a, b]);
        expect(pairs.length, `seed ${seed}, para ${n}`).toBeGreaterThan(0);
        const [a, b] = pairs[Math.floor(rng() * pairs.length)];
        board = take(board, a, b, refills[2 * n], refills[2 * n + 1]);
        expect(board.every(digit)).toBe(true);
      }
    }
  });

  test("zwykła dostawa wchodzi bez zmian: pierwsza liczba w pierwsze dotknięte pole, druga w drugie", () => {
    const { board, refills } = viewOf(1);
    const [a, b] = findPair(board);
    const next = take(board, b, a, refills[0], refills[1]);
    expect(next[b]).toBe(refills[0]);
    if (hasPair(Object.assign([...board], { [b]: refills[0], [a]: refills[1] }))) expect(next[a]).toBe(refills[1]);
  });
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  test.each([
    ["ujemny czas", result([-1])],
    ["czas ponad długość rundy", result([30001])],
    ["ponad 30 s", result(Array(11).fill(3000))],
    ["ujemne pomyłki", result([500], -1)],
    ["niecałkowite pomyłki", result([500], 1.5)],
  ])("%s", (_, move) => expect(game.validateMove(s, A, move)).toBe(false));
  test("wartości brzegowe przechodzą", () => expect(game.validateMove(s, A, result([150, 5000]))).toBe(true));
  test("obcy gracz", () => expect(game.validateMove(s, C, result([500]))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result([500])), A, result([400]))).toBe(false));
  test("po końcu gry", () => expect(game.validateMove(send(send(s, A, result([500])), B, result([400])), A, result([400]))).toBe(false));
  test("pusty wynik", () => expect(game.validateMove(s, A, result([], 4))).toBe(true));
});

describe("schemat", () => {
  test.each([
    ["zły typ ruchu", { type: "tap", times: [], errors: 0 }],
    ["brak czasów", { type: "result", errors: 0 }],
    ["czas tekstem", { type: "result", times: ["500"], errors: 0 }],
    ["suma czasów ponad 30 s", { type: "result", times: Array(201).fill(150), errors: 0 }],
    ["niecałkowite pomyłki", { type: "result", times: [], errors: 0.5 }],
  ])("%s", (_, move) => expect(game.moveSchema.safeParse(move).success).toBe(false));
  test("poprawny ruch", () => expect(game.moveSchema.safeParse(result([500], 2)).success).toBe(true));
});

describe("koniec", () => {
  test.each([
    [A, [A, C, B]],
    [B, [B, A, C]],
    [C, [C, A, B]],
  ])("więcej par wygrywa (%s), remis rozstrzyga średnia", (winner, ranking) => {
    let s = game.setup([A, B, C], createRng(1));
    for (const p of [A, B, C]) {
      expect(game.isOver(s)).toBeNull();
      // Zwycięzca ma 3 pary, pozostali po 2; z nich wyżej ten z niższą średnią.
      s = send(s, p, p === winner ? result([700, 700, 700], 5) : result(p === ranking[1] ? [500, 500] : [600, 600]));
    }
    expect(game.isOver(s)).toEqual({ winner, ranking });
    expect(game.places!(s)).toEqual({ [ranking[0]]: 1, [ranking[1]]: 2, [ranking[2]]: 3 });
    expect(game.waitingFor(s)).toEqual([]);
  });

  test("remis na górze i dwa puste wyniki: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result([600, 400]));
    expect(game.waitingFor(s)).toEqual([B]);
    s = send(s, B, result([500, 500], 3));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1 });

    let t = game.setup([A, B], createRng(1));
    t = send(t, A, result([]));
    t = send(t, B, result([], 7));
    expect(game.isOver(t)).toEqual({ ranking: [A, B] });
  });

  test("gra solo kończy się rankingiem bez zwycięzcy", () => {
    expect(game.isOver(send(game.setup([A], createRng(1)), A, result([500])))).toEqual({ ranking: [A] });
  });

  test("po limicie czasu pusty wynik, który przechodzi walidację", () => {
    const s = game.setup([A], createRng(1));
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(move).toEqual(result([]));
    expect(game.validateMove(s, A, move)).toBe(true);
  });
});

test("applyMove nie zmienia poprzedniego stanu, stan przeżywa JSON", () => {
  const s = game.setup([A, B], createRng(1));
  const before = JSON.stringify(s);
  const next = send(s, A, result([500]));
  expect(JSON.stringify(s)).toBe(before);
  expect(JSON.parse(JSON.stringify(next))).toEqual(next);
});
