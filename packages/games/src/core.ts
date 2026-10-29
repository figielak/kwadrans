import type { z } from "zod";

export type PlayerId = string;

/** Zwraca liczbę z przedziału [0, 1). */
export type Rng = () => number;

export type GameResult = { winner?: PlayerId; ranking?: PlayerId[] };

/** Zaufane źródło z miejsca wywołania w serwerze, nigdy z treści ruchu klienta. */
export type MoveContext = { source: "client" | "timeout" };

export interface GameDefinition<State, Move> {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  /** Kształt ruchu przychodzącego z sieci; reguły sprawdza dopiero validateMove. */
  moveSchema: z.ZodType<Move>;
  /** Tryby do wyboru w lobby, w kolejności wyświetlania; domyślny ma `default` (bez flagi: pierwszy). Gra bez trybów pomija to pole. */
  modes?: { id: string; name: string; hint: string; default?: boolean }[];
  /** `mode` to id z `modes` wybrane przez gospodarza; nieznane albo brak oznacza tryb domyślny. */
  setup(players: PlayerId[], rng: Rng, mode?: string): State;
  /** Brak kontekstu oznacza klienta. Ruchy po limicie również wymagają walidacji. */
  validateMove(state: State, player: PlayerId, move: Move, context?: MoveContext): boolean;
  applyMove(state: State, player: PlayerId, move: Move, rng: Rng): State;
  /** Widok stanu dla konkretnego gracza: tu ukrywamy informacje. Obserwator dostaje widok dla "". */
  playerView(state: State, player: PlayerId): unknown;
  isOver(state: State): GameResult | null;
  /** Miejsca po końcu gry (od 1, remis = to samo miejsce). Mają je mini-gry: turniej liczy z nich punkty. */
  places?(state: State): Record<PlayerId, number>;
  /** Na kogo czekamy (ruch po kolei: jedna osoba; faza równoczesna: kilka); [] po końcu gry. */
  waitingFor(state: State): PlayerId[];
  /** Limit czasu tury; po nim platforma wykonuje timeoutMove za gracza. */
  turnSeconds?: number;
  /** Zamiast turnSeconds: limit zależny od fazy. Odlicza od nowa tylko przy zmianie key (np. STOP w Państwach-miastach). */
  turn?(state: State): { key: string; seconds: number };
  timeoutMove?(state: State, player: PlayerId, rng: Rng): Move;
  /**
   * Mini-gry: główny wynik gracza po końcu partii jako liczba, do rankingu rekordów; `lower` = mniej znaczy lepiej.
   * `tie` to drugie kryterium, którym gra rozstrzyga remisy (np. średnia reakcji); wynik nieskończony znaczy „brak”.
   */
  record?: { lower: boolean; score(state: State, player: PlayerId): number; tie?: { lower: boolean; score(state: State, player: PlayerId): number } };
}

/** mulberry32: mały, deterministyczny generator. Ten sam seed daje ten sam ciąg (testy, powtórki). */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bez O/0, I/1/L, żeby kod dało się bezbłędnie przepisać z ekranu kolegi. */
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 4;

export function roomCode(rng: Rng): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(rng() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Ranking gry, w której każdy oddaje jeden wynik (mini-gry). null, dopóki ktoś nie oddał.
 * Przy remisie kolejność miejsc; zwycięzca tylko przy 2+ graczach i bez remisu na górze (solo nie nabija statystyk).
 */
export function rankResults<R>(players: PlayerId[], results: Record<PlayerId, R>, compare: (a: R, b: R) => number): GameResult | null {
  if (!players.every((p) => p in results)) return null;
  const ranking = [...players].sort((a, b) => compare(results[a], results[b]));
  const clear = ranking.length > 1 && compare(results[ranking[0]], results[ranking[1]]) !== 0;
  return clear ? { winner: ranking[0], ranking } : { ranking };
}

/** Miejsca z remisami: 1 + liczba graczy ze ściśle lepszym wynikiem. Tylko po końcu gry (każdy ma wynik). */
export function rankPlaces<R>(players: PlayerId[], results: Record<PlayerId, R>, compare: (a: R, b: R) => number): Record<PlayerId, number> {
  return Object.fromEntries(players.map((p) => [p, 1 + players.filter((q) => compare(results[q], results[p]) < 0).length]));
}

/** Nieukończone nowe partie są na końcu i remisują. Brak znacznika w historii nie zmienia wyniku. */
export function byCompletion<R extends { completed?: boolean }>(compare: (a: R, b: R) => number): (a: R, b: R) => number {
  return (a, b) => a.completed === false || b.completed === false
    ? Number(a.completed === false) - Number(b.completed === false)
    : compare(a, b);
}

type Ranked<S> = { isOver: (state: S) => GameResult | null; places: (state: S) => Record<PlayerId, number> };
type Scored<T> = { lower: boolean; score: T };

/**
 * `isOver` i `places` mini-gry z jednego komparatora, żeby ranking i miejsca nie mogły się rozjechać.
 * `record` (wynik jako liczba i kierunek, opcjonalnie drugie kryterium `tie`) dokłada pole do rankingu rekordów.
 */
export function ranked<S extends { players: PlayerId[] }, R>(results: (state: S) => Record<PlayerId, R>, compare: (a: R, b: R) => number): Ranked<S>;
export function ranked<S extends { players: PlayerId[] }, R>(
  results: (state: S) => Record<PlayerId, R>,
  compare: (a: R, b: R) => number,
  record: Scored<(result: R) => number> & { tie?: Scored<(result: R) => number> },
): Ranked<S> & { record: Scored<(state: S, player: PlayerId) => number> & { tie?: Scored<(state: S, player: PlayerId) => number> } };
export function ranked<S extends { players: PlayerId[] }, R>(
  results: (state: S) => Record<PlayerId, R>,
  compare: (a: R, b: R) => number,
  record?: Scored<(result: R) => number> & { tie?: Scored<(result: R) => number> },
) {
  const of = ({ lower, score }: Scored<(result: R) => number>) => ({ lower, score: (state: S, player: PlayerId) => score(results(state)[player]) });
  return {
    isOver: (state: S) => rankResults(state.players, results(state), compare),
    places: (state: S) => rankPlaces(state.players, results(state), compare),
    ...(record && { record: { ...of(record), ...(record.tie && { tie: of(record.tie) }) } }),
  };
}

/** Bez wielkości liter, polskich znaków i nadmiarowych spacji: duplikaty odpowiedzi w Państwach-miastach i klucz nicku. */
export const normalize = (text: string) => text.trim().toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ");

/** „Ala”, „ala” i „ALA” to w rankingach jeden gracz. */
export const nickKey = normalize;

/**
 * Etykiety graczy na kropkach w nagłówku mini-gry, najwyżej dwa znaki. Unikalna pierwsza litera wystarcza („B”, „K”);
 * gdy się powtarza, dochodzi cyfra z końca nicku („G1”, „G2”) albo znak z pierwszej pozycji, na której te nicki się różnią („Ka”, „Kr”).
 */
export function initials(nicks: string[]): string[] {
  const segmenter = new Intl.Segmenter("pl", { granularity: "grapheme" });
  // Grafemy, nie jednostki UTF-16: emoji i flaga to jeden znak.
  const chars = nicks.map((nick) => [...segmenter.segment(nick.replace(/\s+/g, ""))].map((s) => s.segment));
  const upper = chars.map((c) => c.map((ch) => ch.toLocaleUpperCase("pl")));
  const second = (i: number, k: number) => (/\d/.test(chars[i].at(-1) ?? "") ? chars[i].length - 1 : k);
  return chars.map((own, i) => {
    const first = upper[i][0] ?? "";
    const group = upper.flatMap((c, j) => (c[0] === first ? [j] : []));
    if (group.length === 1) return first;
    // Te same nicki („Ala” i „ala”) i tak dostaną to samo, więc różnić muszą się tylko różne.
    const distinct = [...new Map(group.map((j) => [upper[j].join(""), j])).values()];
    const longest = Math.max(...distinct.map((j) => chars[j].length));
    let k = 1;
    // ponytail: dwa nicki z tą samą cyfrą na końcu („Gracz 1”, „Gosia1”) zostają z tą samą etykietą, rozróżnia je kolor.
    while (k < longest && new Set(distinct.map((j) => upper[j][second(j, k)] ?? "")).size < distinct.length) k++;
    if (k === longest) k = 1;
    const at = second(i, k);
    return first + (at > 0 ? (own[at] ?? "") : "");
  });
}

/** Id jedynego gracza w stanie z `soloState`. */
export const SOLO = "1";

/**
 * Stan mini-gry przycięty do jednego gracza: rekordowa partia w rankingu, którą ekran gry pokazuje jak zwykły koniec partii solo.
 * Mapy per gracz (obiekty z id graczy w kluczach) zostają z jednym wpisem pod `SOLO`, więc id sesji nie wychodzi poza pokój; wyzwanie zostaje bez zmian.
 */
export function soloState<S extends { players: PlayerId[] }>(state: S, player: PlayerId): S {
  const perPlayer = (value: unknown): value is Record<PlayerId, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value) && state.players.some((id) => id in value);
  return Object.fromEntries(
    Object.entries(state).map(([key, value]) => [key, key === "players" ? [SOLO] : perPlayer(value) ? (player in value ? { [SOLO]: value[player] } : {}) : value]),
  ) as S;
}

/** Wiersz rankingu rekordów mini-gry: najlepszy wynik gracza, jego drugie kryterium (null: gra go nie ma) i liczba partii. */
export interface RecordRow {
  nick: string;
  best: number;
  tie: number | null;
  played: number;
}

/** Kierunki rekordu gry; pasuje do niego `record` z `GameDefinition`. */
export type RecordOrder = { lower: boolean; tie?: { lower: boolean } };

/** Sąsiad w rankingu i różnica do niego: w głównym wyniku albo, przy równym (`onTie`), w drugim kryterium. */
type Neighbour = { nick: string; gap: number; onTie: boolean };

export interface RecordStanding {
  /** Od 1; remis = to samo miejsce, jak w `rankPlaces`. */
  place: number;
  of: number;
  best: number;
  tie: number | null;
  played: number;
  /** Najbliższy gracz ze ściśle lepszym rekordem. */
  ahead?: Neighbour;
  /** Najbliższy gracz ze ściśle gorszym rekordem. */
  behind?: Neighbour;
}

type Score = { best: number; tie: number | null };

/** Porównanie dwóch rekordów: ujemne, gdy `a` lepszy. Drugie kryterium liczy się tylko przy równym głównym wyniku. */
export const compareRecords = (order: RecordOrder) => (a: Score, b: Score) =>
  (order.lower ? a.best - b.best : b.best - a.best) || (order.tie && a.tie !== null && b.tie !== null ? (order.tie.lower ? a.tie - b.tie : b.tie - a.tie) : 0);

/** Pozycja gracza w rankingu rekordów; `rows` od najlepszego (tak przychodzą z serwera). null, gdy gracz nie ma rekordu. */
export function standing(rows: RecordRow[], nick: string, order: RecordOrder): RecordStanding | null {
  const key = nickKey(nick);
  const mine = rows.find((r) => nickKey(r.nick) === key);
  if (!mine) return null;
  const compare = compareRecords(order);
  const neighbour = (r?: RecordRow): Neighbour | undefined =>
    r && (r.best !== mine.best ? { nick: r.nick, gap: Math.abs(r.best - mine.best), onTie: false } : { nick: r.nick, gap: Math.abs(r.tie! - mine.tie!), onTie: true });
  const ahead = neighbour(rows.findLast((r) => compare(r, mine) < 0));
  const behind = neighbour(rows.find((r) => compare(mine, r) < 0));
  return {
    place: 1 + rows.filter((r) => compare(r, mine) < 0).length,
    of: rows.length,
    best: mine.best,
    tie: mine.tie,
    played: mine.played,
    ...(ahead && { ahead }),
    ...(behind && { behind }),
  };
}

/**
 * `n` liczb całkowitych z [min, max] o sumie dokładnie `total`: losowanie do skutku, żeby każda partia miała tyle samo do zdobycia
 * (rekordy porównują różne partie). Suma w środku zakresu trafia się raz na kilkadziesiąt do kilku tysięcy prób.
 */
export function withSum(rng: Rng, n: number, min: number, max: number, total: number): number[] {
  for (;;) {
    const list = Array.from({ length: n }, () => min + Math.floor(rng() * (max - min + 1)));
    if (list.reduce((a, b) => a + b, 0) === total) return list;
  }
}

/** Tasuje kopię tablicy (Fisher-Yates). */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Gra wyzwania dnia: lista tasowana raz na cykl (tyle dni, ile gier), więc w cyklu każda gra wypada raz. `day` to numer dnia (liczy go serwer).
 */
// ponytail: ostatnia gra cyklu może się powtórzyć jako pierwsza następnego (1 na liczbę gier); osobna poprawka, gdyby to raziło
export const dailyGame = (day: number, ids: readonly string[]) => shuffle(ids, createRng(Math.floor(day / ids.length)))[day % ids.length];

export const average = (times: number[]) => (times.length ? times.reduce((a, b) => a + b, 0) / times.length : Infinity);

/** Porównanie wyników „na trafienia”: więcej trafień wyżej, przy równej liczbie niższa średnia czasu. */
export const byHitsThenAverage = (a: { times: number[] }, b: { times: number[] }) =>
  // Dwa puste wyniki to remis: Infinity - Infinity dałoby NaN, a NaN !== 0 robiło zwycięzcę z pierwszego gracza.
  b.times.length - a.times.length || (a.times.length ? average(a.times) - average(b.times) : 0);

/** Porównanie wyników „na punkty” (Stój!, Obrót): więcej punktów wyżej, przy równych niższa średnia czasu; dwa wyniki bez trafień to remis. */
export const byScoreThenAverage =
  <R extends { times: number[] }>(score: (r: R) => number) =>
  (a: R, b: R) =>
    score(b) - score(a) || (a.times.length || b.times.length ? average(a.times) - average(b.times) : 0);
