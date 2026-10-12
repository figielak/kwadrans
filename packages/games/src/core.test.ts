import { describe, expect, test } from "vitest";
import { byHitsThenAverage, createRng, nickKey, ranked, rankPlaces, rankResults, ROOM_CODE_ALPHABET, roomCode, shuffle, standing, withSum } from "./core.ts";

test("ten sam seed daje ten sam ciąg", () => {
  const a = createRng(42);
  const b = createRng(42);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});

test("rng zwraca liczby z [0, 1)", () => {
  const rng = createRng(1);
  for (let i = 0; i < 1000; i++) {
    const x = rng();
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(1);
  }
});

test("kod pokoju ma 4 znaki z alfabetu bez mylących znaków", () => {
  const rng = createRng(7);
  for (let i = 0; i < 200; i++) {
    const code = roomCode(rng);
    expect(code).toMatch(new RegExp(`^[${ROOM_CODE_ALPHABET}]{4}$`));
  }
  expect(ROOM_CODE_ALPHABET).not.toMatch(/[O0I1L]/);
});

test("withSum: liczby całkowite z zakresu o zadanej sumie, te same dla tego samego seedu", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const list = withSum(createRng(seed), 10, 1, 30, 155);
    expect(list).toHaveLength(10);
    expect(list.every((n) => Number.isInteger(n) && n >= 1 && n <= 30)).toBe(true);
    expect(list.reduce((a, b) => a + b, 0)).toBe(155);
    expect(withSum(createRng(seed), 10, 1, 30, 155)).toEqual(list);
  }
  const all = Array.from({ length: 200 }, (_, seed) => withSum(createRng(seed), 10, 1, 30, 155)).flat();
  expect([Math.min(...all), Math.max(...all)]).toEqual([1, 30]);
});

test("shuffle: permutacja, oryginał bez zmian", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  const shuffled = shuffle(items, createRng(3));
  expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
  expect(shuffle([], createRng(3))).toEqual([]);
});

describe("rankResults", () => {
  const desc = (a: number, b: number) => b - a;

  test("null, dopóki ktoś nie oddał wyniku (także bez żadnego wyniku)", () => {
    expect(rankResults(["a", "b"], {}, desc)).toBeNull();
    expect(rankResults(["a", "b"], { a: 1 }, desc)).toBeNull();
  });

  test("wynik 0 to też oddany wynik", () => {
    expect(rankResults(["a", "b"], { a: 0, b: 1 }, desc)).toEqual({ winner: "b", ranking: ["b", "a"] });
  });

  test("solo: ranking bez zwycięzcy", () => {
    expect(rankResults(["a"], { a: 5 }, desc)).toEqual({ ranking: ["a"] });
  });

  test("remis na górze: bez zwycięzcy, kolejność miejsc, reszta posortowana", () => {
    expect(rankResults(["a", "b", "c"], { a: 1, b: 5, c: 5 }, desc)).toEqual({ ranking: ["b", "c", "a"] });
    expect(rankResults(["a", "b", "c"], { a: 5, b: 5, c: 5 }, desc)).toEqual({ ranking: ["a", "b", "c"] });
  });

  test("remis poniżej pierwszego miejsca nie odbiera wygranej", () => {
    expect(rankResults(["a", "b", "c"], { a: 2, b: 2, c: 9 }, desc)).toEqual({ winner: "c", ranking: ["c", "a", "b"] });
  });

  test("wynik gracza spoza listy jest ignorowany", () => {
    expect(rankResults(["a", "b"], { a: 1, b: 2, x: 99 }, desc)).toEqual({ winner: "b", ranking: ["b", "a"] });
  });
});

describe("byHitsThenAverage", () => {
  const r = (...times: number[]) => ({ times });

  test("więcej trafień wyżej, potem niższa średnia", () => {
    expect(byHitsThenAverage(r(900, 900), r(100))).toBeLessThan(0);
    expect(byHitsThenAverage(r(200), r(100))).toBeGreaterThan(0);
    expect(byHitsThenAverage(r(100, 300), r(200, 200))).toBe(0);
  });

  test("dwa puste wyniki to remis, nie NaN", () => {
    expect(byHitsThenAverage(r(), r())).toBe(0);
    expect(rankResults(["a", "b"], { a: r(), b: r() }, byHitsThenAverage)).toEqual({ ranking: ["a", "b"] });
  });

  test("pusty wynik przegrywa z każdym trafieniem", () => {
    expect(byHitsThenAverage(r(), r(5000))).toBeGreaterThan(0);
  });
});

describe("rankPlaces: miejsca z remisami (potrzebne w turnieju)", () => {
  const desc = (a: number, b: number) => b - a;

  test("miejsce to 1 + liczba graczy ze ściśle lepszym wynikiem", () => {
    expect(rankPlaces(["a", "b", "c"], { a: 1, b: 9, c: 5 }, desc)).toEqual({ a: 3, b: 1, c: 2 });
  });

  test("remis daje to samo miejsce, następne miejsce przeskakuje", () => {
    expect(rankPlaces(["a", "b", "c", "d"], { a: 5, b: 5, c: 9, d: 1 }, desc)).toEqual({ a: 2, b: 2, c: 1, d: 4 });
    expect(rankPlaces(["a", "b", "c"], { a: 5, b: 5, c: 5 }, desc)).toEqual({ a: 1, b: 1, c: 1 });
  });

  test("solo: pierwsze miejsce", () => {
    expect(rankPlaces(["a"], { a: 0 }, desc)).toEqual({ a: 1 });
  });

  test("ranked: isOver i places z jednego komparatora", () => {
    const game = ranked((s: { players: string[]; results: Record<string, number> }) => s.results, desc);
    expect(game.isOver({ players: ["a", "b"], results: { a: 1 } })).toBeNull();
    const over = { players: ["a", "b", "c"], results: { a: 2, b: 2, c: 9 } };
    expect(game.isOver(over)).toEqual({ winner: "c", ranking: ["c", "a", "b"] });
    expect(game.places(over)).toEqual({ a: 2, b: 2, c: 1 });
  });
});

describe("rekordy mini-gier", () => {
  test("nickKey: bez wielkości liter, polskich znaków i nadmiarowych spacji", () => {
    expect(nickKey("Łukasz")).toBe("lukasz");
    expect(nickKey("ŻÓŁW")).toBe(nickKey("zolw"));
    expect(nickKey("  Ala   B ")).toBe("ala b");
    expect(nickKey("Ala")).not.toBe(nickKey("Ola"));
  });

  test("ranked z rekordem: wynik gracza jako liczba, z tego samego źródła co miejsca", () => {
    const game = ranked((s: { players: string[]; results: Record<string, { hits: number }> }) => s.results, (a, b) => b.hits - a.hits, {
      lower: false,
      score: (r) => r.hits,
    });
    expect(game.record.lower).toBe(false);
    expect(game.record.score({ players: ["a", "b"], results: { a: { hits: 4 }, b: { hits: 7 } } }, "b")).toBe(7);
    expect("record" in ranked((s: { players: string[]; results: Record<string, number> }) => s.results, (a, b) => a - b)).toBe(false);
  });

  test("ranked z rekordem i drugim kryterium: remis w głównym wyniku rozstrzyga `tie`", () => {
    const game = ranked((s: { players: string[]; results: Record<string, { hits: number; avg: number }> }) => s.results, (a, b) => b.hits - a.hits || a.avg - b.avg, {
      lower: false,
      score: (r) => r.hits,
      tie: { lower: true, score: (r) => r.avg },
    });
    expect(game.record.tie!.lower).toBe(true);
    expect(game.record.tie!.score({ players: ["a"], results: { a: { hits: 4, avg: 250 } } }, "a")).toBe(250);
  });

  // Wiersze przychodzą z serwera posortowane od najlepszego rekordu.
  const row = (nick: string, best: number, played: number, tie: number | null = null) => ({ nick, best, tie, played });
  const lower = [row("Ola", 20, 3), row("Ala", 35, 1), row("Ela", 35, 2), row("Ula", 90, 5)];
  const LOWER = { lower: true };

  test("standing: miejsce, liczba graczy, sąsiad wyżej i niżej z różnicą", () => {
    expect(standing(lower, "Ula", LOWER)).toEqual({ place: 4, of: 4, best: 90, tie: null, played: 5, ahead: { nick: "Ela", gap: 55, onTie: false } });
    expect(standing(lower, "Ola", LOWER)).toEqual({ place: 1, of: 4, best: 20, tie: null, played: 3, behind: { nick: "Ala", gap: 15, onTie: false } });
  });

  test("standing: remis daje to samo miejsce, a sąsiad to ktoś ze ściśle innym wynikiem", () => {
    expect(standing(lower, "Ala", LOWER)).toMatchObject({ place: 2, ahead: { nick: "Ola", gap: 15 }, behind: { nick: "Ula", gap: 55 } });
    expect(standing(lower, "Ela", LOWER)).toMatchObject({ place: 2, ahead: { nick: "Ola", gap: 15 } });
  });

  test("standing: więcej znaczy lepiej", () => {
    const higher = [row("Ola", 12, 1), row("Ala", 9, 1)];
    expect(standing(higher, "Ala", { lower: false })).toMatchObject({ place: 2, of: 2, best: 9, ahead: { nick: "Ola", gap: 3, onTie: false } });
  });

  test("standing: przy równym głównym wyniku miejsce i różnicę daje drugie kryterium", () => {
    // Trafienia (więcej lepiej), potem średnia reakcji (mniej lepiej).
    const hits = [row("Ola", 13, 1, 240), row("Ala", 13, 1, 256), row("Ela", 13, 1, 256), row("Ula", 12, 1, 200)];
    const order = { lower: false, tie: { lower: true } };
    expect(standing(hits, "Ola", order)).toMatchObject({ place: 1, behind: { nick: "Ala", gap: 16, onTie: true } });
    expect(standing(hits, "Ala", order)).toMatchObject({ place: 2, tie: 256, ahead: { nick: "Ola", gap: 16, onTie: true }, behind: { nick: "Ula", gap: 1, onTie: false } });
    expect(standing(hits, "Ela", order)?.place).toBe(2);
    expect(standing(hits, "Ula", order)).toMatchObject({ place: 4, ahead: { nick: "Ela", gap: 1, onTie: false } });
  });

  test("standing: gracza szuka po kluczu nicku; bez rekordu null", () => {
    expect(standing(lower, "ola", LOWER)?.place).toBe(1);
    expect(standing(lower, "Iga", LOWER)).toBeNull();
    expect(standing([], "Ola", LOWER)).toBeNull();
  });
});
