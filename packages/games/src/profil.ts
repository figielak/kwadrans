// Kształty historii partii, profilu gracza i raportu gier: zapisuje i liczy je serwer (`apps/server/src/history.ts`), pokazuje web.

/** Gdzie toczyła się partia: pokój solo z ekranu głównego, zwykły pokój, turniej z ustawieniami albo szybka seria. */
export type MatchKind = "solo" | "room" | "tournament" | "quick";
/** Skąd wzięła się partia. Solo: miejsce na ekranie głównym, z którego gracz ją uruchomił. */
export type MatchSource = "host" | "vote" | "rematch" | "tournament" | "list" | "random" | "daily" | "records" | "import";
export const SOLO_SOURCES = ["list", "random", "daily", "records"] as const satisfies MatchSource[];
/** `stopped`: gospodarz przerwał; `aborted`: wyjście gracza bez walkowera albo błąd. */
export type MatchOutcome = "completed" | "walkover" | "aborted" | "stopped";
/** Liczniki per gra i dzień, bez nicków. */
export type Signal = "picked" | "dropped" | "voteShown" | "voteWon" | "howTo";
export const SIGNALS: Signal[] = ["picked", "dropped", "voteShown", "voteWon", "howTo"];

export interface MatchEntry {
  /** Losowy klucz pokoju (nie kod): partie jednego wieczoru. */
  roomKey: string;
  gameId: string;
  mode: string | null;
  kind: MatchKind;
  source: MatchSource;
  startedAt: number;
  endedAt: number;
  /** Mini-gra: czy minęła instrukcja; gry główne zawsze true. */
  started: boolean;
  observers: number;
  outcome: MatchOutcome;
  reactions: number;
  /** Wszyscy, którzy siedzieli przy stole na starcie, w kolejności miejsc przy stole. */
  players: { nick: string; place: number | null; won: boolean; score: number | null; left: boolean; timeouts: number }[];
}

export interface HistoryRow {
  id: number;
  gameId: string;
  mode: string | null;
  kind: MatchKind;
  source: MatchSource;
  outcome: MatchOutcome;
  startedAt: number;
  endedAt: number;
  place: number | null;
  won: boolean;
  score: number | null;
  players: { key: string; nick: string; place: number | null; left: boolean }[];
}

export interface Profile {
  nick: string;
  firstAt: number;
  lastAt: number;
  /** Ukończone partie (także solo). */
  matches: number;
  days: number;
  favorite: string | null;
  games: { gameId: string; played: number; wins: number }[];
  rivals: { key: string; nick: string; matches: number; wins: number; losses: number; ties: number }[];
  evenings: { played: number; won: number };
  bestStreak: number;
}

export interface ReportGame {
  gameId: string;
  matches: number;
  completed: number;
  aborted: number;
  walkovers: number;
  players: number;
  solo: number;
  rematches: number;
  medianSeconds: number | null;
  introLeft: number;
  avgPlayers: number;
  timeoutsPerMatch: number;
  reactionsPerMatch: number;
  lastAt: number | null;
  picked: number;
  dropped: number;
  voteShown: number;
  voteWon: number;
  howTo: number;
}

export interface Report {
  games: ReportGame[];
  totals: { matches: number; players: number; days: number };
}

export interface PlayerStat {
  key: string;
  nick: string;
  /** Partie w okresie (także przerwane). */
  matches: number;
  days: number;
  wins: number;
  favorite: string | null;
  /** Pierwsza i ostatnia partia w ogóle, nie tylko w okresie. */
  firstAt: number;
  lastAt: number;
  /** Pierwsza partia w okresie. */
  isNew: boolean;
}

export interface GameDetail {
  modes: { mode: string | null; n: number }[];
  sources: { source: MatchSource; n: number }[];
  outcomes: { outcome: MatchOutcome; n: number }[];
  sizes: { players: number; n: number }[];
  /** Mediana czasu ukończonych partii (bez importu) wg liczby grających. */
  medianBySize: { players: number; seconds: number }[];
  top: { nick: string; matches: number; wins: number }[];
  /** Partie w 12 ostatnich tygodniach, od najstarszego; liczone od teraz, niezależnie od okresu. */
  weekly: number[];
}

/** Szczegóły raportu do szerokiej strony /statystyki. Gry bez partii w okresie nie mają wpisu w `games`. */
export interface Insights {
  totals: { matches: number; completed: number; players: number; newPlayers: number; returning: number; days: number; evenings: number; playSeconds: number };
  /** Doba po dobie od początku okresu (albo pierwszej partii) do dziś. */
  daily: { day: string; main: number; mini: number; solo: number }[];
  /** [dzień tygodnia od poniedziałku][godzina]: liczba rozpoczętych partii. */
  hours: number[][];
  sources: { source: MatchSource; n: number }[];
  kinds: { kind: MatchKind; n: number }[];
  sizes: { players: number; n: number }[];
  evenings: { count: number; medianMatches: number; medianMinutes: number | null };
  players: PlayerStat[];
  games: Record<string, GameDetail>;
}
