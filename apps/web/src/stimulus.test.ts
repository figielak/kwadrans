import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { markFrame, reaction } from "./stimulus.ts";

// P4-061 (D4-049 A): bodziec liczony od pierwszej klatki z nim, dotyk od znacznika zdarzenia.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

afterEach(() => vi.unstubAllGlobals());

test("markFrame: najpierw chwila zmiany stanu, potem znacznik pierwszej klatki", () => {
  let frame: FrameRequestCallback = () => {};
  vi.stubGlobal("performance", { now: () => 1000 });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => ((frame = cb), 1));
  const seen: number[] = [];
  markFrame((t) => seen.push(t));
  expect(seen).toEqual([1000]);
  frame(1009);
  expect(seen).toEqual([1000, 1009]);
});

test("reaction: od klatki do zdarzenia, zaokrąglona; dotyk przed klatką to czas ujemny", () => {
  expect(reaction(1009, { timeStamp: 1264.6 })).toBe(256);
  expect(reaction(1009, { timeStamp: 1004 })).toBe(-5);
});

test("Refleks i Stój! liczą reakcję nową metodą, Stoper i Wieża bez zmian", () => {
  for (const [file, ref] of [["games/Refleks.tsx", "r.goAt"], ["games/Stoj.tsx", "r.shownAt"]]) {
    const code = read(file);
    expect(code).toContain(`reaction(${ref}, e)`);
    expect(code).toContain("markFrame(");
    expect(code).not.toContain(`Math.round(performance.now() - ${ref})`);
  }
  expect(read("games/Stoper.tsx")).toContain("Math.min(performance.now() - start.current, giveUp)");
  expect(read("games/Wieza.tsx")).toContain("Math.round(performance.now() - started.current)");
});

test("dokumenty opisują pomiar i jego granice", () => {
  const rules = read("../../../ZASADY.md");
  expect(rules).toContain("pierwszej klatki z bodźcem");
  expect(rules).toContain("nie usuwa opóźnienia ekranu ani dotyku");
  const games = read("../../../ZASADY-GIER.md");
  expect(games.match(/od pierwszej klatki z bodźcem do znacznika dotyku/g)).toHaveLength(2);
});
