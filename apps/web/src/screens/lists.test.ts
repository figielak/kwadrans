import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLAYER_COLORS, type RoomView } from "@kwadrans/games";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Lobby, wishDots } from "./Lobby.tsx";

// P4-034: lista mini-gier z rejestru, Sudoku montuje się po nonce, Turniej ma jeden przyklejony pasek.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

const lobby = (n: number) => {
  const view: RoomView = {
    code: "ABCD", hostId: "p1", phase: "lobby", solo: false, gameId: null, mode: null,
    players: Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nick: `Gracz ${i + 1}`, color: PLAYER_COLORS[i], connected: true, ready: false })),
    seats: [], tournament: null, markedBy: {}, scores: {}, game: null, wishes: {}, vote: null,
    evening: { games: 0, played: [], table: [], titles: [] },
  };
  return renderToStaticMarkup(createElement(Lobby, { view, me: "p1", dropped: false, send: () => {}, onLeave: () => {}, onMini: () => {} }));
};

test("lobby sześciu osób pokazuje dostępne gry przed zablokowanymi", () => {
  const html = lobby(6);
  for (const name of ["Memory", "Państwa-miasta", "Kalambury"]) expect(html.indexOf(name)).toBeLessThan(html.indexOf("Gomoku"));
  expect(html).toContain("Gomoku");
  expect(html).toContain("tylko 2 os.");
});

test("lobby przed wyborem gry nie zasłania listy paskiem bez akcji", () => {
  expect(lobby(2)).not.toContain("sticky bottom-0");
  expect(lobby(6)).not.toContain("sticky bottom-0");
});

test("F4-017: Game.tsx i Lobby.tsx biorą mini-gry z MINI_GAME_IDS, bez ręcznej listy id", () => {
  const game = read("Game.tsx");
  expect(game).toContain("MINI_GAME_IDS");
  expect(game).not.toMatch(/new Set\(\["tort"/);
  // Listę miejsc pod grą zastąpił bohater wyników (07-04).
  expect(game).not.toContain("OWN_RANKING");
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

test("07-21: wishDots przypisuje kropki do gier, gracz, który wyszedł, znika", () => {
  const players = [
    { id: "a", nick: "Ala", color: "#f00", connected: true, ready: false },
    { id: "b", nick: "Bob", color: "#0f0", connected: true, ready: false },
    { id: "c", nick: "Cyd", color: "#00f", connected: true, ready: false },
  ];
  const view = (wishes: Record<string, string>, who = players) => ({ players: who, wishes }) as unknown as RoomView;
  expect(wishDots(view({}))).toEqual({});
  const dots = wishDots(view({ b: "stoper", c: "stoper", a: "memory" }));
  expect(dots.stoper).toEqual([
    { id: "b", nick: "Bob", color: "#0f0" },
    { id: "c", nick: "Cyd", color: "#00f" },
  ]);
  expect(dots.memory).toEqual([{ id: "a", nick: "Ala", color: "#f00" }]);
  // Życzenie nieobecnego (wyszedł, serwer jeszcze go nie skasował) nie daje kropki.
  const left = wishDots(view({ b: "stoper", c: "stoper" }, players.filter((p) => p.id !== "c")));
  expect(left.stoper).toEqual([{ id: "b", nick: "Bob", color: "#0f0" }]);
  expect(wishDots(view({ c: "stoper" }, players.filter((p) => p.id !== "c")))).toEqual({});
});
