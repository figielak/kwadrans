import { describe, expect, test } from "vitest";
import { createRng, type MoveContext, type Rng } from "./core.ts";
import {
  buildDeck,
  type Card,
  type Choice,
  DECISION_SECONDS,
  EXPEDITIONS,
  HAZARDS,
  type Hazard,
  type Move,
  openExpedition,
  type State,
  SUMMARY_SECONDS,
  type View,
  wyprawa as game,
} from "./wyprawa.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 2-6 graczy, 5 wypraw, każda ze świeżą talią 30 kart: 15 skarbów 1-15 po razie (suma 120) i 5 rodzajów zagrożeń po 3 karty,
// - serwer sam odkrywa kartę i otwiera decyzję; skarb daje każdemu na szlaku floor(v/a), reszta trafia do loose i nie wchodzi do kolejnych podziałów,
// - pierwsza karta zagrożenia ostrzega, druga tego samego rodzaju kończy wyprawę: pozostali tracą carried, loose przepada, bank jest nietknięty,
// - decyzja jest tajna, nieodwołalna i rozstrzygana kompletem: wracający dostają carried i równą część loose, bez względu na kolejność wiadomości,
// - najpierw bank, potem następna karta; wracający trafia do obozu i nie decyduje do końca wyprawy,
// - wszyscy wrócili: koniec bez następnej karty, reszta loose przepada; pusta talia: pozostali bankują carried i dzielą loose,
// - odsłona 15 s albo komplet „Dalej” od wszystkich, po piątej wyprawie od razu over, bez odsłony,
// - wygrywa największy bank, remis na górze bez zwycięzcy, równe banki to wspólne miejsca,
// - każdy ruch ma nonce i wyprawę, choose także numer odkrycia; stary ruch, drugi wybór, ruch z obozu i obcy gracz odpadają,
// - limit decyzji to Wracam, limit odsłony to next, klucz czasu zmienia tylko odkrycie, wyprawa, faza albo nonce,
// - widok nie ma talii ani cudzych wyborów przed rozstrzygnięciem, obserwator i obce id widzą to samo, bez własnego wyboru,
// - monety się zgadzają: bank, utracone i odrzucone to razem suma odkrytych skarbów.

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";
const E = "ewa";
const F = "filip";
const TWO = [A, B];
const THREE = [A, B, C];
const SIX = [A, B, C, D, E, F];
const OBSERVER = "";
const STRANGER = "ktos-obcy";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

/** Każdy stan w testach jest zamrożony: mutacja w applyMove kończy test błędem. */
const start = (players: string[] = THREE, seed = 1) => deepFreeze(game.setup(players, createRng(seed)));

function send(s: State, player: string, move: Move, rng: Rng = createRng(1), context?: MoveContext): State {
  expect(game.validateMove(s, player, move, context), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return deepFreeze(game.applyMove(s, player, move, rng));
}

const rejects = (s: State, player: string, move: unknown) => expect(game.validateMove(s, player, move as Move), JSON.stringify(move)).toBe(false);

/** Liczba to skarb, nazwa to zagrożenie; pierwsza karta jest odkrywana pierwsza. */
const deckOf = (...cards: (number | Hazard)[]): Card[] =>
  cards.map((card) => (typeof card === "number" ? { kind: "treasure", value: card } : { kind: "hazard", hazard: card }));

/** Wyprawa o ustalonej kolejności kart; pierwsza karta jest już odkryta. */
const trek = (players: string[], ...cards: (number | Hazard)[]) => deepFreeze(openExpedition(start(players), deckOf(...cards)));
const reopen = (s: State, ...cards: (number | Hazard)[]) => deepFreeze(openExpedition(s, deckOf(...cards)));

const choose = (s: State, choice: Choice): Move => ({ type: "choose", choice, nonce: s.nonce, expedition: s.expedition, reveal: s.reveal });
const next = (s: State): Move => ({ type: "next", nonce: s.nonce, expedition: s.expedition });

/** Komplet decyzji: `returning` wraca, reszta na szlaku idzie dalej. */
const decide = (s: State, returning: string[] = []) =>
  s.onTrail.reduce((acc, p) => send(acc, p, choose(acc, returning.includes(p) ? "return" : "continue")), s);
const allNext = (s: State, rng: Rng = createRng(1)) => s.players.reduce((acc, p) => send(acc, p, next(acc), rng), s);

/** Zła implementacja bez końca partii ma oblać test, a nie zawiesić go w synchronicznej pętli. */
const MAX_STEPS = 2000;
function guard(steps: number) {
  if (steps > MAX_STEPS) throw new Error("partia się nie kończy");
  return steps + 1;
}

/** Reszta partii bez monet: każda kolejna wyprawa to samo pierwsze ostrzeżenie i powrót wszystkich. */
function quiet(s: State) {
  let acc = s;
  let steps = 0;
  while (acc.phase !== "over") {
    steps = guard(steps);
    if (acc.phase === "summary") acc = allNext(acc);
    acc = reopen(acc, "roj");
    acc = decide(acc, acc.onTrail);
  }
  return acc;
}

/** Partia do końca według wskazanych decyzji; `onEach` dostaje każdy stan po drodze. */
function playAll(s: State, pick: (s: State, player: string) => Choice, rng: Rng = createRng(7), onEach: (s: State) => void = () => {}) {
  let acc = s;
  let steps = 0;
  onEach(acc);
  while (acc.phase !== "over") {
    steps = guard(steps);
    if (acc.phase === "summary") acc = allNext(acc, rng);
    else acc = acc.onTrail.reduce((inner, p) => send(inner, p, choose(inner, pick(inner, p)), rng), acc);
    onEach(acc);
  }
  return acc;
}

const timeoutOf = (s: State, player: string, rng: Rng = createRng(1)) => game.timeoutMove?.(s, player, rng) as Move;

/** Partia do końca samymi ruchami limitu, tak jak robi to zegar serwera. */
function timeoutAll(s: State, rng: Rng = createRng(3)) {
  let acc = s;
  let steps = 0;
  while (game.waitingFor(acc).length) {
    steps = guard(steps);
    const p = game.waitingFor(acc)[0];
    acc = send(acc, p, timeoutOf(acc, p, rng), rng, { source: "timeout" });
  }
  return acc;
}

const view = (s: State, player = OBSERVER) => game.playerView(s, player) as View;
const turn = (s: State) => game.turn?.(s) as { key: string; seconds: number };
const places = (s: State) => game.places?.(s) as Record<string, number>;
const lastExpedition = (s: State) => s.history[s.history.length - 1];
const sum = (values: Iterable<number>) => [...values].reduce((total, value) => total + value, 0);
const sumOf = (record: Record<string, number>) => sum(Object.values(record));
const treasures = (cards: Card[]) => sum(cards.map((card) => (card.kind === "treasure" ? card.value : 0)));

function expectFullDeck(cards: Card[]) {
  expect(cards).toHaveLength(30);
  const values = cards.flatMap((card) => (card.kind === "treasure" ? [card.value] : []));
  expect([...values].sort((a, b) => a - b)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  expect(sum(values)).toBe(120);
  for (const hazard of HAZARDS) {
    expect(cards.filter((card) => card.kind === "hazard" && card.hazard === hazard)).toHaveLength(3);
  }
}

describe("definicja", () => {
  test("id, nazwa i liczba graczy 2-6", () => {
    expect(game.id).toBe("wyprawa");
    expect(game.name).toBe("Wyprawa");
    expect(game.minPlayers).toBe(2);
    expect(game.maxPlayers).toBe(6);
  });

  test("gra główna bez rekordu, podglądu rywali i trybów", () => {
    expect(game.record).toBeUndefined();
    expect(game.live).toBeUndefined();
    expect(game.modes).toBeUndefined();
  });

  test("stałe zasad: 5 wypraw, 20 s decyzja, 15 s odsłona", () => {
    expect(EXPEDITIONS).toBe(5);
    expect(DECISION_SECONDS).toBe(20);
    expect(SUMMARY_SECONDS).toBe(15);
  });

  test("pięć rodzajów zagrożeń", () => {
    expect([...HAZARDS].sort()).toEqual(["most", "osuwisko", "przepasc", "roj", "zalanie"]);
  });

  test("świeża gra nie jest skończona", () => {
    expect(game.isOver(start())).toBeNull();
  });
});

describe("setup i talia", () => {
  test("talia ma 30 kart: 15 skarbów 1-15 po razie, suma 120, 5 zagrożeń po 3", () => {
    expectFullDeck(buildDeck(createRng(5)));
  });

  test("pierwsza karta jest od razu odkryta i otwarta jest pierwsza decyzja wszystkich", () => {
    const s = start();
    expect(s.phase).toBe("decision");
    expect(s.expedition).toBe(0);
    expect(s.trail).toHaveLength(1);
    expect(s.reveal).toBe(1);
    expect(s.deck).toHaveLength(29);
    expect(s.onTrail).toEqual(THREE);
    expect(game.waitingFor(s)).toEqual(THREE);
    expect(s.last).toBeNull();
    expect(s.history).toEqual([]);
    expectFullDeck([...s.trail, ...s.deck]);
  });

  test("bank zaczyna od zera, a pierwsza karta jest już rozstrzygnięta", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = start(THREE, seed);
      expect(sumOf(s.bank)).toBe(0);
      expect(sumOf(s.carried) + s.loose).toBe(treasures(s.trail));
    }
  });

  test("ten sam seed daje to samo, różne seedy dają inną talię i inny nonce", () => {
    expect(start(THREE, 1)).toEqual(start(THREE, 1));
    const a = start(THREE, 1);
    const b = start(THREE, 2);
    expect([...b.trail, ...b.deck]).not.toEqual([...a.trail, ...a.deck]);
    expect(b.nonce).not.toBe(a.nonce);
  });

  test("openExpedition ustawia kolejność kart i odkrywa pierwszą, bez zmiany banku", () => {
    const s = trek(THREE, 9, "roj", 4);
    expect(s.trail).toEqual(deckOf(9));
    expect(s.deck).toEqual(deckOf("roj", 4));
    expect(s.reveal).toBe(1);
    expect(s.carried).toEqual({ [A]: 3, [B]: 3, [C]: 3 });
    expect(s.loose).toBe(0);
    expect(game.waitingFor(s)).toEqual(THREE);
  });
});

describe("schemat ruchu", () => {
  const stamp = { nonce: 123, expedition: 0, reveal: 1 };

  test("poprawne ruchy przechodzą, także pierwsza i ostatnia wartość", () => {
    const good = [
      { type: "choose", choice: "continue", ...stamp },
      { type: "choose", choice: "return", ...stamp },
      { type: "choose", choice: "return", nonce: 0, expedition: EXPEDITIONS - 1, reveal: 20 },
      { type: "next", nonce: 123, expedition: 0 },
      { type: "next", nonce: 123, expedition: EXPEDITIONS - 1 },
    ];
    for (const move of good) expect(game.moveSchema.safeParse(move).success, JSON.stringify(move)).toBe(true);
  });

  test("zły typ, zły wybór, brak stempla, liczby niecałkowite i śmieci odpadają", () => {
    const bad = [
      null,
      "next",
      7,
      [],
      {},
      { type: "kup", ...stamp },
      { type: "choose", ...stamp },
      { type: "choose", choice: "wait", ...stamp },
      { type: "choose", choice: 1, ...stamp },
      { type: "choose", choice: "return", expedition: 0, reveal: 1 },
      { type: "choose", choice: "return", nonce: 123, reveal: 1 },
      { type: "choose", choice: "return", nonce: 123, expedition: 0 },
      { type: "choose", choice: "return", ...stamp, nonce: 1.5 },
      { type: "choose", choice: "return", ...stamp, expedition: 0.5 },
      { type: "choose", choice: "return", ...stamp, reveal: 1.5 },
      { type: "choose", choice: "return", ...stamp, reveal: "1" },
      { type: "next" },
      { type: "next", nonce: 123 },
      { type: "next", expedition: 0 },
      { type: "next", nonce: "123", expedition: 0 },
      { type: "next", nonce: 123, expedition: 0.5 },
    ];
    for (const move of bad) expect(game.moveSchema.safeParse(move).success, JSON.stringify(move)).toBe(false);
  });
});

describe("podział skarbu", () => {
  test("skarb 1 przy 6 osobach: carried bez zmian, loose +1", () => {
    const s = trek(SIX, 1, 2);
    expect(sumOf(s.carried)).toBe(0);
    expect(s.loose).toBe(1);
  });

  test("skarb 15 przy 2 osobach: po 7, loose +1", () => {
    const s = trek(TWO, 15);
    expect(s.carried).toEqual({ [A]: 7, [B]: 7 });
    expect(s.loose).toBe(1);
  });

  test("wcześniejsze loose nie wchodzi do podziału kolejnego skarbu", () => {
    const s = decide(trek(TWO, 3, 15, 2));
    expect(s.carried).toEqual({ [A]: 8, [B]: 8 });
    expect(s.loose).toBe(2);
  });

  test("następny skarb dzieli się tylko między osoby nadal na wyprawie", () => {
    const s = decide(trek(THREE, 3, 8, 2), [A]);
    expect(s.carried).toEqual({ [A]: 0, [B]: 5, [C]: 5 });
    expect(s.bank[A]).toBe(1);
    expect(s.loose).toBe(0);
  });
});

describe("powroty", () => {
  // carried 8 i 8: 2 → 0, 14 → 4, 13 → 4; loose 2 + 2 + 1 = 5.
  const loose5 = () => decide(decide(trek(THREE, 2, 14, 13, 6, "roj")));

  test("loose 5, wracają dwie osoby z carried 8 i 8: bank +10 i +10, na szlaku zostaje 1", () => {
    const before = loose5();
    expect(before.loose).toBe(5);
    expect(before.carried).toEqual({ [A]: 8, [B]: 8, [C]: 8 });
    const s = decide(before, [A, B]);
    expect(s.bank).toEqual({ [A]: 10, [B]: 10, [C]: 0 });
    expect(s.carried[A]).toBe(0);
    expect(s.carried[B]).toBe(0);
    expect(s.loose).toBe(1);
    expect(s.onTrail).toEqual([C]);
    expect(s.last?.share).toBe(2);
    expect(s.last?.looseAfter).toBe(1);
    expect(s.last?.returned).toEqual([A, B]);
    expect(s.last?.banked[A]).toBe(10);
    expect(s.last?.banked[B]).toBe(10);
  });

  // Jedyny stan poprawiany ręcznie: ruchami carried osób na szlaku jest zawsze równe,
  // a przykład z ZASADY-GIER §12 pokazuje wzór na różnych wartościach.
  test("loose 5, wracają dwie osoby z carried 7 i 4: bank +9 i +6, na szlaku zostaje 1", () => {
    const before = deepFreeze({ ...loose5(), carried: { [A]: 7, [B]: 4, [C]: 8 } });
    const s = decide(before, [A, B]);
    expect(s.bank).toEqual({ [A]: 9, [B]: 6, [C]: 0 });
    expect(s.loose).toBe(1);
    expect(s.onTrail).toEqual([C]);
  });

  test("samotny powrót zabiera całą resztę loose do banku tej osoby", () => {
    // 2 → loose 2, 14 → carried 4, loose 4.
    const s = decide(decide(trek(THREE, 2, 14, 6, "roj")), [A]);
    expect(s.bank).toEqual({ [A]: 8, [B]: 0, [C]: 0 });
    expect(s.loose).toBe(0);
    expect(s.last?.share).toBe(4);
    expect(s.last?.looseAfter).toBe(0);
  });

  test("loose mniejsze niż liczba wracających: udział 0, loose zostaje", () => {
    const s = decide(trek(THREE, 1, 3, "roj"), [A, B]);
    expect(s.bank).toEqual({ [A]: 0, [B]: 0, [C]: 0 });
    expect(s.last?.share).toBe(0);
    expect(s.last?.looseAfter).toBe(1);
    expect(s.loose).toBe(1);
    expect(s.carried[C]).toBe(3);
  });

  test("powrót przed drugim takim samym zagrożeniem: najpierw bank, potem karta, wracający nic nie traci", () => {
    const s = decide(decide(trek(THREE, "roj", 9, "roj")), [A]);
    expect(s.phase).toBe("summary");
    expect(s.bank).toEqual({ [A]: 3, [B]: 0, [C]: 0 });
    expect(lastExpedition(s).gain).toEqual({ [A]: 3, [B]: 0, [C]: 0 });
    expect(lastExpedition(s).lost).toEqual({ [A]: 0, [B]: 3, [C]: 3 });
  });

  test("po powrocie osoba jest w obozie i nie decyduje do końca wyprawy", () => {
    const s = decide(trek(THREE, 3, 6, "roj"), [A]);
    expect(s.onTrail).toEqual([B, C]);
    expect(game.waitingFor(s)).toEqual([B, C]);
    expect(s.phase).toBe("decision");
    expect(s.reveal).toBe(2);
  });

  test("gdy ktoś został, serwer od razu odkrywa następną kartę i otwiera nową decyzję", () => {
    const before = trek(THREE, 3, 6, "roj");
    const s = decide(before, [A, B]);
    expect(s.trail).toEqual(deckOf(3, 6));
    expect(s.deck).toEqual(deckOf("roj"));
    expect(s.reveal).toBe(2);
    expect(game.waitingFor(s)).toEqual([C]);
  });

  test("wiele powrotów naraz daje ten sam stan bez względu na kolejność wiadomości", () => {
    const before = decide(trek(THREE, 2, 14, 6, "roj"));
    const orders = [[A, B, C], [A, C, B], [B, A, C], [B, C, A], [C, A, B], [C, B, A]];
    const choices: Record<string, Choice> = { [A]: "return", [B]: "continue", [C]: "return" };
    const results = orders.map((order) => order.reduce((acc, p) => send(acc, p, choose(acc, choices[p])), before));
    for (const result of results) expect(result).toEqual(results[0]);
    expect(results[0].last?.returned).toEqual([A, C]);
    expect(results[0].bank).toEqual({ [A]: 6, [B]: 0, [C]: 6 });
  });

  test("wybór przed kompletem nie zmienia banku, loose, carried ani szlaku", () => {
    const before = decide(trek(THREE, 2, 14, 6, "roj"));
    const s = send(before, A, choose(before, "return"));
    expect(s.bank).toEqual(before.bank);
    expect(s.loose).toBe(before.loose);
    expect(s.carried).toEqual(before.carried);
    expect(s.trail).toEqual(before.trail);
    expect(s.onTrail).toEqual(before.onTrail);
    expect(s.last).toEqual(before.last);
  });

  test("wybór jest nieodwołalny: drugi ruch tej samej osoby odpada, także z tą samą treścią", () => {
    const before = trek(THREE, 3, 6);
    const s = send(before, A, choose(before, "continue"));
    rejects(s, A, choose(s, "return"));
    rejects(s, A, choose(s, "continue"));
  });

  test("kolejne odkrycie to nowy stempel: ruch sprzed odkrycia odpada", () => {
    const before = trek(THREE, 3, 6, 9);
    const old = choose(before, "continue");
    const s = decide(before);
    expect(s.reveal).toBe(2);
    rejects(s, A, old);
    expect(game.validateMove(s, A, choose(s, "continue"))).toBe(true);
  });

  test("rozstrzygnięcie zapisuje komplet decyzji tylko osób, które decydowały", () => {
    const s = decide(decide(trek(THREE, 3, 6, 9), [A]), [B]);
    expect(s.last?.reveal).toBe(2);
    expect(s.last?.choices).toEqual({ [B]: "return", [C]: "continue" });
    expect(s.last?.returned).toEqual([B]);
  });
});

describe("zagrożenia i końce wyprawy", () => {
  test("pierwsza karta danego zagrożenia tylko ostrzega", () => {
    const before = trek(TWO, 8, "roj", 2);
    const s = decide(before);
    expect(s.phase).toBe("decision");
    expect(s.carried).toEqual(before.carried);
    expect(s.loose).toBe(before.loose);
    expect(s.history).toEqual([]);
  });

  test("dwa różne zagrożenia: wyprawa trwa", () => {
    const s = decide(trek(TWO, "roj", "most", 2));
    expect(s.phase).toBe("decision");
    expect(s.trail).toEqual(deckOf("roj", "most"));
    expect(game.waitingFor(s)).toEqual(TWO);
  });

  test("druga taka sama karta: pozostali tracą carried, loose przepada, bank bez zmian", () => {
    // Pierwsza wyprawa daje bank, druga kończy się zagrożeniem na szlaku.
    const first = decide(trek(TWO, 8), TWO);
    const before = reopen(allNext(first), 9, "roj", "roj");
    const s = decide(decide(before));
    expect(s.phase).toBe("summary");
    expect(s.bank).toEqual({ [A]: 4, [B]: 4 });
    expect(s.carried).toEqual({ [A]: 0, [B]: 0 });
    expect(s.loose).toBe(0);
    expect(lastExpedition(s)).toEqual({
      trail: deckOf(9, "roj", "roj"),
      gain: { [A]: 0, [B]: 0 },
      lost: { [A]: 4, [B]: 4 },
      discarded: 1,
      end: "hazard",
      hazard: "roj",
    });
  });

  test("zagrożenie z poprzedniej wyprawy nie liczy się w następnej", () => {
    const ended = decide(trek(TWO, "roj", "roj"));
    expect(ended.phase).toBe("summary");
    const s = decide(reopen(allNext(ended), "roj", 4));
    expect(s.phase).toBe("decision");
    expect(s.expedition).toBe(1);
  });

  test("wszyscy wracają: bez następnej karty, reszta loose przepada, koniec returned", () => {
    // 5 przy 3: po 1, loose 2; trzy osoby nie podzielą 2, więc reszta przepada.
    const s = decide(trek(THREE, 5, 9), THREE);
    expect(s.phase).toBe("summary");
    expect(s.trail).toEqual(deckOf(5));
    expect(s.reveal).toBe(1);
    expect(s.onTrail).toEqual([]);
    expect(s.bank).toEqual({ [A]: 1, [B]: 1, [C]: 1 });
    expect(s.loose).toBe(0);
    expect(lastExpedition(s)).toEqual({
      trail: deckOf(5),
      gain: { [A]: 1, [B]: 1, [C]: 1 },
      lost: { [A]: 0, [B]: 0, [C]: 0 },
      discarded: 2,
      end: "returned",
      hazard: null,
    });
  });

  test("pusta talia przy kimś na szlaku: pozostali bankują carried i dzielą loose", () => {
    // 5 → po 2, loose 1; 5 → po 4, loose 2; pusta talia dzieli 2 na dwie osoby.
    const s = decide(decide(trek(TWO, 5, 5)));
    expect(s.phase).toBe("summary");
    expect(s.bank).toEqual({ [A]: 5, [B]: 5 });
    expect(s.carried).toEqual({ [A]: 0, [B]: 0 });
    expect(s.loose).toBe(0);
    expect(lastExpedition(s)).toEqual({
      trail: deckOf(5, 5),
      gain: { [A]: 5, [B]: 5 },
      lost: { [A]: 0, [B]: 0 },
      discarded: 0,
      end: "empty",
      hazard: null,
    });
  });

  test("pusta talia po wcześniejszym powrocie: niepodzielna reszta przepada", () => {
    // 5 przy 3: po 1, loose 2, A wraca z 3; 5 przy 2: po 2, loose 1; pusta talia daje B i C po 3.
    const s = decide(decide(trek(THREE, 5, 5), [A]));
    expect(s.bank).toEqual({ [A]: 3, [B]: 3, [C]: 3 });
    expect(lastExpedition(s).end).toBe("empty");
    expect(lastExpedition(s).discarded).toBe(1);
  });

  test("15 skarbów i 5 różnych zagrożeń przed powtórką: najwyżej 20 decyzji, 21. karta kończy", () => {
    const cards = [...Array.from({ length: 15 }, (_, i) => i + 1), "osuwisko", "zalanie", "roj", "przepasc", "most", "roj"] as (number | Hazard)[];
    let s = trek(TWO, ...cards);
    let decisions = 0;
    while (s.phase === "decision") {
      guard(decisions);
      s = decide(s);
      decisions++;
    }
    expect(decisions).toBe(20);
    expect(s.reveal).toBe(21);
    expect(lastExpedition(s).end).toBe("hazard");
    expect(lastExpedition(s).lost).toEqual({ [A]: 56, [B]: 56 });
    expect(lastExpedition(s).discarded).toBe(8);
  });

  test("każda przetasowana talia kończy wyprawę najpóźniej 21. kartą", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const seen = new Set<Hazard>();
      const end = buildDeck(createRng(seed)).findIndex((card) => {
        if (card.kind !== "hazard") return false;
        if (seen.has(card.hazard)) return true;
        seen.add(card.hazard);
        return false;
      });
      expect(end).toBeGreaterThanOrEqual(1);
      expect(end).toBeLessThanOrEqual(20);
    }
  });
});

describe("odsłona", () => {
  // 8 przy 3: po 2, loose 2; A wraca z 4, drugi rój kończy wyprawę B i C.
  const ended = () => decide(decide(trek(THREE, 8, "roj", "roj"), [A]));

  test("waitingFor to wszyscy uczestnicy, także ci, którzy wrócili", () => {
    const s = ended();
    expect(s.phase).toBe("summary");
    expect(game.waitingFor(s)).toEqual(THREE);
  });

  test("„Dalej” od części osób nie otwiera następnej wyprawy", () => {
    const summary = ended();
    const s = send(summary, A, next(summary));
    expect(s.phase).toBe("summary");
    expect(game.waitingFor(s)).toEqual([B, C]);
    expect(view(s).ready).toEqual([A]);
  });

  test("komplet „Dalej” otwiera następną wyprawę z pierwszą kartą, bank zachowany, carried i loose zerowane, wszyscy znów na szlaku", () => {
    const summary = ended();
    const bank = summary.bank;
    const s = allNext(summary);
    expect(s.phase).toBe("decision");
    expect(s.expedition).toBe(1);
    expect(s.nonce).toBe(summary.nonce);
    expect(s.bank).toEqual(bank);
    expect(s.onTrail).toEqual(THREE);
    expect(s.trail).toHaveLength(1);
    expect(s.reveal).toBe(1);
    expect(s.last).toBeNull();
    expect(s.history).toHaveLength(1);
    expect(sumOf(s.carried) + s.loose).toBe(treasures(s.trail));
    expect(game.waitingFor(s)).toEqual(THREE);
    expect(view(s).ready).toEqual([]);
  });

  test("następna wyprawa ma świeżą pełną talię zależną od rng", () => {
    const summary = ended();
    const a = allNext(summary, createRng(11));
    const b = allNext(summary, createRng(12));
    expectFullDeck([...a.trail, ...a.deck]);
    expectFullDeck([...b.trail, ...b.deck]);
    expect([...a.trail, ...a.deck]).not.toEqual([...b.trail, ...b.deck]);
    expect(allNext(summary, createRng(11))).toEqual(a);
  });

  test("odsłona pokazuje ostatnie rozstrzygnięcie, koniec wyprawy i odkryty szlak", () => {
    const s = ended();
    expect(s.last?.choices).toEqual({ [B]: "continue", [C]: "continue" });
    expect(s.trail).toEqual(deckOf(8, "roj", "roj"));
    expect(lastExpedition(s).end).toBe("hazard");
    expect(lastExpedition(s).hazard).toBe("roj");
  });
});

describe("koniec partii", () => {
  test("piąta wyprawa zakończona: od razu over bez odsłony, waitingFor puste, turn 0 s", () => {
    let s = decide(trek(TWO, "roj"), TWO);
    for (let i = 1; i < EXPEDITIONS - 1; i++) s = decide(reopen(allNext(s), "roj"), TWO);
    s = reopen(allNext(s), 6);
    expect(s.expedition).toBe(EXPEDITIONS - 1);
    expect(s.phase).toBe("decision");
    s = decide(s, TWO);
    expect(s.phase).toBe("over");
    expect(game.waitingFor(s)).toEqual([]);
    expect(turn(s).seconds).toBe(0);
    expect(s.history).toHaveLength(EXPEDITIONS);
    expect(s.last?.returned).toEqual(TWO);
    expect(s.bank).toEqual({ [A]: 3, [B]: 3 });
    expect(game.isOver(s)).not.toBeNull();
  });

  test("przegrana ryzyka w piątej wyprawie też kończy partię", () => {
    let s = decide(trek(TWO, "roj"), TWO);
    for (let i = 1; i < EXPEDITIONS - 1; i++) s = decide(reopen(allNext(s), "roj"), TWO);
    s = decide(reopen(allNext(s), 4, "most", "most"));
    s = decide(s);
    expect(s.phase).toBe("over");
    expect(lastExpedition(s).end).toBe("hazard");
    expect(s.bank).toEqual({ [A]: 0, [B]: 0 });
  });

  /** `winner` jako jedyny zostaje po 6 i zabiera 9: bank 11 wobec 2 u reszty. */
  function winFor(winner: string) {
    const rest = THREE.filter((p) => p !== winner);
    const s = decide(trek(THREE, 6, 9), rest);
    return quiet(decide(s, [winner]));
  }

  test.each(THREE)("wygrywa największy bank: %s", (winner) => {
    const s = winFor(winner);
    const result = game.isOver(s);
    expect(s.bank[winner]).toBe(11);
    expect(result?.winner).toBe(winner);
    expect(result?.ranking?.[0]).toBe(winner);
    expect(result?.ranking).toHaveLength(3);
    expect(places(s)[winner]).toBe(1);
    expect(game.waitingFor(s)).toEqual([]);
  });

  test("remis niżej zachowuje zwycięzcę, równe dalsze banki to wspólne miejsca", () => {
    const s = winFor(B);
    expect(game.isOver(s)?.winner).toBe(B);
    expect(game.isOver(s)?.ranking).toEqual([B, A, C]);
    expect(places(s)).toEqual({ [A]: 2, [B]: 1, [C]: 2 });
  });

  test("równe banki na górze: bez zwycięzcy, wspólne miejsca", () => {
    // A i B wracają z 3, C zostaje i traci zdobycz na drugim roju.
    const first = decide(trek(THREE, 9, "roj", "roj"), [A, B]);
    const s = quiet(decide(first));
    expect(s.bank).toEqual({ [A]: 3, [B]: 3, [C]: 0 });
    const result = game.isOver(s);
    expect(result?.winner).toBeUndefined();
    expect(result?.ranking).toEqual([A, B, C]);
    expect(places(s)).toEqual({ [A]: 1, [B]: 1, [C]: 3 });
  });

  test("ruch po końcu gry odpada", () => {
    const s = winFor(A);
    for (const p of THREE) {
      rejects(s, p, choose(s, "return"));
      rejects(s, p, next(s));
    }
  });

  test("w trakcie partii nie ma wyniku", () => {
    const s = decide(trek(TWO, "roj"), TWO);
    expect(s.phase).toBe("summary");
    expect(game.isOver(s)).toBeNull();
  });
});

describe("walidacja", () => {
  const fresh = () => trek(THREE, 3, 6, "roj", "roj");

  test("poprawny stempel przechodzi, sąsiednie wartości nie", () => {
    const s = fresh();
    const move = choose(s, "continue");
    expect(game.validateMove(s, A, move)).toBe(true);
    rejects(s, A, { ...move, nonce: s.nonce + 1 });
    rejects(s, A, { ...move, expedition: s.expedition + 1 });
    rejects(s, A, { ...move, expedition: s.expedition - 1 });
    rejects(s, A, { ...move, reveal: s.reveal + 1 });
    rejects(s, A, { ...move, reveal: s.reveal - 1 });
  });

  test("next ze starym nonce albo inną wyprawą odpada", () => {
    const s = decide(fresh(), THREE);
    const move = next(s);
    expect(game.validateMove(s, A, move)).toBe(true);
    rejects(s, A, { ...move, nonce: s.nonce + 1 });
    rejects(s, A, { ...move, expedition: s.expedition + 1 });
    rejects(s, A, { ...move, expedition: s.expedition - 1 });
  });

  test("obcy gracz i obserwator nie mogą ruszać w żadnej fazie", () => {
    const decision = fresh();
    const summary = decide(decision, THREE);
    for (const stranger of [STRANGER, OBSERVER]) {
      rejects(decision, stranger, choose(decision, "continue"));
      rejects(decision, stranger, next(decision));
      rejects(summary, stranger, next(summary));
    }
  });

  test("ruch z obozu odpada", () => {
    const s = decide(fresh(), [A]);
    rejects(s, A, choose(s, "continue"));
    rejects(s, A, choose(s, "return"));
    expect(game.validateMove(s, B, choose(s, "return"))).toBe(true);
  });

  test("next poza odsłoną odpada", () => {
    const s = fresh();
    rejects(s, A, next(s));
  });

  test("choose w odsłonie odpada", () => {
    const s = decide(fresh(), THREE);
    rejects(s, A, choose(s, "return"));
  });

  test("drugi next tej samej osoby odpada", () => {
    const summary = decide(fresh(), THREE);
    const s = send(summary, A, next(summary));
    rejects(s, A, next(s));
  });

  test("validateMove sam odrzuca złe wartości, także bez parsowania schematem", () => {
    const s = fresh();
    rejects(s, A, { ...choose(s, "return"), choice: "wait" });
    rejects(s, A, { ...choose(s, "return"), type: "kup" });
  });
});

describe("limity", () => {
  test("waitingFor kurczy się po kolei i pomija obóz", () => {
    const camp = decide(trek(SIX, 6, 12, 15), [A, B]);
    expect(game.waitingFor(camp)).toEqual([C, D, E, F]);
    let s = send(camp, C, choose(camp, "continue"));
    expect(game.waitingFor(s)).toEqual([D, E, F]);
    s = send(s, E, choose(s, "return"));
    expect(game.waitingFor(s)).toEqual([D, F]);
    s = send(s, D, choose(s, "continue"));
    expect(game.waitingFor(s)).toEqual([F]);
    s = send(s, F, choose(s, "continue"));
    expect(game.waitingFor(s)).toEqual([C, D, F]);
  });

  test("przy 2 osobach komplet to dwa wybory", () => {
    const before = trek(TWO, 3, 6);
    const s = send(before, B, choose(before, "continue"));
    expect(game.waitingFor(s)).toEqual([A]);
    expect(s.reveal).toBe(1);
    expect(send(s, A, choose(s, "continue")).reveal).toBe(2);
  });

  test("turn: 20 s w decyzji, 15 s w odsłonie, klucz z nonce, wyprawy, odkrycia i fazy", () => {
    const s = trek(TWO, 3, 6);
    expect(turn(s)).toEqual({ key: `${s.nonce}:0:1:decision`, seconds: DECISION_SECONDS });
    const summary = decide(s, TWO);
    expect(turn(summary)).toEqual({ key: `${s.nonce}:0:1:summary`, seconds: SUMMARY_SECONDS });
  });

  test("klucz czasu nie zmienia się od ruchu innego gracza", () => {
    const before = trek(THREE, 3, 6);
    const key = turn(before).key;
    const chosen = send(before, A, choose(before, "return"));
    expect(turn(chosen).key).toBe(key);
    const summary = decide(before, THREE);
    expect(turn(send(summary, A, next(summary))).key).toBe(turn(summary).key);
  });

  test("klucz czasu zmienia się przy nowym odkryciu, wyprawie, fazie i nonce", () => {
    const first = trek(TWO, 3, 6);
    const second = decide(first);
    expect(turn(second).key).not.toBe(turn(first).key);
    const summary = decide(second, TWO);
    expect(turn(summary).key).not.toBe(turn(second).key);
    const nextTrek = reopen(allNext(summary), 3, 6);
    expect(nextTrek.reveal).toBe(first.reveal);
    expect(turn(nextTrek).key).not.toBe(turn(first).key);
    expect(turn(start(TWO, 1)).key).not.toBe(turn(start(TWO, 2)).key);
  });

  test("limit decyzji to Wracam, legalny też jako zwykły ruch", () => {
    const s = trek(THREE, 3, 6);
    const move = timeoutOf(s, A);
    expect(move).toEqual(choose(s, "return"));
    expect(game.moveSchema.safeParse(move).success).toBe(true);
    expect(game.validateMove(s, A, move)).toBe(true);
    expect(game.validateMove(s, A, move, { source: "timeout" })).toBe(true);
  });

  test("limit odsłony to next, legalny też jako zwykły ruch", () => {
    const s = decide(trek(THREE, 3, 6), THREE);
    const move = timeoutOf(s, B);
    expect(move).toEqual(next(s));
    expect(game.moveSchema.safeParse(move).success).toBe(true);
    expect(game.validateMove(s, B, move)).toBe(true);
    expect(game.validateMove(s, B, move, { source: "timeout" })).toBe(true);
  });

  test("lokalny wybór bez „Gotowe” nie jest ruchem: po limicie liczy się Wracam", () => {
    const before = trek(THREE, 3, 6, 9);
    let s = send(before, A, choose(before, "continue"));
    for (const p of [B, C]) s = send(s, p, timeoutOf(s, p), createRng(1), { source: "timeout" });
    expect(s.last?.choices).toEqual({ [A]: "continue", [B]: "return", [C]: "return" });
    expect(s.onTrail).toEqual([A]);
    expect(s.bank).toEqual({ [A]: 0, [B]: 1, [C]: 1 });
  });

  test.each([[TWO], [SIX]])("komplet timeoutów: wszyscy zawsze wracają razem, koniec partii, remis (%j)", (players) => {
    const s = timeoutAll(start(players, 21));
    expect(s.phase).toBe("over");
    expect(s.history).toHaveLength(EXPEDITIONS);
    for (const record of s.history) {
      expect(record.end).toBe("returned");
      expect(record.trail).toHaveLength(1);
    }
    expect(new Set(Object.values(s.bank)).size).toBe(1);
    const result = game.isOver(s);
    expect(result?.winner).toBeUndefined();
    expect(result?.ranking).toHaveLength(players.length);
    expect(Object.values(places(s))).toEqual(players.map(() => 1));
  });
});

describe("widoki", () => {
  // Skarb 15 leży w talii nieodkryty w każdej fazie, także po końcu pierwszej wyprawy.
  const decision = () => trek(THREE, 3, 6, "roj", "roj", 15);
  const scenes = () => {
    const fresh = decision();
    const chosen = send(fresh, A, choose(fresh, "return"));
    const camp = decide(fresh, [A]);
    const campChosen = send(camp, B, choose(camp, "return"));
    const summary = decide(decide(camp));
    const over = quiet(summary);
    return { fresh, chosen, camp, campChosen, summary, over };
  };
  const SCENES = ["fresh", "chosen", "camp", "campChosen", "summary", "over"] as const;
  const VIEW_KEYS = ["bank", "carried", "deckLeft", "expedition", "history", "last", "loose", "myChoice", "nonce", "onTrail", "phase", "players", "ready", "reveal", "trail"];

  function keysDeep(value: unknown): string[] {
    if (!value || typeof value !== "object") return [];
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keysDeep(inner)]);
  }

  test.each(SCENES)("whitelista kluczy widoku dla każdego oglądającego: %s", (name) => {
    const s = scenes()[name];
    for (const viewer of [A, B, C, OBSERVER, STRANGER]) {
      expect(Object.keys(view(s, viewer)).sort()).toEqual(VIEW_KEYS);
    }
  });

  test.each(SCENES)("widok nie niesie talii, seeda ani nieodkrytych kart: %s", (name) => {
    const s = scenes()[name];
    for (const viewer of [A, B, C, OBSERVER, STRANGER]) {
      const v = view(s, viewer);
      const keys = keysDeep(v);
      expect(keys).not.toContain("deck");
      expect(keys).not.toContain("seed");
      expect(JSON.stringify(v)).not.toContain('"value":15');
    }
  });

  test.each(SCENES)("deckLeft podaje tylko liczbę pozostałych kart: %s", (name) => {
    const s = scenes()[name];
    expect(view(s, A).deckLeft).toBe(s.deck.length);
  });

  test.each(SCENES)("obserwator i obce id widzą to samo, bez własnego wyboru: %s", (name) => {
    const s = scenes()[name];
    expect(view(s, STRANGER)).toEqual(view(s, OBSERVER));
    expect(view(s, OBSERVER).myChoice).toBeNull();
  });

  test.each(SCENES)("widok przeżywa przejście przez JSON: %s", (name) => {
    const v = view(scenes()[name], A);
    expect(JSON.parse(JSON.stringify(v))).toEqual(v);
  });

  test("jawne dla wszystkich: banki, carried, loose, szlak i kto jest na szlaku", () => {
    const s = scenes().camp;
    for (const viewer of [A, B, OBSERVER]) {
      const v = view(s, viewer);
      expect(v.bank).toEqual(s.bank);
      expect(v.carried).toEqual(s.carried);
      expect(v.loose).toBe(s.loose);
      expect(v.trail).toEqual(s.trail);
      expect(v.onTrail).toEqual([B, C]);
    }
  });

  test("gracz na szlaku widzi własny zatwierdzony wybór, a nie cudzy", () => {
    const s = scenes().chosen;
    expect(view(s, A).myChoice).toBe("return");
    for (const viewer of [B, C, OBSERVER]) {
      const v = view(s, viewer);
      expect(v.myChoice).toBeNull();
      expect(v.ready).toEqual([A]);
      expect(JSON.stringify(v)).not.toContain('"return"');
    }
  });

  test("jawna jest gotowość, nie jej treść", () => {
    const before = decision();
    const asContinue = send(before, A, choose(before, "continue"));
    const asReturn = send(before, A, choose(before, "return"));
    expect(view(asContinue, B)).toEqual(view(asReturn, B));
    expect(view(asContinue, OBSERVER)).toEqual(view(asReturn, OBSERVER));
  });

  test("gracz w obozie nie zna cudzych wyborów przed rozstrzygnięciem", () => {
    const s = scenes().campChosen;
    const v = view(s, A);
    expect(v.myChoice).toBeNull();
    expect(v.ready).toEqual([B]);
    expect(v.last?.reveal).toBe(1);
    expect(v.last?.choices).toEqual({ [A]: "return", [B]: "continue", [C]: "continue" });
  });

  test("cudze wybory są jawne dopiero w last, także dla obozu i obserwatora", () => {
    const camp = scenes().camp;
    const resolved = send(send(camp, B, choose(camp, "return")), C, choose(camp, "continue"));
    for (const viewer of [A, B, C, OBSERVER, STRANGER]) {
      expect(view(resolved, viewer).last?.reveal).toBe(2);
      expect(view(resolved, viewer).last?.choices).toEqual({ [B]: "return", [C]: "continue" });
    }
  });

  test("własny zatwierdzony wybór wraca po przeładowaniu, a nowe odkrycie go czyści", () => {
    const s = scenes().chosen;
    const reloaded = JSON.parse(JSON.stringify(s)) as State;
    expect(view(reloaded, A).myChoice).toBe("return");
    const fresh = decision();
    const chosen = send(fresh, B, choose(fresh, "continue"));
    expect(view(chosen, B).myChoice).toBe("continue");
    const nextReveal = decide(fresh);
    expect(view(nextReveal, B).myChoice).toBeNull();
    expect(view(nextReveal, B).ready).toEqual([]);
  });

  test("nowa partia nie ma zatwierdzonego wyboru", () => {
    const s = start(THREE, 2);
    for (const p of THREE) expect(view(s, p).myChoice).toBeNull();
  });

  test("po końcu ostatnia odsłona zostaje w widoku", () => {
    const s = scenes().over;
    const v = view(s, A);
    expect(v.phase).toBe("over");
    expect(v.history).toHaveLength(EXPEDITIONS);
    expect(v.last).not.toBeNull();
    expect(v.history[0].trail).toEqual(deckOf(3, 6, "roj", "roj"));
  });
});

describe("bilans monet", () => {
  /** Monety bieżącego stanu względem wszystkich odkrytych skarbów. */
  function expectBalanced(s: State) {
    const ended = sum(s.history.map((record) => record.discarded + sumOf(record.lost)));
    const revealed = sum(s.history.map((record) => treasures(record.trail))) + (s.phase === "decision" ? treasures(s.trail) : 0);
    expect(sumOf(s.bank) + sumOf(s.carried) + s.loose + ended).toBe(revealed);
  }

  test.each([2, 3, 4, 5, 6])("suma gain, lost i discarded równa sumie odkrytych skarbów po każdej wyprawie: %i graczy", (count) => {
    for (let seed = 1; seed <= 25; seed++) {
      const players = SIX.slice(0, count);
      const strategy = createRng(seed * 31);
      const s = playAll(start(players, seed), () => (strategy() < 0.25 ? "return" : "continue"), createRng(seed + 1), expectBalanced);
      expect(s.phase).toBe("over");
      for (const record of s.history) {
        expect(sumOf(record.gain) + sumOf(record.lost) + record.discarded).toBe(treasures(record.trail));
      }
      for (const p of players) {
        expect(s.bank[p]).toBe(sum(s.history.map((record) => record.gain[p])));
        expect(s.bank[p]).toBeGreaterThanOrEqual(0);
        expect(s.bank[p]).toBeLessThanOrEqual(600);
      }
      expect(sumOf(s.bank)).toBeLessThanOrEqual(600);
    }
  });

  test("same „Idę dalej” kończą każdą wyprawę zagrożeniem, najpóźniej 21. kartą", () => {
    const s = playAll(start(SIX, 9), () => "continue", createRng(10));
    for (const record of s.history) {
      expect(record.end).toBe("hazard");
      expect(record.trail.length).toBeLessThanOrEqual(21);
    }
  });
});

describe("bank bez podwójnych wpisów", () => {
  test("nic nie trafia do banku drugi raz po przeładowaniu, next ani powtórzonej wiadomości", () => {
    const before = trek(TWO, 8, 6);
    const returned = send(before, A, choose(before, "return"));
    rejects(returned, A, choose(before, "return"));
    const summary = send(returned, B, choose(returned, "return"));
    expect(summary.bank).toEqual({ [A]: 4, [B]: 4 });
    rejects(summary, A, choose(before, "return"));

    const reloaded = JSON.parse(JSON.stringify(summary)) as State;
    expect(reloaded.bank).toEqual(summary.bank);
    expect(view(reloaded, A).bank).toEqual(summary.bank);

    const ready = send(summary, A, next(summary));
    rejects(ready, A, next(summary));
    expect(ready.bank).toEqual(summary.bank);
    const opened = send(ready, B, next(ready));
    expect(opened.bank).toEqual(summary.bank);
    rejects(opened, B, next(summary));
  });
});

describe("stan", () => {
  test("applyMove nie zmienia poprzedniego stanu", () => {
    const before = trek(THREE, 3, 6, "roj", "roj");
    const snapshot = JSON.stringify(before);
    const chosen = send(before, A, choose(before, "return"));
    expect(JSON.stringify(before)).toBe(snapshot);
    const chosenSnapshot = JSON.stringify(chosen);
    send(send(chosen, B, choose(chosen, "continue")), C, choose(chosen, "continue"));
    expect(JSON.stringify(chosen)).toBe(chosenSnapshot);
  });

  test("openExpedition nie zmienia podanego stanu", () => {
    const before = start();
    const snapshot = JSON.stringify(before);
    reopen(before, 3, 6);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  test("stan przeżywa JSON w każdej fazie partii", () => {
    const strategy = createRng(77);
    playAll(start(THREE, 4), () => (strategy() < 0.3 ? "return" : "continue"), createRng(5), (s) => {
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    });
  });

  test("partia dokończona z kopii JSON daje ten sam wynik", () => {
    const original = decide(trek(TWO, 3, 6, 9), []);
    const copy = JSON.parse(JSON.stringify(original)) as State;
    expect(decide(copy, [A])).toEqual(decide(original, [A]));
  });

  test.each([[TWO], [SIX]])("partia dochodzi do końca samymi timeoutami (%j)", (players) => {
    const s = timeoutAll(start(players, 8));
    expect(game.isOver(s)).not.toBeNull();
    expect(game.waitingFor(s)).toEqual([]);
    expect(timeoutAll(s)).toEqual(s);
  });
});
