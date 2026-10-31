import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import * as ui from "./screens/ui.tsx";

// P4-049: odczyty liczb mono z tabular-nums, podpisy jako .label, wspólny przecinek i brak wartości, wąskie kolumny.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");
const tsx = ["games", "screens"].flatMap((dir) => readdirSync(join(src, dir)).filter((f) => f.endsWith(".tsx")).map((f) => `${dir}/${f}`));

test("F4-101: każdy font-mono ma tabular-nums", () => {
  for (const file of tsx)
    read(file)
      .split("\n")
      .forEach((line, i) => {
        if (/className=.*\bfont-mono\b/.test(line) || /const text = `font-mono/.test(line)) expect(line, `${file}:${i + 1}`).toContain("tabular-nums");
      });
});

test("F4-101: duże odczyty liczb są mono (zdania mogą zostać Satoshi)", () => {
  for (const file of ["games/Stoper.tsx", "games/Rytm.tsx", "games/Przytrzymaj.tsx"])
    for (const line of read(file).split("\n").filter((l) => /text-7xl/.test(l))) expect(line, file).toContain("font-mono");
  expect(read("screens/Records.tsx")).toMatch(/<dd className="[^"]*font-mono[^"]*tabular-nums/);
  expect(read("screens/Game.tsx")).toMatch(/className="[^"]*font-mono[^"]*" aria-label=\{`Pary:/);
});

test("F4-102: podpisy bloków to .label", () => {
  expect(read("screens/Lobby.tsx")).toContain('<span className="label">Twój kolor</span>');
  expect(read("games/Zakupy.tsx")).toContain('<span className="label">Lista zakupów</span>');
  expect(read("screens/Records.tsx")).toMatch(/<dt className="label[^"]*">\{item\.label\}<\/dt>/);
  expect(read("games/KampusSummary.tsx")).not.toContain('<dt className="text-fg-muted">');
  expect(read("games/KampusTour.tsx")).not.toContain("text-xs font-semibold tracking-wide uppercase");
  expect(read("games/Statki.tsx")).toMatch(/<h2 className=\{`label mb-2/);
});

test("F4-103: ikony w małych akcjach są bold", () => {
  const plain = /<(ArrowLeft|SignOut|ArrowCounterClockwise|Trash|SquaresFour|Play|Trophy|X) size=\{1[68]\}(?![^>]*weight)/;
  for (const file of ["screens/ui.tsx", "screens/Game.tsx", "screens/Home.tsx", "screens/Lobby.tsx", "screens/MiniGames.tsx", "screens/Records.tsx", "games/KampusTour.tsx", "games/Kalambury.tsx"])
    expect(read(file), file).not.toMatch(plain);
});

test("F4-120: wspólny przecinek dziesiętny bez minus zera, kary przez niego", () => {
  const { decimal, tenth } = ui as unknown as { decimal: (n: number, d: number) => string; tenth: (n: number) => string };
  expect(decimal(1.25, 2)).toBe("1,25");
  expect(decimal(-0.01, 1)).toBe("0,0");
  expect(decimal(-1.5, 1)).toBe("−1,5");
  expect(decimal(5, 0)).toBe("5");
  expect(tenth(12.34)).toBe("12,3");
  for (const file of ["games/Schulte.tsx", "games/Sudoku.tsx"]) expect(read(file), file).not.toMatch(/PENALTY_MS\) \/ 1000\}|PENALTY_MS \/ 1000\}/);
});

test("F4-122: brak wartości to „brak”, pusty balon to 0", () => {
  expect(read("games/Kolo.tsx")).not.toMatch(/: "-" \}/);
  expect(read("games/Kolo.tsx")).toContain('"brak"');
  expect(read("games/Balon.tsx")).not.toContain('"–"');
});

test("F4-141/F4-145/F4-149: oś Schultego czytelna, Odcień w Stats, Mapa skraca ponad 999", () => {
  expect(read("games/Schulte.tsx")).not.toContain("text-[9px]");
  expect(read("games/Kolor.tsx")).toMatch(/label: "Kolor", value: `\$\{index \+ 1\}\/\$\{KOLOR_COUNT\}`/);
  expect(read("games/Mapa.tsx")).toContain('"999+"');
});

test("F4-151/F4-153/F4-157: Zakupy w jednym krótkim wierszu, pkt w nagłówku Turnieju, tytuł ustawień jak ekran gry", () => {
  expect(read("games/Zakupy.tsx")).toContain("score: r ? `${r.score} pkt · ${tenth(r.ms / 1000)} s` : null");
  const game = read("screens/Game.tsx");
  expect(game).not.toContain("{r.total} pkt</span>");
  expect(game).toMatch(/<span[^>]*>pkt<\/span>/);
  const setup = read("screens/Setup.tsx");
  expect(setup).not.toContain('<h1 className="label">Turniej');
  expect(setup).toMatch(/<Trophy size=\{28\} weight="fill"/);
});
