import { describe, expect, test } from "vitest";
import { createRng, soloState } from "./core.ts";
import { type Move, PENALTY_MS, schulte as game, type State, type View } from "./schulte.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - wszyscy dostają tę samą siatkę 5×5 z liczbami 1-25 w losowej kolejności,
// - klient oddaje czas (ms) i liczbę pomyłek; każda pomyłka to 3 s kary,
// - czas krótszy niż 25 × 150 ms jest nierealny, dłuższy niż limit tury też,
// - ranking po czasie z karami rosnąco; po limicie czasu ostatnie miejsce,
// - mini-gra ma zasady narzucone z góry: bez trybów, znalezione liczby zostają widoczne,
// - wynik niesie 25 międzyczasów (suma równa czasowi) albo pustą listę; nie wpływają na ranking,
// - po każdym trafieniu klient zgłasza postęp (1-24), który widzą rywale; postęp nie kończy gry i nie odnawia limitu.

const A = "ania";
const B = "bartek";
const C = "celina";

/** Równe międzyczasy, reszta z dzielenia w ostatnim. */
const even = (ms: number) => Array.from({ length: 25 }, (_, i) => Math.floor(ms / 25) + (i === 24 ? ms % 25 : 0));
const result = (ms: number, mistakes = 0, splits = even(ms)): Move => ({ type: "result", ms, mistakes, splits });
const progress = (found: number): Move => ({ type: "progress", found });

function send(s: State, player: string, move: Move, source: "client" | "timeout" = "client"): State {
  expect(game.validateMove(s, player, move, { source }), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("siatka to permutacja 1-25, wspólna dla wszystkich", () => {
  const s = game.setup([A, B], createRng(1));
  const { grid } = game.playerView(s, A) as View;
  expect([...grid].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  expect(grid).not.toEqual([...grid].sort((a, b) => a - b));
  expect(game.waitingFor(s)).toEqual([A, B]);
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  test.each([
    ["za szybko", result(3749)],
    ["po limicie tury", result(game.turnSeconds! * 1000 + 1)],
    ["ujemne pomyłki", result(20_000, -1)],
    ["ułamek pomyłki", result(20_000, 0.5)],
  ])("%s", (_, move) => expect(game.validateMove(s, A, move)).toBe(false));
  test("obcy gracz", () => expect(game.validateMove(s, C, result(20_000))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result(20_000)), A, result(19_000))).toBe(false));
});

describe("koniec", () => {
  test("pomyłki doliczają karę", () => {
    expect(PENALTY_MS).toBe(3000);
    let s = game.setup([A, B, C], createRng(1));
    s = send(s, A, result(20_000, 2)); // 26 s
    s = send(s, B, result(24_000)); // 24 s
    expect(game.isOver(s)).toBeNull();
    s = send(s, C, result(22_000, 1)); // 25 s
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
  });

  test("kara wyrównuje czas: remis bez zwycięzcy; solo też", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(20_000, 1));
    s = send(s, B, result(23_000));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.isOver(send(game.setup([A], createRng(1)), A, result(20_000)))).toEqual({ ranking: [A] });
  });

  test("granice czasu: najkrótszy i najdłuższy dozwolony", () => {
    const s = game.setup([A, B], createRng(1));
    expect(game.validateMove(s, A, result(3750))).toBe(true);
    expect(game.validateMove(s, A, result(game.turnSeconds! * 1000))).toBe(true);
  });

  test("po limicie czasu ostatnie miejsce", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, game.timeoutMove!(s, A, createRng(1)), "timeout");
    s = send(s, B, result(game.turnSeconds! * 1000 - 1000));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
  });
});

test("gra nie ma trybów", () => {
  expect(game.modes).toBeUndefined();
  expect(game.playerView(game.setup([A, B], createRng(1), "latwa"), A)).not.toHaveProperty("mode");
});

describe("postęp", () => {
  const s = game.setup([A, B], createRng(1));

  test("na starcie pusty, po zgłoszeniu widzą go wszyscy", () => {
    expect((game.playerView(s, B) as View).progress).toEqual({});
    const after = send(s, A, progress(12));
    expect((game.playerView(after, B) as View).progress).toEqual({ [A]: 12 });
    expect((game.playerView(after, "") as View).progress).toEqual({ [A]: 12 });
  });

  test("nie kończy gry i nie zmienia, na kogo czekamy", () => {
    const after = send(s, A, progress(24));
    expect(game.isOver(after)).toBeNull();
    expect(game.waitingFor(after)).toEqual([A, B]);
    expect(game.validateMove(after, A, result(20_000))).toBe(true);
  });

  test("może spaść (gracz odświeżył stronę i zaczyna od nowa)", () => {
    expect((send(send(s, A, progress(12)), A, progress(1)) as State).progress[A]).toBe(1);
  });

  test.each([
    ["zero", progress(0)],
    ["ostatnia liczba (to już wynik)", progress(25)],
    ["ułamek", progress(1.5)],
  ])("odrzucony: %s", (_, move) => expect(game.validateMove(s, A, move)).toBe(false));
  test("obcy gracz", () => expect(game.validateMove(s, C, progress(3))).toBe(false));
  test("po oddaniu wyniku", () => expect(game.validateMove(send(s, A, result(20_000)), A, progress(3))).toBe(false));

  test("limit tury ma stały klucz, więc postęp go nie odnawia", () => {
    expect(game.turn!(s)).toEqual({ key: "run", seconds: game.turnSeconds });
    expect(game.turn!(send(s, A, progress(5)))).toEqual(game.turn!(s));
  });
});

describe("międzyczasy", () => {
  const s = game.setup([A, B], createRng(1));

  test("trafiają do widoku razem z wynikiem", () => {
    const splits = [...even(20_000).slice(0, 23), 300, 1300];
    const after = send(s, A, result(20_000, 1, splits));
    expect((game.playerView(after, B) as View).results[A]).toEqual({ ms: 20_000, mistakes: 1, splits, completed: true });
  });

  test("pusta lista przechodzi; tak oddaje wynik limit czasu", () => {
    expect(game.validateMove(s, A, result(20_000, 0, []))).toBe(true);
    expect(game.timeoutMove!(s, A, createRng(1))).toMatchObject({ splits: [] });
  });

  test.each([
    ["24 czasy", even(20_000).slice(1)],
    ["suma inna niż czas", even(19_000)],
    ["ujemny czas", [-800, 1600, ...even(20_000).slice(2)]],
    ["ułamek", [800.5, 799.5, ...even(20_000).slice(2)]],
  ])("odrzucone: %s", (_, splits) => expect(game.validateMove(s, A, result(20_000, 0, splits))).toBe(false));
});

// P4-002: ukończenie przed timeoutem, wspólny porządek miejsc i rekordów, zachowanie starego detail.
describe("ukończenie i timeout", () => {
  test("ukończona partia z karami ponad limit wygrywa z timeoutem", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, game.timeoutMove!(s, A, createRng(1)), "timeout");
    s = send(s, B, result(170_000, 4));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
    expect(game.places!(s)).toEqual({ [A]: 2, [B]: 1 });
    expect(game.record!.score(s, B)).toBe(182_000);
    expect(Number.isFinite(game.record!.score(s, A))).toBe(false);
    expect(s.results[A]).toMatchObject({ completed: false });
    expect(s.results[B]).toMatchObject({ completed: true });
  });

  test.each([1, 2, 6])("%i nieukończonych remisuje bez zwycięzcy i bez rekordów", (n) => {
    const players = [A, B, C, "darek", "ewa", "filip"].slice(0, n);
    let s = game.setup(players, createRng(1));
    for (const player of players) s = send(s, player, game.timeoutMove!(s, player, createRng(1)), "timeout");
    expect(game.isOver(s)).toEqual({ ranking: players });
    expect(game.places!(s)).toEqual(Object.fromEntries(players.map((p) => [p, 1])));
    expect(game.waitingFor(s)).toEqual([]);
    for (const player of players) {
      expect(Number.isFinite(game.record!.score(s, player))).toBe(false);
      expect(game.validateMove(s, player, result(20_000))).toBe(false);
      expect(game.validateMove(s, player, game.timeoutMove!(s, player, createRng(1)), { source: "timeout" })).toBe(false);
    }
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(JSON.stringify(s)).not.toMatch(/Infinity|NaN|null/);
    const solo = soloState(s, A);
    expect(solo.results["1"]).toMatchObject({ completed: false });
    expect(Number.isFinite(game.record!.score(solo, "1"))).toBe(false);
  });

  test("timeout wymaga zaufanego źródła, także po parsowaniu schematu", () => {
    const s = game.setup([A, B], createRng(1));
    const move = game.timeoutMove!(s, A, createRng(1));
    const parsed = game.moveSchema.parse({ ...move, source: "timeout", context: { source: "timeout" } });
    expect(game.validateMove(s, A, parsed)).toBe(false);
    expect(game.validateMove(s, A, parsed, { source: "client" })).toBe(false);
    expect(game.validateMove(s, A, parsed, { source: "timeout" })).toBe(true);
    expect(game.validateMove(s, C, parsed, { source: "timeout" })).toBe(false);
    expect(game.validateMove(s, A, result(20_000), { source: "timeout" })).toBe(false);
  });

  test("klient może zgłosić ukończenie, ale nie nieukończenie", () => {
    const s = game.setup([A], createRng(1));
    for (const completed of [true, false]) {
      const move = game.moveSchema.parse({ ...result(20_000), completed });
      expect(game.validateMove(s, A, move)).toBe(completed);
    }
    expect(game.moveSchema.safeParse({ ...result(20_000), completed: "false" }).success).toBe(false);
    expect(send(s, A, result(20_000)).results[A]).toMatchObject({ completed: true });
  });

  test("timeout nie zmienia poprzedniego stanu ani postępu", () => {
    const s = send(game.setup([A, B], createRng(1)), A, progress(3));
    const before = structuredClone(s);
    const after = send(s, A, game.timeoutMove!(s, A, createRng(1)), "timeout");
    expect(s).toEqual(before);
    expect(after.progress).toEqual(before.progress);
    expect(game.waitingFor(after)).toEqual([B]);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
  });

  test("stary detail bez completed zachowuje czas i nie dostaje domniemanego statusu", () => {
    // To zapis historyczny, nie nowa partia; także czas równy limitowi nie dowodzi timeoutu.
    let s = send(game.setup([A], createRng(1)), A, result(game.turnSeconds! * 1000));
    const legacy = JSON.parse(JSON.stringify(s)) as State;
    Reflect.deleteProperty(legacy.results[A], "completed");
    const before = JSON.stringify(legacy);
    const solo = soloState(legacy, A);
    expect(game.record!.score(solo, "1")).toBe(game.turnSeconds! * 1000);
    expect(game.isOver(solo)).toEqual({ ranking: ["1"] });
    expect(game.playerView(solo, "")).toEqual(solo);
    expect(solo.results["1"]).not.toHaveProperty("completed");
    expect(JSON.stringify(legacy)).toBe(before);
  });
});


// P4-032: nazwane luki istniejących zasad z F4.
test("P4-032/F4-004: definicja 1-6 graczy, świeża gra trwa", () => {
  expect([game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual([1, 6, 180]);
  for (const players of [[A], [A, B, C, "darek", "ela", "filip"]]) expect(game.isOver(game.setup(players, createRng(1)))).toBeNull();
});

test("P4-032/F4-005: ten sam seed daje ten sam setup, seedy zmieniają wyzwanie", () => {
  const s = game.setup([A, B], createRng(7));
  expect(game.setup([A, B], createRng(7))).toEqual(s);
  expect(game.setup([A, B], createRng(8)).grid).not.toEqual(s.grid);
});


test("P4-032/F4-006: po końcu każdy typ ruchu jest odrzucony dla graczy i obcego", () => {
  let s = game.setup([A, B], createRng(1));
  for (const p of [A, B]) s = send(s, p, result(20000));
  expect(game.isOver(s)).not.toBeNull();
  for (const p of [A, B, "obcy"]) for (const move of [result(20000), progress(1)]) expect(game.validateMove(s, p, move)).toBe(false);
});

test.each([null, {}, { type: "nieznany" }, { type: "result", ms: 20000, mistakes: 0 }, { type: "result", ms: "20000", mistakes: 0, splits: [] }, { type: "result", ms: 20000, splits: [] }, { type: "progress" }, { type: "progress", found: "1" }])("P4-032/F4-008: schemat odrzuca %j", (move) => {
  expect(game.moveSchema.safeParse(move).success).toBe(false);
});

test.each([A, C])("P4-032/F4-009: wygrywa także %s", (winner) => {
  let s = game.setup([A, B, C], createRng(1));
  for (const p of [A, B, C]) {
    s = send(s, p, result(p === winner ? 10000 : 20000));
  }
  expect(game.isOver(s)?.winner).toBe(winner);
  expect(game.waitingFor(s)).toEqual([]);
});

test("P4-032/F4-010: każdy typ ruchu bez mutacji zamrożonego wejścia i z JSON round-trip", () => {
  function freeze(value: unknown): void {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  }
  let s = game.setup([A, B], createRng(1));
  const moves: Move[] = [progress(3), result(20000)];
  for (const move of moves) {
    const before = structuredClone(s);
    freeze(s);
    const after = send(s, A, move);
    expect(s).toEqual(before);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
    s = after;
  }
});

test("P4-032/F4-045: różne międzyczasy przy tym samym czasie nie zmieniają rankingu", () => {
  let s = game.setup([A, B], createRng(1));
  s = send(s, A, result(20000, 0, even(20000)));
  s = send(s, B, result(20000, 0, [1600, ...even(20000).slice(1, 24), 0]));
  expect(s.results[A].splits).not.toEqual(s.results[B].splits);
  expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1 });
});
