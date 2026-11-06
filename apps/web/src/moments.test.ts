import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { canReact, canShowMoment, createMomentStore, createReactionStore, leadChange, leadText, momentFrom } from "./moments.ts";

const names: Record<string, string> = { a: "Ola", b: "Ewa", c: "Jan" };
const nick = (id: string) => names[id] ?? "Gracz";

describe("momentFrom", () => {
  test("brak prev (odświeżenie, reconnect) → null", () => {
    const view = { owner: ["a", "a"], players: ["a", "b"] };
    expect(momentFrom("memory", null, view, "a", nick)).toBeNull();
    expect(momentFrom("chinczyk", null, { last: { roll: 1, player: "a", dice: 3, move: { captured: ["b"] } } }, "a", nick)).toBeNull();
  });

  test.each(["refleks", "stoj", "stoper", "przytrzymaj", "zaslona", "rytm"])("%s (cisza) → null przez całą partię", (id) => {
    const prev = { players: ["a", "b"], results: {} };
    expect(momentFrom(id, prev, { players: ["a", "b"], results: { a: 100 } }, "b", nick)).toBeNull();
  });

  test("para w Memory: komunikat z graczem, bez pary null", () => {
    const prev = { owner: [null, null, null] };
    const next = { owner: ["a", "a", null] };
    expect(momentFrom("memory", prev, next, "b", nick)).toEqual({ text: "Ola ma parę", playerId: "a" });
    expect(momentFrom("memory", prev, next, "a", nick)).toEqual({ text: "Masz parę!", playerId: "a" });
    expect(momentFrom("memory", prev, prev, "a", nick)).toBeNull();
  });

  test("zatopiony statek: gracz, który strzelał; samo trafienie null", () => {
    const board = (shots: { result: string }[]) => ({ ships: [], ready: true, shots });
    const prev = { players: ["a", "b"], boards: { a: board([]), b: board([{ result: "hit" }]) } };
    const hit = { players: ["a", "b"], boards: { a: board([]), b: board([{ result: "hit" }, { result: "hit" }]) } };
    const sunk = { players: ["a", "b"], boards: { a: board([]), b: board([{ result: "sunk" }, { result: "sunk" }]) } };
    expect(momentFrom("statki", prev, hit, "a", nick)).toBeNull();
    expect(momentFrom("statki", prev, sunk, "b", nick)).toEqual({ text: "Ola zatapia statek", playerId: "a" });
    expect(momentFrom("statki", prev, sunk, "a", nick)).toEqual({ text: "Zatapiasz statek!", playerId: "a" });
  });

  test("zbicie w Chińczyku: raz, przy nowym ruchu", () => {
    const before = { last: { roll: 4, player: "a", dice: 3 } };
    const after = { last: { roll: 4, player: "a", dice: 3, move: { captured: ["b"] } } };
    expect(momentFrom("chinczyk", before, after, "c", nick)).toEqual({ text: "Ola zbija: Ewa", playerId: "a" });
    expect(momentFrom("chinczyk", before, after, "a", nick)).toEqual({ text: "Zbijasz: Ewa", playerId: "a" });
    expect(momentFrom("chinczyk", before, after, "b", nick)).toEqual({ text: "Ola zbija Twój pionek", playerId: "a" });
    expect(momentFrom("chinczyk", after, after, "c", nick)).toBeNull();
    expect(momentFrom("chinczyk", before, { last: { roll: 4, player: "a", dice: 3, move: { captured: [] } } }, "c", nick)).toBeNull();
  });

  test("komplet w Kampus Tour: tylko nowe zdarzenie, także przy przesuniętym logu", () => {
    const old = { type: "buy", player: "b", tile: 1 };
    const set = { type: "set", player: "a", tile: 5 };
    expect(momentFrom("kampus-tour", { events: [old] }, { events: [old, set] }, "b", nick)).toEqual({ text: "Ola ma komplet", playerId: "a" });
    expect(momentFrom("kampus-tour", { events: [old] }, { events: [old, set] }, "a", nick)).toEqual({ text: "Masz komplet!", playerId: "a" });
    expect(momentFrom("kampus-tour", { events: [set, old] }, { events: [old, { type: "rent", player: "a" }] }, "b", nick)).toBeNull();
  });

  describe("gra przeżycia", () => {
    const three = (results: object) => ({ players: ["a", "b", "c"], sequence: [1, 2, 3, 4], results });

    test("„Ola odpada” u pozostałych", () => {
      expect(momentFrom("simon", three({}), three({ a: 2 }), "b", nick)).toEqual({ text: "Ola odpada", playerId: "a" });
    });

    test("„Zostałeś ostatni”, gdy w grze zostaje tylko patrzący", () => {
      expect(momentFrom("simon", three({ a: 2 }), three({ a: 2, b: 1 }), "c", nick)).toEqual({ text: "Zostałeś ostatni", playerId: "c" });
    });

    test("sam odpadasz: bez nicku", () => {
      expect(momentFrom("simon", three({}), three({ a: 2 }), "a", nick)).toEqual({ text: "Odpadasz", playerId: "a" });
    });

    test("komplet rund to nie odpadnięcie, w każdej z pięciu gier", () => {
      expect(momentFrom("simon", three({}), three({ a: 4 }), "b", nick)).toBeNull();
      expect(momentFrom("kubki", { players: ["a", "b"], results: {} }, { players: ["a", "b"], results: { a: 999 } }, "b", nick)).toBeNull();
      expect(momentFrom("w-pamieci", { players: ["a", "b"], results: {} }, { players: ["a", "b"], results: { a: { rounds: 999, diff: 0 } } }, "b", nick)).toBeNull();
      expect(momentFrom("sledzenie", { players: ["a", "b"], results: {} }, { players: ["a", "b"], results: { a: { rounds: 999, hits: 0 } } }, "b", nick)).toBeNull();
      expect(momentFrom("wieza", { players: ["a", "b"], results: {} }, { players: ["a", "b"], results: { a: { height: 999, width: 1 } } }, "b", nick)).toBeNull();
    });

    test.each([
      ["kubki", 0],
      ["w-pamieci", { rounds: 0, diff: 3 }],
      ["sledzenie", { rounds: 0, hits: 1 }],
      ["wieza", { height: 1, width: 5 }],
    ])("%s: odpadnięcie rozpoznane", (id, result) => {
      expect(momentFrom(id as string, { players: ["a", "b", "c"], results: {} }, { players: ["a", "b", "c"], results: { a: result } }, "b", nick)?.text).toBe("Ola odpada");
    });

    test("solo: bez komunikatu", () => {
      expect(momentFrom("simon", { players: ["a"], sequence: [1, 2], results: {} }, { players: ["a"], sequence: [1, 2], results: { a: 1 } }, "a", nick)).toBeNull();
    });
  });

  test("obserwator: te same komunikaty, bez „Ty”", () => {
    const owner = momentFrom("memory", { owner: [null, null] }, { owner: ["a", "a"] }, "", nick);
    expect(owner).toEqual({ text: "Ola ma parę", playerId: "a" });
    const three = (results: object) => ({ players: ["a", "b"], sequence: [1, 2], results });
    expect(momentFrom("simon", three({}), three({ a: 1 }), "", nick)).toEqual({ text: "Ola odpada", playerId: "a" });
    expect(momentFrom("simon", three({ a: 1 }), three({ a: 1, b: 0 }), "", nick)).toEqual({ text: "Ewa odpada", playerId: "b" });
    expect(leadText("a", "", nick)).toBe("Ola prowadzi");
  });
});

describe("leadChange: tylko gry na punkty", () => {
  test("zmiana prowadzenia → nowy lider", () => {
    expect(leadChange({ a: 3, b: 2 }, { a: 3, b: 4 })).toBe("b");
  });
  test("pierwsze punkty → null", () => {
    expect(leadChange({}, { a: 1 })).toBeNull();
    expect(leadChange({ a: 0, b: 0 }, { a: 1, b: 0 })).toBeNull();
  });
  test("remis → null, ten sam lider → null", () => {
    expect(leadChange({ a: 3, b: 2 }, { a: 3, b: 3 })).toBeNull();
    expect(leadChange({ a: 3, b: 2 }, { a: 4, b: 2 })).toBeNull();
    expect(leadChange({ a: 3, b: 3 }, { a: 3, b: 4 })).toBeNull();
  });
  test("teksty z „Ty” i bez", () => {
    expect(leadText("a", "a", nick)).toBe("Prowadzisz!");
    expect(leadText("a", "b", nick)).toBe("Ola prowadzi");
  });
});

describe("limit komunikatów", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  test("canShowMoment: najwyżej jeden na 3 s", () => {
    expect(canShowMoment(null, 0)).toBe(true);
    expect(canShowMoment(1000, 3999)).toBe(false);
    expect(canShowMoment(1000, 4000)).toBe(true);
  });

  test("dwa zdarzenia w 3 s: drugie przepada, a komunikat znika po 1,2 s", () => {
    const store = createMomentStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.show({ text: "pierwszy", playerId: "a" });
    store.show({ text: "drugi", playerId: "b" });
    expect(store.get()?.text).toBe("pierwszy");
    expect(listener).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1200);
    expect(store.get()).toBeNull();
    vi.advanceTimersByTime(1000);
    store.show({ text: "trzeci w oknie", playerId: "a" });
    expect(store.get()).toBeNull();
    vi.advanceTimersByTime(800);
    store.show({ text: "czwarty", playerId: "a" });
    expect(store.get()?.text).toBe("czwarty");
  });
});

describe("Moment w CSS i katalogu", () => {
  const css = readFileSync(new URL("./index.css", import.meta.url), "utf8");
  const rules = readFileSync(new URL("../../../ZASADY.md", import.meta.url), "utf8");
  const ui = readFileSync(new URL("./screens/ui.tsx", import.meta.url), "utf8");

  test("moment-in ma wiersz katalogu z czasem 1,2 s", () => {
    expect(rules).toMatch(/\| `moment-in` \|[^|]+\| `1\.2s` \|/);
    expect(ui).toContain("animate-[moment-in_1.2s");
  });

  test("przy prefers-reduced-motion bez ruchu, ale komunikat zostaje widoczny", () => {
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\[class\*="animate-\[moment-in"\] \{\s*animation: none !important;/);
  });

  test("nieklikalny i ogłaszany", () => {
    const code = ui.slice(ui.indexOf("export function Moment("));
    expect(code).toContain("pointer-events-none");
    expect(code).toContain('role="status"');
  });
});

describe("canReact: kiedy pasek reakcji", () => {
  const base = { mini: false, phase: "playing" as const, seated: true, waiting: true, people: 2 };

  test("gra turowa: także we własnej turze", () => {
    expect(canReact(base)).toBe(true);
    expect(canReact({ ...base, waiting: false })).toBe(true);
  });

  test("mini-gra: w trakcie pomiaru nie, po oddaniu wyniku tak", () => {
    expect(canReact({ ...base, mini: true })).toBe(false);
    expect(canReact({ ...base, mini: true, waiting: false })).toBe(true);
  });

  test("obserwator zawsze, także w mini-grze", () => {
    expect(canReact({ ...base, mini: true, seated: false, waiting: false })).toBe(true);
  });

  test("po partii każdy, a sam w pokoju nikt", () => {
    expect(canReact({ ...base, mini: true, phase: "over", waiting: false })).toBe(true);
    expect(canReact({ ...base, people: 1, waiting: false, phase: "over" })).toBe(false);
  });
});

describe("showReaction: wstrzymanie w trakcie pomiaru", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  test("bez wstrzymania od razu, po 1,2 s znika", () => {
    const store = createReactionStore();
    store.showReaction({ id: "a", index: 2 });
    expect(store.get().map((r) => [r.id, r.index])).toEqual([["a", 2]]);
    vi.advanceTimersByTime(1200);
    expect(store.get()).toEqual([]);
  });

  test("u grającego czeka do końca pomiaru i wtedy wychodzi, po jednej od osoby", () => {
    const store = createReactionStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setHeld(true);
    store.showReaction({ id: "a", index: 1 });
    store.showReaction({ id: "a", index: 2 });
    store.showReaction({ id: "b", index: 3 });
    expect(store.get()).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
    store.setHeld(false);
    expect(store.get().map((r) => [r.id, r.index])).toEqual([["a", 2], ["b", 3]]);
    vi.advanceTimersByTime(1200);
    expect(store.get()).toEqual([]);
  });

  test("dwie reakcje jednej osoby mają różne klucze", () => {
    const store = createReactionStore();
    store.showReaction({ id: "a", index: 1 });
    store.showReaction({ id: "a", index: 1 });
    const [first, second] = store.get();
    expect(first.key).not.toBe(second.key);
  });
});

describe("reakcje w CSS i katalogu", () => {
  const css = readFileSync(new URL("./index.css", import.meta.url), "utf8");
  const rules = readFileSync(new URL("../../../ZASADY.md", import.meta.url), "utf8");
  const ui = readFileSync(new URL("./screens/ui.tsx", import.meta.url), "utf8");

  test("reaction-float ma wiersz katalogu z czasem 1,2 s", () => {
    expect(rules).toMatch(/\| `reaction-float` \|[^|]+\| `1\.2s` \|/);
    expect(ui).toContain("animate-[reaction-float_1.2s");
  });

  test("przy prefers-reduced-motion bez unoszenia, ale widoczna", () => {
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\[class\*="animate-\[reaction-float"\] \{\s*animation: none !important;/);
  });

  test("pola paska mają min. 48 px", () => {
    const bar = ui.slice(ui.indexOf("export function ReactionBar("));
    expect(bar.slice(0, bar.indexOf("\n}\n"))).toContain("size-12");
  });
});
