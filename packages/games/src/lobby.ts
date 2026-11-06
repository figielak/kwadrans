import { z } from "zod";
import type { GameResult, PlayerId } from "./core.ts";
import type { Tournament } from "./turniej.ts";

/** Kolory graczy: dane, nie akcent. Żaden nie przypomina czerwieni akcentu (#ff2445). */
export const PLAYER_COLORS = ["#3b9eff", "#ffc53d", "#46a758", "#8e7cff", "#0ac5b3", "#f76fbe"] as const;

export const MAX_PLAYERS = PLAYER_COLORS.length;
export const NICK_MAX = 16;
/** Limit instrukcji mini-gry przy 2+ grających; jedna osoba czeka na Start bez odliczania. */
export const INTRO_SECONDS = 15;
/** Instrukcja po rewanżu; kolejna gra turnieju zachowuje INTRO_SECONDS. */
export const REMATCH_INTRO_SECONDS = 5;
/** Wspólne odliczanie po instrukcji przy 2+ grających. */
export const COUNTDOWN_SECONDS = 3;

export interface LobbyPlayer {
  id: PlayerId;
  nick: string;
  color: string;
  connected: boolean;
  /** Gość potwierdził, że jest gotów do wybranej gry. Gospodarza nie dotyczy: on daje start. */
  ready: boolean;
}

export type Phase = "lobby" | "playing" | "over";

export interface RoomView {
  code: string;
  hostId: PlayerId;
  players: LobbyPlayer[];
  phase: Phase;
  /** Pokój gry solo z ekranu głównego: jeden gracz, od razu mini-gra, bez lobby, kodu i wpisu w ostatnich pokojach. */
  solo: boolean;
  gameId: string | null;
  /** Tryb wybranej gry (id z `modes`); null, gdy gra nie ma trybów. */
  mode: string | null;
  /** Kto gra w wybranej grze, w kolejności ruchów. Reszta ogląda. */
  seats: PlayerId[];
  /** Wybrany albo trwający turniej mini-gier; w trakcie `gameId` to bieżąca gra turnieju. */
  tournament: Tournament | null;
  /** Kto ostatni zaznaczył grę turnieju („na pewno” albo „bez”): id gry → id gracza. */
  markedBy: Record<string, PlayerId>;
  /** Wygrane partie w tym pokoju. */
  scores: Record<PlayerId, number>;
  game: {
    view: unknown;
    /** Na kogo czekamy: gracz na turze albo kilku naraz (np. rozstawianie statków). */
    waitingFor: PlayerId[];
    /** Ile zostało do końca instrukcji, odliczania albo tury; liczone od odebrania wiadomości (zegary telefonu i serwera się różnią). */
    msLeft: number | null;
    /** Trwa instrukcja lub odliczanie: limit gry jeszcze nie ruszył; przy jednym grającym msLeft jest null. */
    intro: boolean;
    /** Trwa wspólne 3-2-1; intro pozostaje true, msLeft liczy czas do startu gry. */
    countdown: boolean;
    /** Tylko rewanż w pokoju solo: klient pomija instrukcję i wysyła begin; po begin false. */
    skipIntro: boolean;
    /** Kto zgłosił gotowość przyciskiem „Start” na ekranie instrukcji; po jej końcu wszyscy grający. */
    began: PlayerId[];
    /** Ostatnie dekoracyjne wartości z kanału live, do odtworzenia podglądu po reconnect. */
    live: Record<PlayerId, number>;
    result: GameResult | null;
    /** Miejsca z remisami po partii: result.places, potem def.places; null bez rankingu lub bez definicji miejsc. */
    places: Record<PlayerId, number> | null;
  } | null;
}

/** Zwraca oczyszczony nick albo null, gdy się nie nadaje. */
export function cleanNick(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const nick = raw.trim().replace(/\s+/g, " ");
  return nick.length >= 1 && nick.length <= NICK_MAX ? nick : null;
}

/** Schematy wiadomości od klienta do pokoju; serwer odrzuca wszystko, co do nich nie pasuje. */
export const ROOM_MESSAGES = {
  // null: gospodarz wraca z ekranu gry do listy gier.
  pickGame: z.object({ gameId: z.string().nullable() }),
  // Wybór turnieju i zmiana liczby gier (gospodarz); zakres sprawdza cleanConfig.
  pickTournament: z.object({ length: z.number() }),
  // Zaznaczenie jednej gry turnieju: na pewno, bez albo z powrotem losowo. Może każdy w pokoju.
  markGame: z.object({ id: z.string(), mark: z.enum(["must", "skip", "any"]) }),
  pickMode: z.object({ mode: z.string() }),
  toggleSeat: z.object({ id: z.string() }),
  pickColor: z.object({ color: z.enum(PLAYER_COLORS) }),
  ready: z.object({ ready: z.boolean() }),
  start: z.unknown(),
  // „Start” na ekranie instrukcji mini-gry.
  begin: z.unknown(),
  rematch: z.unknown(),
  toLobby: z.unknown(),
  // Kształt ruchu sprawdza moveSchema wybranej gry.
  move: z.unknown(),
  // Dekoracyjny podgląd rywali; osobny kanał i limit, poza validateMove oraz wynikami gry.
  live: z.object({ value: z.number().int().min(0).max(9999) }),
};
