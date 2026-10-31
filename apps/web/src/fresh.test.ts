import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { seenAtMount } from "./screens/ui.tsx";

// P4-046: zastany stan po wejściu albo odświeżeniu bez animacji; koniec partii, para, trafienie i werdykt Balonu.
const src = new URL(".", import.meta.url).pathname;
const rules = readFileSync(join(src, "../../../ZASADY.md"), "utf8");
const game = (name: string) => readFileSync(join(src, "games", `${name}.tsx`), "utf8");

describe("zastany stan bez animacji", () => {
  test("elementy z pierwszego stanu są zastane, nowe nie; zniknięcie zapomina klucz (rewanż)", () => {
    let seen = seenAtMount(null, [1, 2]);
    expect([...seen]).toEqual([1, 2]);
    seen = seenAtMount(seen, [1, 2, 3]);
    expect(seen.has(3)).toBe(false);
    seen = seenAtMount(seen, []);
    seen = seenAtMount(seen, [1]);
    expect(seen.has(1)).toBe(false);
  });

  test.each(["PiecWRzedzie", "Statki", "Labirynt", "Memory"])("%s animuje pojawienie tylko nowych elementów", (name) => {
    const code = game(name);
    expect(code).toContain("useFresh(");
    for (const line of code.split("\n").filter((l) => l.includes("animate-[stone-pop"))) expect(line, name).toMatch(/isNew\(/);
  });
});

describe("koniec partii, para, trafienie i werdykt", () => {
  test("Kampus Tour: nagłówek końca w kolorze zwycięzcy, title-pop tylko u niego; podsumowanie w kolorze zwycięzcy", () => {
    const code = game("KampusTour");
    expect(code).toMatch(/result\?\.winner === me \? "[^"]*animate-\[title-pop_0\.5s_cubic-bezier\(0\.2,0\.8,0\.4,1\)\]/);
    expect(code).toMatch(/winner=\{result\?\.winner/);
    expect(game("KampusSummary")).toMatch(/style=\{winner \? \{ color: color\(winner\) \} : undefined\}/);
  });

  test("W pamięci: zaliczona runda to krótki tile-hit kafla, bez wibracji", () => {
    const code = game("WPamieci");
    expect(code).toContain("animate-[tile-hit_0.35s_ease-out]");
    expect(code.match(/navigator\.vibrate/g)?.length).toBe(1);
  });

  test("Balon: werdykt nie zależy od fazy, więc float-up gra pełne 1,6 s", () => {
    const code = game("Balon");
    const verdict = code.slice(code.indexOf("animate-[float-up") - 200, code.indexOf("animate-[float-up"));
    expect(verdict).not.toContain('phase === "pause"');
    expect(verdict).toContain("pumps.length > 0");
  });

  test("ZASADY §5: para to stone-pop, set-glow komplet wielu pól, zastany stan bez animacji", () => {
    expect(rules).toMatch(/set-glow[^\n]*komplet wielu (różnych )?pól/);
    expect(rules).toMatch(/Zastany stan[^\n]*od razu/);
  });
});
