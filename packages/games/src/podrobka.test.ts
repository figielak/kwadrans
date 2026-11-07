import { describe, expect, test } from "vitest";
import { createRng, type MoveContext } from "./core.ts";
import {
  ANSWER_MAX,
  cleanAnswer,
  type Move,
  podrobka as game,
  resolveVotes,
  ROUNDS,
  type RoundRecord,
  type State,
  SUMMARY_SECONDS,
  type View,
  VOTE_SECONDS,
  WRITE_SECONDS,
} from "./podrobka.ts";
import { PAIRS } from "./podrobka-dane.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 3-6 graczy, 6 rund, bez record, live i modes; limity 30 s odpowiedź, 60 s głos, 15 s odsłona,
// - setup losuje 6 różnych par z puli, kierunek każdej pary i niezależnie jedną Podróbkę na rundę, bez rotacji,
// - odpowiedź do 30 jednostek UTF-16, serwer usuwa zewnętrzne białe znaki i zwija ciągi do jednej spacji,
// - szkic może być pusty, nie kończy pisania i nie odnawia czasu; „Gotowe” klienta wymaga tekstu,
// - po limicie szkic zostaje odpowiedzią, pustą odpowiedź i wstrzymanie głosu zatwierdza tylko kontekst timeoutu,
// - pole source w JSON ruchu nie daje uprawnień zegara,
// - brak odpowiedzi anuluje rundę: wszyscy 0, bez głosowania, jawne missing, runda się zużywa,
// - głos tylko na innego grającego, nieodwołalny i tajny do odsłony; jawne jest tylko, kto zagłosował,
// - wykrycie to samodzielnie najwięcej głosów i co najmniej 2, remis i niewinny lider to brak wykrycia,
// - trafny głos zwykłego gracza daje 2, Podróbka niewykryta z własnym głosem 3, reszta 0,
// - punkty liczą się raz, przy wejściu w odsłonę; „Dalej” od wszystkich albo limit otwiera następną rundę,
// - po szóstej rundzie od razu over, bez summary i next; wygrywa największa suma, remis na górze bez zwycięzcy, równe sumy to wspólne miejsca,
// - widoki mają jawną listę pól; rola, pairId, przyszłe pary, cudze szkice i głosy nie wychodzą przed odsłoną; obserwator i obce id widzą to samo,
// - każda faza ma legalny timeoutMove, sam zegar kończy partię bez ponownego naliczania punktów,
// - stan jest zwykłym JSON, a applyMove go nie zmienia.

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";
const E = "ewa";
const F = "filip";
const THREE = [A, B, C];
const FOUR = [A, B, C, D];
const FIVE = [A, B, C, D, E];
const SIX = [A, B, C, D, E, F];
const OBSERVER = "";
const STRANGER = "ktos-obcy";
const TIMEOUT: MoveContext = { source: "timeout" };
const CLIENT: MoveContext = { source: "client" };

/** Pola widoku: każdy widok ma dokładnie te klucze, ukryte wartości to null. */
const VIEW_KEYS = ["answers", "done", "hint", "history", "majorityQuestion", "myDraft", "myQuestion", "myVote", "nonce", "phase", "players", "ready", "round", "totals", "voted"];
const SECRET_KEYS = ['"impostor"', '"pairId"', '"deals"', '"drafts"', '"votes"', '"majority"', '"other"', '"otherQuestion"', '"seed"'];

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

const rejects = (s: State, player: string, move: unknown, context?: MoveContext) =>
  expect(game.validateMove(s, player, move as Move, context), `${player}: ${JSON.stringify(move)}`).toBe(false);

const seen = (s: State, player: string) => game.playerView(s, player) as View;
const pub = (s: State) => seen(s, OBSERVER);
const waiting = (s: State) => game.waitingFor(s);
const turn = (s: State) => game.turn!(s);
const impostor = (s: State) => s.deals[pub(s).round].impostor;
const lastRecord = (s: State): RoundRecord => pub(s).history.at(-1)!;

const write = (s: State, answer: string, done = true): Move => ({ type: "write", nonce: pub(s).nonce, round: pub(s).round, answer, done });
const vote = (s: State, target: string | null): Move => ({ type: "vote", nonce: pub(s).nonce, round: pub(s).round, target });
const next = (s: State): Move => ({ type: "next", nonce: pub(s).nonce, round: pub(s).round });
const timeoutOf = (s: State, player: string) => game.timeoutMove!(s, player, createRng(1)) as Move;

const defaultAnswer = (player: string) => `odp ${player}`;
const writeAll = (s: State, answer: (player: string) => string = defaultAnswer) =>
  waiting(s).reduce((acc, p) => send(acc, p, write(acc, answer(p))), s);
/** null to wstrzymanie: taki ruch przechodzi wyłącznie w kontekście timeoutu. */
const voteAll = (s: State, votes: Record<string, string | null>) =>
  waiting(s).reduce((acc, p) => (votes[p] === null ? send(acc, p, vote(acc, null), TIMEOUT) : send(acc, p, vote(acc, votes[p]))), s);
const nextAll = (s: State) => waiting(s).reduce((acc, p) => send(acc, p, next(acc)), s);
const abstainAll = (s: State) => voteAll(s, Object.fromEntries(waiting(s).map((p) => [p, null])));
const timeoutPhase = (s: State) => waiting(s).reduce((acc, p) => send(acc, p, timeoutOf(acc, p), TIMEOUT), s);

/** Zła implementacja bez końca partii ma oblać test, a nie zawiesić go w pętli. */
function timeoutAll(s: State) {
  let acc = s;
  for (let steps = 0; pub(acc).phase !== "over"; steps++) {
    if (steps > 100) throw new Error("partia się nie kończy");
    acc = timeoutPhase(acc);
  }
  return acc;
}

/** Ziarno partii, w której warunek na role jest spełniony. Z State czytamy tylko deals[round].impostor. */
function seedWhere(players: string[], condition: (s: State) => boolean) {
  for (let seed = 1; seed < 200_000; seed++) {
    const s = game.setup(players, createRng(seed));
    if (condition(s)) return seed;
  }
  throw new Error("brak ziarna");
}
const startWith = (players: string[], role: string, round = 0) => start(players, seedWhere(players, (s) => s.deals[round].impostor === role));
/** Głosowanie pierwszej rundy, w której Podróbką jest wskazana osoba. */
const votingWith = (players: string[], role: string) => writeAll(startWith(players, role));
/** Rundy przelatują na samym zegarze: anulowane, bez punktów. */
function skipRounds(s: State, count: number) {
  let acc = s;
  for (let i = 0; i < count; i++) acc = timeoutPhase(timeoutPhase(acc));
  return acc;
}
const cyclicVotes = (players: string[]) => Object.fromEntries(players.map((p, i) => [p, players[(i + 1) % players.length]]));
/** Prawda o rundach tej samej partii: odsłaniamy ją na bliźniaczym stanie, zegarem do końca. */
const truth = (players: string[], seed: number) => pub(timeoutAll(start(players, seed))).history;
/** Po jednym stanie z każdej fazy tej samej partii. */
function phases(players: string[] = THREE, seed = 1) {
  const write0 = start(players, seed);
  const vote0 = writeAll(write0);
  const summary0 = voteAll(vote0, cyclicVotes(players));
  return { write: write0, vote: vote0, summary: summary0, over: timeoutAll(summary0) };
}
const zeroes = (players: string[]) => Object.fromEntries(players.map((p) => [p, 0]));

describe("definicja", () => {
  test("id, nazwa i 3-6 graczy", () => {
    expect(game.id).toBe("podrobka");
    expect(game.name).toBe("Podróbka");
    expect(game.minPlayers).toBe(3);
    expect(game.maxPlayers).toBe(6);
  });

  test("bez record, live i modes", () => {
    expect(game.record).toBeUndefined();
    expect(game.live).toBeUndefined();
    expect(game.modes).toBeUndefined();
  });

  test("stałe zasad", () => {
    expect(ROUNDS).toBe(6);
    expect(WRITE_SECONDS).toBe(30);
    expect(VOTE_SECONDS).toBe(60);
    expect(SUMMARY_SECONDS).toBe(15);
    expect(ANSWER_MAX).toBe(30);
  });

  test("limit idzie z turn() zależnego od fazy", () => {
    expect(typeof game.turn).toBe("function");
    expect(game.turnSeconds).toBeUndefined();
  });

  test.each([[THREE], [FOUR], [FIVE], [SIX]])("świeża gra nie jest skończona i czeka na wszystkich (%j)", (players) => {
    const s = start(players);
    expect(game.isOver(s)).toBeNull();
    expect(waiting(s)).toEqual(players);
    expect(pub(s).phase).toBe("write");
    expect(pub(s).round).toBe(0);
    expect(pub(s).totals).toEqual(zeroes(players));
    expect(pub(s).history).toEqual([]);
    expect(pub(s).players).toEqual(players);
  });
});

describe("setup i losowanie", () => {
  test("w każdej rundzie jest dokładnie jedna legalna Podróbka", () => {
    const s = start(SIX, 3);
    for (let round = 0; round < ROUNDS; round++) expect(SIX).toContain(s.deals[round].impostor);
    const records = truth(SIX, 3);
    records.forEach((record, round) => expect(record.impostor).toBe(s.deals[round].impostor));
  });

  test("partia ma 6 różnych par z puli, z pytaniami i wskazówką tej samej pary", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const records = truth(THREE, seed);
      expect(records).toHaveLength(ROUNDS);
      const ids = records.map((record) => {
        const pair = PAIRS.find((p) => p.a === record.majorityQuestion || p.b === record.majorityQuestion)!;
        expect(pair, record.majorityQuestion).toBeDefined();
        expect([pair.a, pair.b].sort()).toEqual([record.majorityQuestion, record.otherQuestion].sort());
        expect(record.hint).toBe(pair.hint);
        return pair.id;
      });
      expect(new Set(ids).size).toBe(ROUNDS);
    }
  });

  test("ten sam seed daje ten sam stan", () => {
    expect(game.setup(SIX, createRng(5))).toEqual(game.setup(SIX, createRng(5)));
  });

  test("różne seedy dają różne losowania i różne nonce", () => {
    expect(game.setup(SIX, createRng(5))).not.toEqual(game.setup(SIX, createRng(6)));
    expect(pub(start(SIX, 5)).nonce).not.toBe(pub(start(SIX, 6)).nonce);
    expect(truth(SIX, 5).map((r) => r.majorityQuestion)).not.toEqual(truth(SIX, 6).map((r) => r.majorityQuestion));
  });

  test("nonce jest liczbą całkowitą, a rewanż z tego samego rng ma nowe", () => {
    const rng = createRng(9);
    const first = game.setup(THREE, rng);
    const rematch = game.setup(THREE, rng);
    expect(Number.isInteger(pub(first).nonce)).toBe(true);
    expect(pub(rematch).nonce).not.toBe(pub(first).nonce);
  });

  test("oba kierunki pary występują po równo, a pula nie ma martwych par", () => {
    let majorityA = 0;
    const used = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      for (const record of truth(THREE, seed)) {
        const pair = PAIRS.find((p) => p.a === record.majorityQuestion || p.b === record.majorityQuestion)!;
        used.add(pair.id);
        if (pair.a === record.majorityQuestion) majorityA++;
      }
    }
    expect(majorityA).toBeGreaterThan(240);
    expect(majorityA).toBeLessThan(360);
    expect(used.size).toBe(PAIRS.length);
  });

  test("Podróbkę losuje się jednakowo prawdopodobnie spośród graczy", () => {
    const counts: Record<string, number> = zeroes(THREE);
    for (let seed = 1; seed <= 300; seed++) {
      const s = game.setup(THREE, createRng(seed));
      for (let round = 0; round < ROUNDS; round++) counts[s.deals[round].impostor]++;
    }
    for (const p of THREE) {
      expect(counts[p], p).toBeGreaterThan(500);
      expect(counts[p], p).toBeLessThan(700);
    }
  });

  test("role są niezależne: można dostać rolę kilka razy albo wcale, bez rotacji", () => {
    let repeatedAfter = 0;
    let transitions = 0;
    let someoneOften = false;
    let someoneNever = false;
    for (let seed = 1; seed <= 300; seed++) {
      const s = game.setup(THREE, createRng(seed));
      const roles = Array.from({ length: ROUNDS }, (_, round) => s.deals[round].impostor);
      for (let round = 1; round < ROUNDS; round++) {
        transitions++;
        if (roles[round] === roles[round - 1]) repeatedAfter++;
      }
      if (THREE.some((p) => roles.filter((role) => role === p).length >= 3)) someoneOften = true;
      if (THREE.some((p) => !roles.includes(p))) someoneNever = true;
    }
    expect(someoneOften).toBe(true);
    expect(someoneNever).toBe(true);
    // Przy rotacji powtórka tej samej osoby po sobie by nie wystąpiła; przy niezależnym losowaniu to około 1/3.
    expect(repeatedAfter / transitions).toBeGreaterThan(0.28);
    expect(repeatedAfter / transitions).toBeLessThan(0.39);
  });
});

describe("schemat ruchu", () => {
  const ok = { nonce: 1, round: 0 };
  const valid = (move: unknown) => game.moveSchema.safeParse(move).success;

  test.each([
    ["szkic", { type: "write", ...ok, answer: "x", done: false }],
    ["pusty szkic", { type: "write", ...ok, answer: "", done: false }],
    ["zatwierdzenie", { type: "write", ...ok, answer: "x", done: true }],
    ["głos", { type: "vote", ...ok, target: B }],
    ["wstrzymanie", { type: "vote", ...ok, target: null }],
    ["gotowość", { type: "next", ...ok }],
  ])("poprawny kształt przechodzi: %s", (_, move) => {
    expect(valid(move)).toBe(true);
  });

  test.each([
    ["zły typ ruchu", { type: "stop", ...ok }],
    ["brak typu", { ...ok, answer: "x", done: false }],
    ["śmieci", "ruch"],
    ["null", null],
    ["write bez answer", { type: "write", ...ok, done: false }],
    ["write bez done", { type: "write", ...ok, answer: "x" }],
    ["write bez nonce", { type: "write", round: 0, answer: "x", done: false }],
    ["write bez round", { type: "write", nonce: 1, answer: "x", done: false }],
    ["answer nie jest tekstem", { type: "write", ...ok, answer: 5, done: false }],
    ["done nie jest wartością logiczną", { type: "write", ...ok, answer: "x", done: "tak" }],
    ["nonce niecałkowity", { type: "write", nonce: 1.5, round: 0, answer: "x", done: false }],
    ["round niecałkowita", { type: "write", nonce: 1, round: 0.5, answer: "x", done: false }],
    ["round jako tekst", { type: "next", nonce: 1, round: "0" }],
    ["vote bez target", { type: "vote", ...ok }],
    ["target liczbowy", { type: "vote", ...ok, target: 5 }],
    ["target jako obiekt", { type: "vote", ...ok, target: { id: B } }],
    ["vote z niecałkowitą rundą", { type: "vote", nonce: 1, round: 1.5, target: B }],
    ["next bez nonce", { type: "next", round: 0 }],
    ["next z niecałkowitym nonce", { type: "next", nonce: 0.1, round: 0 }],
  ])("śmieci z sieci odpadają: %s", (_, move) => {
    expect(valid(move)).toBe(false);
  });

  test("odpowiedź ma do 30 jednostek UTF-16: 30 przechodzi, 31 odpada", () => {
    const answer = (text: string) => ({ type: "write", ...ok, answer: text, done: true });
    expect(valid(answer("x".repeat(ANSWER_MAX)))).toBe(true);
    expect(valid(answer("x".repeat(ANSWER_MAX + 1)))).toBe(false);
    expect(valid(answer("😀".repeat(15)))).toBe(true);
    expect(valid(answer(`${"😀".repeat(15)}x`))).toBe(false);
  });

  test("validateMove odrzuca to, czego nie przepuszcza schemat", () => {
    const s = start();
    rejects(s, A, { ...write(s, "x"), answer: "x".repeat(ANSWER_MAX + 1) });
    rejects(s, A, { ...write(s, "x"), answer: 5 });
    rejects(s, A, { type: "stop" });
    rejects(s, A, null);
  });
});

describe("walidacja", () => {
  test("gracz spoza partii i obserwator nie mogą ruszać w żadnej fazie", () => {
    const { write: w, vote: v, summary: sum } = phases();
    for (const outsider of [STRANGER, OBSERVER]) {
      rejects(w, outsider, write(w, "x"));
      rejects(w, outsider, write(w, "x", false));
      rejects(v, outsider, vote(v, A));
      rejects(sum, outsider, next(sum));
      rejects(w, outsider, write(w, "x"), TIMEOUT);
      rejects(v, outsider, vote(v, null), TIMEOUT);
    }
  });

  test("ruch w złej fazie odpada", () => {
    const { write: w, vote: v, summary: sum } = phases();
    rejects(w, A, vote(w, B));
    rejects(w, A, next(w));
    rejects(v, A, write(v, "x"));
    rejects(v, A, write(v, "x", false));
    rejects(v, A, next(v));
    rejects(sum, A, write(sum, "x"));
    rejects(sum, A, vote(sum, B));
  });

  test("drugie zatwierdzenie odpowiedzi odpada", () => {
    const s = send(start(), A, write(start(), "x"));
    rejects(s, A, write(s, "y"));
    rejects(s, A, write(s, "y"), TIMEOUT);
  });

  test("zatwierdzony głos jest nieodwołalny", () => {
    const v = writeAll(start());
    const s = send(v, A, vote(v, B));
    rejects(s, A, vote(s, C));
    rejects(s, A, vote(s, null), TIMEOUT);
  });

  test("drugie „Dalej” odpada", () => {
    const { summary: sum } = phases();
    const s = send(sum, A, next(sum));
    rejects(s, A, next(s));
    rejects(s, A, next(s), TIMEOUT);
  });

  test("nie wolno głosować na siebie ani z kontekstem timeoutu", () => {
    const v = writeAll(start());
    rejects(v, A, vote(v, A));
    rejects(v, A, vote(v, A), TIMEOUT);
  });

  test("nie wolno głosować na obcego ani na obserwatora", () => {
    const v = writeAll(start());
    rejects(v, A, vote(v, STRANGER));
    rejects(v, A, vote(v, OBSERVER));
  });

  test("gracz z tego samego składu spoza partii też nie jest celem", () => {
    const v = writeAll(start(THREE));
    rejects(v, A, vote(v, D));
  });

  test("ruch ze złym nonce odpada w każdej fazie", () => {
    const { write: w, vote: v, summary: sum } = phases();
    const nonce = pub(w).nonce + 1;
    rejects(w, A, { ...write(w, "x"), nonce });
    rejects(w, A, { ...write(w, "x", false), nonce });
    rejects(v, A, { ...vote(v, B), nonce });
    rejects(sum, A, { ...next(sum), nonce });
    rejects(w, A, { ...write(w, "x"), nonce }, TIMEOUT);
  });

  test("ruch z poprzedniej partii nie przechodzi do rewanżu", () => {
    const old = start(THREE, 1);
    const rematch = start(THREE, 2);
    rejects(rematch, A, write(old, "x"));
    rejects(rematch, A, write(old, "x", false));
  });

  test("ruch ze złej rundy odpada w każdej fazie", () => {
    const { write: w, vote: v, summary: sum } = phases();
    rejects(w, A, { ...write(w, "x"), round: 1 });
    rejects(v, A, { ...vote(v, B), round: 1 });
    rejects(sum, A, { ...next(sum), round: 1 });
  });

  test("po końcu partii żaden ruch nie przechodzi", () => {
    const { over } = phases();
    for (const p of THREE) {
      rejects(over, p, write(over, "x"));
      rejects(over, p, write(over, "", false));
      rejects(over, p, vote(over, A === p ? B : A));
      rejects(over, p, vote(over, null), TIMEOUT);
      rejects(over, p, next(over));
      rejects(over, p, next(over), TIMEOUT);
    }
  });
});

describe("pisanie", () => {
  test("serwer usuwa zewnętrzne białe znaki i zwija ciągi do jednej spacji", () => {
    expect(cleanAnswer("  Ala   ma\tkota ")).toBe("Ala ma kota");
    expect(cleanAnswer("a\n\n b  c")).toBe("a b c");
    expect(cleanAnswer("   ")).toBe("");
    expect(cleanAnswer("")).toBe("");
  });

  test("polskie litery i wielkość liter zostają bez zmian", () => {
    expect(cleanAnswer("Żółć ĄĘ łódź")).toBe("Żółć ĄĘ łódź");
  });

  test("zatwierdzona odpowiedź jest zapisana po normalizacji", () => {
    const s = send(start(), A, write(start(), "  Ala   ma\tkota "));
    expect(seen(s, A).myDraft).toBe("Ala ma kota");
    const v = writeAll(s);
    expect(pub(v).answers![A]).toBe("Ala ma kota");
  });

  test("ostatni szkic po czasie też przechodzi normalizację", () => {
    let s = start();
    s = send(s, A, write(s, "  Ala   ma\tkota ", false));
    s = writeAll(send(s, A, timeoutOf(s, A), TIMEOUT));
    expect(pub(s).answers![A]).toBe("Ala ma kota");
  });

  test.each([["pusty", ""], ["z samych spacji", "   "]])("szkic %s od klienta jest przyjęty, nie kończy pisania i nie odnawia czasu", (_, text) => {
    const s = start();
    const after = send(s, A, write(s, text, false));
    expect(waiting(after)).toEqual(THREE);
    expect(pub(after).done).toEqual([]);
    expect(pub(after).phase).toBe("write");
    expect(turn(after)).toEqual(turn(s));
  });

  test("szkic zapisuje tekst, a kolejny go zastępuje", () => {
    let s = start();
    s = send(s, A, write(s, "pierwszy", false));
    expect(seen(s, A).myDraft).toBe("pierwszy");
    s = send(s, A, write(s, "drugi", false));
    expect(seen(s, A).myDraft).toBe("drugi");
    expect(seen(s, B).myDraft).toBe("");
  });

  test("„Gotowe” wysyła aktualny tekst, nie zapisany szkic", () => {
    let s = start();
    s = send(s, A, write(s, "szkic", false));
    s = send(s, A, write(s, "ostatecznie"));
    expect(seen(s, A).myDraft).toBe("ostatecznie");
  });

  test.each([["pustym tekstem", ""], ["samymi spacjami", "   \t "], ["twardą spacją", " "]])("„Gotowe” z %s od klienta odpada, a z kontekstem timeoutu przechodzi", (_, text) => {
    const s = start();
    rejects(s, A, write(s, text));
    rejects(s, A, write(s, text), CLIENT);
    expect(game.validateMove(s, A, write(s, text), TIMEOUT)).toBe(true);
  });

  test("pole source w JSON ruchu klienta nie daje uprawnień zegara", () => {
    const s = start();
    const forged = { ...write(s, ""), source: "timeout", context: { source: "timeout" } };
    rejects(s, A, forged);
    rejects(s, A, forged, CLIENT);
    rejects(s, A, game.moveSchema.parse(forged), CLIENT);
    const v = writeAll(s);
    const forgedVote = { ...vote(v, null), source: "timeout", context: { source: "timeout" } };
    rejects(v, A, forgedVote);
    rejects(v, A, forgedVote, CLIENT);
    rejects(v, A, game.moveSchema.parse(forgedVote), CLIENT);
  });

  test("szkic po własnym zatwierdzeniu odpada", () => {
    const s = send(start(), A, write(start(), "x"));
    rejects(s, A, write(s, "y", false));
    rejects(s, A, write(s, "", false));
  });

  test("szkic ze starej rundy odpada", () => {
    const first = start();
    const stale = write(first, "stary", false);
    const second = nextAll(voteAll(writeAll(first), cyclicVotes(THREE)));
    expect(pub(second).round).toBe(1);
    rejects(second, A, stale);
    const voting = writeAll(first);
    rejects(voting, A, stale);
  });

  test("po zatwierdzeniu edycja jest zablokowana, a gracz widzi swoje pytanie i odpowiedź", () => {
    const fresh = start();
    const s = send(fresh, A, write(fresh, "x"));
    expect(seen(s, A).done).toEqual([A]);
    expect(seen(s, A).myQuestion).toBe(seen(fresh, A).myQuestion);
    expect(seen(s, A).myDraft).toBe("x");
    expect(waiting(s)).toEqual([B, C]);
  });

  test("limit pisania przy zapisanym szkicu: szkic zostaje odpowiedzią", () => {
    let s = start();
    s = send(s, A, write(s, "Mleko", false));
    s = timeoutPhase(s);
    expect(pub(s).phase).toBe("summary");
    expect(lastRecord(s).answers[A]).toBe("Mleko");
    expect(lastRecord(s).answers[B]).toBe("");
  });

  test("limit pisania przy szkicach wszystkich: odpowiedzi ze szkiców i głosowanie", () => {
    let s = start();
    for (const p of THREE) s = send(s, p, write(s, `szkic ${p}`, false));
    s = timeoutPhase(s);
    expect(pub(s).phase).toBe("vote");
    expect(pub(s).answers).toEqual({ [A]: `szkic ${A}`, [B]: `szkic ${B}`, [C]: `szkic ${C}` });
  });

  test("limit pisania bez szkicu: pusta odpowiedź", () => {
    let s = start();
    const move = timeoutOf(s, A);
    expect(move).toMatchObject({ type: "write", answer: "", done: true });
    s = timeoutPhase(s);
    expect(lastRecord(s).answers[A]).toBe("");
  });

  test("szkic z samych spacji i limit: pusta odpowiedź, runda anulowana", () => {
    let s = start();
    s = send(s, A, write(s, "    ", false));
    s = send(s, B, write(s, "b"));
    s = send(s, C, write(s, "c"));
    expect(pub(s).phase).toBe("write");
    s = send(s, A, timeoutOf(s, A), TIMEOUT);
    expect(pub(s).phase).toBe("summary");
    expect(lastRecord(s).cancelled).toBe(true);
    expect(lastRecord(s).answers[A]).toBe("");
    expect(lastRecord(s).missing).toEqual([A]);
  });

  test("ostatnie zatwierdzenie zmienia fazę dokładnie raz", () => {
    let s = start();
    const key = turn(s).key;
    s = send(s, A, write(s, "a"));
    expect(pub(s).phase).toBe("write");
    expect(turn(s).key).toBe(key);
    s = send(s, B, write(s, "b"));
    expect(pub(s).phase).toBe("write");
    expect(turn(s).key).toBe(key);
    s = send(s, C, write(s, "c"));
    expect(pub(s).phase).toBe("vote");
    expect(turn(s).key).not.toBe(key);
    expect(waiting(s)).toEqual(THREE);
  });
});

describe("anulowanie rundy", () => {
  const cancelWith = (players: string[], role: string, empty: string[]) => {
    let s = startWith(players, role);
    for (const p of players) if (!empty.includes(p)) s = send(s, p, write(s, defaultAnswer(p)));
    return timeoutPhase(s);
  };

  test("pusta odpowiedź Podróbki anuluje rundę", () => {
    const s = cancelWith(THREE, A, [A]);
    expect(pub(s).phase).toBe("summary");
    expect(lastRecord(s).cancelled).toBe(true);
    expect(lastRecord(s).missing).toEqual([A]);
  });

  test("pusta odpowiedź zwykłego gracza anuluje rundę", () => {
    const s = cancelWith(THREE, A, [B]);
    expect(pub(s).phase).toBe("summary");
    expect(lastRecord(s).cancelled).toBe(true);
    expect(lastRecord(s).missing).toEqual([B]);
  });

  test("missing wymienia wszystkich bez odpowiedzi, w kolejności graczy", () => {
    expect(lastRecord(cancelWith(SIX, A, [E, B, D])).missing).toEqual([B, D, E]);
  });

  test("anulowana runda: wszyscy 0, bez głosowania", () => {
    const s = cancelWith(FOUR, A, [B]);
    const record = lastRecord(s);
    expect(record.gain).toEqual(zeroes(FOUR));
    expect(record.detected).toBe(false);
    expect(Object.values(record.votes).every((target) => target === null)).toBe(true);
    expect(Object.values(record.tally).every((count) => count === 0)).toBe(true);
    expect(pub(s).totals).toEqual(zeroes(FOUR));
    for (const p of FOUR) rejects(s, p, vote(s, p === A ? B : A));
  });

  test("anulowana runda odsłania oba pytania i zużywa jedno z sześciu miejsc", () => {
    const s = cancelWith(THREE, A, [B]);
    const record = lastRecord(s);
    expect(record.impostor).toBe(A);
    expect(record.majorityQuestion).not.toBe(record.otherQuestion);
    expect(pub(s).round).toBe(0);
    const after = nextAll(s);
    expect(pub(after).phase).toBe("write");
    expect(pub(after).round).toBe(1);
    expect(pub(after).history).toHaveLength(1);
  });

  test("rundy bez pustej odpowiedzi nie są oznaczone jako anulowane", () => {
    const s = voteAll(writeAll(start()), cyclicVotes(THREE));
    expect(lastRecord(s).cancelled).toBe(false);
    expect(lastRecord(s).missing).toEqual([]);
  });

  test("anulowana szósta runda: od razu over, oznaczenie w historii, partia się kończy", () => {
    let s = skipRounds(start(), ROUNDS - 1);
    expect(pub(s).round).toBe(ROUNDS - 1);
    s = timeoutPhase(s);
    expect(pub(s).phase).toBe("over");
    expect(pub(s).history).toHaveLength(ROUNDS);
    expect(lastRecord(s).cancelled).toBe(true);
    expect(waiting(s)).toEqual([]);
    expect(game.isOver(s)).not.toBeNull();
  });
});

describe("głosowanie", () => {
  test("target null od klienta odpada, z kontekstem timeoutu to wstrzymanie", () => {
    const v = writeAll(start());
    rejects(v, A, vote(v, null));
    rejects(v, A, vote(v, null), CLIENT);
    const s = send(v, A, vote(v, null), TIMEOUT);
    expect(waiting(s)).toEqual([B, C]);
    expect(pub(s).voted).toEqual([A]);
    const end = voteAll(s, { [B]: A, [C]: A });
    expect(lastRecord(end).votes[A]).toBeNull();
  });

  test("po czasie brak głosu to wstrzymanie, bez losowania oskarżenia", () => {
    const v = writeAll(start());
    expect(timeoutOf(v, A)).toMatchObject({ type: "vote", target: null });
    const s = timeoutPhase(v);
    expect(lastRecord(s).votes).toEqual({ [A]: null, [B]: null, [C]: null });
    expect(lastRecord(s).tally).toEqual(zeroes(THREE));
  });

  test("zatwierdzony głos zostaje, gdy reszta dostaje timeout", () => {
    let s = writeAll(start());
    s = send(s, A, vote(s, B));
    s = timeoutPhase(s);
    expect(lastRecord(s).votes).toEqual({ [A]: B, [B]: null, [C]: null });
  });

  test("Podróbka też głosuje i czeka się na jej decyzję", () => {
    const v = votingWith(THREE, A);
    expect(waiting(v)).toContain(A);
    expect(game.validateMove(v, A, vote(v, B))).toBe(true);
  });

  test("jawne jest tylko, kto już zagłosował", () => {
    let s = writeAll(start());
    s = send(s, A, vote(s, B));
    for (const viewer of [B, C, OBSERVER]) {
      const view = seen(s, viewer);
      expect(view.voted).toEqual([A]);
      expect(view.myVote).toBeNull();
    }
    expect(seen(s, A).myVote).toBe(B);
  });

  test("ostatnia decyzja natychmiast otwiera odsłonę, dokładnie raz", () => {
    let s = writeAll(start());
    const key = turn(s).key;
    s = send(s, A, vote(s, B));
    s = send(s, B, vote(s, C));
    expect(pub(s).phase).toBe("vote");
    expect(turn(s).key).toBe(key);
    expect(pub(s).history).toEqual([]);
    s = send(s, C, vote(s, A));
    expect(pub(s).phase).toBe("summary");
    expect(turn(s).key).not.toBe(key);
    expect(pub(s).history).toHaveLength(1);
  });
});

describe("wykrycie i punktacja", () => {
  test("Podróbka ma 2 głosy, nikt inny tyle: wykryta (3 osoby, dwa głosy pozostałych)", () => {
    const s = voteAll(votingWith(THREE, A), { [A]: B, [B]: A, [C]: A });
    const record = lastRecord(s);
    expect(record.detected).toBe(true);
    expect(record.tally).toEqual({ [A]: 2, [B]: 1, [C]: 0 });
    expect(record.gain).toEqual({ [A]: 0, [B]: 2, [C]: 2 });
  });

  test("nie trzeba większości bezwzględnej: samodzielne 2 z 6 głosów wystarczają", () => {
    const votes = { [A]: null, [B]: A, [C]: A, [D]: null, [E]: F, [F]: null };
    const s = voteAll(votingWith(SIX, A), votes);
    expect(lastRecord(s).detected).toBe(true);
    expect(lastRecord(s).tally).toEqual({ [A]: 2, [B]: 0, [C]: 0, [D]: 0, [E]: 0, [F]: 1 });
  });

  test("Podróbka i ktoś inny po tyle samo najwięcej: niewykryta, bez dogrywki", () => {
    const s = voteAll(votingWith(FOUR, A), { [A]: B, [B]: A, [C]: A, [D]: B });
    const record = lastRecord(s);
    expect(record.detected).toBe(false);
    expect(record.tally).toEqual({ [A]: 2, [B]: 2, [C]: 0, [D]: 0 });
    expect(record.gain).toEqual({ [A]: 3, [B]: 2, [C]: 2, [D]: 0 });
    expect(pub(s).phase).toBe("summary");
  });

  test("pojedynczy głos na Podróbkę bez innych głosów: niewykryta", () => {
    const s = voteAll(votingWith(THREE, A), { [A]: null, [B]: A, [C]: null });
    const record = lastRecord(s);
    expect(record.tally).toEqual({ [A]: 1, [B]: 0, [C]: 0 });
    expect(record.detected).toBe(false);
    expect(record.gain).toEqual({ [A]: 0, [B]: 2, [C]: 0 });
  });

  test("lider niewinny: niewykryta, a trafny głos zwykłego gracza nadal daje 2 pkt", () => {
    const s = voteAll(votingWith(FOUR, A), { [A]: C, [B]: C, [C]: A, [D]: C });
    const record = lastRecord(s);
    expect(record.tally).toEqual({ [A]: 1, [B]: 0, [C]: 3, [D]: 0 });
    expect(record.detected).toBe(false);
    expect(record.gain).toEqual({ [A]: 3, [B]: 0, [C]: 2, [D]: 0 });
  });

  test("Podróbka niewykryta, która zagłosowała, dostaje 3 pkt", () => {
    const s = voteAll(votingWith(THREE, A), { [A]: B, [B]: C, [C]: B });
    expect(lastRecord(s).detected).toBe(false);
    expect(lastRecord(s).gain[A]).toBe(3);
  });

  test("Podróbka niewykryta bez głosu dostaje 0 pkt", () => {
    const s = voteAll(votingWith(THREE, A), { [A]: null, [B]: C, [C]: B });
    expect(lastRecord(s).detected).toBe(false);
    expect(lastRecord(s).gain[A]).toBe(0);
  });

  test("Podróbka wykryta dostaje 0 pkt, nawet po oddaniu głosu", () => {
    const s = voteAll(votingWith(THREE, A), { [A]: C, [B]: A, [C]: A });
    expect(lastRecord(s).detected).toBe(true);
    expect(lastRecord(s).gain[A]).toBe(0);
  });

  test("głos Podróbki na siebie nie istnieje, więc nie ma od niej trafnego głosu za 2 pkt", () => {
    const v = votingWith(THREE, A);
    rejects(v, A, vote(v, A));
    const gained = resolveVotes(THREE, A, { [A]: B, [B]: C, [C]: B }).gain[A];
    expect(gained).toBe(3);
  });

  test("głos Podróbki wpływa na wynik oskarżenia, ale nie daje punktów za wskazanie", () => {
    const base = { [B]: A, [C]: A, [D]: C };
    const onD = resolveVotes(FOUR, A, { ...base, [A]: D });
    expect(onD.detected).toBe(true);
    expect(onD.gain[A]).toBe(0);
    const onC = resolveVotes(FOUR, A, { ...base, [A]: C });
    expect(onC.detected).toBe(false);
    expect(onC.gain[A]).toBe(3);
    expect(onC.gain[D]).toBe(0);
  });

  test("wszyscy się wstrzymali: 0 pkt dla wszystkich", () => {
    const s = abstainAll(votingWith(THREE, A));
    expect(lastRecord(s).detected).toBe(false);
    expect(lastRecord(s).gain).toEqual(zeroes(THREE));
    expect(lastRecord(s).cancelled).toBe(false);
  });

  test("zwykły gracz bez trafnego głosu dostaje 0 pkt", () => {
    const s = voteAll(votingWith(FOUR, A), { [A]: B, [B]: C, [C]: A, [D]: null });
    const record = lastRecord(s);
    expect(record.gain[B]).toBe(0);
    expect(record.gain[C]).toBe(2);
    expect(record.gain[D]).toBe(0);
  });

  test("wejście w odsłonę dolicza punkty raz, a „Dalej” ich nie zmienia", () => {
    let s = votingWith(THREE, A);
    expect(pub(s).totals).toEqual(zeroes(THREE));
    s = voteAll(s, { [A]: B, [B]: A, [C]: B });
    const expected = { [A]: 3, [B]: 2, [C]: 0 };
    expect(lastRecord(s).gain).toEqual(expected);
    expect(pub(s).totals).toEqual(expected);
    s = send(s, A, next(s));
    expect(pub(s).totals).toEqual(expected);
    expect(pub(s).history).toHaveLength(1);
    s = timeoutPhase(s);
    expect(pub(s).phase).toBe("write");
    expect(pub(s).totals).toEqual(expected);
    expect(pub(s).history).toHaveLength(1);
  });

  // Rozkłady (n-1 celów + wstrzymanie)^n: dla 6 osób 46 656 na jedną Podróbkę.
  function agreesWithOracle(players: string[], impostors: string[]) {
    const mismatches: string[] = [];
    let cases = 0;
    const choices = (voter: string) => [null, ...players.filter((p) => p !== voter)];
    const votes: Record<string, string | null> = {};
    const check = (role: string) => {
      cases++;
      const tally: Record<string, number> = zeroes(players);
      for (const p of players) if (votes[p] !== null) tally[votes[p]!]++;
      const top = Math.max(...players.map((p) => tally[p]));
      const leaders = players.filter((p) => tally[p] === top);
      const detected = top >= 2 && leaders.length === 1 && leaders[0] === role;
      const gain: Record<string, number> = {};
      for (const p of players) {
        if (p === role) gain[p] = !detected && votes[p] !== null ? 3 : 0;
        else gain[p] = votes[p] === role ? 2 : 0;
      }
      const result = resolveVotes(players, role, votes);
      const same = result.detected === detected && players.every((p) => result.tally[p] === tally[p] && result.gain[p] === gain[p]);
      if (!same && mismatches.length < 3) mismatches.push(`${role}: ${JSON.stringify(votes)} -> ${JSON.stringify(result)}`);
    };
    const walk = (index: number, role: string) => {
      if (index === players.length) return check(role);
      for (const choice of choices(players[index])) {
        votes[players[index]] = choice;
        walk(index + 1, role);
      }
    };
    for (const role of impostors) walk(0, role);
    expect(mismatches).toEqual([]);
    return cases;
  }

  test("resolveVotes: wszystkie rozkłady dla 3 osób zgodne z wyrocznią", () => {
    expect(agreesWithOracle(THREE, THREE)).toBe(3 * 3 ** 3);
  });

  test("resolveVotes: wszystkie rozkłady dla 4 osób zgodne z wyrocznią", () => {
    expect(agreesWithOracle(FOUR, FOUR)).toBe(4 * 4 ** 4);
  });

  test("resolveVotes: wszystkie rozkłady dla 5 osób zgodne z wyrocznią", () => {
    expect(agreesWithOracle(FIVE, FIVE)).toBe(5 * 5 ** 5);
  });

  test("resolveVotes: wszystkie rozkłady dla 6 osób zgodne z wyrocznią", () => {
    expect(agreesWithOracle(SIX, [A, F])).toBe(2 * 6 ** 6);
  }, 60_000);
});

describe("kolejność faz i limity", () => {
  test("turn().key to partia, runda i faza, a sekundy zależą od fazy", () => {
    const { write: w, vote: v, summary: sum, over } = phases();
    const nonce = pub(w).nonce;
    expect(turn(w)).toEqual({ key: `${nonce}:0:write`, seconds: WRITE_SECONDS });
    expect(turn(v)).toEqual({ key: `${nonce}:0:vote`, seconds: VOTE_SECONDS });
    expect(turn(sum)).toEqual({ key: `${nonce}:0:summary`, seconds: SUMMARY_SECONDS });
    expect(turn(nextAll(sum))).toEqual({ key: `${nonce}:1:write`, seconds: WRITE_SECONDS });
    expect(turn(over).seconds).toBe(0);
    expect(turn(over).key).toBe(`${nonce}:${ROUNDS - 1}:over`);
  });

  test("turn().key jest stały wewnątrz każdej fazy", () => {
    let s = start();
    const writeKey = turn(s).key;
    for (const p of THREE.slice(0, 2)) {
      s = send(s, p, write(s, "szkic", false));
      expect(turn(s).key).toBe(writeKey);
      s = send(s, p, write(s, "x"));
      expect(turn(s).key).toBe(writeKey);
    }
    s = send(s, C, write(s, "x"));
    const voteKey = turn(s).key;
    s = send(s, A, vote(s, B));
    expect(turn(s).key).toBe(voteKey);
    s = send(s, B, vote(s, A));
    s = send(s, C, vote(s, A));
    const summaryKey = turn(s).key;
    s = send(s, A, next(s));
    expect(turn(s).key).toBe(summaryKey);
  });

  test("waitingFor kurczy się w każdej fazie, a szkic go nie zmienia", () => {
    let s = start();
    expect(waiting(s)).toEqual(THREE);
    s = send(s, B, write(s, "szkic", false));
    expect(waiting(s)).toEqual(THREE);
    s = send(s, B, write(s, "x"));
    expect(waiting(s)).toEqual([A, C]);
    s = send(s, A, write(s, "x"));
    expect(waiting(s)).toEqual([C]);
    s = send(s, C, write(s, "x"));
    expect(waiting(s)).toEqual(THREE);
    s = send(s, C, vote(s, A));
    expect(waiting(s)).toEqual([A, B]);
    s = send(s, A, vote(s, B));
    expect(waiting(s)).toEqual([B]);
    s = send(s, B, vote(s, A));
    expect(waiting(s)).toEqual(THREE);
    s = send(s, A, next(s));
    expect(waiting(s)).toEqual([B, C]);
    s = send(s, B, next(s));
    expect(waiting(s)).toEqual([C]);
    s = send(s, C, next(s));
    expect(waiting(s)).toEqual(THREE);
  });

  test("„Dalej” od wszystkich otwiera kolejną rundę z czystymi szkicami i głosami", () => {
    let s = start();
    s = send(s, A, write(s, "stary szkic", false));
    s = nextAll(voteAll(writeAll(s), cyclicVotes(THREE)));
    const view = seen(s, A);
    expect(view.phase).toBe("write");
    expect(view.round).toBe(1);
    expect(view.myDraft).toBe("");
    expect(view.done).toEqual([]);
    expect(view.voted).toEqual([]);
    expect(view.ready).toEqual([]);
    expect(view.myVote).toBeNull();
  });

  test("timeout każdego oczekującego w odsłonie otwiera kolejną rundę", () => {
    let s = voteAll(writeAll(start()), cyclicVotes(THREE));
    s = send(s, A, next(s));
    s = timeoutPhase(s);
    expect(pub(s).phase).toBe("write");
    expect(pub(s).round).toBe(1);
  });

  test("szósta runda rozstrzygnięta: over bez summary i next, ostatnia odsłona w history", () => {
    const seed = seedWhere(THREE, (s) => s.deals[ROUNDS - 1].impostor === A);
    let s = skipRounds(start(THREE, seed), ROUNDS - 1);
    expect(pub(s).round).toBe(ROUNDS - 1);
    s = voteAll(writeAll(s), { [A]: B, [B]: A, [C]: A });
    expect(pub(s).phase).toBe("over");
    expect(waiting(s)).toEqual([]);
    expect(pub(s).history).toHaveLength(ROUNDS);
    expect(lastRecord(s).round).toBe(ROUNDS - 1);
    expect(lastRecord(s).detected).toBe(true);
    expect(pub(s).totals).toEqual({ [A]: 0, [B]: 2, [C]: 2 });
    rejects(s, A, next(s));
  });

  test("górna granica partii to 615 s i tyle dają limity z zasad", () => {
    expect(ROUNDS * (WRITE_SECONDS + VOTE_SECONDS) + (ROUNDS - 1) * SUMMARY_SECONDS).toBe(615);
  });
});

describe("limit czasu", () => {
  test.each([[THREE], [SIX]])("każda faza ma legalny timeoutMove przechodzący schemat i validateMove (%j)", (players) => {
    const { write: w, vote: v, summary: sum } = phases(players);
    for (const s of [w, v, sum]) {
      for (const p of players) {
        const move = timeoutOf(s, p);
        expect(game.moveSchema.safeParse(move).success).toBe(true);
        expect(game.validateMove(s, p, move, TIMEOUT)).toBe(true);
      }
    }
    expect(timeoutOf(w, players[0])).toMatchObject({ type: "write", done: true });
    expect(timeoutOf(v, players[0])).toMatchObject({ type: "vote", target: null });
    expect(timeoutOf(sum, players[0])).toMatchObject({ type: "next" });
  });

  test.each([[THREE], [SIX]])("komplet timeoutów we wszystkich rundach: 6 anulowań, wszyscy 0, remis bez zwycięzcy (%j)", (players) => {
    const s = timeoutAll(start(players, 21));
    const view = pub(s);
    expect(view.phase).toBe("over");
    expect(view.history).toHaveLength(ROUNDS);
    expect(view.history.every((record) => record.cancelled)).toBe(true);
    expect(view.totals).toEqual(zeroes(players));
    const result = game.isOver(s)!;
    expect(result.winner).toBeUndefined();
    expect(game.places!(s)).toEqual(Object.fromEntries(players.map((p) => [p, 1])));
  });

  test.each([[THREE], [SIX]])("zegar nie nalicza punktów ponownie: odpowiedzi od graczy, głosy i „Dalej” po limicie (%j)", (players) => {
    let s = start(players, 4);
    for (let round = 0; round < ROUNDS; round++) {
      s = writeAll(s);
      if (round === 0) {
        const role = impostor(s);
        const voter = players.find((p) => p !== role)!;
        s = send(s, voter, vote(s, role));
      }
      s = timeoutPhase(s);
      if (round === 0) {
        expect(Object.values(pub(s).totals).reduce((sum, value) => sum + value, 0)).toBe(2);
      }
      if (pub(s).phase === "summary") s = timeoutPhase(s);
    }
    expect(pub(s).phase).toBe("over");
    expect(pub(s).history.every((record) => !record.cancelled)).toBe(true);
    expect(Object.values(pub(s).totals).reduce((sum, value) => sum + value, 0)).toBe(2);
  });
});

describe("widoki", () => {
  test.each([[THREE], [SIX]])("każdy widok ma dokładnie dozwolone klucze w każdej fazie (%j)", (players) => {
    const all = phases(players);
    for (const [phase, s] of Object.entries(all)) {
      for (const viewer of [...players, OBSERVER, STRANGER]) {
        expect(Object.keys(seen(s, viewer)).sort(), `${phase}/${viewer}`).toEqual(VIEW_KEYS);
      }
    }
  });

  test("w pisaniu i głosowaniu pierwszej rundy widok nie ma ról, pairId, szkiców ani głosów", () => {
    const { write: w, vote: v } = phases(SIX, 2);
    for (const s of [w, v]) {
      for (const viewer of [...SIX, OBSERVER, STRANGER]) {
        const json = JSON.stringify(seen(s, viewer));
        for (const key of SECRET_KEYS) expect(json, `${pub(s).phase}/${viewer}/${key}`).not.toContain(key);
      }
    }
  });

  test("widok Podróbki w pisaniu wygląda jak widok zwykłego gracza, różni się tylko pytaniem", () => {
    const s = startWith(FOUR, A);
    const fake = seen(s, A);
    const normal = seen(s, B);
    expect({ ...fake, myQuestion: "" }).toEqual({ ...normal, myQuestion: "" });
    expect(fake.myQuestion).not.toBe(normal.myQuestion);
    expect(seen(s, C).myQuestion).toBe(normal.myQuestion);
    expect(seen(s, D).myQuestion).toBe(normal.myQuestion);
  });

  test("zwykły gracz w pisaniu i głosowaniu nie zna pytania Podróbki", () => {
    const seed = seedWhere(FOUR, (s) => s.deals[0].impostor === A);
    const record = truth(FOUR, seed)[0];
    const w = start(FOUR, seed);
    const v = writeAll(w);
    for (const s of [w, v]) {
      for (const viewer of [B, C, D]) {
        expect(seen(s, viewer).myQuestion).toBe(record.majorityQuestion);
        expect(JSON.stringify(seen(s, viewer))).not.toContain(record.otherQuestion);
      }
    }
  });

  test("Podróbka w pisaniu nie zna pytania większości, w głosowaniu widzi je obok własnego", () => {
    const seed = seedWhere(FOUR, (s) => s.deals[0].impostor === A);
    const record = truth(FOUR, seed)[0];
    const w = start(FOUR, seed);
    expect(seen(w, A).myQuestion).toBe(record.otherQuestion);
    expect(seen(w, A).majorityQuestion).toBeNull();
    expect(JSON.stringify(seen(w, A))).not.toContain(record.majorityQuestion);
    const v = writeAll(w);
    expect(seen(v, A).myQuestion).toBe(record.otherQuestion);
    expect(seen(v, A).majorityQuestion).toBe(record.majorityQuestion);
  });

  test("wskazówka formatu jest wspólna dla wszystkich uczestników", () => {
    const seed = seedWhere(FOUR, (s) => s.deals[0].impostor === A);
    const record = truth(FOUR, seed)[0];
    const w = start(FOUR, seed);
    for (const p of FOUR) expect(seen(w, p).hint).toBe(record.hint);
  });

  test("widok przez całą partię nie ma przyszłych pytań ani bieżącej rundy w historii", () => {
    const seed = 8;
    const records = truth(THREE, seed);
    const future = (round: number) => records.slice(round + 1).flatMap((r) => [r.majorityQuestion, r.otherQuestion]);
    let s = start(THREE, seed);
    for (let round = 0; round < ROUNDS; round++) {
      const check = (state: State) => {
        for (const viewer of [...THREE, OBSERVER]) {
          const view = seen(state, viewer);
          const json = JSON.stringify(view);
          for (const question of future(round)) expect(json, `${round}/${viewer}`).not.toContain(question);
          expect(view.history.filter((record) => record.round >= round)).toEqual([]);
        }
      };
      check(s);
      s = writeAll(s);
      check(s);
      s = voteAll(s, cyclicVotes(THREE));
      if (round < ROUNDS - 1) s = nextAll(s);
    }
    expect(pub(s).phase).toBe("over");
  });

  test("cudze szkice i odpowiedzi w pisaniu są niewidoczne dla graczy i obserwatora", () => {
    let s = start(FOUR);
    s = send(s, A, write(s, "SEKRETSZKIC", false));
    s = send(s, B, write(s, "SEKRETODP"));
    for (const viewer of [C, D, OBSERVER, STRANGER]) {
      const json = JSON.stringify(seen(s, viewer));
      expect(json).not.toContain("SEKRETSZKIC");
      expect(json).not.toContain("SEKRETODP");
    }
    expect(JSON.stringify(seen(s, A))).not.toContain("SEKRETODP");
    expect(JSON.stringify(seen(s, B))).not.toContain("SEKRETSZKIC");
    expect(seen(s, A).myDraft).toBe("SEKRETSZKIC");
    expect(seen(s, B).myDraft).toBe("SEKRETODP");
  });

  test("cudzy głos przed odsłoną nie jest widoczny nawet w gotowości", () => {
    let s = writeAll(start(FOUR));
    s = send(s, A, vote(s, B));
    for (const viewer of [B, C, D, OBSERVER, STRANGER]) {
      const view = seen(s, viewer);
      expect(view.myVote).toBeNull();
      expect(JSON.stringify(view)).not.toContain('"votes"');
      expect(view.voted).toEqual([A]);
    }
  });

  test("obserwator i obce id w pisaniu: bez pytań i szkiców, widać rundę, punkty i gotowość", () => {
    let s = start(THREE);
    s = send(s, A, write(s, "x"));
    s = send(s, B, write(s, "y", false));
    for (const viewer of [OBSERVER, STRANGER]) {
      const view = seen(s, viewer);
      expect(view.myQuestion).toBeNull();
      expect(view.majorityQuestion).toBeNull();
      expect(view.hint).toBeNull();
      expect(view.myDraft).toBeNull();
      expect(view.answers).toBeNull();
      expect(view.myVote).toBeNull();
      expect(view.round).toBe(0);
      expect(view.phase).toBe("write");
      expect(view.done).toEqual([A]);
      expect(view.totals).toEqual(zeroes(THREE));
    }
    const seed = 1;
    const record = truth(THREE, seed)[0];
    const json = JSON.stringify(pub(start(THREE, seed)));
    expect(json).not.toContain(record.majorityQuestion);
    expect(json).not.toContain(record.otherQuestion);
  });

  test("obserwator i obce id w głosowaniu: pytanie większości i odpowiedzi, bez głosów", () => {
    const seed = seedWhere(THREE, (s) => s.deals[0].impostor === A);
    const record = truth(THREE, seed)[0];
    let s = writeAll(start(THREE, seed));
    s = send(s, B, vote(s, A));
    for (const viewer of [OBSERVER, STRANGER]) {
      const view = seen(s, viewer);
      expect(view.majorityQuestion).toBe(record.majorityQuestion);
      expect(view.answers).toEqual({ [A]: defaultAnswer(A), [B]: defaultAnswer(B), [C]: defaultAnswer(C) });
      expect(view.voted).toEqual([B]);
      expect(view.myQuestion).toBeNull();
      expect(view.myDraft).toBeNull();
      expect(view.myVote).toBeNull();
      expect(JSON.stringify(view)).not.toContain(record.otherQuestion);
      expect(JSON.stringify(view)).not.toContain('"votes"');
    }
  });

  test("obce id widzi dokładnie to samo co obserwator w każdej fazie", () => {
    for (const s of Object.values(phases(FOUR))) {
      expect(seen(s, STRANGER)).toEqual(pub(s));
    }
  });

  test("uczestnik w głosowaniu widzi pytanie większości, wszystkie odpowiedzi, swoje pytanie i głos", () => {
    let s = votingWith(THREE, A);
    s = send(s, B, vote(s, C));
    const view = seen(s, B);
    expect(view.majorityQuestion).not.toBeNull();
    expect(view.myQuestion).toBe(view.majorityQuestion);
    expect(view.answers).toEqual({ [A]: defaultAnswer(A), [B]: defaultAnswer(B), [C]: defaultAnswer(C) });
    expect(view.myVote).toBe(C);
  });

  test("odsłona: oba pytania, Podróbka, odpowiedzi, głosy i przyrost, ten sam publiczny wynik dla wszystkich", () => {
    const s = voteAll(votingWith(THREE, A), { [A]: B, [B]: A, [C]: A });
    const record = lastRecord(s);
    expect(record.round).toBe(0);
    expect(record.impostor).toBe(A);
    expect(record.majorityQuestion).not.toBe(record.otherQuestion);
    expect(record.answers).toEqual({ [A]: defaultAnswer(A), [B]: defaultAnswer(B), [C]: defaultAnswer(C) });
    expect(record.votes).toEqual({ [A]: B, [B]: A, [C]: A });
    expect(record.gain).toEqual({ [A]: 0, [B]: 2, [C]: 2 });
    for (const viewer of [...THREE, STRANGER]) {
      expect(seen(s, viewer).history).toEqual(pub(s).history);
      expect(seen(s, viewer).totals).toEqual(pub(s).totals);
    }
  });

  test("koniec: historia jest publiczna i taka sama dla każdego widza", () => {
    const { over } = phases(FOUR);
    for (const viewer of [...FOUR, STRANGER]) expect(seen(over, viewer).history).toEqual(pub(over).history);
    expect(pub(over).history).toHaveLength(ROUNDS);
  });
});

describe("koniec partii", () => {
  /** P kończy z punktami, reszta z zerem: zwykli głosują obok, Podróbka inna niż P się wstrzymuje. */
  function playForWinner(players: string[], winner: string, seed = 13) {
    let s = start(players, seed);
    for (let round = 0; round < ROUNDS; round++) {
      s = writeAll(s);
      const role = impostor(s);
      const votes = Object.fromEntries(players.map((p) => {
        if (p === winner) return [p, role === winner ? players.find((q) => q !== winner)! : role];
        if (p === role) return [p, null];
        return [p, players.find((q) => q !== p && q !== role)!];
      }));
      s = voteAll(s, votes);
      if (round < ROUNDS - 1) s = nextAll(s);
    }
    return s;
  }

  test.each([
    ...THREE.map((p) => [THREE, p] as const),
    ...SIX.map((p) => [SIX, p] as const),
  ])("każdy może wygrać (%j, %s)", (players, winner) => {
    const s = playForWinner(players, winner);
    const result = game.isOver(s)!;
    expect(result.winner).toBe(winner);
    expect(result.ranking![0]).toBe(winner);
    expect(result.ranking!.slice().sort()).toEqual([...players].sort());
    expect(game.places!(s)[winner]).toBe(1);
    for (const p of players) if (p !== winner) expect(game.places!(s)[p]).toBe(2);
    expect(waiting(s)).toEqual([]);
  });

  test("remis na górze: bez zwycięzcy, wspólne pierwsze miejsce, kolejne to trzecie", () => {
    let s = startWith(THREE, C);
    s = voteAll(writeAll(s), { [A]: C, [B]: C, [C]: null });
    expect(pub(s).totals).toEqual({ [A]: 2, [B]: 2, [C]: 0 });
    s = nextAll(s);
    s = timeoutAll(s);
    const result = game.isOver(s)!;
    expect(result.winner).toBeUndefined();
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1, [C]: 3 });
    expect(result.ranking!.slice(0, 2).sort()).toEqual([A, B]);
    expect(result.ranking![2]).toBe(C);
  });

  test("remis niżej: zwycięzca jest, a równe sumy mają wspólne miejsce", () => {
    const seed = seedWhere(FOUR, (s) => s.deals[0].impostor === D && s.deals[1].impostor === D);
    let s = start(FOUR, seed);
    s = voteAll(writeAll(s), { [A]: D, [B]: D, [C]: A, [D]: null });
    s = nextAll(s);
    s = voteAll(writeAll(s), { [A]: D, [B]: C, [C]: A, [D]: null });
    s = nextAll(s);
    s = timeoutAll(s);
    expect(pub(s).totals).toEqual({ [A]: 4, [B]: 2, [C]: 0, [D]: 0 });
    const result = game.isOver(s)!;
    expect(result.winner).toBe(A);
    expect(result.ranking!.slice(0, 2)).toEqual([A, B]);
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 2, [C]: 3, [D]: 3 });
  });

  test("bez rozstrzygania szybkością: kolejność odpowiedzi i głosów nie zmienia remisu", () => {
    const seed = seedWhere(THREE, (s) => s.deals[0].impostor === C);
    let forward = start(THREE, seed);
    forward = voteAll(writeAll(forward), { [A]: C, [B]: C, [C]: null });
    let backward = start(THREE, seed);
    for (const p of [C, B, A]) backward = send(backward, p, write(backward, defaultAnswer(p)));
    backward = send(backward, C, vote(backward, null), TIMEOUT);
    for (const p of [B, A]) backward = send(backward, p, vote(backward, C));
    expect(pub(backward).totals).toEqual(pub(forward).totals);
    expect(game.places!(timeoutAll(nextAll(backward)))).toEqual({ [A]: 1, [B]: 1, [C]: 3 });
  });

  test("tabela sum jest zgodna z places i sumą przyrostów, a sumy mieszczą się w 0-18", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const players = seed % 2 ? THREE : SIX;
      const rng = createRng(seed * 31);
      let s = start(players, seed);
      for (let round = 0; round < ROUNDS; round++) {
        s = writeAll(s);
        const votes = Object.fromEntries(players.map((p) => {
          const others = [...players.filter((q) => q !== p), null];
          return [p, others[Math.floor(rng() * others.length)]];
        }));
        s = voteAll(s, votes);
        if (round < ROUNDS - 1) s = nextAll(s);
      }
      const { totals, history } = pub(s);
      const places = game.places!(s);
      for (const p of players) {
        expect(totals[p]).toBe(history.reduce((sum, record) => sum + record.gain[p], 0));
        expect(totals[p]).toBeGreaterThanOrEqual(0);
        expect(totals[p]).toBeLessThanOrEqual(18);
        expect(places[p]).toBe(1 + players.filter((q) => totals[q] > totals[p]).length);
      }
      const ranking = game.isOver(s)!.ranking!;
      expect(ranking.map((p) => totals[p])).toEqual(players.map((p) => totals[p]).sort((x, y) => y - x));
    }
  });

  test("maksimum to 18: Podróbka we wszystkich rundach zawsze uchodzi z własnym głosem", () => {
    const seed = seedWhere(THREE, (s) => Array.from({ length: ROUNDS }, (_, round) => s.deals[round].impostor).every((role) => role === A));
    let s = start(THREE, seed);
    for (let round = 0; round < ROUNDS; round++) {
      s = voteAll(writeAll(s), { [A]: B, [B]: C, [C]: B });
      if (round < ROUNDS - 1) s = nextAll(s);
    }
    expect(pub(s).totals[A]).toBe(18);
    expect(game.isOver(s)!.winner).toBe(A);
  });

  test("isOver jest null do samego końca partii", () => {
    let s = start();
    for (let round = 0; round < ROUNDS; round++) {
      expect(game.isOver(s)).toBeNull();
      s = writeAll(s);
      expect(game.isOver(s)).toBeNull();
      s = voteAll(s, cyclicVotes(THREE));
      if (round < ROUNDS - 1) {
        expect(game.isOver(s)).toBeNull();
        s = nextAll(s);
      }
    }
    expect(game.isOver(s)).not.toBeNull();
  });
});

describe("stan", () => {
  test("applyMove nie zmienia poprzedniego stanu w żadnej fazie", () => {
    const fresh = start();
    const copy = JSON.stringify(fresh);
    const draft = game.applyMove(fresh, A, write(fresh, "x", false), createRng(1));
    expect(JSON.stringify(fresh)).toBe(copy);
    expect(draft).not.toBe(fresh);
    const { vote: v, summary: sum } = phases();
    for (const [s, move] of [[v, vote(v, B)], [sum, next(sum)]] as const) {
      const before = JSON.stringify(s);
      game.applyMove(s, A, move, createRng(1));
      expect(JSON.stringify(s)).toBe(before);
    }
  });

  test.each([[THREE], [SIX]])("pełna partia przeżywa JSON na każdym kroku (%j)", (players) => {
    const roundTrip = (s: State) => {
      const parsed = JSON.parse(JSON.stringify(s)) as State;
      expect(parsed).toStrictEqual(s);
      return deepFreeze(parsed);
    };
    let s = roundTrip(start(players, 6));
    for (let round = 0; round < ROUNDS; round++) {
      s = roundTrip(send(s, players[0], write(s, "szkic", false)));
      for (const p of players) s = roundTrip(send(s, p, write(s, defaultAnswer(p))));
      for (const p of waiting(s)) s = roundTrip(send(s, p, vote(s, cyclicVotes(players)[p])));
      if (round < ROUNDS - 1) for (const p of waiting(s)) s = roundTrip(send(s, p, next(s)));
    }
    expect(pub(s).phase).toBe("over");
    expect(pub(s).history).toHaveLength(ROUNDS);
    expect(JSON.parse(JSON.stringify(pub(s)))).toStrictEqual(pub(s));
  });
});
