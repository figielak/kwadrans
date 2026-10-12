import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { deviation, MAX_MS, MIN_MS, type Move, przytrzymaj as game, ROUNDS, type State, TOTAL_MS } from "./przytrzymaj.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie; 5 rund, w każdej pole świeci się przez czas celu, a gracz trzyma palec tak samo długo,
// - cele losuje serwer: 5 czasów w pełnych ms, każdy 1000-5000, razem zawsze 15 000, te same dla wszystkich,
// - klient oddaje jeden wynik: 5 czasów trzymania w ms (int, 0-10 000),
// - serwer liczy odchyłkę każdej rundy (|trzymanie − cel|, ucięta do celu) i sumuje,
// - mniejsza suma wyżej; zwycięzca tylko przy 2+ graczach i bez remisu; po limicie czasu najgorszy wynik (suma celów).

const A = "ania";
const B = "bartek";
const C = "celina";

const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));
const result = (holds: number[]): Move => ({ type: "result", holds });
/** Wynik gracza, który w każdej rundzie trzyma o `offset` ms dłużej niż cel. */
const exact = (s: State, offset = 0) => result(s.targets.map((t) => t + offset));
const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);

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
  test("1-6 graczy, limit 120 s, świeża gra trwa", () => {
    expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["przytrzymaj", 1, 6, 120]);
    expect(game.isOver(fresh())).toBeNull();
  });
});

describe("setup", () => {
  test("5 celów w pełnych ms, każdy 1000-5000, trafiają się oba końce zakresu", () => {
    const all = Array.from({ length: 200 }, (_, i) => fresh([A, B], i).targets);
    for (const targets of all) {
      expect(targets).toHaveLength(ROUNDS);
      for (const t of targets) {
        expect(Number.isInteger(t)).toBe(true);
        expect(t).toBeGreaterThanOrEqual(MIN_MS);
        expect(t).toBeLessThanOrEqual(MAX_MS);
      }
    }
    const flat = all.flat();
    expect(Math.min(...flat)).toBeLessThan(MIN_MS + 100);
    expect(Math.max(...flat)).toBeGreaterThan(MAX_MS - 100);
  });

  test("suma celów to zawsze 15 s: każda partia jest równie trudna", () => {
    expect(TOTAL_MS).toBe(15_000);
    for (let seed = 0; seed < 200; seed++) expect(sum(fresh([A, B], seed).targets)).toBe(TOTAL_MS);
  });

  test("wszyscy grają naraz, ten sam seed daje te same cele, rewanż ma inne", () => {
    const s = fresh();
    expect(game.waitingFor(s)).toEqual([A, B]);
    expect(fresh([A, B], 1).targets).toEqual(s.targets);
    expect(fresh([A, B], 2).targets).not.toEqual(s.targets);
  });
});

describe("odchyłka rundy", () => {
  test("idealne trzymanie to 0", () => expect(deviation(2500, 2500)).toBe(0));
  test("za krótko i za długo o tyle samo kosztuje tyle samo", () => {
    expect(deviation(2500, 2300)).toBe(200);
    expect(deviation(2500, 2700)).toBe(200);
  });
  test("puszczenie od razu to cały cel", () => expect(deviation(2500, 0)).toBe(2500));
  test("trzymanie ponad dwukrotność celu jest ucięte do celu", () => {
    expect(deviation(2500, 5000)).toBe(2500);
    expect(deviation(2500, 2 * MAX_MS)).toBe(2500);
  });
});

describe("wynik", () => {
  test("suma odchyłek z 5 rund", () => {
    const s = fresh();
    expect(send(s, A, exact(s)).results[A]).toBe(0);
    expect(send(s, A, exact(s, 30)).results[A]).toBe(ROUNDS * 30);
    expect(send(s, A, exact(s, -30)).results[A]).toBe(ROUNDS * 30);
  });

  test("czasy trzymania zostają w stanie do tabeli rund", () => {
    const s = fresh();
    const move = exact(s, 40);
    expect(send(s, A, move).holds[A]).toEqual(move.holds);
  });
});

describe("walidacja", () => {
  const s = fresh();
  const holds = (first: number, n = ROUNDS) => Array.from({ length: n }, (_, i) => (i ? 2000 : first));
  test("obcy gracz", () => expect(accepts(s, C, exact(s))).toBe(false));
  test("drugi wynik", () => expect(accepts(send(s, A, exact(s)), A, exact(s))).toBe(false));
  test("po końcu gry", () => expect(accepts(send(send(s, A, exact(s)), B, exact(s, 5)), A, exact(s))).toBe(false));
  test.each([[ROUNDS - 1], [ROUNDS + 1], [1]])("lista %s czasów", (n) => expect(accepts(s, A, result(holds(2000, n)))).toBe(false));
  test.each([[-1], [2 * MAX_MS + 1], [1500.5]])("czas %s", (t) => expect(accepts(s, A, result(holds(t)))).toBe(false));
  test.each([[0], [2 * MAX_MS]])("czas %s przechodzi", (t) => expect(accepts(s, A, result(holds(t)))).toBe(true));
});

describe("schemat", () => {
  const s = fresh();
  test.each([
    ["czas tekstem", { type: "result", holds: ["2000", 2000, 2000, 2000, 2000] }],
    ["brak listy", { type: "result" }],
    ["zły typ ruchu", { type: "progress", holds: [2000, 2000, 2000, 2000, 2000] }],
    ["NaN", { type: "result", holds: [Number.NaN, 2000, 2000, 2000, 2000] }],
  ])("%s", (_, move) => expect(accepts(s, A, move)).toBe(false));
});

describe("koniec", () => {
  test.each([[A], [B], [C]])("wygrywa %s z najmniejszą sumą", (best) => {
    let s = fresh([A, B, C]);
    const offsets: Record<string, number> = { [A]: 300, [B]: 200, [C]: 100, [best]: 10 };
    for (const p of [A, B, C]) s = send(s, p, exact(s, offsets[p]));
    expect(game.isOver(s)?.winner).toBe(best);
    expect(game.isOver(s)?.ranking?.[0]).toBe(best);
    expect(game.waitingFor(s)).toEqual([]);
  });

  test("ranking od najmniejszej sumy", () => {
    let s = fresh([A, B, C]);
    s = send(s, A, exact(s, 300));
    s = send(s, B, exact(s, 15));
    s = send(s, C, exact(s, -120));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
  });

  test("remis: bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, exact(s, 40));
    s = send(s, B, exact(s, -40));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("solo: ranking bez zwycięzcy", () => {
    const s = fresh([A]);
    expect(game.isOver(send(s, A, exact(s, 10)))).toEqual({ ranking: [A] });
  });

  test("czekamy na graczy bez wyniku", () => {
    const s = fresh([A, B, C]);
    expect(game.waitingFor(send(s, B, exact(s)))).toEqual([A, C]);
  });

  test("po limicie czasu najgorszy wynik: suma celów", () => {
    const s = fresh();
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(send(s, A, move).results[A]).toBe(sum(s.targets));
    // Gorzej się nie da: nawet puszczanie od razu w każdej rundzie daje tyle samo.
    expect(send(s, B, result(s.targets.map(() => 0))).results[B]).toBe(sum(s.targets));
  });
});

describe("stan", () => {
  test("applyMove nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    const next = send(s, A, exact(s, 20));
    expect(JSON.stringify(s)).toBe(before);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
});
