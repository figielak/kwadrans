import { createRng, GAMES, type KropkiIKreskiView, type LobbyPlayer } from "@kwadrans/games";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { edgeName, freePick, KropkiIKreskiScreen, tap } from "./KropkiIKreski.tsx";

// Testy napisane przed ekranem. Widoki pochodzą z prawdziwego playerView po legalnych ruchach (D-02, D-03):
// - plansza ma (n+1)² kropek, wszystkie kreski jako przyciski i wszystkie kwadraty, dla 3×3 i 7×7,
// - wolna kreska to przycisk z nazwą kropek („Kreska A1-B1”), zajęta i cudza tura są wyłączone, obserwator nie ma aktywnych kresek,
// - bez wyboru przycisk mówi „Wybierz kreskę” i jest wyłączony; wybór pokazuje podgląd i „Postaw kreskę A1-B1”,
// - tap: pierwsze dotknięcie wybiera, drugie w tym samym miejscu wysyła, inne miejsce zmienia wybór,
// - wybór znika, gdy kreska jest zajęta albo gracz nie ma ruchu,
// - po własnym kwadracie komunikat o następnej kresce, czekający widzi, kto się zastanawia, po końcu nie ma komunikatu ani przycisku,
// - licznik kwadratów przy 2 i 4 osobach, kwadrat ma inicjał właściciela,
// - stan zastany nie ma klas animacji; ekran nie wibruje i nie ma em-dashy.

const A = "p1";
const B = "p2";
const C = "p3";
const D = "p4";
const game = GAMES["kropki-i-kreski"];
const lobby = (id: string, nick: string, color: string): LobbyPlayer => ({ id, nick, color, connected: true, ready: false });
const PLAYERS = [lobby(A, "Ania", "#3b9eff"), lobby(B, "Bartek", "#ffc53d"), lobby(C, "Celina", "#46a758"), lobby(D, "Darek", "#8e7cff")];

type S = unknown;
const setup = (ids: string[], mode: string) => game.setup(ids, createRng(1), mode) as S;
const view = (s: S, me = "") => game.playerView(s, me) as KropkiIKreskiView;
const draw = (s: S, edges: number[]) =>
  edges.reduce<S>((state, edge) => {
    const who = game.waitingFor(state)[0];
    expect(game.validateMove(state, who, { edge })).toBe(true);
    return game.applyMove(state, who, { edge }, createRng(1)) as S;
  }, s);

function render(v: KropkiIKreskiView, opts: { canMove?: boolean; picked?: number | null; players?: LobbyPlayer[] } = {}) {
  return renderToStaticMarkup(
    <KropkiIKreskiScreen view={v} players={opts.players ?? PLAYERS} canMove={opts.canMove ?? true} picked={opts.picked ?? null} onTap={vi.fn()} onSend={vi.fn()} />,
  );
}
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;
const button = (html: string, label: string) => html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0];

describe("plansza", () => {
  test.each([
    ["mala", 3, 24, 9],
    ["duza", 7, 112, 49],
  ])("tryb %s rysuje kropki, kreski i kwadraty", (mode, n, edges, boxes) => {
    const html = render(view(setup([A, B], mode), A));
    expect(count(html, /data-dot/g)).toBe((n + 1) ** 2);
    expect(count(html, /data-edge-button/g)).toBe(edges);
    expect(count(html, /data-box/g)).toBe(boxes);
  });

  test("nazwa kreski to nazwy jej kropek: kolumna literą, wiersz liczbą", () => {
    expect(edgeName(3, 0)).toBe("A1-B1");
    expect(edgeName(3, 3)).toBe("A2-B2");
    expect(edgeName(3, 12)).toBe("A1-A2");
    expect(edgeName(3, 23)).toBe("D3-D4");
  });

  test("wolna kreska to przycisk z nazwą, zajęta i cudza tura są wyłączone", () => {
    const state = draw(setup([A, B], "mala"), [0]);
    const mine = render(view(state, B));
    expect(button(mine, "Kreska A1-B1")).toContain(`disabled=""`);
    expect(button(mine, "Kreska B1-C1")).not.toContain(`disabled=""`);
    const theirs = render(view(state, A), { canMove: false });
    expect(button(theirs, "Kreska B1-C1")).toContain(`disabled=""`);
  });

  test("obserwator nie ma aktywnych kresek ani przycisku", () => {
    const html = render(view(setup([A, B], "mala"), ""), { canMove: false });
    expect(html).not.toMatch(/<button[^>]*data-edge-button(?![^>]*disabled)[^>]*>/);
    expect(html).not.toContain("Wybierz kreskę");
    expect(html).not.toContain("Postaw kreskę");
  });
});

describe("wybór i potwierdzenie", () => {
  test("bez wyboru przycisk mówi „Wybierz kreskę” i jest wyłączony", () => {
    const html = render(view(setup([A, B], "mala"), A));
    const bar = html.match(/<button[^>]*data-confirm[^>]*>[^<]*<\/button>/)![0];
    expect(bar).toContain("Wybierz kreskę");
    expect(bar).toContain(`disabled=""`);
  });

  test("wybór pokazuje podgląd na planszy i przycisk z nazwą", () => {
    const html = render(view(setup([A, B], "mala"), A), { picked: 0 });
    expect(html).toContain("Postaw kreskę A1-B1");
    expect(count(html, /data-preview/g)).toBe(1);
    const bar = html.match(/<button[^>]*data-confirm[^>]*>/)![0];
    expect(bar).not.toContain(`disabled=""`);
    expect(bar).toContain("#3b9eff");
  });

  test("tap: pierwsze dotknięcie wybiera, drugie w tym samym miejscu wysyła, inne zmienia wybór", () => {
    expect(tap(null, 4)).toEqual({ picked: 4, send: null });
    expect(tap(4, 4)).toEqual({ picked: null, send: 4 });
    expect(tap(4, 7)).toEqual({ picked: 7, send: null });
    expect(tap(4, 0)).toEqual({ picked: 0, send: null });
  });

  test("wybór znika, gdy kreska jest zajęta albo gracz nie ma ruchu", () => {
    const state = draw(setup([A, B], "mala"), [5]);
    const v = view(state, B);
    expect(freePick(v, true, 6)).toBe(6);
    expect(freePick(v, true, 5)).toBeNull();
    expect(freePick(v, false, 6)).toBeNull();
    expect(freePick(v, true, null)).toBeNull();
    expect(render(v, { picked: 5 })).not.toContain("Postaw kreskę");
    expect(render(v, { picked: 6, canMove: false })).not.toContain("data-preview");
  });
});

describe("komunikaty", () => {
  test("po własnym kwadracie pojawia się komunikat o następnej kresce", () => {
    const state = draw(setup([A, B], "mala"), [0, 3, 12, 13]);
    const html = render(view(state, B));
    expect(html).toMatch(/następn\S+ kresk/i);
    expect(render(view(draw(setup([A, B], "mala"), [0]), B))).not.toMatch(/następn\S+ kresk/i);
  });

  test("czekający widzi, kto się zastanawia", () => {
    const html = render(view(setup([A, B], "mala"), B), { canMove: false });
    expect(html).toContain("Ania się zastanawia");
    expect(html).not.toContain("data-confirm");
  });

  test("po końcu partii nie ma komunikatu ani przycisku", () => {
    let state = setup([A, B], "mala");
    while (!game.isOver(state)) {
      const who = game.waitingFor(state)[0];
      const move = game.timeoutMove!(state, who, createRng(2));
      state = game.applyMove(state, who, move, createRng(2)) as S;
    }
    for (const canMove of [true, false]) {
      const html = render(view(state, A), { canMove });
      expect(html).not.toContain("się zastanawia");
      expect(html).not.toContain("data-confirm");
      expect(html).not.toMatch(/następn\S+ kresk/i);
    }
  });
});

describe("licznik i kwadraty", () => {
  test("licznik pokazuje kwadraty każdego gracza przy 2 osobach", () => {
    const state = draw(setup([A, B], "mala"), [0, 3, 12, 13]);
    const html = render(view(state, A), { canMove: false });
    expect(html).toContain("Ania");
    expect(html).toContain("Bartek");
    expect(html).toMatch(/data-count="0"[^>]*>0</);
    expect(html).toMatch(/data-count="1"[^>]*>1</);
  });

  test("licznik ma wszystkie 4 osoby, a kwadrat ma inicjał właściciela", () => {
    const state = draw(setup([A, B, C, D], "mala"), [0, 3, 12, 13]);
    const html = render(view(state, A), { canMove: false });
    expect(count(html, /data-count=/g)).toBe(4);
    for (const nick of ["Ania", "Bartek", "Celina", "Darek"]) expect(html).toContain(nick);
    // kwadrat 0 zamknął Darek (czwarta kreska to jego ruch): jego inicjał leży w SVG, nie tylko kolor
    expect(html).toMatch(/data-box="0"[^>]*>[^]*?>D</);
  });
});

describe("licznik przy wielu graczach", () => {
  const counter = (html: string) => html.match(/<div class="grid gap-1.5"[^>]*>(.*?)<\/div><\/div><div class="rounded-inset/)![1];
  const LONG = [lobby(A, "Aleksandra-Maria", "#3b9eff"), lobby(B, "Bartłomiej-Jan", "#ffc53d"), lobby(C, "Celina-Zofia", "#46a758"), lobby(D, "Dominik-Piotr", "#8e7cff")];

  test("zawsze jeden rząd, przy 2 osobach nicki", () => {
    const html = render(view(setup([A, B], "mala"), A), { canMove: false, players: LONG });
    expect(html).toContain("grid-template-columns:repeat(2,");
    expect(counter(html)).toMatch(/>Aleksandra-Maria</);
  });

  test("przy 3-4 osobach inicjał zamiast nicku, pełny nick w etykiecie, żeby długie nicki nie ucinały się w 360 px", () => {
    for (const ids of [[A, B, C], [A, B, C, D]]) {
      const html = render(view(setup(ids, "mala"), A), { canMove: false, players: LONG });
      expect(html).toContain(`grid-template-columns:repeat(${ids.length},`);
      const row = counter(html);
      expect(row).not.toMatch(/>Aleksandra-Maria</);
      expect(row).toMatch(/>A</);
      expect(row).toContain('aria-label="Aleksandra-Maria: 0"');
    }
  });
});

describe("zasady ekranu", () => {
  test("stan zastany nie ma klas animacji", () => {
    const state = draw(setup([A, B], "mala"), [0, 3, 12, 13, 5]);
    expect(render(view(state, A), { canMove: false })).not.toContain("animate-");
  });

  const source = readFileSync(new URL("./KropkiIKreski.tsx", import.meta.url), "utf8");
  test("ekran nie wibruje sam i nie ma em-dashy", () => {
    expect(source).not.toContain("vibrate");
    expect(source).not.toContain("useHarm");
    expect(source).not.toContain("—");
  });
});
