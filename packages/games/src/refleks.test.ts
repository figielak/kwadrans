import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { type Move, PENALTY_MS, refleks as game, ROUNDS, type State, type View } from "./refleks.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie, 12 rund, ta sama lista opóźnień (1-3 s) dla wszystkich,
// - klient oddaje jeden wynik: 12 czasów reakcji (int 100-1000 ms); falstart i reakcja ponad 1 s to 1000 ms,
// - serwer liczy zaokrągloną średnią, mniej lepiej; zwycięzca tylko przy 2+ graczach i bez remisu,
// - po limicie czasu pusta lista, czyli najgorszy wynik: 1000 ms.

const A = "ania";
const B = "bartek";
const C = "celina";

const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));
const result = (times: number[]): Move => ({ type: "result", times });
/** Gracz z taką samą reakcją w każdej rundzie. */
const steady = (ms: number) => result(Array(ROUNDS).fill(ms));

/** Tak ruch widzi platforma: najpierw kształt, potem reguły. */
const accepts = (s: State, player: string, move: unknown) => {
  const parsed = game.moveSchema.safeParse(move);
  return parsed.success && game.validateMove(s, player, parsed.data);
};

function send(s: State, player: string, move: Move): State {
  expect(accepts(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

describe("setup", () => {
  test("12 rund, kara 1000 ms, wszyscy grają naraz, opóźnienia 1-3 s", () => {
    expect([ROUNDS, PENALTY_MS, game.turnSeconds]).toEqual([12, 1000, 60]);
    const s = fresh();
    expect(game.waitingFor(s)).toEqual([A, B]);
    const { delays } = game.playerView(s, A) as View;
    expect(delays).toHaveLength(ROUNDS);
    expect(delays.every((d) => d >= 1000 && d <= 3000)).toBe(true);
  });

  test("ten sam seed to te same opóźnienia, rewanż ma inne", () => {
    expect(fresh([A, B], 7)).toEqual(fresh([A, B], 7));
    expect(fresh([A, B], 8).delays).not.toEqual(fresh([A, B], 7).delays);
  });
});

describe("walidacja", () => {
  const s = fresh();
  const last = (ms: number) => result([...Array(ROUNDS - 1).fill(300), ms]);
  test.each([
    ["za szybka reakcja", last(99)],
    ["ponad karę", last(1001)],
    ["liczba niecałkowita", last(300.5)],
    ["za mało rund", result(Array(ROUNDS - 1).fill(300))],
    ["za dużo rund", result(Array(ROUNDS + 1).fill(300))],
    ["śmieci z sieci", { type: "result", times: "szybko" }],
  ])("%s", (_, move) => expect(accepts(s, A, move)).toBe(false));
  test("wartości brzegowe 100 i 1000 przechodzą", () => {
    expect(accepts(s, A, last(100))).toBe(true);
    expect(accepts(s, A, last(PENALTY_MS))).toBe(true);
  });
  test("obcy gracz", () => expect(accepts(s, C, steady(300))).toBe(false));
  test("drugi wynik tego samego gracza", () => expect(accepts(send(s, A, steady(300)), A, steady(200))).toBe(false));
  test("pusty wynik jest dozwolony", () => expect(accepts(s, A, result([]))).toBe(true));
});

describe("koniec", () => {
  test("gra trwa, dopóki ktoś nie oddał wyniku; czasy zostają w stanie", () => {
    const s = send(fresh(), A, steady(300));
    expect(game.waitingFor(s)).toEqual([B]);
    expect(game.isOver(s)).toBeNull();
    const view = game.playerView(s, B) as View;
    expect(view.results[A]).toBe(300);
    expect(view.times[A]).toEqual(Array(ROUNDS).fill(300));
  });

  test("wynik to zaokrąglona średnia, kara liczy się jak 1000 ms", () => {
    const s = send(fresh(), A, result([...Array(ROUNDS - 1).fill(200), PENALTY_MS]));
    expect(s.results[A]).toBe(Math.round((200 * (ROUNDS - 1) + PENALTY_MS) / ROUNDS));
  });

  test("niższa średnia wygrywa, niezależnie od kolejności miejsc", () => {
    let s = fresh([A, B, C]);
    s = send(s, A, steady(350));
    s = send(s, B, steady(250));
    s = send(s, C, steady(300));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
    expect(game.places!(s)).toEqual({ [B]: 1, [C]: 2, [A]: 3 });
  });

  test("remis na górze: bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, steady(300));
    s = send(s, B, steady(300));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("limit czasu to najgorszy wynik: 1000 ms, na równi z samymi karami", () => {
    let s = fresh();
    expect(game.timeoutMove!(s, A, createRng(1))).toEqual(result([]));
    s = send(s, A, game.timeoutMove!(s, A, createRng(1)));
    s = send(s, B, steady(PENALTY_MS));
    expect(s.results).toEqual({ [A]: PENALTY_MS, [B]: PENALTY_MS });
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("solo: bez zwycięzcy", () => {
    expect(game.isOver(send(fresh([A]), A, steady(300)))).toEqual({ ranking: [A] });
  });

  test("rekord to średnia, mniej lepiej, bez drugiego kryterium", () => {
    const s = send(fresh([A]), A, steady(280));
    expect(game.record!.lower).toBe(true);
    expect(game.record!.score(s, A)).toBe(280);
    expect(game.record!.tie).toBeUndefined();
  });

  test("applyMove nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    const next = send(s, A, steady(300));
    expect(JSON.stringify(s)).toBe(before);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
});


// P4-032: nazwane luki istniejących zasad z F4.
test("P4-032/F4-004: definicja 1-6 graczy, świeża gra trwa", () => {
  expect([game.minPlayers, game.maxPlayers]).toEqual([1, 6]);
  for (const players of [[A], [A, B, C, "darek", "ela", "filip"]]) expect(game.isOver(game.setup(players, createRng(1)))).toBeNull();
});


test("P4-032/F4-006: po końcu każdy typ ruchu jest odrzucony dla graczy i obcego", () => {
  let s = game.setup([A, B], createRng(1));
  for (const p of [A, B]) s = send(s, p, steady(300));
  expect(game.isOver(s)).not.toBeNull();
  for (const p of [A, B, "obcy"]) for (const move of [steady(300)]) expect(game.validateMove(s, p, move)).toBe(false);
});

test.each([{ type: "result" }, { type: "nieznany", times: [] }])("P4-032/F4-008: schemat odrzuca %j", (move) => {
  expect(game.moveSchema.safeParse(move).success).toBe(false);
});

test.each([A, C])("P4-032/F4-009: wygrywa także %s", (winner) => {
  let s = game.setup([A, B, C], createRng(1));
  for (const p of [A, B, C]) {
    s = send(s, p, steady(p === winner ? 200 : 400));
  }
  expect(game.isOver(s)?.winner).toBe(winner);
  expect(game.waitingFor(s)).toEqual([]);
});
