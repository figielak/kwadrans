import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// P4-051: ciemne natywne kontrolki, nazwane przyciski i pola, ozdoby pominięte, podpowiedź wykresu po dotknięciu.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : []));

/** Otwierające znaczniki `<tag …>` z atrybutami (także wielolinijkowe); nawiasy klamrowe chronią `=>` w wyrażeniach. */
function tags(code: string, tag: string): string[] {
  const out: string[] = [];
  for (let i = code.indexOf(`<${tag}`); i >= 0; i = code.indexOf(`<${tag}`, i + 1)) {
    if (!/[\s>]/.test(code[i + tag.length + 1])) continue;
    let depth = 0;
    let j = i;
    for (; j < code.length; j++) {
      const c = code[j];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    out.push(code.slice(i, j + 1));
  }
  return out;
}

describe("platforma", () => {
  test("color-scheme: dark dla natywnych kontrolek", () => {
    expect(read("index.css")).toMatch(/html \{[^}]*color-scheme: dark/);
    expect(readFileSync(join(src, "../index.html"), "utf8")).toContain('name="color-scheme" content="dark"');
  });

  test("span z aria-label ma rolę (czytniki pomijają etykietę gołego span)", () => {
    for (const file of files(src)) {
      for (const t of tags(readFileSync(file, "utf8"), "span").filter((t) => t.includes("aria-label="))) expect(t, file).toMatch(/role=/);
    }
  });

  test("pasek limitu ma zakres", () => {
    const bar = tags(read("screens/Game.tsx"), "div").find((t) => t.includes('role="progressbar"'))!;
    expect(bar).toContain("aria-valuemin={0}");
    expect(bar).toContain("aria-valuemax=");
  });

  test("kropka gracza na ekranie instrukcji to ozdoba", () => {
    const code = read("screens/ui.tsx");
    const list = code.slice(code.indexOf("room.others.map"), code.indexOf('"czyta zasady"'));
    expect(list).toContain("aria-hidden");
  });
});

describe("gry", () => {
  test("Balon: pole pompowania to przycisk z nazwą", () => {
    expect(tags(read("games/Balon.tsx"), "button").some((t) => t.includes("onPointerDown={pump}") && t.includes('aria-label="Pompuj balon"'))).toBe(true);
  });

  test("Za zasłoną: pole ma nazwę w każdej rundzie", () => {
    expect(tags(read("games/Zaslona.tsx"), "button").find((t) => t.includes("onPointerDown={press}"))).toMatch(/aria-label=/);
  });

  test("Kalambury: płótno to obraz z nazwą", () => {
    const svg = tags(read("games/Kalambury.tsx"), "svg")[0];
    expect(svg).toContain('role="img"');
    expect(svg).toContain("aria-label=");
  });

  test("Inny element i Sudoku: komórki siatki mają nazwy", () => {
    expect(tags(read("games/Quiz.tsx"), "button").find((t) => t.includes("onPointerDown={() => answer(i)}"))).toMatch(/aria-label=/);
    expect(tags(read("games/Sudoku.tsx"), "button").find((t) => t.includes("onPointerDown={() => pick(i)}"))).toMatch(/aria-label=/);
  });

  test("Statki: pole mówi o stanie strzału", () => {
    const code = read("games/Statki.tsx");
    for (const state of ["pudło", "trafiony", "zatopiony"]) expect(code).toContain(`"${state}"`);
    expect(code).toMatch(/state \? `, \$\{state\}`/);
  });

  test("Kampus Tour: ikona X w przycisku zamknięcia jest ozdobą", () => {
    for (const t of tags(read("games/KampusTour.tsx"), "X")) expect(t).toMatch(/aria-hidden|aria-label/);
  });

  test("Labirynt: plansza opisuje położenie pionków", () => {
    expect(read("games/Labirynt.tsx")).not.toContain('aria-label="Plansza labiryntu"');
  });

  test("Kampus Tour: podpowiedź wykresu zostaje po dotknięciu", () => {
    const code = read("games/KampusSummary.tsx");
    expect(code).toContain("onPointerDown=");
    expect(code).toMatch(/onPointerLeave=\{\(e\) => e\.pointerType === "mouse" && setHover\(null\)\}/);
  });
});
