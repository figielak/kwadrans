import { Client, type Room } from "@colyseus/sdk";
import type { RecordRow, RoomView } from "@kwadrans/games";

// W dev serwer gry stoi obok Vite na porcie 2567 tego samego hosta (działa też z telefonu w LAN).
const serverUrl = import.meta.env.DEV ? `http://${location.hostname}:2567` : location.origin;
const client = new Client(serverUrl);

export interface RankingRow {
  nick: string;
  wins: number;
  played: number;
}

/** Ranking po nicku dla każdej gry; przy błędzie pusty (sekcja się po prostu nie pokaże). */
export const fetchRanking = (): Promise<Record<string, RankingRow[]>> =>
  fetch(`${serverUrl}/api/stats`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));

/** Rekordy mini-gier: wszyscy gracze każdej gry, od najlepszego; null, gdy serwer nie odpowie (to nie to samo co brak wyników). */
export const fetchRecords = (): Promise<Record<string, RecordRow[]> | null> =>
  fetch(`${serverUrl}/api/records`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

/** Partia, w której padł rekord gry (stan z `soloState`), null bez zapisanej partii albo false, gdy serwer nie odpowie. */
export const fetchTopRecord = (gameId: string): Promise<unknown> =>
  fetch(`${serverUrl}/api/records/${gameId}/top`)
    .then((r) => (r.ok ? r.json() : false))
    .catch(() => false);

/** Wyzwanie dnia: gra na dziś i dzisiejsze wyniki, od najlepszego; przy błędzie null (kafel się nie pokaże). */
export const fetchDaily = (): Promise<{ gameId: string; rows: RecordRow[] } | null> =>
  fetch(`${serverUrl}/api/daily`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

/** Które z podanych pokoi jeszcze istnieją: kod → liczba połączonych graczy. */
export const fetchRooms = (codes: string[]): Promise<Record<string, number>> =>
  fetch(`${serverUrl}/api/rooms?kody=${codes.join()}`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));

// Tryb testowy (/dev): każda ramka ma swój slot z adresu (`?dev=2`), więc własny token i nick.
const slot = import.meta.env.DEV ? (new URLSearchParams(location.search).get("dev") ?? "") : "";
const TOKEN_KEY = `mg.token${slot}`;
const NICK_KEY = `mg.nick${slot}`;

// localStorage potrafi rzucić (tryb prywatny, zablokowane dane), a bez niego aplikacja dalej ma działać.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

export const savedNick = () => read(NICK_KEY) ?? "";
export const saveNick = (nick: string) => write(NICK_KEY, nick);

/** Pokoje, w których gracz ostatnio był: szybki powrót z ekranu głównego. Pokój żyje najwyżej godzinę bez ruchu, więc starsze niż doba znikają. */
export interface RecentRoom {
  code: string;
  gameId: string | null;
  players: number;
  at: number;
}
const ROOMS_KEY = `mg.rooms${slot}`;
const RECENT_MAX = 3;
const RECENT_MS = 24 * 60 * 60 * 1000;

export function recentRooms(): RecentRoom[] {
  try {
    return (JSON.parse(read(ROOMS_KEY) ?? "[]") as RecentRoom[]).filter((r) => Date.now() - r.at < RECENT_MS);
  } catch {
    return [];
  }
}
const writeRecent = (rooms: RecentRoom[]) => write(ROOMS_KEY, JSON.stringify(rooms.slice(0, RECENT_MAX)));
export const forgetRecent = (code: string) => writeRecent(recentRooms().filter((r) => r.code !== code));

function noteRoom(v: RoomView) {
  // Gra solo to dla gracza nie pokój: nie ma do czego wracać.
  if (v.solo) return;
  const rooms = recentRooms();
  // W lobby gra nie jest wybrana, więc zostaje ostatnia grana w tym pokoju.
  const gameId = v.gameId ?? rooms.find((r) => r.code === v.code)?.gameId ?? null;
  writeRecent([{ code: v.code, gameId, players: v.players.length, at: Date.now() }, ...rooms.filter((r) => r.code !== v.code)]);
}

// Serwer wysyła stan pokoju od razu po dołączeniu, zanim React podepnie nasłuch,
// więc nasłuch wisi tu od początku, a ostatni stan czeka na komponent.
const rooms = new WeakMap<Room, { view: RoomView | null; listener?: (v: RoomView) => void }>();

export function watchRoom(room: Room, listener: (v: RoomView) => void) {
  const entry = rooms.get(room)!;
  entry.listener = listener;
  if (entry.view) listener(entry.view);
  return () => (entry.listener = undefined);
}

function remember(room: Room, nick?: string) {
  const entry: { view: RoomView | null; listener?: (v: RoomView) => void } = { view: null };
  rooms.set(room, entry);
  room.onMessage("room", (v: RoomView) => {
    entry.view = v;
    noteRoom(v);
    entry.listener?.(v);
  });
  write(TOKEN_KEY, room.reconnectionToken);
  if (nick) write(NICK_KEY, nick);
  room.onReconnect(() => write(TOKEN_KEY, room.reconnectionToken));
  return room;
}

/** `solo`: id mini-gry, którą pokój od razu startuje dla jednego gracza. */
export const createRoom = async (nick: string, solo?: string) => remember(await client.create("lobby", { nick, solo }), nick);

export const joinRoom = async (code: string, nick: string) =>
  remember(await client.joinById(code, { nick }), nick);

/** Wraca do pokoju sprzed odświeżenia strony. Jedna próba na załadowanie strony: token działa tylko raz. */
let resuming: Promise<Room | null> | undefined;
export const resumeRoom = () => (resuming ??= tryResume().then((room) => room ?? devRoom()));

/** Ramka trybu testowego wchodzi sama: z kodem dołącza, bez kodu zakłada pokój. */
async function devRoom(): Promise<Room | null> {
  if (!slot) return null;
  const nick = `Gracz ${slot}`;
  try {
    return await (codeFromUrl() ? joinRoom(codeFromUrl(), nick) : createRoom(nick));
  } catch {
    return null;
  }
}

/** Kod z linku udostępnienia (`/?kod=ABCD`). */
export const codeFromUrl = () => new URLSearchParams(location.search).get("kod")?.toUpperCase() ?? "";

async function tryResume(): Promise<Room | null> {
  const token = read(TOKEN_KEY);
  if (!token) return null;
  // Token ma postać "KOD:sesja". Link do innego pokoju wygrywa z powrotem do starego.
  const linked = codeFromUrl();
  if (linked && linked !== token.split(":")[0]) return null;
  try {
    return remember(await client.reconnect(token));
  } catch {
    write(TOKEN_KEY, null);
    return null;
  }
}

export const forgetRoom = () => write(TOKEN_KEY, null);

export const NO_ROOM = "Nie ma pokoju o tym kodzie.";

export function errorText(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  if (/not found|invalid/i.test(message)) return NO_ROOM;
  if (/locked|full/i.test(message)) return "Ten pokój jest już pełny.";
  if (/failed to fetch|network/i.test(message)) return "Brak połączenia z serwerem.";
  return message;
}
