import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// P4-050: wspólna klasa akcji gracza, tokeny w swoich rolach, drugi znak właściciela i wyboru, nazwane wyjątki treści.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");
const css = read("index.css");
const design = readFileSync(join(src, "../../../DESIGN.md"), "utf8");
const rules = readFileSync(join(src, "../../../ZASADY.md"), "utf8");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : []));

describe("akcja gracza", () => {
  test("btn-player w index.css i w każdym przycisku akcji gracza zamiast text-bg", () => {
    expect(css).toMatch(/\.btn-player \{/);
    for (const file of files(src)) {
      for (const line of readFileSync(file, "utf8").split("\n").filter((l) => /\bbtn\b/.test(l))) expect(line, file).not.toMatch(/\btext-bg\b/);
    }
    expect(rules).toContain("`btn-player`");
  });
});

describe("tokeny w swoich rolach", () => {
  test("bez bieli i czerni spoza tokenów", () => {
    expect(css).not.toMatch(/#fff\b|#000\b/);
    for (const name of ["KampusTour", "PiecWRzedzie"]) expect(read(`games/${name}.tsx`), name).not.toMatch(/\bwhite\b/);
  });

  test("accent-fg tylko na akcencie", () => {
    for (const name of ["Simon", "Stoj"]) expect(read(`games/${name}.tsx`), name).not.toContain("accent-fg");
  });

  test("Statki: strefa zakazana i zły duch w warning, akcent tylko dla trafienia", () => {
    const code = read("games/Statki.tsx");
    expect(code).not.toContain("accent-soft");
    expect(code).not.toMatch(/hull\(RED, true\)/);
    expect(code).toMatch(/hull\(WARN, true\)/);
  });

  test("Państwa-miasta: odrzucona bez tła akcentu, kafel litery z line, gotowość w fg, zła litera z ikoną i tekstem", () => {
    const code = read("games/PanstwaMiasta.tsx");
    expect(code).not.toContain("accent");
    expect(code).not.toContain("border-line-hover bg-surface text-7xl");
    expect(code).toMatch(/className="text-fg" aria-label="gotowe"/);
    expect(code).toContain("Zła litera");
  });

  test("Rekordy: liczba „Do pobicia” bez ostrzeżenia", () => {
    expect(read("screens/Records.tsx")).not.toMatch(/warn: toBeat/);
  });

  test("Kampus Tour: pola do wyboru w kolorze gracza, nie akcentu", () => {
    expect(read("games/KampusTour.tsx")).not.toContain("outline-accent");
  });

  test("Setup: wybrany tryb w kolorze gracza z ikoną Check", () => {
    const code = read("screens/Setup.tsx");
    expect(code).not.toContain("border-accent bg-accent-soft");
    expect(code).toMatch(/<Check\b/);
  });

  test("pasek limitu w kolorze gracza w Kampus Tour i Państwach-miastach", () => {
    const code = read("screens/Game.tsx");
    expect(code).toMatch(/<Countdown game=\{game\} total=\{def\.turnSeconds\} color=\{turnColor\} \/>/);
    expect(code).toMatch(/<Countdown game=\{game\} total=\{def\.turn\?\.\(game\.view\)\.seconds\} color=\{turnColor\} tense \/>/);
  });
});

describe("drugi znak oprócz koloru", () => {
  test.each(["PiecWRzedzie", "Chinczyk", "Labirynt", "Memory", "Zakupy"])("%s: inicjał właściciela na elemencie", (name) => {
    expect(read(`games/${name}.tsx`)).toMatch(/initials\(/);
  });

  test("Kampus Tour: ikona postaci właściciela na polu, widoczna", () => {
    const code = read("games/KampusTour.tsx");
    expect(code).not.toContain('<span className="sr-only">Właściciel:');
    expect(code).toMatch(/token\(owner, /);
  });

  test("Śledzenie: cele w pokazie mają widoczny obrys, nie tylko kolor", () => {
    expect(read("games/Sledzenie.tsx")).toMatch(/phase === "show" && isTarget\(i\)[^\n]*outline/);
  });
});

describe("skala promieni i nazwane wyjątki", () => {
  test("bez promieni spoza skali", () => {
    expect(read("games/Statki.tsx")).not.toContain("rounded-[1px]");
    expect(read("games/Chinczyk.tsx")).not.toContain("rounded-[6px]");
    expect(read("games/Wieza.tsx")).not.toContain("rounded-sm");
  });

  test("DESIGN §6 nazywa wyjątki treści", () => {
    for (const s of ["uchwyt suwaka", "figury Obrotu", "gradient oceny", "4 px", "2.5D", "rogi"]) expect(design, s).toContain(s);
  });
});
