import { describe, expect, test } from "vitest";
import { createRng, normalize, type MoveContext } from "./core.ts";
import { WORDS } from "./kalambury-dane.ts";
import {
  ANSWER_MAX,
  DRAWER_POINTS,
  ERASER,
  GUESS_POINTS,
  HALF_SECONDS,
  INKS,
  kalambury as game,
  MAX_GUESSES,
  MAX_POINTS,
  type Move,
  type State,
  type View,
} from "./kalambury.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - rysuje się po kolei (players[r % n]), Krótka: każdy raz, Długa: każdy dwa razy,
// - rysujący wybiera 1 z 3 haseł, hasła w partii się nie powtarzają,
// - kreski: pary x, y w 0-1000, do 200 liczb w ruchu, najwyżej 2000 punktów na rysunek, cofnij i wyczyść,
// - kreska ma kolor z palety 5 kolorów i gumki, ustalany na jej początku; „wyczyść” da się cofnąć,
// - rysowanie ma dwie połowy po 40 s; po pierwszej odsłania się jedna litera hasła,
// - hint akceptuje tylko zaufane źródło timeout, nigdy klient ani source z treści ruchu,
// - zgadujący piszą hasła; porównanie bez wielkości liter i polskich znaków, pudła widać na czacie, trafień nie,
// - punkty: 10, 8, 6, 5, 4 według kolejności trafień, rysujący 3 za każdego, kto zgadł,
// - hasło zna tylko rysujący aż do odsłony; obserwator dostaje tylko długość,
// - ranking po sumie punktów, remis na górze bez zwycięzcy.

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";

const choose = (index = 0): Move => ({ type: "choose", index });
const line = (points: number[], start = true, color = 0): Move => ({ type: "line", points, start, color });
/** Kreska w stanie: kolor i punkty. */
const ink = (points: number[], color = 0) => ({ color, points });
const guess = (text: string): Move => ({ type: "guess", text });
const pass: Move = { type: "pass" };
const next: Move = { type: "next" };
const hint: Move = { type: "hint" };
const undo: Move = { type: "undo" };
const clear: Move = { type: "clear" };

function send(s: State, player: string, move: Move, context?: MoveContext): State {
  expect(game.validateMove(s, player, move, context), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

const view = (s: State, p: string) => game.playerView(s, p) as View;
const drawer = (s: State) => view(s, "").drawer;
/** Hasło rundy z widoku rysującego. */
const word = (s: State) => view(s, drawer(s)).word;

/** Setup i wybór pierwszego hasła. */
function drawing(players: string[], mode?: string, seed = 1): State {
  const s = game.setup(players, createRng(seed), mode);
  return send(s, drawer(s), choose());
}

/** Druga połowa rysowania: serwer odsłania literę po limicie pierwszej połowy. */
const secondHalf = (s: State) => send(s, drawer(s), hint, { source: "timeout" });

/** Kto jeszcze zgaduje, pasuje: runda się kończy (po trafieniach wszystkich już jest skończona). */
function endRound(s: State): State {
  if (s.phase !== "draw") return s;
  if (game.waitingFor(s).includes(drawer(s))) s = secondHalf(s);
  for (const p of game.waitingFor(s)) s = send(s, p, pass);
  return s;
}

/** Cała runda: wybór, trafienia w podanej kolejności, reszta pasuje, potem wszyscy „Dalej” (jeśli to nie koniec). */
function round(s: State, hits: string[] = []): State {
  s = send(s, drawer(s), choose());
  const w = word(s);
  for (const p of hits) s = send(s, p, guess(w));
  s = endRound(s);
  if (s.phase === "reveal") for (const p of s.players) s = send(s, p, next);
  return s;
}

describe("definicja", () => {
  test("2-6 graczy, dwa tryby, Krótka domyślna, limit zależny od fazy", () => {
    expect(game.minPlayers).toBe(2);
    expect(game.maxPlayers).toBe(6);
    expect(game.modes!.map((m) => m.id)).toEqual(["krotka", "dluga"]);
    expect(game.modes!.find((m) => m.default)!.id).toBe("krotka");
    expect(game.turn).toBeDefined();
  });

  test("lista haseł: bez powtórek (także po normalize), jedno słowo, do 30 znaków, wystarczy na najdłuższą partię", () => {
    expect(new Set(WORDS.map(normalize)).size).toBe(WORDS.length);
    for (const w of WORDS) {
      expect(w, w).toMatch(/^\p{L}+$/u);
      expect(w.length, w).toBeLessThanOrEqual(ANSWER_MAX);
    }
    expect(WORDS.length).toBeGreaterThanOrEqual(200);
  });
});

describe("setup", () => {
  test("świeża gra: wybór hasła, rysuje pierwszy gracz, czekamy na niego", () => {
    const s = game.setup([A, B, C], createRng(1));
    expect(game.isOver(s)).toBeNull();
    expect(s.phase).toBe("choose");
    expect(drawer(s)).toBe(A);
    expect(game.waitingFor(s)).toEqual([A]);
    expect(game.turn!(s)).toEqual({ key: "choose:0", seconds: 15 });
  });

  test("rysujący dostaje 3 różne hasła z listy", () => {
    const s = game.setup([A, B], createRng(1));
    const { choices } = view(s, A);
    expect(choices).toHaveLength(3);
    expect(new Set(choices).size).toBe(3);
    for (const c of choices) expect(WORDS).toContain(c);
  });

  test("ten sam seed daje te same hasła, inny inne", () => {
    const words = (seed: number) => view(game.setup([A, B], createRng(seed)), A).choices;
    expect(words(1)).toEqual(words(1));
    expect(words(1)).not.toEqual(words(2));
  });

  test("hasła w całej partii się nie powtarzają (6 graczy, Długa)", () => {
    let s = game.setup([A, B, C, D, "e", "f"], createRng(3), "dluga");
    const all: string[] = [];
    while (s.phase !== "over") {
      all.push(...view(s, drawer(s)).choices);
      s = round(s);
    }
    expect(all).toHaveLength(12 * 3);
    expect(new Set(all).size).toBe(all.length);
  });

  test("nieznany tryb to Krótka", () => {
    let s = game.setup([A, B], createRng(1), "nie-ma");
    s = round(round(s));
    expect(s.phase).toBe("over");
  });
});

describe("kolejka rysujących", () => {
  test("Krótka: każdy rysuje raz, po kolei", () => {
    let s = game.setup([A, B, C], createRng(1), "krotka");
    const order: string[] = [];
    while (s.phase !== "over") {
      order.push(drawer(s));
      s = round(s);
    }
    expect(order).toEqual([A, B, C]);
  });

  test("Długa: każdy rysuje dwa razy, po kolei", () => {
    let s = game.setup([A, B], createRng(1), "dluga");
    const order: string[] = [];
    while (s.phase !== "over") {
      order.push(drawer(s));
      s = round(s);
    }
    expect(order).toEqual([A, B, A, B]);
  });
});

describe("wybór hasła", () => {
  test("wybrane hasło trafia do rysowania", () => {
    let s = game.setup([A, B], createRng(1));
    const { choices } = view(s, A);
    s = send(s, A, choose(2));
    expect(s.phase).toBe("draw");
    expect(word(s)).toBe(choices[2]);
    expect(game.turn!(s)).toEqual({ key: "draw:0:0", seconds: HALF_SECONDS });
    expect(game.waitingFor(s)).toEqual([A]);
  });

  test("wybiera tylko rysujący, indeks 0-2, tylko w fazie wyboru", () => {
    const s = game.setup([A, B], createRng(1));
    expect(game.validateMove(s, B, choose())).toBe(false);
    expect(game.validateMove(s, A, choose(3))).toBe(false);
    expect(game.validateMove(s, A, choose(-1))).toBe(false);
    expect(game.validateMove(s, A, guess("kot"))).toBe(false);
    expect(game.validateMove(s, A, line([1, 1]))).toBe(false);
    expect(game.validateMove(send(s, A, choose()), A, choose())).toBe(false);
  });

  test("limit czasu: pierwsze hasło", () => {
    const s = game.setup([A, B], createRng(1));
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(move).toEqual(choose(0));
    expect(game.validateMove(s, A, move)).toBe(true);
  });
});

describe("rysowanie", () => {
  test("kreska trafia do rysunku, start zaczyna nową, reszta dokleja", () => {
    let s = drawing([A, B]);
    s = send(s, A, line([0, 0, 10, 10]));
    s = send(s, A, line([20, 20], false));
    s = send(s, A, line([500, 500, 1000, 1000]));
    expect(view(s, B).strokes).toEqual([ink([0, 0, 10, 10, 20, 20]), ink([500, 500, 1000, 1000])]);
  });

  test("paleta: 5 kolorów i gumka jako ostatni", () => {
    expect(INKS).toBe(6);
    expect(ERASER).toBe(INKS - 1);
  });

  test("kolor: 0 i 5 (gumka) przechodzą, -1 i 6 nie", () => {
    const s = drawing([A, B]);
    expect(game.validateMove(s, A, line([1, 1], true, 0))).toBe(true);
    expect(game.validateMove(s, A, line([1, 1], true, ERASER))).toBe(true);
    expect(game.validateMove(s, A, line([1, 1], true, -1))).toBe(false);
    expect(game.validateMove(s, A, line([1, 1], true, INKS))).toBe(false);
  });

  test("kolor ustala początek kreski, doklejone punkty go nie zmieniają", () => {
    let s = drawing([A, B]);
    s = send(s, A, line([1, 1], true, 3));
    s = send(s, A, line([2, 2], false, 1));
    s = send(s, A, line([5, 5], true, ERASER));
    expect(view(s, B).strokes).toEqual([ink([1, 1, 2, 2], 3), ink([5, 5], ERASER)]);
  });

  test("gumka wlicza się do limitu punktów i cofa się jak zwykła kreska", () => {
    let s = drawing([A, B]);
    const batch = Array.from({ length: 200 }, (_, i) => i);
    for (let i = 0; i < MAX_POINTS / 100; i++) s = send(s, A, line(batch, true, ERASER));
    expect(game.validateMove(s, A, line([1, 1]))).toBe(false);
    s = send(s, A, { type: "undo" });
    expect(view(s, B).strokes).toHaveLength(MAX_POINTS / 100 - 1);
  });

  test("rysuje tylko rysujący i tylko w fazie rysowania", () => {
    const s = drawing([A, B, C]);
    expect(game.validateMove(s, B, line([1, 1]))).toBe(false);
    expect(game.validateMove(s, "obcy", line([1, 1]))).toBe(false);
    expect(game.validateMove(endRound(s), A, line([1, 1]))).toBe(false);
  });

  test("punkty: 0 i 1000 przechodzą, -1 i 1001 nie, liczby całkowite, parzysta długość", () => {
    const s = drawing([A, B]);
    expect(game.validateMove(s, A, line([0, 1000]))).toBe(true);
    expect(game.validateMove(s, A, line([-1, 5]))).toBe(false);
    expect(game.validateMove(s, A, line([5, 1001]))).toBe(false);
    expect(game.validateMove(s, A, line([1, 2, 3]))).toBe(false);
    expect(game.validateMove(s, A, line([]))).toBe(false);
  });

  test("dokładanie bez rozpoczętej kreski odpada", () => {
    const s = drawing([A, B]);
    expect(game.validateMove(s, A, line([1, 1], false))).toBe(false);
  });

  test("rysunek ma najwyżej 2000 punktów", () => {
    let s = drawing([A, B]);
    const batch = Array.from({ length: 200 }, (_, i) => i);
    for (let i = 0; i < MAX_POINTS / 100; i++) s = send(s, A, line(batch));
    expect(view(s, A).strokes.flatMap((k) => k.points)).toHaveLength(MAX_POINTS * 2);
    expect(game.validateMove(s, A, line([1, 1]))).toBe(false);
    expect(game.validateMove(s, A, line([1, 1], false))).toBe(false);
  });

  test("cofnij usuwa ostatnią kreskę, wyczyść cały rysunek", () => {
    let s = drawing([A, B]);
    expect(game.validateMove(s, A, { type: "undo" })).toBe(false);
    s = send(s, A, line([1, 1]));
    s = send(s, A, line([2, 2]));
    s = send(s, A, { type: "undo" });
    expect(view(s, B).strokes).toEqual([ink([1, 1])]);
    s = send(s, A, { type: "clear" });
    expect(view(s, B).strokes).toEqual([]);
    expect(game.validateMove(s, B, { type: "clear" })).toBe(false);
  });

  test("wyczyść da się cofnąć", () => {
    let s = drawing([A, B]);
    s = send(s, A, line([1, 1]));
    s = send(s, A, line([2, 2], true, 2));
    s = send(s, A, clear);
    expect(view(s, B).strokes).toEqual([]);
    s = send(s, A, undo);
    expect(view(s, B).strokes).toEqual([ink([1, 1]), ink([2, 2], 2)]);
  });

  test("po wyczyść i nowej kresce cofnij najpierw usuwa kreskę, potem przywraca rysunek", () => {
    let s = drawing([A, B]);
    s = send(s, A, line([1, 1]));
    s = send(s, A, clear);
    s = send(s, A, line([9, 9]));
    s = send(s, A, undo);
    expect(view(s, B).strokes).toEqual([]);
    s = send(s, A, undo);
    expect(view(s, B).strokes).toEqual([ink([1, 1])]);
    expect(game.validateMove(s, A, undo)).toBe(true);
    s = send(s, A, undo);
    expect(game.validateMove(s, A, undo)).toBe(false);
  });

  test("wyczyść pustego rysunku odpada (nie nadpisuje odłożonego)", () => {
    let s = drawing([A, B]);
    expect(game.validateMove(s, A, clear)).toBe(false);
    s = send(s, A, line([1, 1]));
    s = send(s, A, clear);
    expect(game.validateMove(s, A, clear)).toBe(false);
  });

  test("odłożony rysunek zna tylko rysujący", () => {
    let s = drawing([A, B]);
    s = send(s, A, line([1, 1]));
    s = send(s, A, clear);
    expect(view(s, A).cleared).toEqual([ink([1, 1])]);
    expect(view(s, B).cleared).toEqual([]);
    expect(view(s, "").cleared).toEqual([]);
  });

  test("nowa runda nie przywraca rysunku z poprzedniej", () => {
    let s = drawing([A, B], "dluga");
    s = send(s, A, line([1, 1]));
    s = send(s, A, clear);
    s = endRound(s);
    for (const p of s.players) s = send(s, p, next);
    s = send(s, B, choose());
    expect(game.validateMove(s, B, undo)).toBe(false);
  });

  test("nowa runda zaczyna od czystego rysunku", () => {
    let s = drawing([A, B]);
    s = send(s, A, line([1, 1]));
    s = endRound(s);
    for (const p of s.players) s = send(s, p, next);
    expect(view(s, "").strokes).toEqual([]);
  });
});

describe("zgadywanie", () => {
  test("trafienie bez wielkości liter, polskich znaków i nadmiarowych spacji", () => {
    let s = drawing([A, B]);
    const w = word(s);
    const mangled = `  ${w.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/Ł/g, "L")}  `;
    s = send(s, B, guess(mangled));
    expect(view(s, "").guessed).toEqual([B]);
  });

  test("pudło trafia do czatu, trafienie nie", () => {
    let s = drawing([A, B, C]);
    s = send(s, B, guess("zzz"));
    s = send(s, C, guess(word(s)));
    expect(view(s, B).chat).toEqual([{ player: B, text: "zzz" }]);
    expect(view(s, B).guessed).toEqual([C]);
    expect(JSON.stringify(view(s, B))).not.toContain(`"${word(s)}"`);
  });

  test("kto zgadł albo spasował, nie strzela dalej", () => {
    let t = drawing([A, B, C, D]);
    t = send(t, B, guess(word(t)));
    t = send(t, C, pass);
    expect(game.validateMove(t, B, guess("zzz"))).toBe(false);
    expect(game.validateMove(t, B, pass)).toBe(false);
    expect(game.validateMove(t, C, guess("zzz"))).toBe(false);
    expect(game.waitingFor(secondHalf(t))).toEqual([D]);
  });

  test("rysujący nie zgaduje ani nie pasuje", () => {
    const s = drawing([A, B]);
    expect(game.validateMove(s, A, guess(word(s)))).toBe(false);
    expect(game.validateMove(s, A, pass)).toBe(false);
  });

  test("strzał: pusty po obcięciu spacji odpada, do 30 znaków", () => {
    const s = drawing([A, B]);
    expect(game.validateMove(s, B, guess("   "))).toBe(false);
    expect(game.validateMove(s, B, guess("x".repeat(ANSWER_MAX)))).toBe(true);
    expect(game.moveSchema.safeParse(guess("x".repeat(ANSWER_MAX + 1))).success).toBe(false);
  });

  test("najwyżej 30 pudeł na gracza w rundzie", () => {
    let s = drawing([A, B]);
    for (let i = 0; i < MAX_GUESSES; i++) s = send(s, B, guess(`zzz${i}`));
    expect(game.validateMove(s, B, guess("zzz"))).toBe(false);
    expect(game.validateMove(s, B, guess(word(s)))).toBe(false);
    expect(game.validateMove(s, B, pass)).toBe(true);
  });

  test("zgadywać można tylko w fazie rysowania", () => {
    const s = game.setup([A, B], createRng(1));
    expect(game.validateMove(s, B, guess("kot"))).toBe(false);
    expect(game.validateMove(s, B, pass)).toBe(false);
  });

  test("runda kończy się, gdy wszyscy zgadujący zgadli", () => {
    let s = drawing([A, B, C]);
    s = send(s, B, guess(word(s)));
    expect(s.phase).toBe("draw");
    s = send(s, C, guess(word(s)));
    expect(s.phase).toBe("reveal");
    expect(game.turn!(s)).toEqual({ key: "reveal:0", seconds: 6 });
  });

  test("limit czasu w drugiej połowie: pas za każdego, kto nie zgadł", () => {
    let s = drawing([A, B, C]);
    s = send(s, B, guess(word(s)));
    s = secondHalf(s);
    expect(game.waitingFor(s)).toEqual([C]);
    const move = game.timeoutMove!(s, C, createRng(1));
    expect(move).toEqual(pass);
    expect(game.validateMove(s, C, move)).toBe(true);
  });
});

describe("punkty", () => {
  test("zgadujący 10, 8, 6, 5, 4 według kolejności, rysujący 3 za każdego", () => {
    expect(GUESS_POINTS).toEqual([10, 8, 6, 5, 4]);
    expect(DRAWER_POINTS).toBe(3);
    const players = [A, B, C, D, "e", "f"];
    let s = drawing(players);
    for (const p of [D, B, "f", C, "e"]) s = send(s, p, guess(word(s)));
    const { roundScores, totals } = view(s, "");
    expect(roundScores).toEqual({ [A]: 15, [B]: 8, [C]: 5, [D]: 10, e: 4, f: 6 });
    expect(totals).toEqual(roundScores);
  });

  test("nikt nie zgadł: zero dla wszystkich, także rysującego", () => {
    const s = endRound(drawing([A, B, C]));
    expect(view(s, "").roundScores).toEqual({ [A]: 0, [B]: 0, [C]: 0 });
  });

  test("punkty sumują się przez rundy", () => {
    let s = game.setup([A, B], createRng(1), "dluga");
    s = round(s, [B]); // A rysuje: A 3, B 10
    s = round(s, [A]); // B rysuje: B 3, A 10
    s = round(s, []);
    expect(view(s, "").totals).toEqual({ [A]: 13, [B]: 13 });
  });
});

describe("odsłona", () => {
  test("hasło jawne dla wszystkich, następna runda po „Dalej” od wszystkich", () => {
    let s = endRound(drawing([A, B, C]));
    const w = word(s);
    expect(view(s, B).word).toBe(w);
    expect(view(s, "").word).toBe(w);
    s = send(s, A, next);
    expect(game.waitingFor(s)).toEqual([B, C]);
    expect(game.validateMove(s, A, next)).toBe(false);
    s = send(s, B, next);
    s = send(s, C, next);
    expect(s.phase).toBe("choose");
    expect(drawer(s)).toBe(B);
    expect(game.turn!(s).key).toBe("choose:1");
  });

  test("limit czasu w odsłonie: „Dalej”", () => {
    const s = endRound(drawing([A, B]));
    const move = game.timeoutMove!(s, B, createRng(1));
    expect(move).toEqual(next);
    expect(game.validateMove(s, B, move)).toBe(true);
  });

  test("po ostatniej rundzie od razu koniec, hasło i rysunek zostają", () => {
    let s = round(game.setup([A, B], createRng(1)));
    s = send(s, B, choose());
    s = send(s, B, line([1, 1]));
    const w = word(s);
    s = endRound(s);
    expect(s.phase).toBe("over");
    expect(view(s, "").word).toBe(w);
    expect(view(s, "").strokes).toEqual([ink([1, 1])]);
    expect(game.waitingFor(s)).toEqual([]);
    expect(game.turn!(s).seconds).toBe(0);
  });
});

describe("połowy rysowania", () => {
  test("pierwsza połowa: limit 40 s rysującego, zgadywać i pasować już można", () => {
    let s = drawing([A, B, C]);
    expect(HALF_SECONDS).toBe(40);
    expect(game.waitingFor(s)).toEqual([A]);
    s = send(s, B, guess("zzz"));
    s = send(s, C, pass);
    expect(view(s, "").chat).toHaveLength(1);
  });

  test("po limicie pierwszej połowy serwer odsłania jedną literę hasła", () => {
    let s = drawing([A, B, C]);
    const before = JSON.stringify(s);
    expect(game.turn!(s)).toEqual({ key: "draw:0:0", seconds: HALF_SECONDS });
    const move = game.timeoutMove!(s, A, createRng(1));
    expect(move).toEqual(hint);
    const firstHalf = s;
    s = send(s, A, move, { source: "timeout" });
    expect(JSON.stringify(firstHalf)).toBe(before);
    expect(s.half).toBe(1);
    expect(game.turn!(s)).toEqual({ key: "draw:0:1", seconds: HALF_SECONDS });
    expect(game.waitingFor(s)).toEqual([B, C]);
    const w = word(s);
    const h = view(s, B).hint;
    expect(h).toHaveLength(w.length);
    const shown = [...h].map((c, i) => [c, i] as const).filter(([c]) => c !== "_");
    expect(shown).toHaveLength(1);
    expect(shown[0][0]).toBe(w[shown[0][1]]);
    expect(view(s, A).word).toBe(w);
  });

  test("klient nie może odsłonić litery, także rysujący i przy domyślnym kontekście", () => {
    const s = drawing([A, B]);
    for (const p of [A, B, "obcy", ""]) {
      expect(game.validateMove(s, p, hint)).toBe(false);
      expect(game.validateMove(s, p, hint, { source: "client" })).toBe(false);
    }
  });

  test("source w JSON ruchu nie daje uprawnień serwerowego timeoutu", () => {
    const s = drawing([A, B]);
    const forged = { type: "hint" as const, source: "timeout", context: { source: "timeout" } };
    expect(game.validateMove(s, A, forged)).toBe(false);
    const parsed = game.moveSchema.parse(forged);
    expect(parsed).toEqual(hint);
    expect(game.validateMove(s, A, parsed)).toBe(false);
    expect(game.validateMove(s, A, parsed, { source: "client" })).toBe(false);
  });

  test("timeout odsłania literę tylko za rysującego w pierwszej połowie rysowania", () => {
    const s = drawing([A, B]);
    expect(game.validateMove(s, A, hint, { source: "timeout" })).toBe(true);
    for (const p of [B, "obcy", ""]) expect(game.validateMove(s, p, hint, { source: "timeout" })).toBe(false);
    const second = secondHalf(s);
    expect(game.validateMove(second, A, hint, { source: "timeout" })).toBe(false);
    expect(second.half).toBe(1);
    expect(second.revealed).toHaveLength(1);
    for (const state of [game.setup([A, B], createRng(1)), endRound(s), round(round(game.setup([A, B], createRng(1))))]) {
      expect(game.validateMove(state, state.drawer, hint, { source: "timeout" }), state.phase).toBe(false);
    }
  });

  test("kreski i strzały nie zmieniają połowy, odsłoniętej litery ani klucza limitu", () => {
    let s = drawing([A, B, C]);
    s = send(s, A, line([1, 1]));
    s = send(s, B, guess("zzz"));
    expect(s.half).toBe(0);
    expect(s.revealed).toEqual([]);
    expect(game.turn!(s).key).toBe("draw:0:0");
    s = secondHalf(s);
    const revealed = [...s.revealed];
    s = send(s, A, line([2, 2]));
    s = send(s, B, guess("zzz"));
    expect(s.half).toBe(1);
    expect(s.revealed).toEqual(revealed);
    expect(game.turn!(s).key).toBe("draw:0:1");
  });

  test("runda może skończyć się już w pierwszej połowie", () => {
    let s = drawing([A, B]);
    s = send(s, B, guess(word(s)));
    expect(s.phase).toBe("reveal");
  });

  test("nowa runda zaczyna od pierwszej połowy i bez odsłoniętych liter", () => {
    let s = endRound(drawing([A, B]));
    for (const p of s.players) s = send(s, p, next);
    s = send(s, B, choose());
    expect(game.turn!(s).key).toBe("draw:1:0");
    expect(view(s, A).hint).toMatch(/^_+$/);
  });
});

describe("ukrywanie hasła", () => {
  test("w wyborze hasła widzi tylko rysujący", () => {
    const s = game.setup([A, B], createRng(1));
    const choices = view(s, A).choices;
    for (const p of [B, ""]) {
      expect(view(s, p).choices).toEqual([]);
      for (const c of choices) expect(JSON.stringify(view(s, p))).not.toContain(`"${c}"`);
    }
  });

  test("w rysowaniu hasło zna tylko rysujący, reszta dostaje długość", () => {
    const s = drawing([A, B]);
    const w = word(s);
    for (const p of [B, ""]) {
      const v = view(s, p);
      expect(v.word).toBe("");
      expect(v.hint).toBe("_".repeat(w.length));
      expect(JSON.stringify(v)).not.toContain(`"${w}"`);
    }
  });

  test("lista haseł przyszłych rund nigdy nie trafia do widoku", () => {
    const start = game.setup([A, B, C], createRng(1));
    const later: string[] = [];
    for (let u = round(start); u.phase !== "over"; u = round(u)) later.push(...view(u, drawer(u)).choices);
    expect(later).toHaveLength(6);
    const chosen = send(start, A, choose());
    for (const s of [start, chosen, endRound(chosen)]) {
      for (const p of [A, B, C, ""]) {
        const json = JSON.stringify(view(s, p));
        for (const w of later) expect(json, `${s.phase} ${p}`).not.toContain(`"${w}"`);
      }
    }
  });
});

describe("koniec gry", () => {
  test("wygrywa najwięcej punktów (każdy z graczy może wygrać)", () => {
    // A rysuje, B zgaduje: A 3, B 10; B rysuje, A pasuje: B wygrywa.
    let s = game.setup([A, B], createRng(1));
    s = round(round(s, [B]), []);
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
    // A rysuje, B pasuje; B rysuje, A zgaduje: A wygrywa.
    let t = game.setup([A, B], createRng(1));
    t = round(round(t, []), [A]);
    expect(game.isOver(t)?.winner).toBe(A);
  });

  test("remis na górze: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = round(round(s, [B]), [A]);
    const result = game.isOver(s)!;
    expect(result.winner).toBeUndefined();
    expect([...result.ranking!].sort()).toEqual([A, B]);
  });

  test("ranking w kolejności punktów", () => {
    let s = game.setup([A, B, C], createRng(1));
    s = round(s, [C, B]); // A 6, C 10, B 8
    s = round(s, []);
    s = round(s, []);
    expect(game.isOver(s)?.ranking).toEqual([C, B, A]);
  });

  test("po końcu nikt nic nie może", () => {
    const s = round(round(game.setup([A, B], createRng(1))));
    for (const m of [choose(), line([1, 1]), guess("kot"), pass, next, undo, hint]) {
      for (const p of [A, B]) expect(game.validateMove(s, p, m)).toBe(false);
    }
  });
});

describe("schemat i stan", () => {
  test("moveSchema odrzuca śmieci z sieci", () => {
    const bad = [
      {},
      { type: "line" },
      { type: "line", points: [1.5, 2], start: true, color: 0 },
      { type: "line", points: ["1", "2"], start: true, color: 0 },
      { type: "line", points: Array.from({ length: 202 }, () => 1), start: true, color: 0 },
      { type: "line", points: [1, 2], start: true },
      { type: "line", points: [1, 2], start: true, color: 1.5 },
      { type: "choose", index: 0.5 },
      { type: "guess", text: 5 },
      { type: "nie-ma" },
    ];
    for (const m of bad) expect(game.moveSchema.safeParse(m).success, JSON.stringify(m)).toBe(false);
    expect(game.moveSchema.safeParse(line(Array.from({ length: 200 }, () => 1))).success).toBe(true);
  });

  test("gracz spoza gry nic nie może", () => {
    const s = drawing([A, B]);
    for (const m of [choose(), line([1, 1]), guess("kot"), pass, next]) expect(game.validateMove(s, "obcy", m)).toBe(false);
  });

  test("applyMove nie zmienia poprzedniego stanu, stan przeżywa JSON", () => {
    const s = drawing([A, B]);
    const before = JSON.stringify(s);
    send(s, A, line([1, 1]));
    send(s, B, guess("zzz"));
    send(s, B, guess(word(s)));
    expect(JSON.stringify(s)).toBe(before);
    expect(JSON.parse(before)).toEqual(s);
  });
});

describe("P4-030: luki F4 Kalamburów", () => {
  test("F4-040: różne seedy dają różny nonce rewanżu", () => {
    expect(game.setup([A, B], createRng(1)).nonce).not.toBe(game.setup([A, B], createRng(2)).nonce);
  });

  test("F4-011: kreska, pudło i pas w tej samej połowie nie odnawiają klucza tury", () => {
    let s = drawing([A, B, C]);
    const key = game.turn!(s).key;
    s = send(s, A, line([0, 0, 10, 10]));
    expect(game.turn!(s).key).toBe(key);
    s = send(s, B, guess("zzzzzz"));
    expect(game.turn!(s).key).toBe(key);
    s = send(s, B, pass);
    expect(s.phase).toBe("draw");
    expect(game.turn!(s).key).toBe(key);
  });
});
