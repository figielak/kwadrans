import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

// P4-034: lista mini-gier z rejestru, Sudoku montuje się po nonce, Turniej ma jeden przyklejony pasek.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

test("F4-017: Game.tsx i Lobby.tsx biorą mini-gry z MINI_GAME_IDS, bez ręcznej listy id", () => {
  const game = read("Game.tsx");
  expect(game).toContain("MINI_GAME_IDS");
  expect(game).not.toMatch(/new Set\(\["tort"/);
  // Kalambury mają własną tabelę „Suma punktów”, więc nie dostają drugiej listy pod spodem.
  expect(game).toMatch(/OWN_RANKING = new Set\(\[\.\.\.MINI_GAME_IDS, "panstwa-miasta", "kalambury"\]\)/);
  expect(read("Lobby.tsx")).toMatch(/MINI_GAMES = MINI_GAME_IDS\.map\(\(id\) => GAMES\[id\]\)/);
});

test("F4-048: Sudoku montuje się od nowa po nonce, stara partia bez nonce po planszy", () => {
  expect(read("../games/MiniGame.tsx")).toMatch(/key=\{\(view as SudokuView\)\.nonce \?\? \(view as SudokuView\)\.puzzle\.join\(\)\}/);
});

test("F4-156: Turniej nie owija StartBar drugim przyklejonym paskiem", () => {
  const setup = read("Setup.tsx");
  expect(setup).not.toContain('className="sticky bottom-0');
  expect(setup).toMatch(/<StartBar[^>]*note=/);
});
