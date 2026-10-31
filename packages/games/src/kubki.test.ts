import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { ballAt, kubki as game, type Move, ROUNDS, SHOW_MS, type State, swapCount, swapMs, type View } from "./kubki.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie te same rundy: trzy kubki (miejsca 0-2), pod jednym kulka, najwyżej 20 rund,
// - runda to miejsce kulki i lista zamian dwóch miejsc; ta sama para nie pada dwa razy z rzędu,
// - z każdą rundą zamian jest więcej (4 + r) i są szybsze (500 ms − 25 ms na rundę, nie mniej niż 150 ms),
// - gdzie kulka jest po tasowaniu, liczy ballAt (ta sama funkcja na serwerze i w ekranie),
// - klient oddaje jeden wynik: wskazane miejsce (0-2) w kolejnych rundach,
// - serwer liczy rundy trafione od początku do pierwszej pomyłki,
// - ranking: więcej rund wyżej, bez drugiego kryterium; zwycięzca tylko przy 2+ graczach i bez remisu.

const A = "ania";
const B = "bartek";
const C = "celina";

const view = (s: State, player = A) => game.playerView(s, player) as View;
const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));

/** Wynik gracza, który trafił `rounds` rund, a w następnej wskazał zły kubek (`miss`); bez `miss`: przerwał albo doszedł do końca. */
function play(s: State, rounds: number, miss = false): Move {
  const picks = s.rounds.slice(0, rounds).map(ballAt);
  return { type: "result", picks: miss ? [...picks, (ballAt(s.rounds[rounds]) + 1) % 3] : picks };
}

/** Tak ruch widzi platforma: najpierw kształt, potem reguły. */
const accepts = (s: State, player: string, move: unknown) => {
  const parsed = game.moveSchema.safeParse(move);
  return parsed.success && game.validateMove(s, player, parsed.data);
};

function send(s: State, player: string, move: Move): State {
  expect(accepts(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

describe("definicja", () => {
  test("1-6 graczy, limit 180 s, świeża gra trwa", () => {
    expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["kubki", 1, 6, 180]);
    expect(game.isOver(fresh())).toBeNull();
  });

  test("najwyżej 20 rund, kulkę widać przez 1 s", () => {
    expect([ROUNDS, SHOW_MS]).toEqual([20, 1000]);
  });
});

describe("setup", () => {
  test("wszyscy grają naraz i dostają te same rundy", () => {
    const s = fresh();
    expect(game.waitingFor(s)).toEqual([A, B]);
    expect(view(s, A).rounds).toEqual(view(s, B).rounds);
    expect(view(s, "").rounds).toEqual(view(s, A).rounds);
  });

  test("20 rund, w każdej kulka na miejscu 0-2 i tyle zamian, ile wynika z tempa", () => {
    const { rounds } = view(fresh());
    expect(rounds).toHaveLength(ROUNDS);
    rounds.forEach((round, r) => {
      expect([0, 1, 2]).toContain(round.ball);
      expect(round.swaps).toHaveLength(swapCount(r));
    });
  });

  test("ten sam seed to te same rundy, rewanż daje inne", () => {
    expect(view(fresh([A], 1)).rounds).toEqual(view(fresh([A], 1)).rounds);
    expect(view(fresh([A], 1)).rounds).not.toEqual(view(fresh([A], 2)).rounds);
  });
});

describe("tempo", () => {
  test.each([
    [0, 4, 500],
    [1, 5, 475],
    [13, 17, 175],
    [14, 18, 150],
    [19, 23, 150],
  ])("runda %i: %i zamian po %i ms", (round, count, ms) => {
    expect([swapCount(round), swapMs(round)]).toEqual([count, ms]);
  });

  test("tasowanie nigdy nie trwa dłużej niż 3,6 s", () => {
    for (let r = 0; r < ROUNDS; r++) expect(swapCount(r) * swapMs(r)).toBeLessThanOrEqual(3600);
  });
});

describe("zamiany", () => {
  const games = [1, 2, 3].map((seed) => view(fresh([A], seed)).rounds);

  test("zamiana to dwa różne miejsca 0-2", () => {
    for (const rounds of games) {
      for (const { swaps } of rounds) {
        for (const swap of swaps) {
          expect(swap).toHaveLength(2);
          for (const place of swap) expect([0, 1, 2]).toContain(place);
          expect(swap[0]).not.toBe(swap[1]);
        }
      }
    }
  });

  test("ta sama para nie pada dwa razy z rzędu (także odwrócona)", () => {
    const pair = (swap: number[]) => [...swap].sort().join();
    for (const rounds of games) {
      for (const { swaps } of rounds) swaps.slice(1).forEach((swap, i) => expect(pair(swap)).not.toBe(pair(swaps[i])));
    }
  });

  test("kulka kończy pod każdym z trzech kubków", () => {
    for (const rounds of games) expect(new Set(rounds.map(ballAt))).toEqual(new Set([0, 1, 2]));
  });
});

describe("ballAt", () => {
  test("bez zamian kulka zostaje na miejscu", () => {
    expect(ballAt({ ball: 1, swaps: [] })).toBe(1);
  });

  test("kulka idzie za swoim kubkiem w obie strony", () => {
    expect(ballAt({ ball: 0, swaps: [[0, 2]] })).toBe(2);
    expect(ballAt({ ball: 2, swaps: [[0, 2]] })).toBe(0);
  });

  test("zamiana dwóch pustych kubków jej nie rusza", () => {
    expect(ballAt({ ball: 2, swaps: [[0, 1], [1, 0]] })).toBe(2);
  });

  test("seria zamian: 0 → 1 → 2, potem zamiana 0 i 1 już jej nie dotyczy", () => {
    expect(ballAt({ ball: 0, swaps: [[0, 1], [1, 2], [0, 1]] })).toBe(2);
    expect(ballAt({ ball: 0, swaps: [[0, 1], [1, 2], [0, 1], [2, 0]] })).toBe(0);
  });
});

describe("walidacja", () => {
  const s = fresh();
  const one = (pick: number) => ({ type: "result", picks: [pick] });

  test("obcy gracz", () => expect(accepts(s, C, play(s, 3))).toBe(false));
  test("drugi wynik tego samego gracza", () => expect(accepts(send(s, A, play(s, 3)), A, play(s, 4))).toBe(false));
  test("wynik po końcu gry", () => {
    const over = send(send(s, A, play(s, 3)), B, play(s, 4));
    expect(accepts(over, A, play(s, 5))).toBe(false);
  });

  test("miejsce od 0 do 2", () => {
    expect(accepts(s, A, one(-1))).toBe(false);
    expect(accepts(s, A, one(3))).toBe(false);
    for (const pick of [0, 1, 2]) expect(accepts(s, A, one(pick))).toBe(true);
  });

  test("najwyżej tyle rund, ile jest w partii", () => {
    expect(accepts(s, A, play(s, ROUNDS))).toBe(true);
    expect(accepts(s, A, { type: "result", picks: [...play(s, ROUNDS).picks, 0] })).toBe(false);
  });

  test.each([
    ["miejsce niecałkowite", { type: "result", picks: [0.5] }],
    ["miejsce tekstem", { type: "result", picks: ["0"] }],
    ["runda jest listą", { type: "result", picks: [[0]] }],
    ["brak listy", { type: "result" }],
    ["lista nie jest listą", { type: "result", picks: 1 }],
    ["zły typ ruchu", { type: "progress", picks: [] }],
  ])("schemat odrzuca: %s", (_, move) => {
    expect(game.moveSchema.safeParse(move).success).toBe(false);
  });
});

describe("wynik", () => {
  const s = fresh();
  const result = (move: Move) => view(send(s, A, move)).results[A];

  test("liczą się rundy trafione od początku", () => {
    expect(result(play(s, 2))).toBe(2);
  });

  test("pierwsza pomyłka kończy liczenie", () => {
    expect(result(play(s, 3, true))).toBe(3);
    expect(result(play(s, 0, true))).toBe(0);
  });

  test("rundy po pomyłce są ignorowane", () => {
    const { picks } = play(s, 5);
    picks[1] = (picks[1] + 1) % 3;
    expect(result({ type: "result", picks })).toBe(1);
  });

  test("wszystkie 20 rund bez pomyłki", () => {
    expect(result(play(s, ROUNDS))).toBe(ROUNDS);
  });
});

describe("koniec", () => {
  test("gra trwa, dopóki ktoś nie oddał wyniku", () => {
    const s = send(fresh(), A, play(fresh(), 3, true));
    expect(game.waitingFor(s)).toEqual([B]);
    expect(game.isOver(s)).toBeNull();
    expect(view(s, B).results[A]).toBe(3);
  });

  test("więcej rund wygrywa", () => {
    let s = fresh([A, B, C]);
    s = send(s, A, play(s, 4, true));
    s = send(s, B, play(s, 6, true));
    s = send(s, C, play(s, 5, true));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
    expect(game.waitingFor(s)).toEqual([]);
  });

  test.each([A, B, C])("wygrać może każdy: %s", (best) => {
    let s = fresh([A, B, C]);
    for (const p of [A, B, C]) s = send(s, p, play(s, p === best ? 9 : 4, true));
    expect(game.isOver(s)?.winner).toBe(best);
  });

  test("tyle samo rund: remis bez zwycięzcy, bez drugiego kryterium", () => {
    let s = fresh();
    s = send(s, A, play(s, 5, true));
    s = send(s, B, play(s, 5));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("obaj doszli do końca: remis bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, play(s, ROUNDS));
    s = send(s, B, play(s, ROUNDS));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("solo: bez zwycięzcy", () => {
    const s = fresh([A]);
    expect(game.isOver(send(s, A, play(s, 8, true)))).toEqual({ ranking: [A] });
  });

  test("po limicie czasu pusty wynik, czyli zero rund", () => {
    const s = fresh();
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(move).toEqual({ type: "result", picks: [] });
    expect(view(send(s, A, move)).results[A]).toBe(0);
  });
});

describe("stan", () => {
  test("oddanie wyniku nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    const next = send(s, A, play(s, 2, true));
    expect(JSON.stringify(s)).toBe(before);
    const copy = JSON.parse(JSON.stringify(next)) as State;
    expect(copy).toEqual(next);
    expect(game.isOver(send(copy, B, play(s, 3)))).toEqual({ winner: B, ranking: [B, A] });
  });
});

test("P4-035/F4-019: zamiany z ustalonych seedów takie same jak przed zmianą nazwy na swapsFor", () => {
  const hash = (t: string) => [...t].reduce((x, c) => (Math.imul(x, 31) + c.charCodeAt(0)) | 0, 7);
  const rounds = (seed: number) => game.setup([A], createRng(seed)).rounds;
  expect(rounds(1)[0]).toEqual({ ball: 1, swaps: [[2, 1], [1, 0], [2, 1], [0, 1]] });
  expect([1, 2, 3].map((seed) => hash(JSON.stringify(rounds(seed))))).toEqual([2087188642, -879307560, -1565113317]);
});
