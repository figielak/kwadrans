import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GAMES, MINI_GAME_IDS, PLAYER_COLORS, type RoomView } from "@kwadrans/games";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { BLURBS, ICONS, Lobby, wishDots } from "./Lobby.tsx";
import { MiniGameGrid, SECTIONS } from "./MiniGames.tsx";
import { Setup, TournamentSetup } from "./Setup.tsx";

// Setup przez MiniGames i net.ts czyta `location` już przy imporcie; testy idą w node.
vi.hoisted(() => {
  Object.assign(globalThis, { location: { hostname: "localhost", origin: "http://localhost", search: "" } });
});

// P4-034: lista mini-gier z rejestru, Sudoku montuje się po nonce, Turniej ma jeden przyklejony pasek.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

const lobby = (n: number, me = "p1") => {
  const view: RoomView = {
    code: "ABCD", hostId: "p1", phase: "lobby", solo: false, gameId: null, mode: null,
    players: Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nick: `Gracz ${i + 1}`, color: PLAYER_COLORS[i], connected: true, ready: false })),
    seats: [], tournament: null, markedBy: {}, scores: {}, game: null, wishes: {}, vote: null,
    evening: { games: 0, played: [], table: [], titles: [] },
  };
  return renderToStaticMarkup(createElement(Lobby, { view, me, dropped: false, send: () => {}, onLeave: () => {}, onMini: () => {} }));
};

test("lobby sześciu osób pokazuje dostępne gry przed zablokowanymi", () => {
  const html = lobby(6);
  for (const name of ["Memory", "Państwa-miasta", "Kalambury"]) expect(html.indexOf(name)).toBeLessThan(html.indexOf("Gomoku"));
  expect(html).toContain("Gomoku");
  expect(html).toContain("tylko 2 os.");
});

test("lobby: gry za małe na pokój to jedna linia tekstu, nie kafle", () => {
  const html = lobby(3);
  expect(html).toContain("Nie dla 3 osób: Gomoku, Statki (tylko 2 os.)");
  expect(html).not.toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>).)*Gomoku/);
  expect(lobby(2)).not.toContain("Nie dla");
});

test("lobby: gry stoją w dwóch grupach, a w każdej te, do których brakuje osób, na końcu", () => {
  const html = lobby(2);
  expect(html.indexOf("Planszowe")).toBeLessThan(html.indexOf("Memory"));
  expect(html.indexOf("Memory")).toBeLessThan(html.indexOf("Towarzyskie"));
  expect(html.indexOf("Towarzyskie")).toBeLessThan(html.indexOf("Kalambury"));
  expect(html.indexOf("Kalambury")).toBeLessThan(html.indexOf("Sabotaż"));
});

test("lobby: główna akcja gospodarza to Szybka seria w dolnym pasku, gość ma tam podpowiedź", () => {
  const host = lobby(2);
  expect(host).toContain("sticky bottom-0");
  expect(host).toMatch(/btn-primary[^>]*>.*Szybka seria/);
  const guest = lobby(2, "p2");
  expect(guest).not.toContain("Szybka seria");
  expect(guest).not.toContain("Turniej");
  expect(guest).toContain("Gracz 1 wybiera grę. Dotknij tej, w którą chcesz zagrać.");
});

test("lobby od dwóch osób: gracze to awatary, kolory są zwinięte pod własnym", () => {
  const html = lobby(3);
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('role="radiogroup"');
  expect(html).toContain('aria-label="Gospodarz"');
});

test("lobby: gospodarz może dotknąć cudzego awatara, żeby wyrzucić, gość nie", () => {
  expect(lobby(3)).toContain('aria-label="Gracz 2, wyrzuć z pokoju"');
  expect(lobby(3)).not.toContain('aria-label="Gracz 1, wyrzuć z pokoju"');
  expect(lobby(3, "p2")).not.toContain("wyrzuć z pokoju");
});

test("lobby: „Zaproś” jest tylko przy wolnym miejscu, sam w pokoju zostaje duży kod z kolorami", () => {
  expect(lobby(5)).toContain("Zaproś");
  expect(lobby(6)).not.toContain("Zaproś");
  const alone = lobby(1);
  expect(alone).not.toContain("Zaproś");
  expect(alone).toContain('role="radiogroup"');
  expect(alone).toContain("Podaj kod znajomym");
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

const tournament = (must: string[] = [], skip: string[] = []) => {
  const view: RoomView = {
    code: "ABCD", hostId: "p1", phase: "lobby", solo: false, gameId: null, mode: null,
    players: [{ id: "p1", nick: "Ola", color: PLAYER_COLORS[0], connected: true, ready: false }],
    seats: ["p1"], tournament: { config: { length: 8, must, skip }, games: [], index: 0, points: [], extra: false },
    markedBy: Object.fromEntries(must.map((id) => [id, "p1"])), scores: {}, game: null, wishes: {}, vote: null,
    evening: { games: 0, played: [], table: [], titles: [] },
  };
  return renderToStaticMarkup(createElement(TournamentSetup, { view, me: "p1", dropped: false, send: () => {}, onLeave: () => {} }));
};

test("mini-gry: każda gra stoi w dokładnie jednej grupie", () => {
  const ids = SECTIONS.flatMap(([, list]) => list);
  expect([...ids].sort()).toEqual([...MINI_GAME_IDS].sort());
});

test("mini-gry: kafel ma podpis tylko przy rozegranej grze", () => {
  const html = renderToStaticMarkup(createElement(MiniGameGrid, { records: {}, nick: "Ola", onPick: () => {} }));
  expect(html).not.toContain("nie grane");
});

test("turniej: dotknięcie gry ustawia przełącznik zamiast liczenia dotknięć", () => {
  const html = tournament();
  expect(html).toContain("Na pewno");
  expect(html).toContain("Wyklucz");
  expect(html).not.toContain("trzeci raz");
});

test("turniej: czas pada raz, przy przycisku", () => {
  expect(tournament().match(/ok\. 12 min/g)).toHaveLength(1);
});

test("turniej: stan gry opisuje czytnikowi kafel, a sam kolor go nie niesie", () => {
  const html = tournament(["refleks"], ["balon"]);
  expect(html).toContain("Refleks: na pewno, zaznaczył(a) Ola");
  expect(html).toContain("Balon: bez");
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
const setupHtml = (gameId: string, { me = "p1", ready = [] as string[], seats = ["p1", "p2", "p3"] } = {}) => {
  const view: RoomView = {
    code: "ABCD", hostId: "p1", phase: "lobby", solo: false, gameId, mode: null,
    players: Array.from({ length: 3 }, (_, i) => ({ id: `p${i + 1}`, nick: `Gracz ${i + 1}`, color: PLAYER_COLORS[i], connected: true, ready: ready.includes(`p${i + 1}`) })),
    seats, tournament: null, markedBy: {}, scores: {}, game: null, wishes: {}, vote: null,
    evening: { games: 0, played: [], table: [], titles: [] },
  };
  return renderToStaticMarkup(createElement(Setup, { view, me, dropped: false, send: () => {}, onLeave: () => {} }));
};

test("15-03: Setup gry z kartą ma „Jak grać” za opisem", () => {
  const html = setupHtml("sabotaz");
  expect(html).toContain("Jak grać");
  expect(html.indexOf(BLURBS.sabotaz!)).toBeGreaterThan(-1);
  expect(html.indexOf(BLURBS.sabotaz!)).toBeLessThan(html.indexOf("Jak grać"));
});

test("ekran gry: nagłówek listy liczy gotowość gości, a podpis „Grają” jest tylko przy oglądających", () => {
  const html = setupHtml("podrobka", { ready: ["p2"] });
  expect(html).toContain("Gotowość 1/2");
  expect(html).not.toContain("W pokoju");
  expect(html).not.toContain("Grają");
  const split = setupHtml("podrobka", { seats: ["p1", "p2"] });
  expect(split).toContain("Grają");
  expect(split).toContain("Oglądają");
  expect(split).toContain("Gotowość 0/1");
  expect(setupHtml("podrobka", { seats: ["p1"] })).not.toContain("Gotowość");
});

test("ekran gry: gotowość to znak ✓ bez słowa, „czeka” zostaje słowem, gospodarz nie ma statusu", () => {
  const html = setupHtml("podrobka", { ready: ["p2"] });
  expect(html.match(/aria-label="gotowe"/g)).toHaveLength(1);
  expect(html).not.toContain(">gotowe<");
  expect(html.match(/>czeka</g)).toHaveLength(1);
});

test("ekran gry: bez kafli wokół opisu gry i listy graczy, tytuł jak w Turnieju", () => {
  const html = setupHtml("podrobka");
  expect(html).not.toContain('class="tile"');
  expect(html).toContain('class="text-3xl font-semibold tracking-tight');
});

test("ekran gry: po zgłoszeniu gotowości krótki status i osobne „Cofnij”", () => {
  const html = setupHtml("podrobka", { me: "p2", ready: ["p2"] });
  expect(html).toContain("Zgłoszone, czekamy na start");
  expect(html).toContain(">Cofnij<");
  expect(html).not.toContain("czekamy na Gracz");
});

test("ekran gry: tło wiersza w kolorze gracza tylko po zgłoszeniu gotowości", () => {
  const html = setupHtml("podrobka", { ready: ["p2"] });
  expect(html).toContain(`${PLAYER_COLORS[0]} 10%`); // gospodarz jest gotowy z definicji
  expect(html).toContain(`${PLAYER_COLORS[1]} 10%`);
  expect(html).not.toContain(`${PLAYER_COLORS[2]} 10%`);
});

test("ekran gry: korona stoi przy nicku, przed statusem", () => {
  const html = setupHtml("podrobka");
  expect(html.indexOf('aria-label="Gospodarz"')).toBeGreaterThan(-1);
  expect(html.indexOf('aria-label="Gospodarz"')).toBeLessThan(html.indexOf(">czeka<"));
});

test("ekran gry: podpowiedź o przenoszeniu graczy tylko, gdy ktoś ogląda", () => {
  expect(setupHtml("podrobka")).not.toContain("Dotknij gracza");
  expect(setupHtml("podrobka", { seats: ["p1", "p2"] })).toContain("Dotknij gracza");
  expect(setupHtml("podrobka", { seats: ["p1", "p2"], me: "p2" })).not.toContain("Dotknij gracza");
});

test("ekran gry: „Jak grać” leży przy opisie gry", () => {
  const html = setupHtml("sabotaz");
  expect(html.indexOf("Jak grać")).toBeLessThan(html.indexOf("</section>"));
});

test("ekran gry: kolory są zwinięte pod własną kropką, jak w lobby", () => {
  const html = setupHtml("podrobka");
  expect(html).not.toContain(">Twój kolor<");
  expect(html).not.toContain('role="radiogroup" aria-label="Twój kolor"');
  expect(html.match(/zmień kolor/g)).toHaveLength(1);
  expect(lobby(2)).not.toContain(">Twój kolor<");
});

test("ekran gry: przycisk gościa to „Zgłaszam gotowość” bez nazwy gry", () => {
  const html = setupHtml("podrobka", { me: "p2" });
  expect(html).toContain(">Zgłaszam gotowość<");
});

test("opisy gier z kartą nie powtarzają punktacji z „Jak grać”", () => {
  for (const id of ["podrobka", "wyprawa", "sabotaz"]) expect(BLURBS[id]).not.toMatch(/punkt|rund|\d+ wypraw/i);
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
