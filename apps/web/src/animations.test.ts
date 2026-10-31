import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// P4-041: katalog animacji w ZASADY.md §5 zgadza się z keyframes w index.css i ich użyciem w komponentach.
const src = new URL(".", import.meta.url).pathname;
const css = readFileSync(join(src, "index.css"), "utf8");
const rules = readFileSync(join(src, "../../../ZASADY.md"), "utf8");

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : []));
const code = files(src).map((f) => readFileSync(f, "utf8")).join("\n");

const keyframes = [...css.matchAll(/@keyframes ([a-z0-9-]+)/g)].map((m) => m[1]);
/** Użycia `animate-[nazwa_czas_…]`: nazwa i czas. */
const uses = [...code.matchAll(/animate-\[([a-z0-9-]+)_([0-9.]+m?s)/g)].map((m) => ({ name: m[1], time: m[2] }));
/** Wiersze katalogu: | `nazwa` | rola | czasy w `…` | */
const catalog = new Map(
  [...rules.matchAll(/^\s*\| `([a-z0-9-]+)` \| [^|]+ \| ([^|]+) \|/gm)].map((m) => [m[1], [...m[2].matchAll(/`([0-9.]+m?s)`/g)].map((t) => t[1])]),
);

describe("katalog animacji", () => {
  test("każda użyta animacja ma keyframes", () => {
    for (const { name } of uses) expect(keyframes, name).toContain(name);
  });

  test("każde keyframes jest używane i ma komentarz z rolą tuż nad sobą", () => {
    for (const name of keyframes) {
      expect(code.includes(`animate-[${name}_`) || css.includes(`animation: ${name}`), `${name} nieużywane`).toBe(true);
      expect(css, `${name} bez komentarza`).toMatch(new RegExp(`\\*/\\s*@keyframes ${name} `));
    }
  });

  test("katalog w ZASADY §5 ma każde keyframes i każdy użyty czas", () => {
    expect([...catalog.keys()].sort()).toEqual([...keyframes].sort());
    for (const { name, time } of uses) expect(catalog.get(name), `${name} ${time}`).toContain(time);
  });
});

// P4-040: przy prefers-reduced-motion pływająca liczba nie znika od razu, tylko stoi i gaśnie w tym samym czasie.
describe("reduced motion", () => {
  const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

  test("float-up zastąpione nieruchomym wygaszeniem 1,6 s", () => {
    expect(reduced).toContain('[class*="animate-[float-up"]');
    expect(reduced).toMatch(/animation: float-still 1\.6s ease-out forwards !important/);
    const still = css.slice(css.indexOf("@keyframes float-still"), css.indexOf("}", css.indexOf("@keyframes float-still") + 40) + 1);
    expect(still).not.toContain("transform");
  });

  test("ZASADY §5 opisuje ruch będący zadaniem i klatkę bazową podglądu", () => {
    for (const game of ["Kubki", "Śledzenie", "Wieża", "Za zasłoną"]) expect(rules).toContain(game);
    expect(rules).toMatch(/klatka bazowa/);
  });
});

// P4-042: jedna animacja na sytuację, jawne czasy przejść, paski czasu z zegara.
describe("przejścia, pętle i paski", () => {
  const lines = code.split("\n");

  test("bez animate-pulse i animate-ping z Tailwinda: czekanie jest spokojne", () => {
    expect(code).not.toMatch(/animate-(pulse|ping)\b/);
  });

  test("ring-pulse zawsze 1,2 s, stone-pop 0,35 s (wyjątek W pamięci 180 ms)", () => {
    for (const { name, time } of uses) {
      if (name === "ring-pulse") expect(time).toBe("1.2s");
      if (name === "stone-pop") expect(["0.35s", "180ms"]).toContain(time);
    }
  });

  test("każde przejście Tailwinda ma jawny czas", () => {
    const bare = lines.filter((l) => /\btransition(-colors|-opacity|-transform|-\[[^\]]+\])?(?=[\s"`$])/.test(l) && !/duration-/.test(l));
    expect(bare).toEqual([]);
  });

  test("paski Rytmu i Zakupów nie jadą jednym długim przejściem CSS", () => {
    for (const f of ["games/Rytm.tsx", "games/Zakupy.tsx"]) {
      const text = readFileSync(join(src, f), "utf8");
      expect(text, f).not.toMatch(/transitionDuration|transition: `width/);
    }
  });
});


// P4-044: odsłona prawdy od razu, bez animacji; znacznik prawdy neutralny, odpowiedź w kolorze gracza, ocena na błędzie.
describe("odsłona prawdy", () => {
  const game = (name: string) => readFileSync(join(src, "games", `${name}.tsx`), "utf8");

  test("Mapa pokazuje prawdziwe miejsce bez stone-pop i neutralnym pierścieniem", () => {
    const code = game("Mapa");
    expect(code).not.toContain("stone-pop");
    expect(code).toMatch(/\{\.\.\.target\}\s+r=\{2\.6\}\s+fill="none"\s+className="stroke-fg"/);
  });

  test("Środek: pierścień środka neutralny, kolor oceny tylko na linii błędu", () => {
    expect(game("Srodek")).toMatch(/<circle cx=\{mid\.x \* 100\} cy=\{mid\.y \* 100\} r=\{2\.6\} fill="none" className="stroke-fg"/);
  });

  test("Tort: idealne cięcia neutralne", () => {
    expect(game("Tort")).toMatch(/ideal\(cake\)\.map\(\(deg, i\) => <Cut key=\{i\} deg=\{deg\} className="stroke-fg"/);
  });

  test("Który rok?: pierścień prawdziwego roku neutralny, nie success", () => {
    const code = game("Rok");
    expect(code).not.toContain("border-success");
    expect(code).toMatch(/rounded-full border-2 border-fg" style=\{\{ left: at\(event\.year\) \}\}/);
  });

  test("Kalambury: odsłonięta litera bez animacji, opisana jako wyjątek w ZASADY §5", () => {
    const code = game("Kalambury");
    const hint = code.slice(code.indexOf("{view.hint}") - 300, code.indexOf("{view.hint}"));
    expect(hint).not.toContain("animate-");
    expect(rules).toMatch(/Odsłona prawdy[^\n]*bez animacji/);
    expect(rules).toMatch(/litera Kalamburów[^\n]*bez animacji/);
  });
});
