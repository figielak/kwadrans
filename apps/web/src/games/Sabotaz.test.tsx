import { createRng, GAMES, type LobbyPlayer, type SabotazKind, type SabotazMove, type SabotazView } from "@kwadrans/games";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { heroResult } from "../screens/results.ts";
import { decisionKey as vibrationKey } from "../vibrate.ts";
import { currentDraft, decisionKey, type Draft, harmKey, moves, options, Sabotaz, SabotazBoard } from "./Sabotaz.tsx";

// Testy napisane przed ekranem. Widoki pochodzą z prawdziwego playerView po legalnych ruchach:
// - gracz widzi własną rękę i własny stos od góry, rywale i obserwator tylko liczby i odkryte karty,
// - wybór i zatwierdzenie są osobno, a ruch niesie nonce, rundę i numer decyzji z widoku,
// - licytacja ma zakres od bieżącej deklaracji do T, przy T zostaje pas,
// - odkrywanie wybiera tylko legalny cudzy stos i pokazuje postęp,
// - oczekujący, obserwator i nieznany me nie mają aktywnych akcji ani prywatnych danych,
// - zakryta karta nie zdradza rodzaju w tekście, etykiecie ani atrybucie.
// - odsłona pokazuje deklarację, kolejność odkryć, werdykt, wszystkie stosy i ręce oraz przyrosty i sumy wprost z widoku,
// - po szóstej rundzie zostaje jej odsłona i historia wszystkich rund, bez Dalej,
// - klucz wibracji tury zmienia się z każdą decyzją, szkoda dotyczy tylko odkrywającego cudzą Pułapkę.

const A = "p1";
const B = "p2";
const C = "p3";
const D = "p4";
const game = GAMES.sabotaz;
const lobby = (id: string, nick: string, color: string): LobbyPlayer => ({ id, nick, color, connected: true, ready: false });
const PLAYERS = [lobby(A, "Ania", "#3b9eff"), lobby(B, "Bartek", "#ffc53d"), lobby(C, "Celina", "#46a758"), lobby(D, "Darek", "#8e7cff")];

type S = unknown;
const start = (players = [A, B, C]) => game.setup(players, createRng(1)) as S;
const view = (s: S, me = "") => game.playerView(s, me) as SabotazView;
const apply = (s: S, player: string, move: SabotazMove) => {
  expect(game.validateMove(s, player, move), JSON.stringify(move)).toBe(true);
  return game.applyMove(s, player, move, createRng(1)) as S;
};
const stamp = (s: S) => ({ nonce: view(s).nonce, round: view(s).round });
const decided = (s: S) => ({ ...stamp(s), decision: view(s).decision });
const turn = (s: S) => view(s).turn!;
const initials = (s: S, kinds: Record<string, SabotazKind> = {}) =>
  view(s).players.reduce((acc, p) => apply(acc, p, { type: "place", kind: kinds[p] ?? "safe", ...stamp(acc) }), s);
const place = (s: S, kind: SabotazKind = "safe") => apply(s, turn(s), { type: "place", kind, ...decided(s) });
const placeAll = (s: S, kind: SabotazKind = "safe") => view(s).players.reduce((acc) => place(acc, kind), s);
const bid = (s: S, amount: number) => apply(s, turn(s), { type: "bid", amount, ...decided(s) });
const pass = (s: S) => apply(s, turn(s), { type: "pass", ...decided(s) });
const reveal = (s: S, owner: string) => apply(s, turn(s), { type: "reveal", owner, ...decided(s) });

function html(s: S, me: string, draft: Draft = {}, places?: Record<string, number> | null) {
  const v = view(s, me);
  return renderToStaticMarkup(<SabotazBoard view={v} me={me} players={PLAYERS} waitingFor={game.waitingFor(s)} onMove={() => {}} places={places} draft={draft} onDraft={() => {}} />);
}
const text = (markup: string) => markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const buttons = (markup: string) => markup.match(/<button[^>]*>/g) ?? [];
const enabled = (markup: string) => buttons(markup).filter((b) => !/\sdisabled=/.test(b));
/** Otwierający znacznik przycisku z danym tekstem w środku. */
const buttonWith = (markup: string, label: string) => (markup.match(/<button[^>]*>.*?<\/button>/g) ?? []).find((b) => text(b).includes(label));

describe("karty gracza", () => {
  test("gracz widzi rękę z licznościami i własny stos od góry", () => {
    const s = place(initials(start(), { [A]: "trap" }));
    const seen = text(html(s, A));
    expect(seen).toContain("Twój stos");
    expect(seen.indexOf("Przejście", seen.indexOf("Twój stos"))).toBeLessThan(seen.indexOf("Pułapka", seen.indexOf("Twój stos")));
    expect(options(view(s, A), A, game.waitingFor(s)).active).toBe(false);
    expect(seen).toContain("Twoja ręka");
    expect(seen).toMatch(/Przejście\s*×\s*2/);
    expect(seen).toMatch(/Pułapka\s*×\s*0/);
  });

  test("zakryta cudza Pułapka daje rywalom i obserwatorowi dokładnie ten sam ekran co Przejście", () => {
    for (const build of [
      (kind: SabotazKind) => apply(start(), A, { type: "place", kind, ...stamp(start()) }),
      (kind: SabotazKind) => initials(start(), { [A]: kind }),
      (kind: SabotazKind) => bid(initials(start(), { [A]: kind }), 1),
      (kind: SabotazKind) => pass(pass(bid(bid(initials(start(), { [A]: kind }), 1), 2))),
    ]) {
      for (const viewer of [B, C, "", "obcy"]) expect(html(build("trap"), viewer), viewer).toBe(html(build("safe"), viewer));
    }
  });

  test("obserwator i nieznany me nie mają ręki, stosu, rodzajów kart ani aktywnych akcji", () => {
    const s = initials(start(), { [A]: "trap" });
    for (const viewer of ["", "obcy"]) {
      const markup = html(s, viewer);
      expect(markup).not.toContain("Twoja ręka");
      expect(markup).not.toContain("Twój stos");
      expect(markup).not.toMatch(/Pułapka|Przejście|trap|safe/);
      expect(buttons(markup)).toEqual([]);
      expect(options(view(s, viewer), viewer, game.waitingFor(s)).active).toBe(false);
    }
  });

  test("etykiety zakrytego stosu podają tylko nick i liczbę kart", () => {
    const markup = html(initials(start(), { [C]: "trap" }), "");
    expect(markup).toContain('aria-label="Celina: 1 zakryta"');
    expect(markup).not.toMatch(/data-[a-z]*="(trap|safe)"/);
  });

  test("każdy gracz ma kafel z nickiem i liczbą kart, także przy 6 osobach", () => {
    const six = ["p1", "p2", "p3", "p4", "p5", "p6"];
    const players = six.map((id, i) => lobby(id, `Gracz${i + 1}`, "#3b9eff"));
    const s = game.setup(six, createRng(1));
    const markup = renderToStaticMarkup(<SabotazBoard view={view(s, "")} me="" players={players} waitingFor={game.waitingFor(s)} onMove={() => {}} draft={{}} onDraft={() => {}} />);
    for (let i = 1; i <= 6; i++) expect(markup).toContain(`Gracz${i}`);
    expect(markup).toContain("grid-cols-2");
  });
});

describe("układ przy 5-6 graczach", () => {
  // Trzy rzędy kafli plus dwa rzędy akcji mają się zmieścić na 360×640; pomiar robi odbiór w przeglądarce.
  const six = ["p1", "p2", "p3", "p4", "p5", "p6"];
  const players = six.map((id, i) => lobby(id, `Gracz${i + 1}`, "#3b9eff"));

  test("kafel stosu trzyma 52 px wysokości, czyli budżet trzech rzędów, i nie schodzi poniżej 48 px", () => {
    const s = game.setup(six, createRng(1));
    const markup = renderToStaticMarkup(<SabotazBoard view={view(s, "")} me="" players={players} waitingFor={game.waitingFor(s)} onMove={() => {}} draft={{}} onDraft={() => {}} />);
    const tiles = markup.match(/<div role="group"[^>]*>/g) ?? [];
    expect(tiles).toHaveLength(6);
    for (const tile of tiles) {
      expect(tile).toContain("min-h-13");
      expect(tile).toContain("py-1.5");
    }
  });

  test("kafel do wyboru przy odkrywaniu ma ten sam budżet", () => {
    let s = view(game.setup(six, createRng(1))).players.reduce((acc, p) => apply(acc, p, { type: "place", kind: "safe", ...stamp(acc) }), game.setup(six, createRng(1)) as S);
    s = bid(s, 2);
    while (view(s).phase === "bid") s = pass(s);
    const leader = view(s).leader!;
    const markup = renderToStaticMarkup(<SabotazBoard view={view(s, leader)} me={leader} players={players} waitingFor={game.waitingFor(s)} onMove={() => {}} draft={{}} onDraft={() => {}} />);
    const pick = buttons(markup).filter((b) => b.includes("aria-pressed"));
    expect(pick.length).toBeGreaterThan(0);
    for (const tile of pick) expect(tile).toContain("min-h-13");
  });
});

describe("pierwsza karta i dokładanie", () => {
  test("pierwsza karta: oba rodzaje dostępne, bez wyboru zatwierdzenie nieaktywne", () => {
    const s = start();
    expect(options(view(s, A), A, game.waitingFor(s)).kinds).toEqual(["safe", "trap"]);
    const markup = html(s, A);
    expect(buttonWith(markup, "Przejście")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Pułapka")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Wybierz kartę")).toMatch(/\sdisabled=/);
    expect(markup).not.toContain("Licytuj");
  });

  test("wybór karty jest zaznaczony drugim znakiem, a zatwierdzenie nazywa kartę", () => {
    const markup = html(start(), A, { kind: "trap" });
    expect(buttonWith(markup, "Pułapka")).toContain('aria-pressed="true"');
    expect(buttonWith(markup, "Przejście")).toContain('aria-pressed="false"');
    expect(buttonWith(markup, "Połóż Pułapkę")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Połóż Pułapkę")).toContain("btn-player");
  });

  test("po pierwszej karcie gracz czeka bez akcji, ale nadal widzi rękę", () => {
    const s = apply(start(), A, { type: "place", kind: "trap", ...stamp(start()) });
    const markup = html(s, A);
    expect(buttons(markup)).toEqual([]);
    expect(text(markup)).toContain("Czekamy na: Bartek, Celina");
    expect(markup).toContain("Twoja ręka");
  });

  test("dostępne rodzaje odpowiadają licznościom: brak Pułapki blokuje jej wybór", () => {
    const s = initials(start(), { [A]: "trap" });
    expect(options(view(s, A), A, game.waitingFor(s)).kinds).toEqual(["safe"]);
    expect(buttonWith(html(s, A), "Pułapka")).toMatch(/\sdisabled=/);
    expect(buttonWith(html(s, A), "Przejście")).not.toMatch(/\sdisabled=/);
  });

  test("układanie: gracz ma Dołóż i Licytuj od 1 do T", () => {
    const s = initials(start());
    const opts = options(view(s, A), A, game.waitingFor(s));
    expect(opts.bid).toEqual({ min: 1, max: 3 });
    expect(opts.canPass).toBe(false);
    const markup = html(s, A, { kind: "safe" });
    expect(buttonWith(markup, "Dołóż Przejście")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Licytuj 1")).not.toMatch(/\sdisabled=/);
    expect(markup).not.toContain(">Pas<");
  });

  test("pusta ręka: opis i sama licytacja, bez przycisku dołożenia", () => {
    const s = placeAll(placeAll(placeAll(initials(start())), "safe"), "trap");
    const opts = options(view(s, A), A, game.waitingFor(s));
    expect(opts.kinds).toEqual([]);
    expect(opts.bid).toEqual({ min: 1, max: 12 });
    const markup = html(s, A);
    expect(text(markup)).toContain("Ręka pusta");
    expect(markup).not.toContain("Dołóż");
    expect(markup).not.toContain("Wybierz kartę");
    expect(buttonWith(markup, "Licytuj 1")).not.toMatch(/\sdisabled=/);
  });

  test("gracz bez ruchu nie ma aktywnych akcji", () => {
    const s = initials(start());
    expect(buttons(html(s, B))).toEqual([]);
    expect(options(view(s, B), B, game.waitingFor(s)).active).toBe(false);
    expect(text(html(s, B))).toContain("Ania");
  });
});

describe("licytacja", () => {
  test("zakres podbicia to bieżąca deklaracja + 1 do T, a obok jest pas", () => {
    const s = bid(placeAll(initials(start())), 2);
    const opts = options(view(s, B), B, game.waitingFor(s));
    expect(opts.bid).toEqual({ min: 3, max: 6 });
    expect(opts.canPass).toBe(true);
    expect(opts.kinds).toEqual([]);
    const markup = html(s, B);
    expect(buttonWith(markup, "Licytuj 3")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Pas")).not.toMatch(/\sdisabled=/);
    expect(markup).not.toContain("Dołóż");
  });

  test("minus i plus blokują się na granicach zakresu", () => {
    const s = bid(placeAll(initials(start())), 2);
    const low = html(s, B, { amount: 3 });
    expect(buttonWith(low, "Licytuj 3")).toBeDefined();
    expect(low).toMatch(/<button[^>]*aria-label="Mniej"[^>]*disabled/);
    expect(low).not.toMatch(/<button[^>]*aria-label="Więcej"[^>]*disabled/);
    const high = html(s, B, { amount: 6 });
    expect(buttonWith(high, "Licytuj 6")).toBeDefined();
    expect(high).toMatch(/<button[^>]*aria-label="Więcej"[^>]*disabled/);
  });

  test("szkic spoza zakresu wraca na granicę", () => {
    const s = bid(placeAll(initials(start())), 2);
    expect(buttonWith(html(s, B, { amount: 1 }), "Licytuj 3")).toBeDefined();
    expect(buttonWith(html(s, B, { amount: 99 }), "Licytuj 6")).toBeDefined();
  });

  test("oferta T zostawia tylko pas", () => {
    const s = bid(initials(start()), 3);
    const opts = options(view(s, B), B, game.waitingFor(s));
    expect(opts.bid).toBeNull();
    expect(opts.canPass).toBe(true);
    const markup = html(s, B);
    expect(markup).not.toContain("Licytuj");
    expect(enabled(markup)).toHaveLength(1);
    expect(buttonWith(markup, "Pas")).toBeDefined();
  });

  test("osoba, która spasowała, nie ma akcji i ma to na kaflu", () => {
    const s = pass(bid(initials(start()), 1));
    expect(buttons(html(s, B))).toEqual([]);
    expect(text(html(s, ""))).toContain("Pas");
  });

  test("lider jest oznaczony na kaflu, a deklaracja widoczna dla wszystkich", () => {
    const seen = text(html(bid(initials(start()), 2), ""));
    expect(seen).toContain("Lider");
    expect(seen).toMatch(/Deklaracja\s*2/);
  });
});

describe("odkrywanie", () => {
  const revealing = () => {
    let s = initials(start([A, B, C, D]));
    s = bid(s, 3);
    s = pass(pass(pass(s)));
    return s;
  };

  test("do wyboru są tylko niepuste cudze stosy, postęp pokazuje x z celu", () => {
    const s = revealing();
    expect(options(view(s, A), A, game.waitingFor(s)).owners).toEqual([B, C, D]);
    const markup = html(s, A);
    expect(text(markup)).toContain("1 z 3");
    expect(buttonWith(markup, "Bartek")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Ania")).toBeUndefined();
    expect(buttonWith(markup, "Wybierz stos")).toMatch(/\sdisabled=/);
  });

  test("wybrany stos ma drugi znak, a potwierdzenie nazywa właściciela", () => {
    const markup = html(revealing(), A, { owner: C });
    expect(buttonWith(markup, "Celina")).toContain('aria-pressed="true"');
    expect(buttonWith(markup, "Odkryj u Celina")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(markup, "Odkryj u Celina")).toContain("btn-player");
  });

  test("opróżniony stos przestaje być wyborem, a szkic na niego nie aktywuje potwierdzenia", () => {
    const s = reveal(revealing(), B);
    expect(options(view(s, A), A, game.waitingFor(s)).owners).toEqual([C, D]);
    const markup = html(s, A, { owner: B });
    expect(buttonWith(markup, "Wybierz stos")).toMatch(/\sdisabled=/);
    expect(text(markup)).toContain("2 z 3");
  });

  test("odkryte karty są jawne na kaflach właścicieli dla wszystkich", () => {
    const s = reveal(revealing(), B);
    const seen = text(html(s, ""));
    expect(seen).toContain("Przejście");
    expect(buttons(html(s, ""))).toEqual([]);
  });

  test("oglądający nie mają wyboru stosu", () => {
    const s = revealing();
    expect(buttons(html(s, B))).toEqual([]);
    expect(options(view(s, B), B, game.waitingFor(s)).owners).toEqual([]);
  });
});

describe("ruchy i szkice", () => {
  test("ruchy niosą nonce, rundę i decyzję wyłącznie z widoku; pierwsza karta bez numeru decyzji", () => {
    const initial = start();
    expect(moves(view(initial, A)).place("trap")).toEqual({ type: "place", kind: "trap", ...stamp(initial) });
    for (const s of [initials(start()), bid(placeAll(initials(start())), 2)]) {
      const v = view(s, turn(s));
      expect(moves(v).bid(4)).toEqual({ type: "bid", amount: 4, ...decided(s) });
    }
    const placing = initials(start());
    expect(moves(view(placing, A)).place("safe")).toEqual({ type: "place", kind: "safe", ...decided(placing) });
    const bidding = bid(placing, 1);
    expect(moves(view(bidding, B)).pass()).toEqual({ type: "pass", ...decided(bidding) });
    expect(moves(view(bidding, B)).reveal(C)).toEqual({ type: "reveal", owner: C, ...decided(bidding) });
  });

  test("każdy zbudowany ruch przechodzi walidację serwera", () => {
    const placing = initials(start());
    expect(game.validateMove(placing, A, moves(view(placing, A)).place("safe"))).toBe(true);
    expect(game.validateMove(placing, A, moves(view(placing, A)).bid(3))).toBe(true);
    const bidding = bid(placing, 1);
    expect(game.validateMove(bidding, B, moves(view(bidding, B)).pass())).toBe(true);
  });

  test("klucz decyzji zmienia się po każdej decyzji, nowej rundzie i nowym nonce, a nie po cudzej gotowości", () => {
    const initial = start();
    const partial = apply(initial, B, { type: "place", kind: "safe", ...stamp(initial) });
    expect(decisionKey(view(partial))).toBe(decisionKey(view(initial)));
    const placing = initials(start());
    expect(decisionKey(view(placing))).not.toBe(decisionKey(view(initial)));
    const placed = place(placing);
    expect(decisionKey(view(placed))).not.toBe(decisionKey(view(placing)));
    const other = game.setup([A, B, C], createRng(2));
    expect(decisionKey(view(other))).not.toBe(decisionKey(view(initial)));
  });

  test("szkic z poprzedniej decyzji jest porzucany", () => {
    expect(currentDraft({ key: "1:0:place:0", draft: { kind: "trap" } }, "1:0:place:0")).toEqual({ kind: "trap" });
    expect(currentDraft({ key: "1:0:place:0", draft: { kind: "trap" } }, "1:0:place:1")).toEqual({});
  });

  test("gotowy ekran renderuje się z samego widoku, bez szkicu z zewnątrz", () => {
    const s = start();
    const markup = renderToStaticMarkup(<Sabotaz view={view(s, A)} me={A} players={PLAYERS} waitingFor={game.waitingFor(s)} onMove={() => {}} />);
    expect(markup).toContain("Twoja ręka");
    expect(markup).toContain("Runda 1 z 6");
  });
});

describe("odsłona", () => {
  /** A deklaruje 5: własne 2, potem B, po czym zostaje ostatni stos C odkrywany automatycznie aż do jego Pułapki. */
  const trapSummary = () => {
    let s = placeAll(initials(start(), { [C]: "trap" }));
    s = bid(s, 6);
    s = pass(pass(s));
    s = reveal(s, B);
    return reveal(s, B);
  };
  /** Lista odkryć z odsłony ostatniej rundy, od pierwszego. */
  const revealList = (markup: string) => (markup.match(/<ol[^>]*>.*?<\/ol>/)?.[0].match(/<li[^>]*>.*?<\/li>/g) ?? []).map(text);

  test("pokazuje deklarację, kolejność odkryć i kończącą Pułapkę, także dla wymuszonej sekwencji", () => {
    const s = trapSummary();
    expect(view(s).phase).toBe("summary");
    const markup = html(s, A);
    expect(text(markup)).toMatch(/Deklaracja\s*6/);
    const list = revealList(markup);
    expect(list).toHaveLength(6);
    expect(list.map((item) => item.match(/Ania|Bartek|Celina/)?.[0])).toEqual(["Ania", "Ania", "Bartek", "Bartek", "Celina", "Celina"]);
    expect(list.slice(0, 5).every((item) => item.includes("Przejście"))).toBe(true);
    expect(list[5]).toContain("Pułapka");
  });

  test("jeden werdykt: punkty biorą się z widoku, bez doliczania w kliencie", () => {
    const markup = text(html(trapSummary(), ""));
    expect(markup).toContain("Ania wpada na Pułapkę: Celina");
    expect(markup.match(/\+1/g)).toHaveLength(1);
    expect(markup).not.toContain("+2");
  });

  test("sukces i własna Pułapka mają własny werdykt", () => {
    const success = text(html(pass(pass(bid(initials(start()), 1))), ""));
    expect(success).toContain("Ania odkrywa 1 z 1");
    expect(success.match(/\+2/g)).toHaveLength(1);
    const own = text(html(pass(pass(bid(initials(start(), { [A]: "trap" }), 1))), ""));
    expect(own).toContain("Ania wpada na własną Pułapkę");
    expect(own).not.toMatch(/\+[12]/);
  });

  test("ujawnia wszystkie stosy od góry i pozostałe ręce każdego, także obserwatorowi", () => {
    const markup = text(html(trapSummary(), ""));
    for (const nick of ["Ania", "Bartek", "Celina"]) expect(markup).toContain(nick);
    expect(markup).toMatch(/Stos.*Przejście.*Pułapka/);
    expect(markup).toMatch(/Ręka/);
    expect(view(trapSummary()).history[0].stacks[C]).toEqual(["trap", "safe"]);
    const celina = html(trapSummary(), "").match(/<li[^>]*data-player="p3"[^>]*>.*?<\/li>/)?.[0] ?? "";
    expect(text(celina).indexOf("Przejście")).toBeLessThan(text(celina).indexOf("Pułapka"));
  });

  test("sumy pochodzą z widoku i są posortowane malejąco", () => {
    const s = trapSummary();
    const markup = text(html(s, ""));
    expect(markup).toContain("Suma punktów");
    expect(markup.indexOf("Celina", markup.indexOf("Suma punktów"))).toBeLessThan(markup.indexOf("Ania", markup.indexOf("Suma punktów")));
  });

  test("Dalej wysyła next, po własnym Dalej gracz czeka na resztę", () => {
    const s = trapSummary();
    expect(moves(view(s, A)).next()).toEqual({ type: "next", ...stamp(s) });
    expect(game.validateMove(s, A, moves(view(s, A)).next())).toBe(true);
    const fresh = html(s, A);
    expect(buttonWith(fresh, "Dalej")).not.toMatch(/\sdisabled=/);
    expect(buttonWith(fresh, "Dalej")).toContain("btn-player");
    const after = apply(s, A, { type: "next", ...stamp(s) });
    const waiting = html(after, A);
    expect(waiting).not.toContain("Dalej");
    expect(buttonWith(waiting, "Czekamy na: Bartek, Celina")).toMatch(/\sdisabled=/);
  });

  test("obserwator w odsłonie nie ma przycisku, a zastany stan nie animuje się", () => {
    const markup = html(trapSummary(), "");
    expect(buttons(markup)).toEqual([]);
    expect(markup).not.toContain("animate-[");
  });

  test("poprzednie rundy są w historii, a bieżąca runda jej nie ujawnia", () => {
    const first = trapSummary();
    const round = (s: S) => view(s).players.reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), s);
    const second = pass(pass(bid(initials(round(first)), 1)));
    expect(view(second).phase).toBe("summary");
    expect(text(html(second, ""))).toContain("Runda 1");
    expect(text(html(second, ""))).toContain("Celina");
    const live = initials(round(first));
    // Ekran decyzji musi się zmieścić na 360×640: historia jest w odsłonie, a sumy na kaflach.
    expect(text(html(live, ""))).not.toContain("Poprzednie rundy");
    expect(text(html(live, ""))).not.toContain("Pułapka");
    expect(text(html(live, ""))).toMatch(/Celina.*1\s*pkt/);
  });

  describe("koniec partii", () => {
    /** Sześć rund, w każdej startujący deklaruje 1 na własnym Przejściu. */
    const finished = () => {
      let s = start();
      for (let r = 0; r < 6; r++) {
        s = pass(pass(bid(initials(s), 1)));
        if (r < 5) s = view(s).players.reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), s);
      }
      return s;
    };

    test("zostaje szósta odsłona i historia wszystkich rund, bez Dalej", () => {
      const s = finished();
      expect(view(s).phase).toBe("over");
      const markup = html(s, A);
      for (let round = 1; round <= 6; round++) expect(text(markup)).toContain(`Runda ${round}`);
      expect(markup).not.toContain("Dalej");
      expect(buttons(markup)).toEqual([]);
      expect(revealList(markup)).toHaveLength(1);
    });

    test("miejsca bierze wprost z serwera, z remisem", () => {
      const markup = text(html(finished(), "", {}, { [A]: 1, [B]: 1, [C]: 1 }));
      expect(markup.match(/1\./g)?.length).toBeGreaterThanOrEqual(3);
    });

    test("bez miejsc z serwera ekran ich nie zgaduje", () => {
      expect(text(html(finished(), "", {}, null))).not.toMatch(/\b1\./);
    });
  });
});

describe("wibracje", () => {
  const keys = (s: S, me: string) => vibrationKey("sabotaz", view(s, me), me, game.waitingFor(s));

  test("dwa kolejne odkrycia tej samej osoby to dwie decyzje", () => {
    let s = placeAll(initials(start()));
    s = pass(pass(bid(s, 5)));
    const first = keys(s, A);
    expect(first).not.toBeNull();
    s = reveal(s, B);
    expect(view(s).turn).toBe(A);
    expect(keys(s, A)).not.toBeNull();
    expect(keys(s, A)).not.toBe(first);
  });

  test("cudza gotowość w pierwszych kartach i odsłonie nie zmienia klucza", () => {
    const initial = start();
    const before = keys(initial, A);
    expect(before).not.toBeNull();
    expect(keys(apply(initial, B, { type: "place", kind: "safe", ...stamp(initial) }), A)).toBe(before);
    const summary = pass(pass(bid(initials(start()), 1)));
    const atSummary = keys(summary, A);
    expect(atSummary).not.toBeNull();
    expect(keys(apply(summary, B, { type: "next", ...stamp(summary) }), A)).toBe(atSummary);
  });

  test("obserwator i osoba bez decyzji dostają null", () => {
    const placing = initials(start());
    expect(keys(placing, "")).toBeNull();
    expect(keys(placing, B)).toBeNull();
    expect(keys(placing, A)).not.toBeNull();
  });

  test("klucz rozróżnia rundy i rewanże", () => {
    const one = keys(start(), A);
    const rematch = game.setup([A, B, C], createRng(2));
    expect(vibrationKey("sabotaz", view(rematch, A), A, game.waitingFor(rematch))).not.toBe(one);
  });

  test("inne gry zachowują dotychczasowy klucz", () => {
    expect(vibrationKey("memory", {}, A, [A])).toBe("turn");
    expect(vibrationKey("memory", {}, A, [B])).toBeNull();
  });

  const foreign = () => reveal(pass(pass(bid(initials(start(), { [C]: "trap" }), 2))), C);

  test("szkoda: tylko odkrywający cudzą Pułapkę, klucz zawiera nonce, rundę, odkrywającego i właściciela", () => {
    const s = foreign();
    const { nonce, round } = view(s);
    expect(harmKey(view(s, A), A)).toBe(`${nonce}:${round}:${A}:${C}`);
    expect(harmKey(view(s, B), B)).toBeNull();
    expect(harmKey(view(s, C), C)).toBeNull();
    expect(harmKey(view(s, ""), "")).toBeNull();
  });

  test("własna Pułapka, sukces i trwająca runda nie dają szkody", () => {
    const own = pass(pass(bid(initials(start(), { [A]: "trap" }), 1)));
    expect(harmKey(view(own, A), A)).toBeNull();
    const success = pass(pass(bid(initials(start()), 1)));
    expect(harmKey(view(success, A), A)).toBeNull();
    const next = view(foreign()).players.reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), foreign());
    expect(harmKey(view(next, A), A)).toBeNull();
  });
});

describe("współpraca z nagłówkiem i wynikiem", () => {
  test("limit czytany z publicznego widoku daje 30, 60 i 15 s oraz ten sam klucz co stan", () => {
    const steps: [S, number][] = [
      [start(), 30],
      [initials(start()), 60],
      [bid(initials(start()), 1), 60],
      [pass(pass(bid(placeAll(initials(start())), 4))), 60],
      [pass(pass(bid(initials(start()), 1))), 15],
    ];
    for (const [s, seconds] of steps) {
      expect(game.turn!(view(s)).seconds).toBe(seconds);
      expect(game.turn!(view(s)).key).toBe(game.turn!(s).key);
    }
  });

  test("widok obserwatora wystarcza do limitu, bez rąk i stosów w stanie", () => {
    const observed = view(initials(start()));
    expect(observed).not.toHaveProperty("hands");
    expect(observed).not.toHaveProperty("stacks");
    expect(() => game.turn!(observed)).not.toThrow();
  });

  const played = (winners: string[]) => {
    let s = start();
    winners.forEach((winner, r) => {
      s = initials(s);
      s = bid(s, 1);
      while (view(s).phase === "bid") s = turn(s) === winner ? bid(s, 2) : pass(s);
      while (view(s).phase === "reveal") s = reveal(s, view(s).players.find((p) => p !== view(s).leader && view(s).stackSizes[p] > 0)!);
      if (r < winners.length - 1) s = view(s).players.reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), s);
    });
    return s;
  };

  const hero = (s: S, me = "") => {
    const result = game.isOver(s)!;
    return heroResult({ result, places: game.places!(s), seats: view(s).players, me, nick: (id) => PLAYERS.find((p) => p.id === id)?.nick ?? "?" });
  };

  test("remis: neutralny tytuł i miejsca serwera, bez fikcyjnego zwycięzcy", () => {
    const s = played([A, B, A, B, A, B]);
    expect(game.isOver(s)?.winner).toBeUndefined();
    const result = hero(s);
    expect(result?.title).toBe("Remis");
    expect(result?.rows.map((row) => [row.id, row.place])).toEqual([[A, 1], [B, 1], [C, 3]]);
  });

  test("wygrana: zwycięzca i wspólne dalsze miejsca z serwera, bez liczby rekordu", () => {
    const result = hero(played([A, A, A, A, A, A]), A);
    expect(result?.title).toBe("Wygrywasz!");
    expect(result?.rows.map((row) => [row.id, row.place])).toEqual([[A, 1], [B, 2], [C, 2]]);
    expect(result?.rows.every((row) => row.score === undefined)).toBe(true);
  });
});
