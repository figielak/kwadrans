import { describe, expect, test } from "vitest";
import { createRng, soloState } from "./core.ts";
import { BLANKS, type Move, PENALTY_MS, type State, sudoku as game, type View } from "./sudoku.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - wszyscy dostają tę samą planszę 4×4 (bloki 2×2, cyfry 1-4): 6 pól danych, 10 do wpisania,
// - plansza ma dokładnie jedno rozwiązanie i jest nim `solution` ze stanu; nic nie jest ukryte,
// - klient oddaje czas (ms) i liczbę pomyłek; każda zła cyfra to 5 s kary,
// - czas krótszy niż 10 × 300 ms jest nierealny, dłuższy niż limit tury też,
// - ranking po czasie z karami rosnąco, bez drugiego kryterium; po limicie czasu ostatnie miejsce,
// - mini-gra ma zasady narzucone z góry: bez trybów,
// - po każdej dobrej cyfrze klient zgłasza postęp (1-9), który widzą rywale; postęp nie kończy gry i nie odnawia limitu.

const A = "ania";
const B = "bartek";
const C = "celina";
const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);

const result = (ms: number, mistakes = 0): Move => ({ type: "result", ms, mistakes });
const progress = (filled: number): Move => ({ type: "progress", filled });

function send(s: State, player: string, move: Move, source: "client" | "timeout" = "client"): State {
  expect(game.validateMove(s, player, move, { source }), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

const view = (s: State, player = A) => game.playerView(s, player) as View;

// Solver niezależny od kodu gry: wszystkie poprawne siatki 4×4 wyliczone raz, rozwiązania planszy to te, które zgadzają się z danymi.
const LINE = [0, 1, 2, 3];
const UNITS = [
  ...LINE.map((r) => LINE.map((c) => r * 4 + c)),
  ...LINE.map((c) => LINE.map((r) => r * 4 + c)),
  ...LINE.map((b) => [0, 1, 4, 5].map((i) => i + (b % 2) * 2 + Math.floor(b / 2) * 8)),
];
function fill(grid: number[], i = 0, out: number[][] = []): number[][] {
  if (i === 16) return out.push([...grid]), out;
  for (let v = 1; v <= 4; v++) {
    if (!UNITS.every((u) => !u.includes(i) || u.every((j) => grid[j] !== v))) continue;
    grid[i] = v;
    fill(grid, i + 1, out);
    grid[i] = 0;
  }
  return out;
}
const ALL = fill(Array<number>(16).fill(0));
const solutions = (puzzle: number[]) => ALL.filter((g) => puzzle.every((v, i) => v === 0 || v === g[i]));

test("solver z testu zna wszystkie 288 siatek 4×4", () => expect(ALL).toHaveLength(288));

describe("definicja", () => {
  test("1-6 graczy, limit 120 s ze stałym kluczem", () => {
    expect(game.id).toBe("sudoku");
    expect(game.minPlayers).toBe(1);
    expect(game.maxPlayers).toBe(6);
    expect(game.turnSeconds).toBe(120);
    expect(game.turn!(game.setup([A, B], createRng(1)))).toEqual({ key: "run", seconds: 120 });
  });

  test("gra nie ma trybów", () => {
    expect(game.modes).toBeUndefined();
    expect(game.playerView(game.setup([A, B], createRng(1), "duza"), A)).not.toHaveProperty("mode");
    expect(game.setup([A, B], createRng(1), "duza")).toEqual(game.setup([A, B], createRng(1)));
  });

  test("świeża gra nie jest skończona, czekamy na wszystkich", () => {
    const s = game.setup([A, B], createRng(1));
    expect(game.isOver(s)).toBeNull();
    expect(game.waitingFor(s)).toEqual([A, B]);
    expect(s.results).toEqual({});
    expect(s.progress).toEqual({});
  });
});

describe("plansza", () => {
  test("ta sama dla wszystkich, nic nie jest ukryte (także przed obserwatorem)", () => {
    const s = game.setup([A, B], createRng(1));
    expect(view(s, A).puzzle).toEqual(view(s, B).puzzle);
    expect(view(s, "").puzzle).toEqual(view(s, A).puzzle);
    expect(view(s, "").solution).toEqual(s.solution);
  });

  test("ten sam seed daje tę samą planszę", () => {
    expect(game.setup([A, B], createRng(7))).toEqual(game.setup([A, B], createRng(7)));
  });

  test("różne seedy dają różne plansze (rewanż to inne wyzwanie)", () => {
    const puzzles = new Set(SEEDS.map((seed) => game.setup([A], createRng(seed)).puzzle.join("")));
    expect(puzzles.size).toBeGreaterThan(SEEDS.length / 2);
    const grids = new Set(SEEDS.map((seed) => game.setup([A], createRng(seed)).solution.join("")));
    expect(grids.size).toBeGreaterThan(SEEDS.length / 2);
  });

  test.each(SEEDS)("seed %i: rozwiązanie ma każdą cyfrę raz w każdym wierszu, kolumnie i bloku", (seed) => {
    const { solution } = game.setup([A], createRng(seed));
    expect(solution).toHaveLength(16);
    for (const unit of UNITS) expect(unit.map((i) => solution[i]).sort()).toEqual([1, 2, 3, 4]);
  });

  test.each(SEEDS)("seed %i: dokładnie 6 pól danych, zgodnych z rozwiązaniem, 10 do wpisania", (seed) => {
    const { puzzle, solution } = game.setup([A], createRng(seed));
    expect(puzzle).toHaveLength(16);
    expect(BLANKS).toBe(10);
    expect(puzzle.filter((v) => v === 0)).toHaveLength(BLANKS);
    puzzle.forEach((v, i) => expect([0, solution[i]], `pole ${i}`).toContain(v));
  });

  test.each(SEEDS)("seed %i: dokładnie jedno rozwiązanie", (seed) => {
    const { puzzle, solution } = game.setup([A], createRng(seed));
    expect(solutions(puzzle)).toEqual([solution]);
  });
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  const max = game.turnSeconds! * 1000;

  test.each([
    ["za szybko", result(2999)],
    ["po limicie tury", result(max + 1)],
    ["ujemne pomyłki", result(20_000, -1)],
    ["ułamek pomyłki", result(20_000, 0.5)],
  ])("odrzucony: %s", (_, move) => expect(game.validateMove(s, A, move)).toBe(false));

  test("granice czasu: najkrótszy (10 × 300 ms) i najdłuższy dozwolony", () => {
    expect(game.validateMove(s, A, result(3000))).toBe(true);
    expect(game.validateMove(s, A, result(max))).toBe(true);
  });

  test("obcy gracz", () => expect(game.validateMove(s, C, result(20_000))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result(20_000)), A, result(19_000))).toBe(false));

  test("po końcu gry nikt nic nie wyśle", () => {
    const over = send(send(s, A, result(20_000)), B, result(21_000));
    for (const player of [A, B, C]) {
      expect(game.validateMove(over, player, result(20_000))).toBe(false);
      expect(game.validateMove(over, player, progress(3))).toBe(false);
    }
  });
});

describe("schemat", () => {
  test.each([
    ["wynik", result(20_000, 1)],
    ["postęp", progress(4)],
  ])("przechodzi: %s", (_, move) => expect(game.moveSchema.safeParse(move).success).toBe(true));

  test.each([
    ["nieznany typ", { type: "fill", cell: 3, digit: 2 }],
    ["brak typu", { ms: 20_000, mistakes: 0 }],
    ["brak pomyłek", { type: "result", ms: 20_000 }],
    ["czas jako tekst", { type: "result", ms: "20000", mistakes: 0 }],
    ["pomyłki jako tekst", { type: "result", ms: 20_000, mistakes: "0" }],
    ["postęp bez liczby", { type: "progress" }],
    ["postęp jako tekst", { type: "progress", filled: "4" }],
    ["nie obiekt", "result"],
    ["null", null],
  ])("odrzuca: %s", (_, move) => expect(game.moveSchema.safeParse(move).success).toBe(false));
});

describe("koniec", () => {
  test("zła cyfra to 5 s kary: szybszy z pomyłką przegrywa", () => {
    expect(PENALTY_MS).toBe(5000);
    let s = game.setup([A, B, C], createRng(1));
    s = send(s, A, result(20_000, 1)); // 25 s
    s = send(s, B, result(24_000)); // 24 s
    expect(game.isOver(s)).toBeNull();
    expect(game.waitingFor(s)).toEqual([C]);
    s = send(s, C, result(17_000, 2)); // 27 s
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A, C] });
    expect(game.waitingFor(s)).toEqual([]);
  });

  test.each([A, B, C])("wygrać może każdy gracz: %s", (best) => {
    let s = game.setup([A, B, C], createRng(1));
    for (const p of [A, B, C]) s = send(s, p, result(p === best ? 15_000 : 30_000 + s.players.indexOf(p)));
    expect(game.isOver(s)?.winner).toBe(best);
    expect(game.isOver(s)?.ranking?.[0]).toBe(best);
  });

  test("wynik trafia do widoku wszystkich", () => {
    const s = send(game.setup([A, B], createRng(1)), A, result(20_000, 1));
    expect(view(s, B).results).toEqual({ [A]: { ms: 20_000, mistakes: 1, completed: true } });
    expect(view(s, "").results).toEqual({ [A]: { ms: 20_000, mistakes: 1, completed: true } });
  });

  test("kara wyrównuje czas: remis bez zwycięzcy (nie ma drugiego kryterium)", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(20_000, 1));
    s = send(s, B, result(25_000));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1 });
    expect(game.record!.tie).toBeUndefined();
  });

  test("gra solo kończy się rankingiem bez zwycięzcy", () => {
    const s = send(game.setup([A], createRng(1)), A, result(20_000));
    expect(game.isOver(s)).toEqual({ ranking: [A] });
    expect(game.waitingFor(s)).toEqual([]);
  });

  test("rekord to czas z karą, mniej lepiej", () => {
    const s = send(game.setup([A], createRng(1)), A, result(20_000, 2));
    expect(game.record!.lower).toBe(true);
    expect(game.record!.score(s, A)).toBe(30_000);
  });
});

describe("limit czasu", () => {
  const s = game.setup([A, B], createRng(1));

  test("oznacza nieukończenie przy najdłuższym czasie bez pomyłek", () => {
    expect(game.timeoutMove!(s, A, createRng(1))).toEqual({ type: "result", ms: 120_000, mistakes: 0, completed: false });
  });

  test("daje ostatnie miejsce", () => {
    let after = send(s, A, game.timeoutMove!(s, A, createRng(1)), "timeout");
    after = send(after, B, result(game.turnSeconds! * 1000 - 1000));
    expect(game.isOver(after)).toEqual({ winner: B, ranking: [B, A] });
  });
});

describe("postęp", () => {
  const s = game.setup([A, B], createRng(1));

  test("na starcie pusty, po zgłoszeniu widzą go wszyscy", () => {
    expect(view(s, B).progress).toEqual({});
    const after = send(s, A, progress(4));
    expect(view(after, B).progress).toEqual({ [A]: 4 });
    expect(view(after, "").progress).toEqual({ [A]: 4 });
  });

  test("nie kończy gry i nie zmienia, na kogo czekamy", () => {
    const after = send(s, A, progress(9));
    expect(game.isOver(after)).toBeNull();
    expect(game.waitingFor(after)).toEqual([A, B]);
    expect(game.validateMove(after, A, result(20_000))).toBe(true);
  });

  test("może spaść (gracz odświeżył stronę i zaczyna od nowa)", () => {
    expect(send(send(s, A, progress(7)), A, progress(1)).progress[A]).toBe(1);
  });

  test("granice: pierwsza i przedostatnia cyfra przechodzą", () => {
    expect(game.validateMove(s, A, progress(1))).toBe(true);
    expect(game.validateMove(s, A, progress(BLANKS - 1))).toBe(true);
  });

  test.each([
    ["zero", progress(0)],
    ["ostatnia cyfra (to już wynik)", progress(BLANKS)],
    ["ułamek", progress(1.5)],
  ])("odrzucony: %s", (_, move) => expect(game.validateMove(s, A, move)).toBe(false));
  test("obcy gracz", () => expect(game.validateMove(s, C, progress(3))).toBe(false));
  test("po oddaniu wyniku", () => expect(game.validateMove(send(s, A, result(20_000)), A, progress(3))).toBe(false));

  test("limit tury ma stały klucz, więc postęp go nie odnawia", () => {
    expect(game.turn!(send(s, A, progress(5)))).toEqual(game.turn!(s));
    expect(game.turn!(send(s, A, result(20_000)))).toEqual(game.turn!(s));
  });
});

describe("stan", () => {
  test("applyMove nie zmienia poprzedniego stanu", () => {
    const s = game.setup([A, B], createRng(1));
    const before = JSON.stringify(s);
    send(s, A, progress(3));
    send(s, A, result(20_000, 1));
    expect(JSON.stringify(s)).toBe(before);
  });

  test("stan przeżywa zapis do JSON", () => {
    const s = send(send(game.setup([A, B], createRng(1)), A, progress(3)), B, result(20_000, 1));
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});

// P4-002: ukończenie przed timeoutem, wspólny porządek miejsc i rekordów, zachowanie starego detail.
describe("ukończenie i timeout", () => {
  test("ukończona partia z karami ponad limit wygrywa z timeoutem", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, game.timeoutMove!(s, A, createRng(1)), "timeout");
    s = send(s, B, result(60_000, 13));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
    expect(game.places!(s)).toEqual({ [A]: 2, [B]: 1 });
    expect(game.record!.score(s, B)).toBe(125_000);
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
