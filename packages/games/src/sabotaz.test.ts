import { describe, expect, test } from "vitest";
import { createRng, type MoveContext, type Rng } from "./core.ts";
import {
  INITIAL_SECONDS,
  type Kind,
  type Move,
  ROUNDS,
  SAFE_CARDS,
  sabotaz as game,
  type State,
  SUCCESS_POINTS,
  SUMMARY_SECONDS,
  TRAP_CARDS,
  TRAP_POINTS,
  TURN_SECONDS,
  type View,
} from "./sabotaz.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 3-6 graczy, 6 rund (round 0..5) bez eliminacji, w każdej rundzie świeże 3 Przejścia i 1 Pułapka, rozpoczyna players[round % N],
// - pierwsza karta naraz i potajemnie, potem po kolei: dołożenie na wierzch albo otwarcie licytacji od 1 do T; z pustą ręką tylko licytacja,
// - po otwarciu nie ma dokładania; podbicia z dowolnym skokiem do T, pas do końca licytacji, poprzedni lider może wrócić, T wymaga pasów pozostałych,
// - lider odkrywa łącznie K kart: serwer najpierw odkrywa własny stos od góry, potem lider wybiera wierzch cudzego stosu,
//   a ostatni niepusty cudzy stos serwer odkrywa sam; próba kończy się dokładnie na celu albo pierwszej pułapce,
// - sukces: lider +2, cudza pułapka: jej właściciel +1, własna pułapka: wszyscy 0,
// - odsłona ujawnia całą rundę; next wszystkich albo limit otwiera nową rundę; po szóstej rundzie od razu koniec bez next,
// - wygrywa najwyższa suma, remis na górze bez zwycięzcy, równe sumy to wspólne miejsca,
// - każdy ruch ma nonce i rundę, ruch turowy także numer decyzji, stary ruch odpada; duplikat initial/next odpada przez gotowość,
// - widok nie zdradza zakrytych kart innych osób, obserwator i obcy id nie mają prywatnych danych, historia niesie tylko zakończone rundy,
// - limity 30/60/15 s: wspólny termin initial i summary, nowy przy każdej decyzji turowej, także kolejnym odkryciu tej samej osoby,
// - timeout: initial Przejście, place licytacja 1, bid pas, reveal losowy legalny cudzy stos, summary next; rng tylko na nonce i wybór stosu.

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";
const E = "ewa";
const F = "filip";
const THREE = [A, B, C];
const FOUR = [A, B, C, D];
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

function send(s: State, player: string, move: Move, context?: MoveContext): State {
  expect(game.validateMove(s, player, move, context), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return deepFreeze(game.applyMove(s, player, move, createRng(1)));
}

const view = (s: State, player = OBSERVER) => game.playerView(s, player) as View;
const players = (s: State) => view(s).players;
const phase = (s: State) => view(s).phase;
const turn = (s: State) => view(s).turn as string;
const at = (s: State) => ({ nonce: view(s).nonce, round: view(s).round });
const atDecision = (s: State) => ({ ...at(s), decision: view(s).decision });

const place = (s: State, kind: Kind): Move => (phase(s) === "initial" ? { type: "place", kind, ...at(s) } : { type: "place", kind, ...atDecision(s) });
const bid = (s: State, amount: number): Move => ({ type: "bid", amount, ...atDecision(s) });
const pass = (s: State): Move => ({ type: "pass", ...atDecision(s) });
const reveal = (s: State, owner: string): Move => ({ type: "reveal", owner, ...atDecision(s) });
const next = (s: State): Move => ({ type: "next", ...at(s) });
/** Ruch spoza schematu, do sprawdzania validateMove bez parsowania. */
const raw = (move: unknown) => move as Move;

/** Pierwsze karty wszystkich; bez podania rodzaju Przejście. */
function initials(s: State, kinds: Record<string, Kind> = {}) {
  return players(s).reduce((acc, p) => send(acc, p, place(acc, kinds[p] ?? "safe")), s);
}

/** Dokłada po kolei po jednej karcie każdego gracza; bez podania rodzaju Przejście. */
function placeAll(s: State, kinds: Record<string, Kind> = {}) {
  return players(s).reduce((acc) => {
    const p = turn(acc);
    return send(acc, p, place(acc, kinds[p] ?? "safe"));
  }, s);
}

/** Otwarcie przez gracza z ruchem, potem wszyscy pasują. */
const openAndPassAll = (s: State, amount: number) => passAll(send(s, turn(s), bid(s, amount)));

function passAll(s: State) {
  let acc = s;
  while (phase(acc) === "bid") acc = send(acc, turn(acc), pass(acc));
  return acc;
}

const firstForeign = (s: State) => players(s).find((p) => p !== view(s).leader && view(s).stackSizes[p] > 0) as string;

/** Runda od pierwszych kart: same Przejścia, `winner` kończy sukcesem. Zwraca stan w odsłonie albo po końcu. */
function win(s: State, winner: string) {
  let acc = initials(s);
  acc = send(acc, turn(acc), bid(acc, 1));
  if (view(acc).leader !== winner) {
    while (phase(acc) === "bid") {
      const p = turn(acc);
      acc = send(acc, p, p === winner ? bid(acc, 2) : pass(acc));
    }
  } else {
    acc = passAll(acc);
  }
  while (phase(acc) === "reveal") acc = send(acc, turn(acc), reveal(acc, firstForeign(acc)));
  return acc;
}

const nextAll = (s: State) => game.waitingFor(s).reduce((acc, p) => send(acc, p, next(acc)), s);

/** Sześć rund; `winners[r]` wygrywa rundę r. */
function playGame(participants: string[], winners: string[]) {
  let s = start(participants);
  winners.forEach((winner, round) => {
    s = win(s, winner);
    if (round < winners.length - 1) s = nextAll(s);
  });
  return s;
}

function tick(s: State, rng: Rng = createRng(1)) {
  return game.waitingFor(s).reduce((acc, p) => {
    const move = game.timeoutMove!(acc, p, rng);
    expect(game.moveSchema.safeParse(move).success, JSON.stringify(move)).toBe(true);
    return send(acc, p, move);
  }, s);
}

/** A, B i C mają po dwie karty na stosie; A jest liderem z deklaracją `amount`, własny stos odkryty. */
function revealPhase(amount: number, kinds: Record<string, Kind> = {}) {
  const s = placeAll(initials(start(), kinds));
  return openAndPassAll(s, amount);
}

function counting(rng: Rng = createRng(1)) {
  const counter = () => {
    counter.calls++;
    return rng();
  };
  counter.calls = 0;
  return counter;
}

describe("definicja gry", () => {
  test("3-6 graczy, trwałe id, bez trybów, podglądu i rekordów, limit zależny od fazy", () => {
    expect(game.id).toBe("sabotaz");
    expect(game.name).toBe("Sabotaż");
    expect(game.minPlayers).toBe(3);
    expect(game.maxPlayers).toBe(6);
    expect(game.turn).toBeTypeOf("function");
    expect(game.modes).toBeUndefined();
    expect(game.live).toBeUndefined();
    expect(game.record).toBeUndefined();
  });

  test("stałe zatwierdzonych zasad", () => {
    expect(ROUNDS).toBe(6);
    expect(SAFE_CARDS).toBe(3);
    expect(TRAP_CARDS).toBe(1);
    expect(INITIAL_SECONDS).toBe(30);
    expect(TURN_SECONDS).toBe(60);
    expect(SUMMARY_SECONDS).toBe(15);
    expect(SUCCESS_POINTS).toBe(2);
    expect(TRAP_POINTS).toBe(1);
  });
});

describe("setup", () => {
  test("świeża gra: runda 0, pierwsze karty, nikt nie jest gotowy, zero punktów, puste stosy i pełne ręce", () => {
    const s = start();
    const v = view(s);
    expect(game.isOver(s)).toBeNull();
    expect(v.players).toEqual(THREE);
    expect(v.round).toBe(0);
    expect(v.phase).toBe("initial");
    expect(v.decision).toBe(0);
    expect(v.turn).toBeNull();
    expect(v.leader).toBeNull();
    expect(v.bid).toBeNull();
    expect(v.passed).toEqual([]);
    expect(v.ready).toEqual([]);
    expect(v.reveals).toEqual([]);
    expect(v.history).toEqual([]);
    for (const p of THREE) {
      expect(v.handSizes[p]).toBe(4);
      expect(v.stackSizes[p]).toBe(0);
      expect(v.totals[p]).toBe(0);
    }
    expect(game.waitingFor(s)).toEqual(THREE);
  });

  test("ręka każdego gracza to 3 Przejścia i 1 Pułapka, przy 3 i 6 osobach", () => {
    for (const participants of [THREE, SIX]) {
      const s = start(participants);
      for (const p of participants) expect(view(s, p).me).toEqual({ hand: { safe: 3, trap: 1 }, stack: [] });
    }
  });

  test("ten sam seed daje ten sam nonce, wybrane różne seedy różne, nonce to liczba całkowita", () => {
    expect(view(start(THREE, 7)).nonce).toBe(view(start(THREE, 7)).nonce);
    expect(view(start(THREE, 1)).nonce).not.toBe(view(start(THREE, 2)).nonce);
    expect(Number.isInteger(view(start()).nonce)).toBe(true);
  });
});

describe("schemat ruchu", () => {
  const base = { nonce: 1, round: 0 };
  const turnBase = { ...base, decision: 0 };

  test("przyjmuje każdy poprawny kształt", () => {
    for (const move of [
      { type: "place", kind: "safe", ...base },
      { type: "place", kind: "trap", ...turnBase },
      { type: "bid", amount: 1, ...turnBase },
      { type: "pass", ...turnBase },
      { type: "reveal", owner: B, ...turnBase },
      { type: "next", ...base },
    ]) {
      expect(game.moveSchema.safeParse(move).success, JSON.stringify(move)).toBe(true);
    }
  });

  test("odrzuca braki pól, nieznany rodzaj, ułamki, NaN, Infinity i złe typy", () => {
    for (const move of [
      null,
      "bid",
      {},
      { type: "skok", ...turnBase },
      { type: "place", ...base },
      { type: "place", kind: "joker", ...base },
      { type: "place", kind: "safe", round: 0 },
      { type: "place", kind: "safe", nonce: 1 },
      { type: "place", kind: "safe", nonce: "1", round: 0 },
      { type: "bid", ...turnBase },
      { type: "bid", amount: 1, ...base },
      { type: "bid", amount: 1.5, ...turnBase },
      { type: "bid", amount: Number.NaN, ...turnBase },
      { type: "bid", amount: Number.POSITIVE_INFINITY, ...turnBase },
      { type: "bid", amount: "2", ...turnBase },
      { type: "pass", ...base },
      { type: "pass", ...turnBase, decision: 0.5 },
      { type: "reveal", ...turnBase },
      { type: "reveal", owner: 123, ...turnBase },
      { type: "reveal", owner: "x".repeat(65), ...turnBase },
      { type: "reveal", owner: B, ...base },
      { type: "next", nonce: 1 },
      { type: "next", round: 0 },
      { type: "next", nonce: 1.5, round: 0 },
      { type: "next", nonce: 1, round: -1 },
    ]) {
      expect(game.moveSchema.safeParse(move).success, JSON.stringify(move)).toBe(false);
    }
  });
});

describe("walidacja", () => {
  test("gracz spoza gry, obserwator i id z prototypu nie mają ruchu w żadnej fazie", () => {
    const initial = start();
    const bidding = send(initials(start()), A, bid(initials(start()), 1));
    for (const p of [STRANGER, OBSERVER, "__proto__", "constructor"]) {
      expect(game.validateMove(initial, p, place(initial, "safe"))).toBe(false);
      expect(game.validateMove(bidding, p, pass(bidding))).toBe(false);
    }
  });

  test("ruch w złej fazie odpada", () => {
    const initial = start();
    expect(game.validateMove(initial, A, bid(initial, 1))).toBe(false);
    expect(game.validateMove(initial, A, pass(initial))).toBe(false);
    expect(game.validateMove(initial, A, reveal(initial, B))).toBe(false);
    expect(game.validateMove(initial, A, next(initial))).toBe(false);

    const placing = initials(start());
    expect(game.validateMove(placing, A, pass(placing))).toBe(false);
    expect(game.validateMove(placing, A, reveal(placing, B))).toBe(false);
    expect(game.validateMove(placing, A, next(placing))).toBe(false);

    const bidding = send(placing, A, bid(placing, 1));
    expect(game.validateMove(bidding, B, place(bidding, "safe"))).toBe(false);
    expect(game.validateMove(bidding, B, reveal(bidding, A))).toBe(false);
    expect(game.validateMove(bidding, B, next(bidding))).toBe(false);

    const revealing = revealPhase(3);
    expect(game.validateMove(revealing, A, pass(revealing))).toBe(false);
    expect(game.validateMove(revealing, A, bid(revealing, 4))).toBe(false);
    expect(game.validateMove(revealing, A, place(revealing, "safe"))).toBe(false);
    expect(game.validateMove(revealing, A, next(revealing))).toBe(false);

    const summary = win(start(), A);
    expect(game.validateMove(summary, A, place(summary, "safe"))).toBe(false);
    expect(game.validateMove(summary, A, bid(summary, 1))).toBe(false);
    expect(game.validateMove(summary, A, pass(summary))).toBe(false);
    expect(game.validateMove(summary, A, reveal(summary, B))).toBe(false);
  });

  test("ruch poza swoją turą odpada", () => {
    const placing = initials(start());
    expect(game.validateMove(placing, B, place(placing, "safe"))).toBe(false);
    expect(game.validateMove(placing, B, bid(placing, 1))).toBe(false);

    const bidding = send(placing, A, bid(placing, 1));
    expect(game.validateMove(bidding, A, bid(bidding, 2))).toBe(false);
    expect(game.validateMove(bidding, A, pass(bidding))).toBe(false);
    expect(game.validateMove(bidding, C, pass(bidding))).toBe(false);

    const revealing = revealPhase(3);
    expect(game.validateMove(revealing, B, reveal(revealing, C))).toBe(false);
  });

  test("ruch ze starym nonce, rundą albo numerem decyzji odpada", () => {
    const placing = initials(start());
    const move = place(placing, "safe");
    expect(game.validateMove(placing, A, { ...move, nonce: view(placing).nonce + 1 })).toBe(false);
    expect(game.validateMove(placing, A, { ...move, round: 1 })).toBe(false);
    expect(game.validateMove(placing, A, { ...move, decision: view(placing).decision + 1 } as Move)).toBe(false);

    const initial = start();
    expect(game.validateMove(initial, A, { ...place(initial, "safe"), nonce: view(initial).nonce + 1 })).toBe(false);

    const summary = win(start(), A);
    const stale = next(summary);
    const fresh = nextAll(summary);
    expect(game.validateMove(fresh, A, stale)).toBe(false);
    expect(game.validateMove(fresh, A, { type: "place", kind: "safe", ...at(summary) })).toBe(false);
  });

  test("ruch turowy bez numeru decyzji odpada, a pierwsza karta z numerem też", () => {
    const placing = initials(start());
    expect(game.validateMove(placing, A, { type: "place", kind: "safe", ...at(placing) })).toBe(false);
    expect(game.validateMove(placing, A, raw({ type: "bid", amount: 1, ...at(placing) }))).toBe(false);

    const initial = start();
    expect(game.validateMove(initial, A, { type: "place", kind: "safe", ...atDecision(initial) })).toBe(false);
  });

  test("zaległy duplikat dołożenia z poprzedniej decyzji odpada", () => {
    const placing = initials(start());
    const move = place(placing, "safe");
    const afterA = send(placing, A, move);
    const afterB = send(afterA, B, place(afterA, "safe"));
    const backToA = send(afterB, C, place(afterB, "safe"));
    expect(turn(backToA)).toBe(A);
    expect(game.validateMove(backToA, A, move)).toBe(false);
  });

  test("drugi wybór pierwszej karty i drugi next tego samego gracza odpadają", () => {
    const initial = send(start(), A, place(start(), "safe"));
    expect(game.validateMove(initial, A, place(initial, "trap"))).toBe(false);

    const summary = send(win(start(), A), A, next(win(start(), A)));
    expect(game.validateMove(summary, A, next(summary))).toBe(false);
    expect(game.validateMove(summary, B, next(summary))).toBe(true);
  });

  test("validateMove sam odrzuca złe wartości, także bez parsowania schematem", () => {
    const placing = initials(start());
    const d = atDecision(placing);
    for (const move of [
      { type: "bid", amount: 1.5, ...d },
      { type: "bid", amount: Number.NaN, ...d },
      { type: "bid", amount: Number.POSITIVE_INFINITY, ...d },
      { type: "bid", amount: "2", ...d },
      { type: "bid", ...d },
      { type: "place", kind: "joker", ...d },
      { type: "place", kind: "__proto__", ...d },
      { type: "place", ...d },
      { type: "skok", ...d },
      {},
    ]) {
      expect(game.validateMove(placing, A, raw(move)), JSON.stringify(move)).toBe(false);
    }
    const revealing = revealPhase(4);
    for (const owner of [STRANGER, OBSERVER, "__proto__", "constructor", 7, null]) {
      expect(game.validateMove(revealing, A, raw({ type: "reveal", owner, ...atDecision(revealing) })), String(owner)).toBe(false);
    }
  });

  test("kontekst timeoutu ani pole source w ruchu nie dają żadnych uprawnień", () => {
    const placing = initials(start());
    const illegal = bid(placing, 99);
    expect(game.validateMove(placing, A, illegal, { source: "timeout" })).toBe(false);
    expect(game.validateMove(placing, A, raw({ ...illegal, source: "timeout" }))).toBe(false);
    expect(game.validateMove(placing, B, place(placing, "safe"), { source: "timeout" })).toBe(false);
  });

  test("po końcu gry każdy ruch odpada", () => {
    const over = playGame(THREE, [A, A, A, A, A, A]);
    expect(phase(over)).toBe("over");
    for (const move of [place(over, "safe"), bid(over, 1), pass(over), reveal(over, B), next(over)]) {
      for (const p of THREE) expect(game.validateMove(over, p, move), JSON.stringify(move)).toBe(false);
    }
  });
});

describe("pierwsza karta", () => {
  test("waitingFor kurczy się po każdym wyborze, a gotowość jest jawna", () => {
    let s = start();
    s = send(s, B, place(s, "trap"));
    expect(game.waitingFor(s)).toEqual([A, C]);
    expect(view(s).ready).toEqual([B]);
    expect(phase(s)).toBe("initial");
    s = send(s, A, place(s, "safe"));
    expect(game.waitingFor(s)).toEqual([C]);
  });

  test("każdy kładzie kartę na własny stos i traci ją z ręki", () => {
    let s = start();
    s = send(s, A, place(s, "trap"));
    expect(view(s, A).me).toEqual({ hand: { safe: 3, trap: 0 }, stack: ["trap"] });
    expect(view(s).stackSizes[A]).toBe(1);
    expect(view(s).handSizes[A]).toBe(3);
  });

  test("po wszystkich wyborach układanie zaczyna players[0]", () => {
    const s = initials(start());
    expect(phase(s)).toBe("place");
    expect(view(s).ready).toEqual([]);
    expect(turn(s)).toBe(A);
    expect(game.waitingFor(s)).toEqual([A]);
  });

  test("wybór pierwszej karty nie podnosi numeru decyzji", () => {
    expect(view(initials(start())).decision).toBe(0);
  });
});

describe("dokładanie", () => {
  test("karta ląduje na wierzchu własnego stosu, a ruch przechodzi do następnej osoby", () => {
    let s = initials(start(), { [A]: "trap" });
    s = send(s, A, place(s, "safe"));
    expect(view(s, A).me).toEqual({ hand: { safe: 2, trap: 0 }, stack: ["trap", "safe"] });
    expect(turn(s)).toBe(B);
    expect(view(s).decision).toBe(1);
  });

  test("po ostatnim graczu ruch wraca do pierwszego", () => {
    expect(turn(placeAll(initials(start())))).toBe(A);
  });

  test("nie można dołożyć rodzaju, którego nie ma w ręce", () => {
    const s = initials(start(), { [A]: "trap" });
    expect(game.validateMove(s, A, place(s, "trap"))).toBe(false);
    expect(game.validateMove(s, A, place(s, "safe"))).toBe(true);
  });

  test("można wyczerpać całe 3 Przejścia i Pułapkę, po czym ręka jest pusta", () => {
    let s = initials(start());
    s = placeAll(s);
    s = placeAll(s);
    s = placeAll(s, { [A]: "trap", [B]: "trap", [C]: "trap" });
    for (const p of THREE) expect(view(s, p).me).toEqual({ hand: { safe: 0, trap: 0 }, stack: ["safe", "safe", "safe", "trap"] });
    expect(view(s).stackSizes[A]).toBe(4);
    expect(view(s).handSizes[A]).toBe(0);
  });

  test("z pustą ręką trzeba otworzyć licytację", () => {
    let s = placeAll(placeAll(initials(start())));
    s = placeAll(s, { [A]: "trap", [B]: "trap", [C]: "trap" });
    expect(game.validateMove(s, A, place(s, "safe"))).toBe(false);
    expect(game.validateMove(s, A, place(s, "trap"))).toBe(false);
    expect(game.validateMove(s, A, bid(s, 12))).toBe(true);
  });

  test("po otwarciu licytacji dokładanie jest zamknięte do końca rundy", () => {
    const placing = initials(start());
    const s = send(placing, A, bid(placing, 1));
    expect(phase(s)).toBe("bid");
    expect(game.validateMove(s, B, place(s, "safe"))).toBe(false);
  });
});

describe("licytacja", () => {
  test("otwarcie: 1 i T są legalne, 0 i T+1 nie", () => {
    const three = initials(start());
    expect(game.validateMove(three, A, bid(three, 0))).toBe(false);
    expect(game.validateMove(three, A, bid(three, 1))).toBe(true);
    expect(game.validateMove(three, A, bid(three, 3))).toBe(true);
    expect(game.validateMove(three, A, bid(three, 4))).toBe(false);
    expect(game.validateMove(three, A, bid(three, -1))).toBe(false);

    const six = placeAll(three);
    expect(game.validateMove(six, A, bid(six, 6))).toBe(true);
    expect(game.validateMove(six, A, bid(six, 7))).toBe(false);
  });

  test("otwierający zostaje liderem, a ruch dostaje następna osoba", () => {
    const placing = initials(start());
    const s = send(placing, A, bid(placing, 2));
    const v = view(s);
    expect(v.phase).toBe("bid");
    expect(v.leader).toBe(A);
    expect(v.bid).toBe(2);
    expect(v.turn).toBe(B);
    expect(game.waitingFor(s)).toEqual([B]);
  });

  test("podbicie musi być większe od aktualnej deklaracji i nie większe od T; skok wartości jest legalny", () => {
    let s = placeAll(initials(start()));
    s = send(s, A, bid(s, 2));
    expect(game.validateMove(s, B, bid(s, 1))).toBe(false);
    expect(game.validateMove(s, B, bid(s, 2))).toBe(false);
    expect(game.validateMove(s, B, bid(s, 3))).toBe(true);
    expect(game.validateMove(s, B, bid(s, 6))).toBe(true);
    expect(game.validateMove(s, B, bid(s, 7))).toBe(false);
    s = send(s, B, bid(s, 5));
    expect(view(s).leader).toBe(B);
    expect(view(s).bid).toBe(5);
    expect(turn(s)).toBe(C);
  });

  test("poprzedni lider może później podbić ponownie", () => {
    let s = placeAll(initials(start()));
    s = send(s, A, bid(s, 1));
    s = send(s, B, bid(s, 2));
    s = send(s, C, pass(s));
    expect(turn(s)).toBe(A);
    s = send(s, A, bid(s, 3));
    expect(view(s).leader).toBe(A);
    expect(turn(s)).toBe(B);
  });

  test("poprzedni lider może też spasować i wtedy pas jest ostateczny", () => {
    let s = placeAll(placeAll(initials(start(FOUR))));
    s = send(s, A, bid(s, 1));
    s = send(s, B, bid(s, 2));
    s = send(s, C, bid(s, 3));
    s = send(s, D, pass(s));
    s = send(s, A, pass(s));
    expect(view(s).passed).toEqual([D, A]);
    s = send(s, B, bid(s, 4));
    expect(turn(s)).toBe(C);
    s = send(s, C, bid(s, 5));
    expect(turn(s)).toBe(B);
    expect(game.validateMove(s, A, bid(s, 6))).toBe(false);
    expect(game.validateMove(s, D, pass(s))).toBe(false);
  });

  test("pas wyklucza tylko z tej licytacji, karty pasującego zostają na stole", () => {
    let s = placeAll(initials(start()));
    s = send(s, A, bid(s, 1));
    s = send(s, B, pass(s));
    expect(view(s).passed).toEqual([B]);
    expect(view(s).stackSizes[B]).toBe(2);
    expect(turn(s)).toBe(C);
  });

  test("pasujący jest pomijany, a lider nigdy nie dostaje ruchu w licytacji", () => {
    let s = placeAll(initials(start(FOUR)));
    s = send(s, A, bid(s, 1));
    s = send(s, B, pass(s));
    s = send(s, C, bid(s, 2));
    s = send(s, D, pass(s));
    expect(turn(s)).toBe(A);
    s = send(s, A, bid(s, 3));
    expect(turn(s)).toBe(C);
    while (phase(s) === "bid") {
      expect(turn(s)).not.toBe(view(s).leader);
      s = send(s, turn(s), pass(s));
    }
  });

  test("gdy poza liderem wszyscy spasowali, lider przechodzi do odkrywania", () => {
    const placing = placeAll(initials(start()));
    const s = openAndPassAll(placing, 4);
    expect(phase(s)).toBe("reveal");
    expect(view(s).leader).toBe(A);
    expect(view(s).bid).toBe(4);
    expect(turn(s)).toBe(A);
    expect(game.waitingFor(s)).toEqual([A]);
  });

  test("deklaracja T nie kończy licytacji sama: pozostali mogą tylko spasować, dopiero komplet pasów zaczyna próbę", () => {
    const placing = initials(start());
    let s = send(placing, A, bid(placing, 3));
    expect(phase(s)).toBe("bid");
    expect(game.validateMove(s, B, bid(s, 4))).toBe(false);
    expect(game.validateMove(s, B, bid(s, 3))).toBe(false);
    s = send(s, B, pass(s));
    expect(phase(s)).toBe("bid");
    expect(game.validateMove(s, C, bid(s, 4))).toBe(false);
    s = send(s, C, pass(s));
    expect(phase(s)).not.toBe("bid");
  });

  test("każda decyzja w licytacji podnosi numer decyzji", () => {
    const placing = initials(start());
    let s = send(placing, A, bid(placing, 1));
    expect(view(s).decision).toBe(1);
    s = send(s, B, pass(s));
    expect(view(s).decision).toBe(2);
  });
});

describe("odkrywanie własnego stosu", () => {
  test("serwer odkrywa własny stos od góry bez ruchu gracza, a wymuszona próba od razu daje odsłonę", () => {
    const s = openAndPassAll(placeAll(initials(start()), { [A]: "safe" }), 2);
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals).toEqual([{ owner: A, kind: "safe" }, { owner: A, kind: "safe" }]);
  });

  test("własny stos jest odkrywany od wierzchu do spodu", () => {
    const s = openAndPassAll(placeAll(initials(start(), { [A]: "trap" })), 2);
    expect(view(s).reveals).toEqual([{ owner: A, kind: "safe" }, { owner: A, kind: "trap" }]);
  });

  test("cel 1 przy własnej Pułapce pod Przejściem to sukces, a Pułapka zostaje zakryta do odsłony", () => {
    const s = openAndPassAll(placeAll(initials(start(), { [A]: "trap" })), 1);
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals).toEqual([{ owner: A, kind: "safe" }]);
    expect(view(s).totals[A]).toBe(SUCCESS_POINTS);
    expect(view(s).history[0].trapOwner).toBeNull();
    expect(view(s).history[0].stacks[A]).toEqual(["trap", "safe"]);
  });

  test("własna Pułapka na wierzchu kończy próbę od razu", () => {
    const s = openAndPassAll(placeAll(initials(start()), { [A]: "trap" }), 3);
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals).toEqual([{ owner: A, kind: "trap" }]);
    expect(view(s).history[0].trapOwner).toBe(A);
  });

  test("po wyczerpaniu własnego stosu bez celu lider czeka na wybór cudzego", () => {
    const s = revealPhase(4);
    expect(phase(s)).toBe("reveal");
    expect(view(s).reveals).toEqual([{ owner: A, kind: "safe" }, { owner: A, kind: "safe" }]);
    expect(view(s).stackSizes[A]).toBe(0);
    expect(view(s, A).me?.stack).toEqual([]);
  });

  test("zakończenie licytacji automatycznym odkryciem liczy się jako jedna decyzja", () => {
    const placing = placeAll(initials(start()));
    const before = view(placing).decision;
    const s = openAndPassAll(placing, 4);
    expect(view(s).decision).toBe(before + 3);
  });
});

describe("odkrywanie cudzych stosów", () => {
  test("odkrywa się wierzch wybranego stosu", () => {
    let s = revealPhase(4, { [B]: "trap" });
    s = send(s, A, reveal(s, B));
    expect(view(s).reveals.at(-1)).toEqual({ owner: B, kind: "safe" });
    expect(view(s).stackSizes[B]).toBe(1);
  });

  test("własny stos, stos nieistniejący i stos pusty nie są legalnym celem", () => {
    let s = openAndPassAll(initials(start(FOUR)), 4);
    expect(phase(s)).toBe("reveal");
    expect(game.validateMove(s, A, reveal(s, A))).toBe(false);
    expect(game.validateMove(s, A, reveal(s, STRANGER))).toBe(false);
    s = send(s, A, reveal(s, B));
    expect(view(s).stackSizes[B]).toBe(0);
    expect(phase(s)).toBe("reveal");
    expect(game.validateMove(s, A, reveal(s, B))).toBe(false);
    expect(game.validateMove(s, A, reveal(s, C))).toBe(true);
  });

  test("między odkryciami wolno zmienić właściciela", () => {
    let s = revealPhase(5);
    s = send(s, A, reveal(s, B));
    s = send(s, A, reveal(s, C));
    s = send(s, A, reveal(s, B));
    expect(view(s).reveals.slice(2).map((r) => r.owner)).toEqual([B, C, B]);
  });

  test("każde odkrycie podnosi numer decyzji", () => {
    let s = revealPhase(5);
    const before = view(s).decision;
    s = send(s, A, reveal(s, B));
    expect(view(s).decision).toBe(before + 1);
    expect(turn(s)).toBe(A);
  });

  test("po osiągnięciu celu próba kończy się i następnej karty się nie odkrywa", () => {
    let s = revealPhase(3, { [B]: "safe", [C]: "trap" });
    s = send(s, A, reveal(s, B));
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals).toHaveLength(3);
    expect(game.validateMove(s, A, reveal(s, C))).toBe(false);
  });

  test("Pułapka kończy próbę natychmiast, także przed celem", () => {
    const placing = initials(start(), { [B]: "safe" });
    const stacked = placeAll(placing, { [B]: "trap" });
    let s = openAndPassAll(stacked, 5);
    s = send(s, A, reveal(s, B));
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals.at(-1)).toEqual({ owner: B, kind: "trap" });
    expect(view(s).reveals).toHaveLength(3);
    expect(game.validateMove(s, A, reveal(s, C))).toBe(false);
    expect(game.validateMove(s, A, reveal(s, B))).toBe(false);
  });

  test("ostatni niepusty cudzy stos serwer odkrywa sam, dokładnie do celu", () => {
    let s = revealPhase(5);
    s = send(s, A, reveal(s, B));
    expect(phase(s)).toBe("reveal");
    expect(view(s).reveals).toHaveLength(3);
    s = send(s, A, reveal(s, B));
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals).toEqual([
      { owner: A, kind: "safe" },
      { owner: A, kind: "safe" },
      { owner: B, kind: "safe" },
      { owner: B, kind: "safe" },
      { owner: C, kind: "safe" },
    ]);
    expect(view(s).history[0].stacks[C]).toHaveLength(2);
    expect(view(s).totals[A]).toBe(SUCCESS_POINTS);
  });

  test("ostatni cudzy stos odkrywa się tylko do pierwszej Pułapki", () => {
    let s = revealPhase(6, { [C]: "trap" });
    s = send(s, A, reveal(s, B));
    s = send(s, A, reveal(s, B));
    expect(phase(s)).toBe("summary");
    expect(view(s).reveals.slice(4)).toEqual([{ owner: C, kind: "safe" }, { owner: C, kind: "trap" }]);
    expect(view(s).history[0].trapOwner).toBe(C);
    expect(view(s).totals[C]).toBe(TRAP_POINTS);
  });

  test("przy dwóch niepustych cudzych stosach wybór należy do lidera", () => {
    let s = openAndPassAll(initials(start(FOUR)), 3);
    s = send(s, A, reveal(s, B));
    expect(view(s).reveals).toHaveLength(2);
    expect(phase(s)).toBe("reveal");
    expect(game.validateMove(s, A, reveal(s, C))).toBe(true);
    expect(game.validateMove(s, A, reveal(s, D))).toBe(true);
  });
});

describe("punkty", () => {
  test("sukces daje wyłącznie liderowi 2 punkty", () => {
    const s = win(start(), B);
    const v = view(s);
    expect(v.totals).toEqual({ [A]: 0, [B]: SUCCESS_POINTS, [C]: 0 });
    expect(v.history[0].gains).toEqual({ [A]: 0, [B]: SUCCESS_POINTS, [C]: 0 });
    expect(v.history[0].outcome).toBe("success");
  });

  test("cudza Pułapka daje punkt wyłącznie jej właścicielowi", () => {
    let s = openAndPassAll(initials(start(), { [C]: "trap" }), 2);
    s = send(s, A, reveal(s, C));
    const v = view(s);
    expect(v.totals).toEqual({ [A]: 0, [B]: 0, [C]: TRAP_POINTS });
    expect(v.history[0].gains).toEqual({ [A]: 0, [B]: 0, [C]: TRAP_POINTS });
    expect(v.history[0].outcome).toBe("foreign-trap");
    expect(v.history[0].trapOwner).toBe(C);
  });

  test("własna Pułapka daje wszystkim 0", () => {
    const s = openAndPassAll(initials(start(), { [A]: "trap" }), 1);
    const v = view(s);
    expect(v.totals).toEqual({ [A]: 0, [B]: 0, [C]: 0 });
    expect(v.history[0].outcome).toBe("own-trap");
    expect(v.history[0].trapOwner).toBe(A);
  });

  test("zakończona próba nie daje punktów drugi raz: ponowne odkrycie i stary ruch odpadają", () => {
    const opened = openAndPassAll(initials(start(), { [C]: "trap" }), 2);
    const move = reveal(opened, C);
    const s = send(opened, A, move);
    expect(game.validateMove(s, A, move)).toBe(false);
    expect(game.validateMove(s, A, reveal(s, B))).toBe(false);
    expect(view(s).totals[C]).toBe(TRAP_POINTS);
  });

  test("punkty sumują się między rundami", () => {
    const s = win(nextAll(win(start(), B)), B);
    expect(view(s).totals[B]).toBe(2 * SUCCESS_POINTS);
    expect(view(s).history.map((h) => h.totals[B])).toEqual([SUCCESS_POINTS, 2 * SUCCESS_POINTS]);
  });
});

describe("odsłona", () => {
  const summary = () => {
    const placing = placeAll(initials(start(), { [C]: "trap" }), { [A]: "safe", [B]: "safe", [C]: "safe" });
    let s = openAndPassAll(placing, 4);
    s = send(s, A, reveal(s, B));
    s = send(s, A, reveal(s, C));
    return s;
  };

  test("ujawnia wszystkie stosy, pozostałe ręce, deklarację, kolejność odkryć, przyrosty i sumy", () => {
    const s = summary();
    expect(phase(s)).toBe("summary");
    const round = view(s, OBSERVER).history[0];
    expect(round.round).toBe(0);
    expect(round.leader).toBe(A);
    expect(round.bid).toBe(4);
    expect(round.stacks).toEqual({ [A]: ["safe", "safe"], [B]: ["safe", "safe"], [C]: ["trap", "safe"] });
    expect(round.hands).toEqual({ [A]: { safe: 1, trap: 1 }, [B]: { safe: 1, trap: 1 }, [C]: { safe: 2, trap: 0 } });
    expect(round.reveals).toEqual([
      { owner: A, kind: "safe" },
      { owner: A, kind: "safe" },
      { owner: B, kind: "safe" },
      { owner: C, kind: "safe" },
    ]);
    expect(round.outcome).toBe("success");
    expect(round.gains).toEqual({ [A]: SUCCESS_POINTS, [B]: 0, [C]: 0 });
    expect(round.totals).toEqual({ [A]: SUCCESS_POINTS, [B]: 0, [C]: 0 });
  });

  test("każdy widzi tę samą jawną odsłonę", () => {
    const s = summary();
    for (const p of [A, B, C, STRANGER]) expect(view(s, p).history).toEqual(view(s).history);
  });

  test("waitingFor kurczy się, gdy gracze klikają dalej, a gotowość jest jawna", () => {
    let s = summary();
    expect(game.waitingFor(s)).toEqual(THREE);
    s = send(s, B, next(s));
    expect(game.waitingFor(s)).toEqual([A, C]);
    expect(view(s).ready).toEqual([B]);
    expect(phase(s)).toBe("summary");
  });

  test("dalej od wszystkich otwiera świeżą rundę z kolejnym rozpoczynającym", () => {
    const s = nextAll(summary());
    const v = view(s);
    expect(v.round).toBe(1);
    expect(v.phase).toBe("initial");
    expect(v.decision).toBe(0);
    expect(v.leader).toBeNull();
    expect(v.bid).toBeNull();
    expect(v.passed).toEqual([]);
    expect(v.ready).toEqual([]);
    expect(v.reveals).toEqual([]);
    expect(v.history).toHaveLength(1);
    expect(v.totals[A]).toBe(SUCCESS_POINTS);
    for (const p of THREE) {
      expect(view(s, p).me).toEqual({ hand: { safe: 3, trap: 1 }, stack: [] });
      expect(v.handSizes[p]).toBe(4);
      expect(v.stackSizes[p]).toBe(0);
    }
    expect(turn(initials(s))).toBe(B);
  });

  test("rozpoczyna players[round % N], także po przejściu przez wszystkich", () => {
    for (const participants of [THREE, SIX]) {
      let s = start(participants);
      for (let round = 0; round < ROUNDS; round++) {
        const opened = initials(s);
        expect(turn(opened)).toBe(participants[round % participants.length]);
        if (round < ROUNDS - 1) s = nextAll(openAndPassAll(opened, 1));
      }
    }
  });
});

describe("koniec gry", () => {
  test("po szóstej rundzie od razu koniec bez dodatkowego next, z pełną historią", () => {
    const s = playGame(THREE, [A, A, A, A, A, A]);
    expect(phase(s)).toBe("over");
    expect(view(s).round).toBe(ROUNDS - 1);
    expect(view(s).history).toHaveLength(ROUNDS);
    expect(view(s).history.map((h) => h.round)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(game.waitingFor(s)).toEqual([]);
    expect(game.isOver(s)).not.toBeNull();
  });

  test("przed szóstą rozstrzygniętą rundą gra się nie kończy", () => {
    const s = playGame(THREE, [A, A, A, A, A]);
    expect(phase(s)).toBe("summary");
    expect(game.isOver(s)).toBeNull();
  });

  test.each(THREE)("może wygrać każdy gracz (%s), z wynikiem 12", (winner) => {
    const s = playGame(THREE, Array(ROUNDS).fill(winner));
    const result = game.isOver(s);
    expect(result?.winner).toBe(winner);
    expect(result?.ranking?.[0]).toBe(winner);
    expect(view(s).totals[winner]).toBe(ROUNDS * SUCCESS_POINTS);
    expect(game.places!(s)[winner]).toBe(1);
  });

  test("remis na górze nie daje zwycięzcy, równe sumy mają wspólne miejsca", () => {
    const s = playGame(THREE, [A, B, A, B, A, B]);
    const result = game.isOver(s);
    expect(result?.winner).toBeUndefined();
    expect(result?.ranking).toHaveLength(3);
    expect(result?.ranking?.[2]).toBe(C);
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1, [C]: 3 });
  });

  test("równe dalsze sumy dzielą miejsce, a ranking idzie malejąco po sumie", () => {
    const s = playGame(FOUR, [A, A, A, A, B, B]);
    const result = game.isOver(s);
    expect(result?.winner).toBe(A);
    expect(result?.ranking?.slice(0, 2)).toEqual([A, B]);
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 2, [C]: 3, [D]: 3 });
  });

  test("punkty za cudzą Pułapkę też mogą rozstrzygnąć partię", () => {
    let s = start();
    for (let round = 0; round < ROUNDS; round++) {
      s = initials(s, { [C]: "trap" });
      s = send(s, turn(s), bid(s, turn(s) === C ? 1 : 2));
      if (view(s).leader === C) s = send(s, turn(s), bid(s, 2));
      s = passAll(s);
      s = send(s, turn(s), reveal(s, C));
      if (round < ROUNDS - 1) s = nextAll(s);
    }
    expect(game.isOver(s)?.winner).toBe(C);
    expect(view(s).totals).toEqual({ [A]: 0, [B]: 0, [C]: ROUNDS * TRAP_POINTS });
    expect(game.places!(s)).toEqual({ [C]: 1, [A]: 2, [B]: 2 });
  });
});

describe("ukrywanie kart", () => {
  /** Ta sama partia w kolejnych fazach; różni się tylko rodzaj pierwszej karty A. */
  const scenarios: Record<string, (kind: Kind) => State> = {
    "pierwsze karty": (kind) => {
      const s = start();
      return send(s, A, place(s, kind));
    },
    układanie: (kind) => initials(start(), { [A]: kind }),
    licytacja: (kind) => {
      const s = initials(start(), { [A]: kind });
      return send(s, A, bid(s, 1));
    },
    odkrywanie: (kind) => {
      let s = initials(start(), { [A]: kind });
      s = send(s, A, bid(s, 1));
      s = send(s, B, bid(s, 2));
      s = send(s, C, pass(s));
      s = send(s, A, pass(s));
      return s;
    },
  };

  test.each(Object.keys(scenarios))("%s: rodzaj cudzej karty nie wpływa na widok rywali, obserwatora ani obcego id", (name) => {
    const safe = scenarios[name]("safe");
    const trap = scenarios[name]("trap");
    for (const p of [B, C, OBSERVER, STRANGER]) expect(view(trap, p), `widok ${p}`).toEqual(view(safe, p));
    expect(view(trap, A).me).not.toEqual(view(safe, A).me);
  });

  test("odkrywanie jest naprawdę w fazie odkrywania z zakrytą kartą A", () => {
    const s = scenarios.odkrywanie("trap");
    expect(phase(s)).toBe("reveal");
    expect(view(s).leader).toBe(B);
    expect(view(s).stackSizes[A]).toBe(1);
  });

  test("własny widok zna własną rękę i kolejność stosu w każdej fazie przed odsłoną", () => {
    let s = initials(start(), { [A]: "trap" });
    expect(view(s, A).me).toEqual({ hand: { safe: 3, trap: 0 }, stack: ["trap"] });
    s = send(s, A, place(s, "safe"));
    expect(view(s, A).me).toEqual({ hand: { safe: 2, trap: 0 }, stack: ["trap", "safe"] });
    s = send(s, B, bid(s, 1));
    expect(view(s, A).me?.stack).toEqual(["trap", "safe"]);
    expect(view(s, B).me?.stack).toEqual(["safe"]);
  });

  test("obserwator i obcy id nie mają własnych kart, a ich widoki są takie same", () => {
    const s = initials(start());
    expect(view(s, OBSERVER).me).toBeNull();
    expect(view(s, STRANGER).me).toBeNull();
    expect(view(s, STRANGER)).toEqual(view(s, OBSERVER));
    expect(view(s, "__proto__").me).toBeNull();
  });

  test("widok rywala i obserwatora nie zawiera prywatnych pól stanu ani cudzych rąk", () => {
    const s = initials(start(), { [C]: "trap" });
    for (const p of [A, OBSERVER]) {
      const json = view(s, p) as unknown as Record<string, unknown>;
      expect(json.hands).toBeUndefined();
      expect(json.stacks).toBeUndefined();
    }
  });

  test("odkrycie ujawnia tylko odkrytą kartę; cudza zakryta Pułapka pod spodem zostaje tajna", () => {
    const build = (kind: Kind) => {
      let s = placeAll(initials(start(), { [B]: kind }));
      s = openAndPassAll(s, 5);
      return send(s, A, reveal(s, B));
    };
    const safe = build("safe");
    const trap = build("trap");
    expect(phase(trap)).toBe("reveal");
    for (const p of [C, OBSERVER, STRANGER]) expect(view(trap, p)).toEqual(view(safe, p));
    expect(view(trap).reveals.at(-1)).toEqual({ owner: B, kind: "safe" });
  });

  test("historia niesie zakończone rundy jawnie, a trwającej rundy nie ujawnia", () => {
    const build = (kind: Kind) => {
      const s = nextAll(win(start(), A));
      return initials(s, { [C]: kind });
    };
    const safe = build("safe");
    const trap = build("trap");
    expect(view(trap).history).toHaveLength(1);
    expect(view(trap).history[0].stacks[A]).toEqual(["safe"]);
    for (const p of [A, B, OBSERVER, STRANGER]) expect(view(trap, p)).toEqual(view(safe, p));
  });

  test("przed końcem pierwszej rundy historia jest pusta dla wszystkich", () => {
    const s = scenarios.odkrywanie("trap");
    for (const p of [A, B, OBSERVER, STRANGER]) expect(view(s, p).history).toEqual([]);
  });

  test("obcy id w trakcie próby widzi tylko stan publiczny i odkryte karty", () => {
    const s = scenarios.odkrywanie("trap");
    expect(view(s, STRANGER).me).toBeNull();
    expect(view(s, STRANGER).reveals).toEqual([{ owner: B, kind: "safe" }]);
    expect(JSON.stringify(view(s, STRANGER))).not.toContain("trap");
  });
});

describe("limit czasu", () => {
  test("pierwsza karta: Przejście za każdego, kto nie wybrał", () => {
    const s = send(start(), B, place(start(), "trap"));
    const after = tick(s);
    expect(phase(after)).toBe("place");
    expect(view(after, A).me?.stack).toEqual(["safe"]);
    expect(view(after, B).me?.stack).toEqual(["trap"]);
    expect(view(after, C).me?.stack).toEqual(["safe"]);
  });

  test("układanie: otwarcie licytacji na 1 zamiast dokładania, także z pustą ręką", () => {
    const placing = initials(start());
    const move = game.timeoutMove!(placing, A, createRng(1));
    expect(move).toEqual(bid(placing, 1));
    const after = tick(placing);
    expect(phase(after)).toBe("bid");
    expect(view(after).bid).toBe(1);
    expect(view(after).leader).toBe(A);

    const empty = placeAll(placeAll(placeAll(placing)), { [A]: "trap", [B]: "trap", [C]: "trap" });
    expect(game.timeoutMove!(empty, A, createRng(1))).toEqual(bid(empty, 1));
  });

  test("licytacja: pas", () => {
    const placing = initials(start());
    const s = send(placing, A, bid(placing, 1));
    expect(game.timeoutMove!(s, B, createRng(1))).toEqual(pass(s));
    expect(view(tick(s)).passed).toEqual([B]);
  });

  test("odkrywanie: wierzch losowego legalnego cudzego stosu, wybór przez przekazane rng", () => {
    const s = revealPhase(4);
    const owners = [0, 0.49, 0.5, 0.999].map((value) => {
      const move = game.timeoutMove!(s, A, () => value);
      expect(game.validateMove(s, A, move)).toBe(true);
      return (move as Extract<Move, { type: "reveal" }>).owner;
    });
    expect(new Set(owners)).toEqual(new Set([B, C]));
  });

  test("odkrywanie po limicie nie wybiera stosu pustego ani własnego", () => {
    let s = openAndPassAll(initials(start(FOUR)), 4);
    s = send(s, A, reveal(s, B));
    for (const value of [0, 0.25, 0.5, 0.75, 0.999]) {
      const move = game.timeoutMove!(s, A, () => value) as Extract<Move, { type: "reveal" }>;
      expect([C, D]).toContain(move.owner);
      expect(game.validateMove(s, A, move)).toBe(true);
    }
  });

  test("odsłona: next za każdego, potem nowa runda", () => {
    const summary = send(win(start(), A), B, next(win(start(), A)));
    expect(game.timeoutMove!(summary, A, createRng(1))).toEqual(next(summary));
    const after = tick(summary);
    expect(view(after).round).toBe(1);
    expect(phase(after)).toBe("initial");
  });

  test.each([[THREE], [SIX]])("pełna partia samymi timeoutami dochodzi do końca przy %j", (participants) => {
    const rng = createRng(5);
    let s = start(participants);
    let guard = 0;
    while (!game.isOver(s)) {
      s = tick(s, rng);
      if (++guard > 500) throw new Error("partia się nie kończy");
    }
    expect(phase(s)).toBe("over");
    expect(game.waitingFor(s)).toEqual([]);
    expect(view(s).history).toHaveLength(ROUNDS);
    const perPlayer = (ROUNDS / participants.length) * SUCCESS_POINTS;
    for (const p of participants) expect(view(s).totals[p]).toBe(perPlayer);
    expect(game.isOver(s)?.winner).toBeUndefined();
    expect(Object.values(game.places!(s)).every((place) => place === 1)).toBe(true);
  });
});

describe("termin tury", () => {
  const key = (s: State) => game.turn!(s).key;
  const seconds = (s: State) => game.turn!(s).seconds;

  test("pierwsze karty: wspólne 30 s, gotowość cudza nie zmienia klucza", () => {
    let s = start();
    const before = key(s);
    expect(seconds(s)).toBe(INITIAL_SECONDS);
    s = send(s, A, place(s, "safe"));
    expect(key(s)).toBe(before);
    s = send(s, B, place(s, "safe"));
    expect(key(s)).toBe(before);
    s = send(s, C, place(s, "safe"));
    expect(key(s)).not.toBe(before);
    expect(seconds(s)).toBe(TURN_SECONDS);
  });

  test("odsłona: wspólne 15 s, next części osób nie zmienia klucza", () => {
    let s = win(start(), A);
    const before = key(s);
    expect(seconds(s)).toBe(SUMMARY_SECONDS);
    s = send(s, A, next(s));
    expect(key(s)).toBe(before);
    s = send(s, B, next(s));
    expect(key(s)).toBe(before);
    s = send(s, C, next(s));
    expect(key(s)).not.toBe(before);
    expect(seconds(s)).toBe(INITIAL_SECONDS);
  });

  test("każda decyzja w układaniu i licytacji daje nowy klucz i 60 s", () => {
    let s = initials(start());
    const seen = new Set([key(s)]);
    s = send(s, A, place(s, "safe"));
    seen.add(key(s));
    s = send(s, B, bid(s, 1));
    seen.add(key(s));
    s = send(s, C, pass(s));
    seen.add(key(s));
    expect(seen.size).toBe(4);
    expect(seconds(s)).toBe(TURN_SECONDS);
  });

  test("kolejne odkrycia tej samej osoby to nowy termin", () => {
    let s = revealPhase(5);
    const first = key(s);
    expect(seconds(s)).toBe(TURN_SECONDS);
    s = send(s, A, reveal(s, B));
    const second = key(s);
    expect(second).not.toBe(first);
    expect(turn(s)).toBe(A);
    s = send(s, A, reveal(s, C));
    expect(key(s)).not.toBe(second);
  });

  test("ta sama faza i decyzja w kolejnej rundzie ma inny klucz", () => {
    const first = initials(start());
    const second = initials(nextAll(win(start(), A)));
    expect(view(first).decision).toBe(view(second).decision);
    expect(key(second)).not.toBe(key(first));
  });

  test("klucz składa się wyłącznie z publicznych pól widoku", () => {
    const initial = start();
    expect(key(initial)).toBe(`${view(initial).nonce}:0:initial`);
    const placing = send(initials(start()), A, place(initials(start()), "safe"));
    expect(key(placing)).toBe(`${view(placing).nonce}:0:place:1`);
    const summary = win(start(), A);
    expect(key(summary)).toBe(`${view(summary).nonce}:0:summary`);
  });
});

describe("stan", () => {
  /** Partia z każdym zakończeniem próby. */
  function varied() {
    const states: State[] = [];
    let s = start();
    const record = (state: State) => {
      states.push(state);
      return state;
    };
    record(s);
    s = record(openAndPassAll(initials(s, { [C]: "trap" }), 2));
    s = record(send(s, A, reveal(s, C)));
    s = record(nextAll(s));
    s = record(openAndPassAll(initials(s, { [B]: "trap" }), 1));
    s = record(nextAll(s));
    s = record(win(s, C));
    s = record(nextAll(s));
    s = record(win(s, A));
    s = record(nextAll(s));
    s = record(win(s, B));
    s = record(nextAll(s));
    s = record(win(s, C));
    expect(phase(s)).toBe("over");
    return states;
  }

  test("applyMove nie zmienia stanu ani zagnieżdżonych kart i historii", () => {
    const placing = placeAll(initials(start()));
    const snapshot = JSON.stringify(placing);
    const after = send(placing, A, bid(placing, 1));
    expect(JSON.stringify(placing)).toBe(snapshot);
    expect(after).not.toBe(placing);
  });

  test("zamrożone stany przechodzą całą partię", () => {
    for (const s of varied()) expect(Object.isFrozen(s)).toBe(true);
  });

  test("stan i widoki przeżywają JSON w każdej fazie", () => {
    for (const s of varied()) {
      expect(JSON.parse(JSON.stringify(s))).toStrictEqual(s);
      for (const p of [A, B, C, OBSERVER, STRANGER]) expect(JSON.parse(JSON.stringify(game.playerView(s, p)))).toStrictEqual(game.playerView(s, p));
    }
  });

  test("gra toczy się dalej ze stanu po JSON", () => {
    const s = JSON.parse(JSON.stringify(placeAll(initials(start())))) as State;
    expect(turn(send(s, A, place(s, "safe")))).toBe(B);
  });

  test("setup zużywa rng wyłącznie na nonce", () => {
    const rng = counting();
    game.setup(THREE, rng);
    expect(rng.calls).toBe(1);
  });

  test("applyMove nie zużywa rng, także przy automatycznym odkrywaniu", () => {
    const rng = counting();
    const apply = (s: State, player: string, move: Move) => deepFreeze(game.applyMove(s, player, move, rng));
    let s = start();
    for (const p of THREE) s = apply(s, p, place(s, "safe"));
    for (const p of THREE) s = apply(s, p, place(s, "safe"));
    s = apply(s, A, bid(s, 5));
    s = apply(s, B, pass(s));
    s = apply(s, C, pass(s));
    s = apply(s, A, reveal(s, B));
    s = apply(s, A, reveal(s, B));
    expect(phase(s)).toBe("summary");
    expect(rng.calls).toBe(0);
  });

  test("timeoutMove losuje tylko przy wyborze cudzego stosu", () => {
    const rng = counting();
    const initial = start();
    game.timeoutMove!(initial, A, rng);
    const placing = initials(start());
    game.timeoutMove!(placing, A, rng);
    const bidding = send(placing, A, bid(placing, 1));
    game.timeoutMove!(bidding, B, rng);
    const summary = win(start(), A);
    game.timeoutMove!(summary, A, rng);
    expect(rng.calls).toBe(0);

    game.timeoutMove!(revealPhase(4), A, rng);
    expect(rng.calls).toBe(1);
  });
});
