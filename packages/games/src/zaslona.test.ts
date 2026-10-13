import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { deviation, MAX_HIDDEN, MAX_VISIBLE, MIN_HIDDEN, MIN_VISIBLE, type Move, ROUNDS, type State, TOTAL_HIDDEN, type View, zaslona as game } from "./zaslona.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie; 8 rund, w każdej kulka toczy się ze stałą prędkością, znika za zasłoną,
//   a gracz dotyka w chwili, gdy powinna dotrzeć do mety,
// - rundy losuje serwer: dwa niezależne czasy w pełnych ms, `visible` 800-2000 (kulkę widać) i `hidden` 1000-4000 (za zasłoną do mety),
//   te same dla wszystkich; suma `hidden` to zawsze 20 000 ms, żeby każda partia była równie trudna,
// - klient oddaje jeden wynik: 8 czasów od zniknięcia kulki do dotknięcia w ms (int, 0-8000),
// - serwer liczy odchyłkę każdej rundy (|dotknięcie − hidden|, ucięta do hidden) i sumuje,
// - mniejsza suma wyżej; zwycięzca tylko przy 2+ graczach i bez remisu; po limicie czasu najgorszy wynik (suma hidden).

const A = "ania";
const B = "bartek";
const C = "celina";

const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));
const result = (taps: number[]): Move => ({ type: "result", taps });
/** Wynik gracza, który w każdej rundzie dotyka `offset` ms po tym, jak kulka dotarła do mety. */
const exact = (s: State, offset = 0) => result(s.rounds.map((r) => r.hidden + offset));
const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);
const hidden = (s: State) => s.rounds.map((r) => r.hidden);

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
    expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["zaslona", 1, 6, 120]);
    expect(game.isOver(fresh())).toBeNull();
  });

  test("najdłuższa uczciwa partia mieści się w limicie", () => {
    // Runda: 1 s przerwy, kulka widoczna, najwyżej dwukrotność `hidden` do końca rundy, 1,5 s odsłony.
    expect(ROUNDS * (1000 + MAX_VISIBLE + 2 * MAX_HIDDEN + 1500)).toBeLessThanOrEqual(game.turnSeconds! * 1000);
  });
});

describe("setup", () => {
  const all = Array.from({ length: 200 }, (_, i) => fresh([A, B], i).rounds);

  test("8 rund, kulkę widać 800-2000 ms, za zasłoną jedzie 1000-4000 ms (pełne ms)", () => {
    expect([ROUNDS, MIN_VISIBLE, MAX_VISIBLE, MIN_HIDDEN, MAX_HIDDEN]).toEqual([8, 800, 2000, 1000, 4000]);
    for (const rounds of all) {
      expect(rounds).toHaveLength(ROUNDS);
      for (const r of rounds) {
        expect(Number.isInteger(r.visible) && Number.isInteger(r.hidden)).toBe(true);
        expect(r.visible).toBeGreaterThanOrEqual(MIN_VISIBLE);
        expect(r.visible).toBeLessThanOrEqual(MAX_VISIBLE);
        expect(r.hidden).toBeGreaterThanOrEqual(MIN_HIDDEN);
        expect(r.hidden).toBeLessThanOrEqual(MAX_HIDDEN);
      }
    }
  });

  test("suma czasów za zasłoną to zawsze 20 s: odchyłka rośnie z tym czasem, więc każda partia jest równie trudna", () => {
    expect(TOTAL_HIDDEN).toBe(20_000);
    for (const rounds of all) expect(sum(rounds.map((r) => r.hidden))).toBe(TOTAL_HIDDEN);
  });

  test("trafiają się oba końce obu zakresów", () => {
    const flat = all.flat();
    expect(Math.min(...flat.map((r) => r.visible))).toBeLessThan(MIN_VISIBLE + 50);
    expect(Math.max(...flat.map((r) => r.visible))).toBeGreaterThan(MAX_VISIBLE - 50);
    expect(Math.min(...flat.map((r) => r.hidden))).toBeLessThan(MIN_HIDDEN + 50);
    expect(Math.max(...flat.map((r) => r.hidden))).toBeGreaterThan(MAX_HIDDEN - 50);
  });

  test("oba czasy są niezależne: prędkość i szerokość zasłony zmieniają się co rundę", () => {
    const flat = all.flat();
    const half = (r: { visible: number; hidden: number }) => [r.visible > (MIN_VISIBLE + MAX_VISIBLE) / 2, r.hidden > (MIN_HIDDEN + MAX_HIDDEN) / 2].join();
    // Każde połączenie krótkiego i długiego czasu trafia się mniej więcej w co czwartej rundzie.
    for (const combo of ["false,false", "false,true", "true,false", "true,true"]) {
      const share = flat.filter((r) => half(r) === combo).length / flat.length;
      expect(share, combo).toBeGreaterThan(0.2);
      expect(share, combo).toBeLessThan(0.3);
    }
    // Udział zasłony w torze nie jest stały w obrębie partii.
    for (const rounds of all) expect(new Set(rounds.map((r) => Math.round((100 * r.hidden) / (r.visible + r.hidden)))).size).toBeGreaterThan(1);
  });

  test("wszyscy grają naraz, ten sam seed daje te same rundy, rewanż ma inne", () => {
    const s = fresh();
    expect(game.waitingFor(s)).toEqual([A, B]);
    expect(s.results).toEqual({});
    expect(fresh([A, B], 1).rounds).toEqual(s.rounds);
    expect(fresh([A, B], 2).rounds).not.toEqual(s.rounds);
  });

  test("rundy widzi każdy gracz i obserwator (partia toczy się na kliencie)", () => {
    const s = fresh();
    for (const viewer of [A, B, ""]) expect((game.playerView(s, viewer) as View).rounds).toEqual(s.rounds);
  });
});

describe("odchyłka rundy", () => {
  test("dotknięcie dokładnie na mecie to 0", () => expect(deviation(2500, 2500)).toBe(0));
  test("za wcześnie i za późno o tyle samo kosztuje tyle samo", () => {
    expect(deviation(2500, 2300)).toBe(200);
    expect(deviation(2500, 2700)).toBe(200);
  });
  test("dotknięcie od razu po zniknięciu to cały czas za zasłoną", () => expect(deviation(2500, 0)).toBe(2500));
  test("dotknięcie po dwukrotności czasu za zasłoną jest ucięte do niego", () => {
    expect(deviation(2500, 5000)).toBe(2500);
    expect(deviation(2500, 2 * MAX_HIDDEN)).toBe(2500);
  });
});

describe("wynik", () => {
  test("suma odchyłek z 8 rund", () => {
    const s = fresh();
    expect(send(s, A, exact(s)).results[A]).toBe(0);
    expect(send(s, A, exact(s, 30)).results[A]).toBe(ROUNDS * 30);
    expect(send(s, A, exact(s, -30)).results[A]).toBe(ROUNDS * 30);
  });

  test("czas, przez który kulkę widać, nie wchodzi do wyniku", () => {
    const s = fresh();
    const other: State = { ...s, rounds: s.rounds.map((r) => ({ ...r, visible: r.visible === MIN_VISIBLE ? MAX_VISIBLE : MIN_VISIBLE })) };
    expect(send(other, A, exact(s, 70)).results[A]).toBe(send(s, A, exact(s, 70)).results[A]);
  });

  test("czasy dotknięć zostają w stanie do tabeli rund", () => {
    const s = fresh();
    const move = exact(s, 40);
    expect(send(s, A, move).taps[A]).toEqual(move.taps);
  });
});

describe("walidacja", () => {
  const s = fresh();
  const taps = (first: number, n = ROUNDS) => Array.from({ length: n }, (_, i) => (i ? 2000 : first));
  test("obcy gracz", () => expect(accepts(s, C, exact(s))).toBe(false));
  test("drugi wynik", () => expect(accepts(send(s, A, exact(s)), A, exact(s))).toBe(false));
  test("po końcu gry", () => expect(accepts(send(send(s, A, exact(s)), B, exact(s, 5)), A, exact(s))).toBe(false));
  test.each([[ROUNDS - 1], [ROUNDS + 1], [1]])("lista %s czasów", (n) => expect(accepts(s, A, result(taps(2000, n)))).toBe(false));
  test.each([[-1], [2 * MAX_HIDDEN + 1], [1500.5]])("czas %s", (t) => expect(accepts(s, A, result(taps(t)))).toBe(false));
  test.each([[0], [2 * MAX_HIDDEN]])("czas %s przechodzi", (t) => expect(accepts(s, A, result(taps(t)))).toBe(true));
  test("pusta lista (limit czasu) przechodzi", () => expect(accepts(s, A, result([]))).toBe(true));
});

describe("schemat", () => {
  const s = fresh();
  const ok = Array(ROUNDS).fill(2000);
  test.each([
    ["czas tekstem", { type: "result", taps: ["2000", ...ok.slice(1)] }],
    ["brak listy", { type: "result" }],
    ["lista tekstem", { type: "result", taps: "2000" }],
    ["zły typ ruchu", { type: "progress", taps: ok }],
    ["NaN", { type: "result", taps: [Number.NaN, ...ok.slice(1)] }],
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
    expect(game.places!(s)).toEqual({ [A]: 3, [B]: 1, [C]: 2 });
  });

  test("remis: bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, exact(s, 40));
    s = send(s, B, exact(s, -40));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1 });
  });

  test("solo: ranking bez zwycięzcy", () => {
    const s = fresh([A]);
    expect(game.isOver(send(s, A, exact(s, 10)))).toEqual({ ranking: [A] });
  });

  test("czekamy na graczy bez wyniku", () => {
    const s = fresh([A, B, C]);
    const next = send(s, B, exact(s));
    expect(game.waitingFor(next)).toEqual([A, C]);
    expect(game.isOver(next)).toBeNull();
  });

  test("po limicie czasu najgorszy wynik: suma czasów za zasłoną", () => {
    const s = fresh();
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(send(s, A, move).results[A]).toBe(sum(hidden(s)));
    // Gorzej się nie da: dotykanie od razu po zniknięciu i czekanie do końca rundy dają tyle samo.
    expect(send(s, B, result(s.rounds.map(() => 0))).results[B]).toBe(sum(hidden(s)));
    expect(send(s, B, result(s.rounds.map(() => 2 * MAX_HIDDEN))).results[B]).toBe(sum(hidden(s)));
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
