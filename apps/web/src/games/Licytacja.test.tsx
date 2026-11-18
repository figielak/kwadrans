import { createRng, GAMES, type LicytacjaMove, type LicytacjaView, type LobbyPlayer } from "@kwadrans/games";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { currentDraft, draftKey, HandControls, LicytacjaBoard, moves, NextBar, options, signed, upward, verdict } from "./Licytacja.tsx";

// Testy ekranu na prawdziwych widokach z playerView po legalnych ruchach:
// - „Gotowe” bez wybranej karty jest nieaktywne, wybór buduje play ze stemplem z widoku, karta spoza ręki nie daje ruchu,
// - szkic żyje w kluczu nonce/runda/faza: nowa runda i rewanż go kasują, cudza gotowość nie,
// - ręka ma 15 miejsc, zagrane są wygaszone i nieaktywne, po przeładowaniu zatwierdzona karta wraca z myCard,
// - w wyborze nikt nie widzi cudzych kart, obserwator nie ma ręki ani akcji,
// - odsłona pokazuje karty wszystkich, zniesione pary i werdykt; „Dalej” ma stempel, po kliknięciu „Czekamy na”,
// - koniec ma punkty z miejscami i przebieg rund, bez „Dalej”,
// - liczby ze znakiem mają typograficzny minus, plik nie ma em-dashy i nie wibruje sam.

const A = "p1";
const B = "p2";
const C = "p3";
const game = GAMES.licytacja;
const lobby = (id: string, nick: string, color: string): LobbyPlayer => ({ id, nick, color, connected: true, ready: false });
const PLAYERS = [lobby(A, "Ania", "#3b9eff"), lobby(B, "Bartek", "#ffc53d"), lobby(C, "Celina", "#46a758")];
const NICK: Record<string, string> = { [A]: "Ania", [B]: "Bartek", [C]: "Celina" };
const nick = (id: string) => NICK[id] ?? "?";

type S = unknown;
const setup = (ids: string[] = [A, B, C], seed = 1) => game.setup(ids, createRng(seed)) as S;
const view = (s: S, me = "") => game.playerView(s, me) as LicytacjaView;
const apply = (s: S, player: string, move: LicytacjaMove) => {
  expect(game.validateMove(s, player, move), JSON.stringify(move)).toBe(true);
  return game.applyMove(s, player, move, createRng(1)) as S;
};
const stamp = (s: S) => ({ nonce: view(s).nonce, round: view(s).round });
const play = (s: S, player: string, card: number) => apply(s, player, { type: "play", card, ...stamp(s) });
const nextAll = (s: S) => game.waitingFor(s).reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), s);
const round = (s: S, cards: Record<string, number>) => Object.entries(cards).reduce((acc, [p, card]) => play(acc, p, card), s);

const board = (s: S, me: string, draft = {}, onMove = vi.fn()) =>
  renderToStaticMarkup(<LicytacjaBoard view={view(s, me)} me={me} players={PLAYERS} waitingFor={game.waitingFor(s)} onMove={onMove} draft={draft} onDraft={vi.fn()} />);

/** Wywołuje onClick przycisku z drzewa React bez DOM. */
function click(node: unknown, label: RegExp): boolean {
  if (!node || typeof node !== "object") return false;
  const el = node as { type?: unknown; props?: { children?: unknown; onClick?: () => void; disabled?: boolean } };
  if (el.type === "button" && el.props?.onClick && !el.props.disabled && label.test(text(el.props.children))) {
    el.props.onClick();
    return true;
  }
  if (typeof el.type === "function") return click((el.type as (p: unknown) => unknown)(el.props), label);
  const children = el.props?.children;
  return (Array.isArray(children) ? children : [children]).some((child) => click(child, label));
}
function text(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  return text((node as { props?: { children?: unknown } }).props?.children);
}

describe("pomocnicze", () => {
  test("signed: plus, typograficzny minus i zero", () => {
    expect(signed(7)).toBe("+7");
    expect(signed(-4)).toBe("−4");
    expect(signed(0)).toBe("0");
  });

  test("kierunek z najnowszej nagrody", () => {
    expect(upward([3])).toBe(true);
    expect(upward([3, -2])).toBe(false);
    expect(upward([-2, 3])).toBe(true);
  });

  test("werdykt: zwycięzca, przejście i przepadnięcie puli", () => {
    const base = { round: 1, pot: [3], plays: { [A]: 6, [B]: 6 }, cancelled: [6], value: 3 };
    expect(verdict({ ...base, winner: A }, nick, false)).toBe("Ania bierze +3.");
    expect(verdict({ ...base, winner: null }, nick, false)).toBe("Nikt nie bierze, pula +3 przechodzi dalej.");
    expect(verdict({ ...base, winner: null }, nick, true)).toBe("Nikt nie bierze, pula +3 przepada.");
  });
});

describe("wybór karty", () => {
  test("bez szkicu nie ma ruchu, szkic buduje play ze stemplem, karta spoza ręki odpada", () => {
    const s = setup();
    const v = view(s, A);
    expect(moves(v, A, {}).play).toBeNull();
    expect(moves(v, A, { card: 9 }).play).toEqual({ type: "play", card: 9, nonce: v.nonce, round: 1 });
    const later = view(nextAll(round(s, { [A]: 9, [B]: 2, [C]: 3 })), A);
    expect(moves(later, A, { card: 9 }).play).toBeNull();
    expect(moves(later, C, { card: 9 }).play).toEqual({ type: "play", card: 9, nonce: later.nonce, round: 2 });
  });

  test("szkic: cudza gotowość go nie kasuje, nowa runda i rewanż tak", () => {
    const s = setup();
    const stored = { key: draftKey(view(s, A)), draft: { card: 5 } };
    expect(currentDraft(stored, view(play(s, B, 4), A))).toEqual({ card: 5 });
    const next = nextAll(round(s, { [A]: 5, [B]: 4, [C]: 3 }));
    expect(currentDraft(stored, view(next, A))).toEqual({});
    expect(currentDraft(stored, view(setup([A, B, C], 2), A))).toEqual({});
  });

  test("opcje: gracz aktywny, po zatwierdzeniu karta wraca z widoku, obserwator bez miejsca", () => {
    const s = setup();
    expect(options(view(s, A), A, game.waitingFor(s))).toEqual({ seated: true, active: true, confirmed: null });
    const a = play(s, A, 11);
    expect(options(view(a, A), A, game.waitingFor(a))).toEqual({ seated: true, active: false, confirmed: 11 });
    expect(options(view(a, ""), "", game.waitingFor(a))).toEqual({ seated: false, active: false, confirmed: null });
  });

  test("ręka: 15 miejsc, zagrane wygaszone, Gotowe nieaktywne bez wyboru", () => {
    const s = nextAll(round(setup(), { [A]: 15, [B]: 2, [C]: 3 }));
    const v = view(s, A);
    const html = renderToStaticMarkup(<HandControls view={v} me={A} waitingFor={game.waitingFor(s)} color="#3b9eff" draft={{}} onDraft={vi.fn()} onMove={vi.fn()} />);
    expect(html.match(/data-card="/g)).toHaveLength(15);
    expect(html).toContain('aria-label="Karta 15, zagrana"');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Gotowe<\/button>/);
  });

  test("Gotowe wysyła wybraną kartę", () => {
    const s = setup();
    const onMove = vi.fn();
    const el = HandControls({ view: view(s, A), me: A, waitingFor: game.waitingFor(s), color: "#3b9eff", draft: { card: 7 }, onDraft: vi.fn(), onMove });
    expect(click(el, /^Gotowe/)).toBe(true);
    expect(onMove).toHaveBeenCalledWith({ type: "play", card: 7, nonce: view(s).nonce, round: 1 });
  });

  test("po zatwierdzeniu: komunikat zamiast Gotowe, także po przeładowaniu", () => {
    const a = play(setup(), A, 12);
    const html = board(a, A);
    expect(html).toContain("Zatwierdzone:");
    expect(html).toContain("Czekasz na pozostałych.");
    expect(html).not.toMatch(/>Gotowe/);
  });

  test("w wyborze nikt nie widzi cudzych kart, obserwator nie ma ręki", () => {
    const a = play(setup(), A, 12);
    for (const me of [B, ""]) expect(board(a, me)).not.toContain("data-play=");
    const watcher = board(a, "");
    expect(watcher).toContain("Oglądasz licytację.");
    expect(watcher).not.toContain("Twoja ręka");
    expect(watcher).not.toContain("Gotowe");
  });

  test("przeniesiona pula pokazuje sumę i kierunek", () => {
    let s: S = setup([A, B]);
    for (let seed = 1; seed < 200; seed++) {
      s = setup([A, B], seed);
      if (view(s).pot[0] > 0 && view(s).prizesLeft.length) break;
    }
    const carried = nextAll(round(s, { [A]: 6, [B]: 6 }));
    const html = board(carried, A);
    expect(view(carried).pot).toHaveLength(2);
    expect(html).toContain("Pula z poprzednich rund");
    expect(html).toMatch(upward(view(carried).pot) ? /najwyższa karta/ : /najniższa karta/);
  });
});

describe("odsłona i koniec", () => {
  test("odsłona: karty wszystkich, zniesiona para, werdykt i Dalej ze stemplem", () => {
    const r = round(setup(), { [A]: 12, [B]: 12, [C]: 9 });
    const html = board(r, A);
    expect(html.match(/data-play="/g)).toHaveLength(3);
    expect(html).toContain("znosi się");
    expect(html).toContain("Celina bierze");
    const onMove = vi.fn();
    const bar = NextBar({ view: view(r, A), me: A, waitingFor: game.waitingFor(r), color: "#3b9eff", nick, onMove });
    expect(click(bar, /^Dalej$/)).toBe(true);
    expect(onMove).toHaveBeenCalledWith({ type: "next", nonce: view(r).nonce, round: 1 });
  });

  test("po własnym Dalej: Czekamy na pozostałych; widz bez paska", () => {
    const r = round(setup(), { [A]: 1, [B]: 2, [C]: 3 });
    const mine = apply(r, A, { type: "next", ...stamp(r) });
    expect(board(mine, A)).toContain("Czekamy na: Bartek, Celina…");
    expect(board(mine, "")).not.toContain("Dalej");
  });

  test("koniec: punkty z miejscami, przebieg 15 rund, bez Dalej", () => {
    let s = setup();
    while (game.waitingFor(s).length) {
      const p = game.waitingFor(s)[0];
      s = game.applyMove(s, p, game.timeoutMove!(s, p, createRng(4)), createRng(4)) as S;
    }
    const v = view(s, A);
    expect(v.phase).toBe("over");
    const places = game.places!(s);
    const html = renderToStaticMarkup(<LicytacjaBoard view={v} me={A} players={PLAYERS} waitingFor={[]} onMove={vi.fn()} places={places} draft={{}} onDraft={vi.fn()} />);
    expect(html).toContain("Przebieg rund");
    expect(html.match(/data-round="/g)).toHaveLength(15);
    expect(html).toContain(`${places[A]}. Ania`);
    expect(html).not.toContain(">Dalej<");
  });
});

test("bez em-dashy i bez własnych wibracji", () => {
  const source = readFileSync(new URL("./Licytacja.tsx", import.meta.url), "utf8");
  expect(source).not.toContain("—");
  expect(source).not.toContain("vibrate");
});
