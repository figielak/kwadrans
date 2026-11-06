import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createLiveStore, liveActive, liveDots, throttleLive } from "./live.ts";

const score = { live: { kind: "score" as const } };
const room = (seats: string[], waitingFor = seats) => ({ seats, game: { waitingFor } });
const noProgress = () => null;

describe("liveDots: gry na punkty", () => {
  test("brak wartości: 0 punktów", () => {
    const dots = liveDots(score, room(["a", "b", "c"]), {}, noProgress);
    expect(dots.map((d) => d.score)).toEqual([0, 0, 0]);
  });

  test("w trakcie partii same punkty, bez miejsca w rankingu", () => {
    const dots = liveDots(score, room(["a", "b", "c"]), { a: 5, b: 2 }, noProgress);
    expect(dots).toEqual([
      { id: "a", score: 5, done: false },
      { id: "b", score: 2, done: false },
      { id: "c", score: 0, done: false },
    ]);
  });

  test("rywal skończył: stan done z ostatnią wartością", () => {
    const [a, b] = liveDots(score, room(["a", "b"], ["a"]), { a: 1, b: 7 }, noProgress);
    expect(a).toMatchObject({ done: false, score: 1 });
    expect(b).toMatchObject({ done: true, score: 7 });
  });

  test("obserwator: te same kropki, bo wynik nie zależy od patrzącego", () => {
    expect(liveDots(score, room(["a", "b"]), { a: 2 }, noProgress)).toEqual(liveDots(score, room(["a", "b"]), { a: 2 }, noProgress));
  });

  test("pozostałe gry bez punktów i miejsca, sam postęp z progressOf", () => {
    const [a, b] = liveDots({ live: { kind: "round", total: 10 } }, room(["a", "b"], ["a"]), { a: 3 }, () => ({ done: 2, total: 8 }));
    expect(a).toEqual({ id: "a", fraction: 0.25, done: false });
    expect(b).toEqual({ id: "b", fraction: 1, done: true });
  });
});

describe("createLiveStore: magazyn wartości poza Reactem", () => {
  test("reconnect: start od game.live", () => {
    const s = createLiveStore();
    s.sync({ a: 3, b: 1 }, false);
    expect(s.get()).toEqual({ a: 3, b: 1 });
  });

  test("rewanż: puste wartości, stare wiadomości nie wracają", () => {
    const s = createLiveStore();
    s.sync({}, false);
    s.set("a", 9);
    s.report("me", 4);
    s.sync({}, true);
    expect(s.get()).toEqual({});
    s.set("a", 9);
    s.report("me", 4);
    expect(s.get()).toEqual({});
    s.sync({}, false);
    expect(s.get()).toEqual({});
  });

  test("własna wartość nie cofa się przez widok serwera sprzed wysyłki", () => {
    const s = createLiveStore();
    s.sync({}, false);
    s.report("me", 5);
    s.sync({ me: 4, a: 2 }, false);
    expect(s.get()).toEqual({ me: 5, a: 2 });
  });

  test("subskrybent dostaje zmianę, a brak zmiany zostawia ten sam obiekt", () => {
    const s = createLiveStore();
    s.sync({}, false);
    const listener = vi.fn();
    const off = s.subscribe(listener);
    s.set("a", 1);
    expect(listener).toHaveBeenCalledTimes(1);
    const before = s.get();
    s.set("a", 1);
    s.sync({ a: 1 }, false);
    expect(s.get()).toBe(before);
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    s.set("a", 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("liveActive: kto wysyła", () => {
  test("wysyła tylko grający w partii z 2+ graczami i w grze z live", () => {
    expect(liveActive(score, ["a", "b"], "a")).toBe(true);
    expect(liveActive(score, ["a", "b"], "obserwator")).toBe(false);
    expect(liveActive(score, ["a"], "a")).toBe(false);
    expect(liveActive({}, ["a", "b"], "a")).toBe(false);
  });
});

describe("throttleLive: najwyżej 2/s, najnowsza wartość wygrywa", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  test("wiele wywołań w 500 ms: jedna wysyłka i jedna z najnowszą wartością na końcu", () => {
    const send = vi.fn();
    const t = throttleLive(send);
    t.push(1);
    t.push(2);
    t.push(3);
    vi.advanceTimersByTime(100);
    t.push(4);
    expect(send.mock.calls).toEqual([[1]]);
    vi.advanceTimersByTime(400);
    expect(send.mock.calls).toEqual([[1], [4]]);
    vi.advanceTimersByTime(2000);
    expect(send).toHaveBeenCalledTimes(2);
  });

  test("ciągłe wywołania nie przekraczają 2 wysyłek na sekundę", () => {
    const send = vi.fn();
    const t = throttleLive(send);
    for (let i = 1; i <= 100; i++) {
      t.push(i);
      vi.advanceTimersByTime(20);
    }
    expect(send.mock.calls.length).toBeLessThanOrEqual(5);
    vi.advanceTimersByTime(500);
    expect(send).toHaveBeenLastCalledWith(100);
  });

  test("po przerwie wysyła od razu; cancel kasuje oczekującą", () => {
    const send = vi.fn();
    const t = throttleLive(send);
    t.push(1);
    vi.advanceTimersByTime(1000);
    t.push(2);
    expect(send).toHaveBeenLastCalledWith(2);
    t.push(3);
    t.cancel();
    vi.advanceTimersByTime(1000);
    expect(send).toHaveBeenCalledTimes(2);
  });
});

describe("liveDots: rundy i przeżycie", () => {
  const round = { live: { kind: "round" as const, total: 4 } };
  const survival = { live: { kind: "survival" as const } };

  test("round: ułamek z total i wartości na żywo, bez punktów i miejsc", () => {
    const [a, b] = liveDots(round, room(["a", "b"]), { a: 1 }, noProgress);
    expect(a).toEqual({ id: "a", fraction: 0.25, done: false });
    expect(b).toEqual({ id: "b", fraction: 0, done: false });
  });

  test("round: ułamek nie przekracza 1, a skończony ma komplet", () => {
    const [a, b] = liveDots(round, room(["a", "b"], ["a"]), { a: 9, b: 2 }, noProgress);
    expect(a.fraction).toBe(1);
    expect(b).toMatchObject({ fraction: 1, done: true });
  });

  test("survival: numer rundy i odpada po wyniku", () => {
    const [a, b, c] = liveDots(survival, room(["a", "b", "c"], ["a", "c"]), { a: 3, b: 5 }, noProgress);
    expect(a).toEqual({ id: "a", round: 3, out: false, done: false });
    expect(b).toEqual({ id: "b", round: 5, out: true, done: true });
    expect(c).toEqual({ id: "c", round: 0, out: false, done: false });
  });
});

describe("źródła: kto zgłasza live", () => {
  const code = (name: string) => readFileSync(new URL(`./games/${name}.tsx`, import.meta.url), "utf8");

  test.each(["WPamieci", "Sledzenie", "Kubki", "Srodek", "Mapa", "Tort", "Nozyczki", "Kolor", "Kolo", "Zakupy"])("%s woła useLive", (name) => {
    expect(code(name)).toMatch(/useLive\(/);
  });

  test.each(["Refleks", "Stoj", "Stoper", "Przytrzymaj", "Zaslona", "Rytm"])("%s (cisza pomiaru) nie importuje live.ts", (name) => {
    expect(code(name)).not.toMatch(/live\.ts|useLive/);
  });

  test.each(["Sekwencja:Simon", "Wieża:Wieza", "Kropki:Kropki", "Kąt:Kat", "Rok:Rok", "Schulte:Schulte", "Sudoku:Sudoku", "Balon:Balon"])("%s zostaje przy progress", (pair) => {
    expect(code(pair.split(":")[1])).not.toMatch(/useLive/);
  });
});
