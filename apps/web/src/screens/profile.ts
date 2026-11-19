import { type HistoryRow, nickKey } from "@kwadrans/games";

const MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
const KIND: Record<HistoryRow["kind"], string | null> = { solo: "solo", room: null, tournament: "turniej", quick: "szybka seria" };
const CO_PLAYERS = 3;

/** „3 listopada 2026”. */
export const since = (at: number) => {
  const d = new Date(at);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** „1 partia”, „3 partie”, „12 partii”, „22 partie”. */
export function matchesWord(n: number): string {
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `${n} ${n === 1 ? "partia" : few ? "partie" : "partii"}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Druga linia wpisu historii: data, rodzaj (zwykły pokój bez etykiety) i z kim, najwyżej trzy nicki. Import nie ma godziny. */
export function historyLine(m: HistoryRow, nick: string): string {
  const d = new Date(m.startedAt);
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear() === new Date().getFullYear() ? "" : String(d.getFullYear()).slice(2)}`.replace(/\.$/, "");
  const when = m.source === "import" ? date : `${date}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const me = nickKey(nick);
  const others = m.players.filter((p) => p.key !== me).map((p) => p.nick);
  const shown = others.slice(0, CO_PLAYERS).join(", ") + (others.length > CO_PLAYERS ? ` +${others.length - CO_PLAYERS}` : "");
  return [when, KIND[m.kind], others.length > 0 && `z ${shown}`].filter(Boolean).join(" · ");
}

/** Wynik po prawej: miejsce z liczbą grających, wynik solo, walkower albo przerwana. */
export function resultOf(m: HistoryRow, format: (gameId: string, score: number) => string): { text: string; crown: boolean; muted: boolean; mono: boolean } {
  if (m.outcome === "aborted" || m.outcome === "stopped") return { text: "przerwana", crown: false, muted: true, mono: false };
  if (m.outcome === "walkover") return { text: m.place === 1 ? "walkower" : "wyszedł", crown: false, muted: m.place !== 1, mono: false };
  if (m.players.length < 2) return m.score === null ? { text: "ukończona", crown: false, muted: true, mono: false } : { text: format(m.gameId, m.score), crown: false, muted: false, mono: true };
  if (m.place === null) return { text: "wyszedł", crown: false, muted: true, mono: false };
  return { text: `${m.place}. z ${m.players.length}`, crown: m.place === 1, muted: m.place !== 1, mono: true };
}

/** Seria dni przy kaflu wyzwania: od 2 dni, a po przerwie łączna liczba dni; bez słów o stracie serii. */
export function dailyStreakText(me: { streak: number; total: number } | null): string {
  if (!me) return "";
  if (me.streak >= 2) return ` · seria ${me.streak} dni`;
  return me.total >= 2 ? ` · łącznie ${me.total} dni` : "";
}
