import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { MAX_ANSWER, MAX_VALUE, type Move, type Round, ROUNDS, SHOW_MS, START_OPS, type State, value, type View, wPamieci as game } from "./w-pamieci.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie te same rundy: liczba startowa i ciąg działań (+, −, ×), najwyżej 12 rund,
// - ciąg się wydłuża: runda i (od 0) ma i + 2 działań; każda runda to nowy ciąg,
// - start 1-9, działania +1..9, −1..9, ×2 albo ×3, wartość po każdym kroku w 1-99; działania liczy się po kolei od lewej (value),
// - klient oddaje jeden wynik: odpowiedzi z kolejnych rund (int 0-999),
// - serwer liczy poprawne odpowiedzi do pierwszej pomyłki i odchyłkę w rundzie z pomyłką (brak odpowiedzi = 999),
// - ranking: więcej rund wyżej, przy równych mniejsza odchyłka; zwycięzca tylko przy 2+ graczach i bez remisu.

const A = "ania";
const B = "bartek";
const C = "celina";

const view = (s: State, player = A) => game.playerView(s, player) as View;
const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));

/** Wynik gracza, który zaliczył `rounds` rund, a w następnej pomylił się o `off` (bez `off`: przerwał albo doszedł do końca). */
const play = (s: State, rounds: number, off?: number): Move => ({
  type: "result",
  answers: [...s.rounds.slice(0, rounds).map(value), ...(off === undefined ? [] : [value(s.rounds[rounds]) + off])],
});

/** Tak ruch widzi platforma: najpierw kształt, potem reguły. */
const accepts = (s: State, player: string, move: unknown) => {
  const parsed = game.moveSchema.safeParse(move);
  return parsed.success && game.validateMove(s, player, parsed.data);
};

function send(s: State, player: string, move: Move): State {
  expect(accepts(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

/** Wartości po każdym kroku ciągu, razem ze startową. */
function steps(round: Round): number[] {
  return round.ops.map((_, i) => value({ start: round.start, ops: round.ops.slice(0, i + 1) })).concat(round.start);
}

describe("definicja", () => {
  test("1-6 graczy, limit 300 s, świeża gra trwa", () => {
    expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["w-pamieci", 1, 6, 300]);
    expect(game.isOver(fresh())).toBeNull();
  });

  test("12 rund, pierwsza ma 2 działania, pozycję widać 1,5 s, wartości do 99, odpowiedzi do 999", () => {
    expect([ROUNDS, START_OPS, SHOW_MS, MAX_VALUE, MAX_ANSWER]).toEqual([12, 2, 1500, 99, 999]);
  });
});

describe("setup", () => {
  const games = Array.from({ length: 40 }, (_, seed) => view(fresh([A], seed + 1)).rounds);

  test("wszyscy grają naraz i dostają te same ciągi", () => {
    const s = fresh();
    expect(game.waitingFor(s)).toEqual([A, B]);
    expect(view(s, A).rounds).toEqual(view(s, B).rounds);
    expect(view(s, "").rounds).toEqual(view(s, A).rounds);
  });

  test("ciąg się wydłuża: runda i ma i + 2 działań", () => {
    for (const rounds of games) {
      expect(rounds).toHaveLength(ROUNDS);
      rounds.forEach((round, i) => expect(round.ops).toHaveLength(i + START_OPS));
    }
  });

  test("start 1-9, działania +1..9, −1..9, ×2 albo ×3", () => {
    for (const round of games.flat()) {
      expect(Number.isInteger(round.start) && round.start >= 1 && round.start <= 9, `start ${round.start}`).toBe(true);
      for (const { op, n } of round.ops) {
        expect(["+", "−", "×"]).toContain(op);
        expect(Number.isInteger(n) && n >= (op === "×" ? 2 : 1) && n <= (op === "×" ? 3 : 9), `${op}${n}`).toBe(true);
      }
    }
  });

  test("wartość po każdym kroku jest w 1-99", () => {
    for (const round of games.flat()) {
      for (const v of steps(round)) expect(v >= 1 && v <= MAX_VALUE, `${JSON.stringify(round)} daje ${v}`).toBe(true);
    }
  });

  test("losowane są wszystkie trzy rodzaje działań", () => {
    expect(new Set(games.flat().flatMap((round) => round.ops.map((o) => o.op)))).toEqual(new Set(["+", "−", "×"]));
  });

  test("ten sam seed to te same ciągi, rewanż daje inne", () => {
    expect(view(fresh([A], 1)).rounds).toEqual(view(fresh([A], 1)).rounds);
    expect(view(fresh([A], 1)).rounds).not.toEqual(view(fresh([A], 2)).rounds);
  });
});

describe("value", () => {
  test("sama liczba startowa", () => expect(value({ start: 7, ops: [] })).toBe(7));

  test("działania liczy się po kolei od lewej, bez kolejności działań", () => {
    // 4 + 7 = 11, 11 − 3 = 8, 8 × 2 = 16 (a nie 4 + 7 − 6).
    expect(value({ start: 4, ops: [{ op: "+", n: 7 }, { op: "−", n: 3 }, { op: "×", n: 2 }] })).toBe(16);
    expect(value({ start: 2, ops: [{ op: "+", n: 3 }, { op: "×", n: 3 }] })).toBe(15);
  });
});

describe("walidacja", () => {
  const s = fresh();
  const one = (answer: number): Move => ({ type: "result", answers: [answer] });

  test("obcy gracz", () => expect(accepts(s, C, play(s, 3))).toBe(false));
  test("drugi wynik tego samego gracza", () => expect(accepts(send(s, A, play(s, 3)), A, play(s, 4))).toBe(false));
  test("wynik po końcu gry", () => {
    const over = send(send(s, A, play(s, 3)), B, play(s, 4));
    expect(accepts(over, A, play(s, 5))).toBe(false);
  });

  test("odpowiedź od 0 do 999", () => {
    expect(accepts(s, A, one(-1))).toBe(false);
    expect(accepts(s, A, one(0))).toBe(true);
    expect(accepts(s, A, one(MAX_ANSWER))).toBe(true);
    expect(accepts(s, A, one(MAX_ANSWER + 1))).toBe(false);
  });

  test("najwyżej tyle odpowiedzi, ile jest rund", () => {
    expect(accepts(s, A, play(s, ROUNDS))).toBe(true);
    expect(accepts(s, A, { type: "result", answers: [...play(s, ROUNDS).answers, 1] })).toBe(false);
  });

  test.each([
    ["odpowiedź niecałkowita", { type: "result", answers: [1.5] }],
    ["odpowiedź tekstem", { type: "result", answers: ["12"] }],
    ["brak listy", { type: "result" }],
    ["lista nie jest listą", { type: "result", answers: 3 }],
    ["za długa lista", { type: "result", answers: Array.from({ length: ROUNDS + 1 }, () => 1) }],
    ["zły typ ruchu", { type: "progress", answers: [] }],
  ])("schemat odrzuca: %s", (_, move) => {
    expect(game.moveSchema.safeParse(move).success).toBe(false);
  });
});

describe("wynik", () => {
  const s = fresh();
  const result = (move: Move) => view(send(s, A, move)).results[A];

  test("poprawna odpowiedź zalicza rundę", () => {
    expect(result(play(s, 2, 1)).rounds).toBe(2);
  });

  test("pierwsza pomyłka kończy liczenie", () => {
    expect(result(play(s, 3, 5))).toEqual({ rounds: 3, diff: 5 });
    expect(result(play(s, 0, 5))).toEqual({ rounds: 0, diff: 5 });
  });

  test.each([1, -1, 4, -4])("odchyłka to różnica w rundzie z pomyłką, bez znaku: %i", (off) => {
    // Runda z wynikiem ponad 4, żeby odpowiedź przesunięta w dół nie zeszła poniżej zera.
    const at = s.rounds.findIndex((round) => value(round) > 4);
    expect(result(play(s, at, off))).toEqual({ rounds: at, diff: Math.abs(off) });
  });

  test("rundy po pomyłce są ignorowane", () => {
    const answers = s.rounds.slice(0, 5).map(value);
    answers[1] += 2;
    expect(result({ type: "result", answers })).toEqual({ rounds: 1, diff: 2 });
  });

  test("urwana lista samych poprawnych: brak odpowiedzi to najgorsza odchyłka", () => {
    expect(result(play(s, 4))).toEqual({ rounds: 4, diff: MAX_ANSWER });
  });

  test("wszystkie 12 rund bez pomyłki: odchyłka 0", () => {
    expect(result(play(s, ROUNDS))).toEqual({ rounds: ROUNDS, diff: 0 });
  });
});

describe("koniec", () => {
  test("gra trwa, dopóki ktoś nie oddał wyniku", () => {
    const s = send(fresh(), A, play(fresh(), 3, 1));
    expect(game.waitingFor(s)).toEqual([B]);
    expect(game.isOver(s)).toBeNull();
    expect(view(s, B).results[A].rounds).toBe(3);
  });

  test("więcej rund wygrywa, przy równych mniejsza odchyłka w rundzie z pomyłką", () => {
    let s = fresh([A, B, C]);
    s = send(s, A, play(s, 4, 6));
    s = send(s, B, play(s, 6, 9));
    s = send(s, C, play(s, 4, 2));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
    expect(game.places!(s)).toEqual({ [B]: 1, [C]: 2, [A]: 3 });
    expect(game.waitingFor(s)).toEqual([]);
  });

  test.each([A, B, C])("wygrać może każdy: %s", (best) => {
    let s = fresh([A, B, C]);
    for (const p of [A, B, C]) s = send(s, p, play(s, p === best ? 9 : 4, 1));
    expect(game.isOver(s)?.winner).toBe(best);
  });

  test("te same rundy i odchyłka: remis bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, play(s, 5, 3));
    s = send(s, B, play(s, 5, 3));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1 });
  });

  test("obaj doszli do końca: remis bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, play(s, ROUNDS));
    s = send(s, B, play(s, ROUNDS));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("solo: bez zwycięzcy", () => {
    const s = fresh([A]);
    expect(game.isOver(send(s, A, play(s, 8, 1)))).toEqual({ ranking: [A] });
  });

  test("po limicie czasu pusty wynik, czyli zero rund i najgorsza odchyłka", () => {
    const s = fresh();
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(move).toEqual({ type: "result", answers: [] });
    expect(view(send(s, A, move)).results[A]).toEqual({ rounds: 0, diff: MAX_ANSWER });
  });

  test("pomyłka w pierwszej rundzie jest wyżej niż limit czasu", () => {
    let s = fresh();
    s = send(s, A, game.timeoutMove!(s, A, createRng(1)));
    s = send(s, B, play(s, 0, 50));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
  });
});

describe("stan", () => {
  test("oddanie wyniku nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    const next = send(s, A, play(s, 2, 1));
    expect(JSON.stringify(s)).toBe(before);
    const copy = JSON.parse(JSON.stringify(next)) as State;
    expect(copy).toEqual(next);
    expect(game.isOver(send(copy, B, play(s, 3)))).toEqual({ winner: B, ranking: [B, A] });
  });
});
