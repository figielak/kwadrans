import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { type ProbeRow, summarize } from "./clock.ts";

// U14 (P4-061): pomiar obu zegarów obok siebie; wynik nadal liczy obecna metoda, dopóki U14 nie rozstrzygnie zmiany.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");
const row = (r: Partial<ProbeRow>): ProbeRow => ({ game: "refleks", stim: 1000, raf: 1008, handler: 1300, event: 1295, hidden: false, ...r });

test("summarize: przesunięcie bodźca, opóźnienie obsługi i różnica reakcji", () => {
  const s = summarize([row({}), row({ raf: 1012, handler: 1404, event: 1400 })], [16.7, 16.6, 16.8]);
  expect(s.hz).toBe(60);
  expect(s.refleks.n).toBe(2);
  expect(s.refleks.shift).toEqual({ min: 8, median: 10, max: 12 });
  expect(s.refleks.lag).toEqual({ min: 4, median: 4.5, max: 5 });
  // stara 300 i 404, nowa 287 i 388: różnica 13 i 16
  expect(s.refleks.diff).toEqual({ min: 13, median: 14.5, max: 16 });
  expect(s.refleks.negative).toBe(0);
});

test("summarize: wejście bez bodźca liczy tylko opóźnienie obsługi, ujemny czas jest zliczany", () => {
  const s = summarize([row({ game: "stoper", stim: null, raf: null }), row({ game: "stoj", event: 1005, handler: 1006 })], []);
  expect(s.hz).toBeNull();
  expect(s.stoper.diff).toBeNull();
  expect(s.stoper.lag?.median).toBe(5);
  expect(s.stoj.negative).toBe(1);
});

test("pomiar nie zmienia wyniku: gry dalej liczą z performance.now()", () => {
  expect(read("games/Refleks.tsx")).toContain("Math.round(performance.now() - r.goAt)");
  expect(read("games/Stoj.tsx")).toContain("Math.round(performance.now() - r.shownAt)");
  expect(read("games/Stoper.tsx")).toContain("Math.min(performance.now() - start.current, giveUp)");
  expect(read("games/Wieza.tsx")).toContain("Math.round(performance.now() - started.current)");
  for (const game of ["Refleks", "Stoj", "Stoper", "Wieza"]) expect(read(`games/${game}.tsx`)).toMatch(/clock\.input\("\w+", e\)/);
});
