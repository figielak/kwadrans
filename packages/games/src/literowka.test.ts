import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { literowka as game, type Move, score, type State, type View, WORDS } from "./literowka.ts";
import { PAIRS } from "./literowka-dane.ts";
import { DURATION_MS } from "./quiz.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - wszyscy dostają te same plansze: 4 słowa (`words`), z których jedno (`wrong`) ma błąd ortograficzny,
// - pary `[poprawne, błędne]` różnią się tylko pisownią ó/u, rz/ż albo ch/h; błędna forma nie jest poprawną formą innej pary,
// - plansze rozdawane są z potasowanej listy par, więc dopóki lista starcza, żadne słowo się nie powtarza,
// - klient oddaje czasy trafień (całkowite 0-30000 ms, razem max 30 s) i liczbę pomyłek,
// - wynik = trafienia − pomyłki, nie mniej niż 0; ranking: więcej punktów wyżej, remis rozstrzyga niższa średnia.

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (times: number[], errors = 0): Move => ({ type: "result", times, errors });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

const trialsOf = (seed: number) => (game.playerView(game.setup([A, B], createRng(seed)), A) as View).trials;
const ALL = [1, 2, 3, 4, 5].flatMap(trialsOf);

/** Słowo bez różnic ó/u, rz/ż i ch/h: obie formy pary dają to samo. */
const sound = (word: string) => word.replaceAll("ó", "u").replaceAll("rz", "ż").replaceAll("ch", "h");
const RIGHT = new Set(PAIRS.map(([right]) => right));
const WRONG = new Set(PAIRS.map(([, wrong]) => wrong));

test("definicja: 1-6 graczy, limit 90 s, świeża gra trwa", () => {
  expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["literowka", 1, 6, 90]);
  const s = game.setup([A, B], createRng(1));
  expect(game.isOver(s)).toBeNull();
  expect(game.waitingFor(s)).toEqual([A, B]);
});

describe("lista słów", () => {
  test("co najmniej 100 par", () => expect(PAIRS.length).toBeGreaterThanOrEqual(100));

  test("słowa mają 4-12 małych liter", () => {
    for (const word of PAIRS.flat()) expect(word, word).toMatch(/^[a-ząćęłńóśźż]{4,12}$/);
  });

  test("błędna forma różni się od poprawnej tylko pisownią ó/u, rz/ż albo ch/h", () => {
    for (const [right, wrong] of PAIRS) {
      expect(wrong, right).not.toBe(right);
      expect(sound(wrong), right).toBe(sound(right));
    }
  });

  test("żadne słowo nie jest na liście dwa razy, a błędna forma nie jest poprawną formą innej pary", () => {
    expect(new Set(PAIRS.map(([right]) => sound(right))).size).toBe(PAIRS.length);
    for (const wrong of WRONG) expect(RIGHT.has(wrong), wrong).toBe(false);
  });
});

describe("plansze", () => {
  test("wystarczy ich na 30 s", () => expect(trialsOf(1).length * 150).toBeGreaterThanOrEqual(DURATION_MS));

  test("ten sam seed daje te same plansze, inny seed (rewanż) inne", () => {
    expect(trialsOf(1)).toEqual(trialsOf(1));
    expect(trialsOf(1)).not.toEqual(trialsOf(2));
  });

  test("plansza to 4 różne słowa", () => {
    expect(WORDS).toBe(4);
    for (const t of ALL) {
      expect(t.words).toHaveLength(WORDS);
      expect(new Set(t.words.map(sound)).size).toBe(WORDS);
    }
  });

  test("dokładnie jedno słowo ma błąd i wskazuje je `wrong`", () => {
    for (const t of ALL)
      t.words.forEach((word, i) => {
        expect(WRONG.has(word), word).toBe(i === t.wrong);
        expect(RIGHT.has(word), word).toBe(i !== t.wrong);
      });
  });

  test("błędne słowo trafia na każdą pozycję mniej więcej po równo", () => {
    for (let i = 0; i < WORDS; i++) {
      const count = ALL.filter((t) => t.wrong === i).length;
      expect(count).toBeGreaterThan(ALL.length * 0.2);
      expect(count).toBeLessThan(ALL.length * 0.3);
    }
  });

  test("dopóki lista starcza, żadne słowo się nie powtarza", () => {
    const boards = Math.floor(PAIRS.length / WORDS);
    for (const seed of [1, 2, 3]) {
      const words = trialsOf(seed).slice(0, boards).flatMap((t) => t.words.map(sound));
      expect(new Set(words).size).toBe(words.length);
    }
  });
});

describe("punktacja", () => {
  test("wynik to trafienia minus pomyłki, nie mniej niż 0", () => {
    expect(score({ times: [500, 500, 500], errors: 1 })).toBe(2);
    expect(score({ times: [500], errors: 4 })).toBe(0);
    expect(score({ times: [], errors: 0 })).toBe(0);
  });

  test("mniej trafień bez pomyłek wygrywa z większą liczbą trafień i wieloma pomyłkami", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(Array(8).fill(400), 6));
    s = send(s, B, result(Array(3).fill(900)));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
  });

  test("przy równych punktach wygrywa niższa średnia czasu", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result([600, 600]));
    s = send(s, B, result([500, 500, 500], 1));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
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
  ])("więcej punktów wygrywa (%s), remis rozstrzyga średnia", (winner, ranking) => {
    let s = game.setup([A, B, C], createRng(1));
    for (const p of [A, B, C]) {
      expect(game.isOver(s)).toBeNull();
      // Zwycięzca ma 3 punkty (5 trafień − 2), pozostali po 2; z nich wyżej ten z niższą średnią.
      s = send(s, p, p === winner ? result(Array(5).fill(700), 2) : result(p === ranking[1] ? [500, 500] : [600, 600]));
    }
    expect(game.isOver(s)).toEqual({ winner, ranking });
    expect(game.waitingFor(s)).toEqual([]);
  });

  test("remis na górze i dwa wyniki bez trafień: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result([600, 400]));
    expect(game.waitingFor(s)).toEqual([B]);
    s = send(s, B, result([500, 500, 500], 1));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });

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
