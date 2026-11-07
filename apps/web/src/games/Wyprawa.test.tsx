import { createRng, GAMES, type LobbyPlayer, WYPRAWA_HAZARDS, type WyprawaMove, type WyprawaView } from "@kwadrans/games";
import { readFileSync } from "node:fs";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { currentDraft, DecisionControls, decisionKey, type Draft, moves, options, WyprawaBoard } from "./Wyprawa.tsx";

// Testy napisane przed ekranem. Widoki pochodzą z prawdziwego playerView po legalnych ruchach:
// - gracz na szlaku widzi „Wyprawa n/5”, bank, to co niesie i resztki na szlaku z osobnymi podpisami,
// - główna karta pokazuje skarb albo zagrożenie, pięć liczników zagrożeń ma nazwę i liczbę odkryć,
// - lista graczy (2 i 6) ma znak szlak/obóz i gotowość, nigdy treść cudzego wyboru przed rozstrzygnięciem,
// - „Gotowe” jest nieaktywne bez wyboru, dotknięcie opcji tylko zmienia szkic, a zatwierdzenie buduje choose ze stemplem z widoku,
// - szkic jest związany z kluczem nonce/wyprawa/odkrycie/faza: nowe odkrycie, nowa wyprawa i rewanż go kasują,
// - po przeładowaniu zatwierdzony wybór wraca z myChoice, bez aktywnych przycisków,
// - gracz w obozie widzi tekst o obozie i jawne wydarzenia, obserwator i obce id nie mają akcji ani prywatnych danych,
// - ostatnia decyzja, podział i poprzednia karta z last są widoczne w następnej decyzji,
// - szczegół szlaku ma wszystkie odkryte karty, nic więcej, a zastany stan nie animuje się,
// - ekran nie wibruje sam (robi to Game.tsx) i nie używa em-dashy.

const A = "p1";
const B = "p2";
const C = "p3";
const D = "p4";
const E = "p5";
const F = "p6";
const game = GAMES.wyprawa;
const lobby = (id: string, nick: string, color: string): LobbyPlayer => ({ id, nick, color, connected: true, ready: false });
const PLAYERS = [
  lobby(A, "Ania", "#3b9eff"),
  lobby(B, "Bartek", "#ffc53d"),
  lobby(C, "Celina", "#46a758"),
  lobby(D, "Darek", "#8e7cff"),
  lobby(E, "Ewa", "#ff8a4c"),
  lobby(F, "Filip", "#2dd4bf"),
];
const NAMES = { osuwisko: "Osuwisko", zalanie: "Zalanie", roj: "Rój", przepasc: "Przepaść", most: "Zawalony most" } as const;
const NICK = Object.fromEntries(PLAYERS.map((p) => [p.id, p.nick]));

type S = unknown;
const setup = (ids: string[], seed = 1) => game.setup(ids, createRng(seed)) as S;
const view = (s: S, me = "") => game.playerView(s, me) as WyprawaView;
const apply = (s: S, player: string, move: WyprawaMove) => {
  expect(game.validateMove(s, player, move), JSON.stringify(move)).toBe(true);
  return game.applyMove(s, player, move, createRng(1)) as S;
};
const stamp = (s: S) => ({ nonce: view(s).nonce, expedition: view(s).expedition });
const choose = (s: S, player: string, choice: "continue" | "return") => apply(s, player, { type: "choose", choice, ...stamp(s), reveal: view(s).reveal });
const everyone = (s: S, choice: "continue" | "return") => game.waitingFor(s).reduce((acc, p) => choose(acc, p, choice), s);
const nextAll = (s: S) => game.waitingFor(s).reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), s);

/** Pierwszy seed, którego pierwsza karta spełnia warunek. */
function openedWith(ids: string[], first: "treasure" | "hazard") {
  for (let seed = 1; seed < 500; seed++) {
    const s = setup(ids, seed);
    if (view(s).trail[0].kind === first) return s;
  }
  throw new Error("brak seeda");
}
const treasure = (ids: string[]) => openedWith(ids, "treasure");
const THREE = [A, B, C];
const TWO = [A, B];
const SIX = [A, B, C, D, E, F];

function html(s: S, me: string, draft: Draft = {}) {
  return renderToStaticMarkup(<WyprawaBoard view={view(s, me)} me={me} players={PLAYERS} waitingFor={game.waitingFor(s)} onMove={() => {}} draft={draft} onDraft={() => {}} />);
}
const text = (markup: string) => markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const buttons = (markup: string) => markup.match(/<button[^>]*>.*?<\/button>/g) ?? [];
const enabled = (markup: string) => buttons(markup).filter((b) => !/^<button[^>]*\sdisabled=/.test(b));
const buttonWith = (markup: string, label: string) => buttons(markup).find((b) => text(b).includes(label));
const stat = (markup: string, label: string) => text(markup.match(new RegExp(`<dt[^>]*>${label}</dt><dd[^>]*>(.*?)</dd>`))?.[1] ?? "").trim();
const row = (markup: string, id: string) => text(markup.match(new RegExp(`<li[^>]*data-player="${id}"[^>]*>.*?</li>`))?.[0] ?? "");
const items = (markup: string, attr: string) => markup.match(new RegExp(`<li[^>]*${attr}="[^"]*"[^>]*>.*?</li>`, "g")) ?? [];

describe("nagłówek i liczby", () => {
  test("gracz na szlaku widzi bank, to co niesie i resztki z osobnymi podpisami", () => {
    const s = setup(THREE);
    const v = view(s, A);
    const seen = html(s, A);
    expect(text(seen)).toContain("Wyprawa 1/5");
    expect(stat(seen, "W banku")).toBe(String(v.bank[A]));
    expect(stat(seen, "Niesiesz")).toBe(String(v.carried[A]));
    expect(stat(seen, "Resztki szlaku")).toBe(String(v.loose));
  });

  test("po przejściu do następnej wyprawy nagłówek pokazuje 2/5, a bank zostaje", () => {
    const first = everyone(treasure(THREE), "return");
    expect(view(first).phase).toBe("summary");
    const s = nextAll(first);
    const seen = html(s, A);
    expect(view(s).expedition).toBe(1);
    expect(text(seen)).toContain("Wyprawa 2/5");
    expect(stat(seen, "W banku")).toBe(String(view(first).bank[A]));
    expect(stat(seen, "Niesiesz")).toBe(String(view(s).carried[A]));
  });
});

describe("główna karta i zagrożenia", () => {
  test("skarb: wartość i podział na osoby", () => {
    const s = treasure(THREE);
    const card = view(s).trail[0];
    if (card.kind !== "treasure") throw new Error("oczekiwano skarbu");
    const seen = text(html(s, A));
    expect(seen).toContain(`Skarb ${card.value}`);
    expect(seen).toContain(`po ${Math.floor(card.value / 3)} na osobę`);
  });

  test("zagrożenie: nazwa i pierwsze ostrzeżenie, drugie takie samo kończy wyprawę", () => {
    const s = openedWith(THREE, "hazard");
    const card = view(s).trail[0];
    if (card.kind !== "hazard") throw new Error("oczekiwano zagrożenia");
    const seen = text(html(s, A));
    expect(seen).toContain(NAMES[card.hazard]);
    expect(seen).toContain("Pierwsze ostrzeżenie");
    expect(seen).toContain("Drugie takie samo kończy wyprawę");
  });

  test("pięć liczników zagrożeń: nazwa i liczba odkryć", () => {
    const s = openedWith(THREE, "hazard");
    const card = view(s).trail[0];
    if (card.kind !== "hazard") throw new Error("oczekiwano zagrożenia");
    const counters = items(html(s, A), "data-hazard");
    expect(counters).toHaveLength(5);
    for (const hazard of WYPRAWA_HAZARDS) {
      const counter = counters.find((c) => c.includes(`data-hazard="${hazard}"`))!;
      expect(text(counter)).toContain(NAMES[hazard]);
      expect(text(counter)).toContain(hazard === card.hazard ? "1" : "0");
      expect(counter).toContain("<svg");
    }
  });
});

describe("lista graczy", () => {
  test.each([[TWO], [SIX]])("%j: każdy ma znak szlaku i nick, gotowość bez treści wyboru", (ids) => {
    let s = setup(ids);
    s = choose(s, A, "return");
    const seen = html(s, ids[ids.length - 1]);
    for (const id of ids) {
      expect(row(seen, id)).toContain(NICK[id]);
      expect(row(seen, id)).toContain("szlak");
    }
    expect(row(seen, A)).toContain("gotowe");
    for (const id of ids.slice(1)) expect(row(seen, id)).not.toContain("gotowe");
    expect(row(seen, A)).not.toMatch(/Wracam|wraca|Idę dalej|idzie dalej/);
  });

  test("po powrocie gracz ma znak obozu", () => {
    const s = choose(choose(choose(treasure(THREE), A, "return"), B, "continue"), C, "continue");
    const seen = html(s, B);
    expect(row(seen, A)).toContain("obóz");
    expect(row(seen, B)).toContain("szlak");
    expect(row(seen, A)).not.toContain("gotowe");
  });

  test("cudzy wybór nie wycieka w żadnym fragmencie ekranu kogoś, kto jeszcze nie zatwierdził", () => {
    const s = choose(setup(THREE), A, "return");
    const seen = text(html(s, C));
    expect(seen).not.toMatch(/Ania[^.]*(wraca|idzie dalej)/);
    expect(row(html(s, C), A)).toBe(row(html(choose(setup(THREE), A, "continue"), C), A));
  });
});

describe("wybór i „Gotowe”", () => {
  test("bez wyboru „Gotowe” jest nieaktywne, a wybór ma dwie opcje i podpowiedź o limicie", () => {
    const seen = html(setup(THREE), A);
    expect(buttonWith(seen, "Gotowe")).toMatch(/\sdisabled=/);
    expect(buttonWith(seen, "Idę dalej")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(seen, "Wracam")).not.toMatch(/\sdisabled=/);
    expect(text(seen)).toContain("Bez Gotowe po czasie wracasz");
  });

  test("wybrana opcja ma aria-pressed, ikonę zaznaczenia i kolor gracza, „Gotowe” się odblokowuje", () => {
    const seen = html(setup(THREE), A, { choice: "return" });
    const picked = buttonWith(seen, "Wracam")!;
    expect(picked).toContain('aria-pressed="true"');
    expect(picked).toContain("<svg");
    expect(picked).toContain("#3b9eff");
    expect(buttonWith(seen, "Idę dalej")).toContain('aria-pressed="false"');
    expect(buttonWith(seen, "Gotowe")).not.toMatch(/\sdisabled=/);
    expect(seen).not.toMatch(/red|#f00|danger/);
  });

  test("dotknięcie opcji zmienia tylko szkic i nie wysyła ruchu", () => {
    const s = setup(THREE);
    const onMove = vi.fn();
    const onDraft = vi.fn();
    const controls = DecisionControls({ view: view(s, A), me: A, waitingFor: game.waitingFor(s), color: "#3b9eff", draft: {}, onDraft, onMove });
    const [stay, back] = findButtons(controls);
    stay.props.onClick();
    back.props.onClick();
    expect(onDraft.mock.calls).toEqual([[{ choice: "continue" }], [{ choice: "return" }]]);
    expect(onMove).not.toHaveBeenCalled();
  });

  test("„Gotowe” wysyła choose ze stemplem z widoku, tylko przy wyborze", () => {
    const s = treasure(THREE);
    const onMove = vi.fn();
    const props = { view: view(s, A), me: A, waitingFor: game.waitingFor(s), color: "#3b9eff", onDraft: () => {}, onMove };
    const idle = findButtons(DecisionControls({ ...props, draft: {} })).at(-1)!;
    expect(idle.props.disabled).toBe(true);
    const ready = findButtons(DecisionControls({ ...props, draft: { choice: "continue" } })).at(-1)!;
    expect(ready.props.disabled).toBe(false);
    ready.props.onClick();
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith({ type: "choose", choice: "continue", nonce: view(s).nonce, expedition: 0, reveal: 1 });
    expect(game.validateMove(s, A, onMove.mock.calls[0][0])).toBe(true);
  });

  test("moves: choose tylko z wyborem, next ze stemplem wyprawy", () => {
    const s = setup(THREE);
    const v = view(s, A);
    expect(moves(v, {}).choose).toBeNull();
    expect(moves(v, { choice: "return" }).choose).toEqual({ type: "choose", choice: "return", nonce: v.nonce, expedition: 0, reveal: 1 });
    expect(moves(v, {}).next).toEqual({ type: "next", nonce: v.nonce, expedition: 0 });
  });
});

describe("szkic lokalnego wyboru", () => {
  const stored = (s: S) => ({ key: decisionKey(view(s)), draft: { choice: "return" as const } });

  test("cudza gotowość nie kasuje wyboru", () => {
    const s = setup(THREE);
    const mine = stored(s);
    const after = choose(s, B, "continue");
    expect(currentDraft(mine, view(after, A))).toEqual({ choice: "return" });
  });

  test("nowe odkrycie kasuje szkic, więc stary wybór nie zostanie wysłany", () => {
    const s = treasure(THREE);
    const mine = stored(s);
    const later = everyone(s, "continue");
    expect(view(later).reveal).toBe(2);
    expect(currentDraft(mine, view(later, A))).toEqual({});
    expect(decisionKey(view(later))).not.toBe(decisionKey(view(s)));
  });

  test("nowa wyprawa kasuje szkic", () => {
    const first = treasure(THREE);
    const mine = stored(first);
    const second = nextAll(everyone(first, "return"));
    expect(view(second).expedition).toBe(1);
    expect(currentDraft(mine, view(second, A))).toEqual({});
  });

  test("rewanż (nowy nonce przy tej samej wyprawie i odkryciu) kasuje szkic", () => {
    const first = setup(THREE, 1);
    const rematch = setup(THREE, 2);
    expect(view(rematch).nonce).not.toBe(view(first).nonce);
    expect([view(rematch).expedition, view(rematch).reveal]).toEqual([view(first).expedition, view(first).reveal]);
    expect(currentDraft(stored(first), view(rematch, A))).toEqual({});
  });

  test("przejście do odsłony kasuje szkic", () => {
    const s = treasure(THREE);
    const ended = everyone(s, "return");
    expect(currentDraft(stored(s), view(ended, A))).toEqual({});
  });
});

describe("zatwierdzony wybór po przeładowaniu", () => {
  test("własny wybór wraca z myChoice, bez aktywnych przycisków, a rywal go nie widzi", () => {
    const s = choose(setup(THREE), A, "return");
    expect(view(s, A).myChoice).toBe("return");
    const seen = html(s, A);
    expect(text(seen)).toContain("Zatwierdzone: Wracam");
    expect(enabled(seen)).toHaveLength(0);
    expect(buttonWith(seen, "Gotowe") ?? "").toMatch(/disabled|^$/);
    expect(text(html(s, B))).not.toContain("Zatwierdzone");
    expect(enabled(html(s, B)).length).toBeGreaterThan(0);
  });

  test("options: zatwierdzony nie jest już aktywny", () => {
    const s = choose(setup(THREE), A, "continue");
    expect(options(view(s, A), A, game.waitingFor(s))).toMatchObject({ onTrail: true, active: false, confirmed: "continue" });
    expect(options(view(s, B), B, game.waitingFor(s))).toMatchObject({ onTrail: true, active: true, confirmed: null });
  });
});

describe("obóz, obserwator i obce id", () => {
  const inCamp = () => choose(choose(choose(treasure(THREE), A, "return"), B, "continue"), C, "continue");

  test("w obozie jest tekst i jawne wydarzenia, bez akcji", () => {
    const s = inCamp();
    expect(view(s, A).onTrail).toEqual([B, C]);
    const seen = html(s, A);
    expect(text(seen)).toContain("Jesteś w obozie. Czekasz na koniec wyprawy");
    expect(enabled(seen)).toHaveLength(0);
    expect(buttonWith(seen, "Gotowe")).toBeUndefined();
    expect(text(seen)).toContain("Poprzednia decyzja");
    expect(options(view(s, A), A, game.waitingFor(s))).toMatchObject({ camp: true, onTrail: false, active: false });
  });

  test.each(["", "ktos-obcy"])("widz %j nie ma akcji ani prywatnych danych", (id) => {
    const s = choose(setup(THREE), A, "return");
    const seen = html(s, id);
    expect(enabled(seen)).toHaveLength(0);
    expect(seen).not.toMatch(/Wracam|Idę dalej|Gotowe|Zatwierdzone|W banku|Niesiesz/);
    expect(text(seen)).toContain("Oglądasz wyprawę");
    expect(row(seen, A)).toContain("gotowe");
    expect(options(view(s, id), id, game.waitingFor(s))).toMatchObject({ seated: false, active: false, onTrail: false, camp: false });
    expect(html(s, "ktos-obcy")).toBe(html(s, ""));
  });

  test("6 graczy bez siódmego widza: obcy widok to widok obserwatora", () => {
    const s = choose(setup(SIX), D, "return");
    expect(view(s, "kibic")).toEqual(view(s, ""));
    expect(view(s, "kibic").myChoice).toBeNull();
    expect(html(s, "kibic")).toBe(html(s, ""));
  });
});

describe("ostatnie rozstrzygnięcie w następnej decyzji", () => {
  test("decyzje, podział i poprzednia karta z last", () => {
    const first = treasure(THREE);
    const card = view(first).trail[0];
    if (card.kind !== "treasure") throw new Error("oczekiwano skarbu");
    const s = choose(choose(choose(first, A, "return"), B, "continue"), C, "continue");
    const last = view(s).last!;
    expect(last.returned).toEqual([A]);
    const seen = html(s, B);
    expect(text(seen)).toContain("Poprzednia decyzja");
    expect(text(seen)).toContain(`Poprzednia karta: Skarb ${card.value}`);
    const decisions = items(seen, "data-decision");
    expect(decisions).toHaveLength(3);
    expect(text(decisions.find((d) => d.includes(`data-decision="${A}"`))!)).toContain(`Ania: wraca, +${last.banked[A]} do banku`);
    expect(text(decisions.find((d) => d.includes(`data-decision="${B}"`))!)).toContain("Bartek: idzie dalej");
    expect(text(seen)).toContain(`po ${last.share}`);
    expect(text(seen)).toContain(`na szlaku zostaje ${last.looseAfter}`);
  });

  test("bez powrotów nie ma linii o podziale", () => {
    const s = everyone(treasure(THREE), "continue");
    const seen = text(html(s, A));
    expect(seen).toContain("Poprzednia decyzja");
    expect(seen).not.toContain("na szlaku zostaje");
  });

  test("pierwsze odkrycie wyprawy nie ma poprzedniej decyzji", () => {
    expect(text(html(setup(THREE), A))).not.toContain("Poprzednia decyzja");
  });
});

describe("szczegół szlaku", () => {
  test("zawiera wszystkie odkryte karty po kolei i żadnej nieodkrytej", () => {
    const s = everyone(everyone(treasure(THREE), "continue"), "continue");
    const v = view(s, A);
    expect(v.trail).toHaveLength(3);
    const seen = html(s, A);
    expect(seen).toContain("<details");
    const cards = items(seen, "data-trail");
    expect(cards).toHaveLength(v.trail.length);
    v.trail.forEach((card, i) => {
      const label = card.kind === "treasure" ? `Skarb ${card.value}` : NAMES[card.hazard];
      expect(text(cards[i])).toContain(label);
    });
  });

  test("zastany stan nie animuje się po wejściu ani odświeżeniu", () => {
    const s = choose(everyone(treasure(THREE), "continue"), A, "return");
    expect(html(s, A)).not.toContain("animate-[");
    expect(html(s, "")).not.toContain("animate-[");
  });
});

describe("faza po wyprawie (do 10-06)", () => {
  test("odsłona i koniec renderują się bez akcji i bez błędu", () => {
    const ended = everyone(treasure(THREE), "return");
    expect(view(ended).phase).toBe("summary");
    expect(() => html(ended, A)).not.toThrow();
    expect(() => html(ended, "")).not.toThrow();
    expect(text(html(ended, A))).toContain("Wyprawa 1/5");
  });
});

describe("zasady ekranu", () => {
  const source = readFileSync(new URL("./Wyprawa.tsx", import.meta.url), "utf8");

  test("ekran nie wibruje sam i nie ma em-dashy", () => {
    expect(source).not.toContain("vibrate");
    expect(source).not.toContain("—");
  });
});

/** Przyciski z drzewa elementów komponentu bez hooków, w kolejności występowania. */
function findButtons(node: ReactNode): ReactElement<{ onClick: () => void; disabled?: boolean; children?: ReactNode }>[] {
  if (Array.isArray(node)) return node.flatMap(findButtons);
  if (!isValidElement<{ children?: ReactNode }>(node)) return [];
  const own = node.type === "button" ? [node as ReactElement<{ onClick: () => void; disabled?: boolean; children?: ReactNode }>] : [];
  return [...own, ...findButtons(node.props.children)];
}
