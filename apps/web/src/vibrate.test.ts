import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { boughtOut } from "./games/KampusTour.tsx";
import { decisionKey, VIBRATE } from "./vibrate.ts";

// P4-043: jedna tabela wibracji, zignorowany ruch bez wibracji, szkoda od rywala raz na zdarzenie, tura przy nowej decyzji.
const src = new URL(".", import.meta.url).pathname;
const rules = readFileSync(join(src, "../../../ZASADY.md"), "utf8");
const read = (file: string) => readFileSync(join(src, file), "utf8");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : []));

describe("tabela wibracji", () => {
  test("wzory w ZASADY §5 zgadzają się z VIBRATE", () => {
    expect(rules).toMatch(new RegExp(`\\| moja nowa decyzja[^|]*\\| ${VIBRATE.turn} \\|`));
    expect(rules).toMatch(new RegExp(`\\| pomyłka[^|]*\\| ${VIBRATE.mistake} \\|`));
    expect(rules).toMatch(new RegExp(`\\| coś złego dla mnie od innego gracza[^|]*\\| \\[${VIBRATE.harm.join(", ")}\\] \\|`));
    expect(rules).toMatch(new RegExp(`\\| uderzenie metronomu w Rytmie[^|]*\\| ${VIBRATE.beat} \\|`));
    expect(rules).toMatch(/\| ruch zignorowany[^|]*\| bez wibracji \|/);
    expect(rules).toMatch(/\| legalne pudło[^|]*\| bez wibracji \|/);
  });

  test("szkoda od rywala ma w tabeli przykłady z każdej gry", () => {
    const row = rules.match(/\| coś złego dla mnie od innego gracza([^|]*)\|/)?.[1] ?? "";
    for (const example of ["zbity pionek", "trafienie mojej floty", "wykupienie mojego pola", "STOP"]) expect(row).toContain(example);
  });

  test("gry wibrują tylko wzorami z VIBRATE", () => {
    for (const file of files(src)) expect(readFileSync(file, "utf8"), file).not.toMatch(/navigator\.vibrate\?\.\((?!VIBRATE\.)/);
  });
});

describe("zignorowany ruch: shake i powód, bez wibracji", () => {
  test.each(["Srodek", "Nozyczki", "Kolo"])("%s", (game) => {
    const code = read(`games/${game}.tsx`);
    expect(code).not.toContain("vibrate");
    expect(code).toContain("animate-[shake_0.3s_ease-out]");
  });

  test("Za zasłoną ignoruje dotknięcie przed zniknięciem kulki bez efektu, opisane w ZASADY §5", () => {
    expect(read("games/Zaslona.tsx")).not.toContain("vibrate");
    expect(rules).toMatch(/Za zasłoną[^\n]*przed zniknięciem kulki/);
  });
});

describe("pomyłka: 60", () => {
  test("falstart w Refleksie wibruje i trzęsie polem jak błąd w Stój!", () => {
    const code = read("games/Refleks.tsx");
    expect(code).toContain("navigator.vibrate?.(VIBRATE.mistake)");
    expect(code).toContain("animate-[tile-miss_0.35s_ease-out]");
  });

  test("błąd Sekwencji wibruje i przez 1 s pokazuje złe i właściwe pole, wynik idzie od razu", () => {
    const code = read("games/Simon.tsx");
    expect(code).toContain("navigator.vibrate?.(VIBRATE.mistake)");
    expect(code).toMatch(/REVEAL_MS = 1000/);
    expect(code).toContain("animate-[tile-miss_0.35s_ease-out]");
  });

  test.each(["Memory", "Kalambury"])("legalne pudło w grze %s nie wibruje", (game) => {
    expect(read(`games/${game}.tsx`)).not.toContain("vibrate");
  });
});

describe("szkoda od rywala: raz na zdarzenie, bez powtórki po wejściu", () => {
  test.each(["Statki", "KampusTour", "PanstwaMiasta"])("%s używa useHarm", (game) => {
    expect(read(`games/${game}.tsx`)).toMatch(/useHarm\(/);
  });

  test("baner STOP wskakuje stone-pop", () => {
    const code = read("games/PanstwaMiasta.tsx");
    const banner = code.slice(code.indexOf("function StopBanner"));
    expect(banner.slice(0, banner.indexOf("}\n"))).toContain("animate-[stone-pop_0.35s_ease-out]");
  });

  test("Kampus Tour: wykupienie to pole, które było moje, a teraz ma je inny gracz", () => {
    expect(boughtOut({ 3: "a", 5: "b" }, { 3: "b", 5: "b" }, "a")).toEqual([3]);
    expect(boughtOut({ 3: "a" }, {}, "a")).toEqual([]); // sprzedaż bankowi to nie szkoda od gracza
    expect(boughtOut({ 3: "b" }, { 3: "a" }, "a")).toEqual([]); // moje wykupienie
    expect(boughtOut({ 3: "a" }, { 3: "a", 4: "b" }, "a")).toEqual([]);
  });
});

describe("tura: wibracja przy nowej decyzji", () => {
  const players = ["a", "b", "c"];
  const kalambury = (round: number, half: number, phase = "draw", guessed: string[] = []) => ({ phase, round, half, drawer: "a", players, guessed });
  // waitingFor jak na serwerze: w pierwszej połowie tylko rysujący, w drugiej zgadujący.
  const waiting = (half: number) => (half === 0 ? ["a"] : ["b", "c"]);
  const k = (me: string, round: number, half: number, phase = "draw", guessed: string[] = []) =>
    decisionKey("kalambury", kalambury(round, half, phase, guessed), me, phase === "draw" ? waiting(half) : phase === "choose" ? ["a"] : players);
  const panstwa = (phase: string, round: number, stop: string | null = null) => ({ phase, round, stop });

  test("Kalambury: zgadujący decyduje od wejścia w rysowanie, połowa nic nie zmienia", () => {
    expect(k("b", 1, 0)).not.toBeNull();
    expect(k("b", 1, 0)).toBe(k("b", 1, 1));
    expect(k("a", 1, 0)).toBe(k("a", 1, 1));
    expect(k("b", 1, 1)).not.toBe(k("b", 2, 0));
  });

  test("Kalambury: wybór hasła i rysowanie to jedna decyzja rysującego; kto zgadł, już nie decyduje", () => {
    expect(k("a", 1, 0, "choose")).toBe(k("a", 1, 0));
    expect(k("b", 1, 0, "choose")).toBeNull();
    expect(k("b", 1, 1, "draw", ["b"])).toBeNull();
    expect(decisionKey("kalambury", kalambury(1, 0), "x", ["a"])).toBeNull();
  });

  test("Państwa-miasta: nowa faza po limicie to nowa decyzja, STOP nie", () => {
    const p = (phase: string, round: number, stop: string | null = null) => decisionKey("panstwa-miasta", panstwa(phase, round, stop), "a", ["a", "b"]);
    expect(p("write", 1)).not.toBe(p("vote", 1));
    expect(p("write", 1)).toBe(p("write", 1, "b"));
    expect(p("summary", 1)).not.toBe(p("write", 2));
    expect(decisionKey("panstwa-miasta", panstwa("write", 1), "a", ["b"])).toBeNull();
  });

  test("gry turowe: klucz tylko, gdy czekamy na mnie", () => {
    expect(decisionKey("chinczyk", { phase: "roll" }, "a", ["a"])).toBe(decisionKey("chinczyk", { phase: "move" }, "a", ["a"]));
    expect(decisionKey("chinczyk", { phase: "roll" }, "a", ["b"])).toBeNull();
  });

  test("Game.tsx wibruje z klucza decyzji, gra tego nie powtarza", () => {
    const code = read("screens/Game.tsx");
    expect(code).toContain("decisionKey(");
    expect(code).toContain("navigator.vibrate?.(VIBRATE.turn)");
  });
});
