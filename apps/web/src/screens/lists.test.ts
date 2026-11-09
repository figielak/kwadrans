import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GAMES, MINI_GAME_IDS, PLAYER_COLORS, type RoomView } from "@kwadrans/games";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { BLURBS, ICONS, Lobby, wishDots } from "./Lobby.tsx";
import { Setup } from "./Setup.tsx";

// Setup przez MiniGames i net.ts czyta `location` już przy imporcie; testy idą w node.
vi.hoisted(() => {
  Object.assign(globalThis, { location: { hostname: "localhost", origin: "http://localhost", search: "" } });
});

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

test("11-06: Sabotaż w lobby ma nazwę, ikonę, opis i limit 3-6, a nie jest mini-grą ani grą z rekordem", () => {
  const html = lobby(3);
  expect(html).toContain("Sabotaż");
  expect(html).toContain("3-6 os.");
  expect(ICONS.sabotaz).toBeDefined();
  expect(BLURBS.sabotaz).toMatch(/Pułapk/);
  expect(BLURBS.sabotaz).not.toMatch(/kwadrans|Skull|—/i);
  expect(MINI_GAME_IDS).not.toContain("sabotaz");
  expect(GAMES.sabotaz.record).toBeUndefined();
});

test("11-06: przy dwóch osobach Sabotaż stoi wśród gier zablokowanych, za dostępnymi", () => {
  const html = lobby(2);
  expect(html).toContain("Sabotaż");
  expect(html.indexOf("Memory")).toBeLessThan(html.indexOf("Sabotaż"));
});

test("11-06: Game montuje Sabotaż po nonce z ruchem, miejscami i oczekującymi", () => {
  const game = read("Game.tsx");
  expect(game).toMatch(/<Sabotaz\s+key=\{\(game\.view as SabotazView\)\.nonce\}/);
  const mount = game.slice(game.indexOf("<Sabotaz"), game.indexOf("/>", game.indexOf("<Sabotaz")));
  for (const prop of ["me={me}", "players={view.players}", "waitingFor={game.waitingFor}", "places={game.places}", 'send("move", move)']) expect(mount).toContain(prop);
  expect(game.indexOf("<ResultDetails")).toBeLessThan(game.indexOf("<Sabotaz"));
  expect(game.indexOf("<Sabotaz")).toBeLessThan(game.indexOf("</ResultDetails>"));
});

test("11-06: status, kolor i etykieta limitu korzystają z jednej informacji o równoczesności", () => {
  const game = read("Game.tsx");
  expect(game).not.toContain("SIMULTANEOUS.has(def.id)");
  expect(game.match(/\bsimultaneous\b/g)!.length).toBeGreaterThanOrEqual(4);
});

test("10-07: Wyprawa w lobby ma nazwę, ikonę, opis i limit 2-6, a nie jest mini-grą ani grą z rekordem", () => {
  const html = lobby(2);
  expect(html).toContain("Wyprawa");
  expect(html).toContain("2-6 os.");
  expect(ICONS.wyprawa).toBeDefined();
  expect(BLURBS.wyprawa).toMatch(/szlak/);
  expect(BLURBS.wyprawa).not.toMatch(/kwadrans|Skull|Uno|Quoridor|—/i);
  expect(MINI_GAME_IDS).not.toContain("wyprawa");
  expect(GAMES.wyprawa.record).toBeUndefined();
});

test("10-07: Game montuje Wyprawę po nonce z ruchem, miejscami i oczekującymi, w ResultDetails", () => {
  const game = read("Game.tsx");
  expect(game).toMatch(/<Wyprawa\s+key=\{\(game\.view as WyprawaView\)\.nonce\}/);
  const mount = game.slice(game.indexOf("<Wyprawa"), game.indexOf("/>", game.indexOf("<Wyprawa")));
  for (const prop of ["me={me}", "players={view.players}", "waitingFor={game.waitingFor}", "places={game.places}", 'send("move", move)']) expect(mount).toContain(prop);
  expect(game.indexOf("<ResultDetails")).toBeLessThan(game.indexOf("<Wyprawa"));
  expect(game.indexOf("<Wyprawa")).toBeLessThan(game.indexOf("</ResultDetails>"));
  expect(game).not.toContain("OWN_RANKING");
});

test("10-07: kolor poświaty w Wyprawie to własny kolor czekającego, a nie jedynego gracza na szlaku", () => {
  const game = read("Game.tsx");
  const focus = game.slice(game.indexOf("const focus ="), game.indexOf("const turnColor"));
  expect(focus).toMatch(/"wyprawa"[\s\S]*simultaneous[\s\S]*game\.waitingFor\.includes\(me\)\s*\?\s*me/);
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

test("08-08: Podróbka w lobby ma nazwę, ikonę, opis i limit 3-6, a nie jest mini-grą ani grą z rekordem", () => {
  const html = lobby(3);
  expect(html).toContain("Podróbka");
  expect(html).toContain("3-6 os.");
  expect(ICONS.podrobka).toBeDefined();
  expect(BLURBS.podrobka).toMatch(/pytani/);
  expect(BLURBS.podrobka).not.toMatch(/kwadrans|Skull|Uno|Quoridor|Wyprawa|Sabotaż|—/i);
  expect(MINI_GAME_IDS).not.toContain("podrobka");
  expect(GAMES.podrobka.record).toBeUndefined();
});

test("08-08: opis Podróbki nie zdradza kierunku pary ani roli poza zasadą gry", () => {
  expect(BLURBS.podrobka).toMatch(/jedna osoba/);
  expect(BLURBS.podrobka).not.toMatch(/większość dostaje|Podróbką jest|ty jesteś|losowan/i);
});

test("08-08: Game montuje Podróbkę po nonce z ruchem, miejscami i oczekującymi, w ResultDetails", () => {
  const game = read("Game.tsx");
  expect(game).toMatch(/<Podrobka\s+key=\{\(game\.view as PodrobkaView\)\.nonce\}/);
  const mount = game.slice(game.indexOf("<Podrobka"), game.indexOf("/>", game.indexOf("<Podrobka")));
  for (const prop of ["me={me}", "players={view.players}", "waitingFor={game.waitingFor}", "places={game.places}", 'send("move", move)']) expect(mount).toContain(prop);
  expect(game.indexOf("<ResultDetails")).toBeLessThan(game.indexOf("<Podrobka"));
  expect(game.indexOf("<Podrobka")).toBeLessThan(game.indexOf("</ResultDetails>"));
  expect(game).not.toContain("OWN_RANKING");
});

test("08-08: kolor poświaty w Podróbce to własny kolor czekającego, a nie jedynego gracza, na którego czekamy", () => {
  const game = read("Game.tsx");
  const focus = game.slice(game.indexOf("const focus ="), game.indexOf("const turnColor"));
  expect(focus).toMatch(/"podrobka"[\s\S]*game\.waitingFor\.includes\(me\)\s*\?\s*me/);
  expect(game).toMatch(/const SIMULTANEOUS = new Set\(\[[^\]]*"podrobka"/);
});

// 15-03: „Jak grać” w kafelku ekranu gry i jako ikona w nagłówku partii.
const setupHtml = (gameId: string) => {
  const view: RoomView = {
    code: "ABCD", hostId: "p1", phase: "lobby", solo: false, gameId, mode: null,
    players: Array.from({ length: 3 }, (_, i) => ({ id: `p${i + 1}`, nick: `Gracz ${i + 1}`, color: PLAYER_COLORS[i], connected: true, ready: false })),
    seats: ["p1", "p2", "p3"], tournament: null, markedBy: {}, scores: {}, game: null, wishes: {}, vote: null,
    evening: { games: 0, played: [], table: [], titles: [] },
  };
  return renderToStaticMarkup(createElement(Setup, { view, me: "p1", dropped: false, send: () => {}, onLeave: () => {} }));
};

test("15-03: Setup gry z kartą ma „Jak grać” za opisem", () => {
  const html = setupHtml("sabotaz");
  expect(html).toContain("Jak grać");
  expect(html.indexOf(BLURBS.sabotaz!)).toBeGreaterThan(-1);
  expect(html.indexOf(BLURBS.sabotaz!)).toBeLessThan(html.indexOf("Jak grać"));
});

test("15-03: TournamentSetup nie pokazuje „Jak grać”", () => {
  const setup = read("Setup.tsx");
  expect(setup).toContain("<RulesDetails");
  expect(setup.slice(setup.indexOf("export function TournamentSetup"))).not.toContain("Rules");
});

test("15-03: Game montuje RulesButton tylko w fazie playing i przekazuje help grom z własnym nagłówkiem", () => {
  const game = read("Game.tsx");
  expect(game).toMatch(/view\.phase === "playing" && <RulesButton gameId=\{def\.id\} \/>/);
  for (const name of ["PanstwaMiasta", "Kalambury"]) {
    const mount = game.slice(game.indexOf(`<${name}\n`), game.indexOf("onMove", game.indexOf(`<${name}\n`)));
    expect(mount, name).toMatch(/help=\{ownHeader && <RulesButton gameId=\{def\.id\} \/>\}/);
  }
});

test("15-03: PanstwaMiasta i Kalambury renderują help w nagłówku z timerem", () => {
  for (const name of ["PanstwaMiasta", "Kalambury"]) {
    const src2 = readFileSync(join(src, "..", "games", `${name}.tsx`), "utf8");
    expect(src2, name).toMatch(/help\?: ReactNode/);
    const header = src2.slice(src2.indexOf("{timer && ("), src2.indexOf("</header>"));
    expect(header, name).toContain("{help}");
  }
});
