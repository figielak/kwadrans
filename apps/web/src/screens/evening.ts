import { CloseCode } from "@colyseus/sdk";
import type { RoomView } from "@kwadrans/games";

type Evening = RoomView["evening"];

/** Podsumowanie tylko po własnym wyjściu z pokoju (nie po zerwanym połączeniu), po co najmniej dwóch partiach i nie w pokoju solo. */
export function shouldSummarize(room: Pick<RoomView, "solo" | "evening"> | null, code: number): boolean {
  return !!room && !room.solo && room.evening.games >= 2 && code === CloseCode.CONSENTED;
}

/** Osoby z największą liczbą punktów; remis daje kilka. */
export function champions(evening: Evening) {
  const best = Math.max(0, ...evening.table.map((row) => row.points));
  return evening.table.filter((row) => row.points === best);
}

/** „2 gry”, „5 gier”, „22 gry”: odmiana liczebnika. */
export function gamesWord(n: number): string {
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `${n} ${few ? "gry" : "gier"}`;
}

const joinNicks = (nicks: string[]) => (nicks.length > 1 ? `${nicks.slice(0, -1).join(", ")} i ${nicks.at(-1)}` : nicks[0]);

/** Krótki tekst do udostępnienia: bez kodu pokoju (pokój się kończy), bez grafiki. */
export function shareText(evening: Evening): string {
  const top = champions(evening);
  const lines = [`Wieczór w Kwadransie: ${gamesWord(evening.games)}.`];
  if (top.length === 1) lines.push(`Mistrz: ${top[0].nick} (${top[0].points} pkt)`);
  else if (top.length > 1) lines.push(`Remis na szczycie: ${joinNicks(top.map((row) => row.nick))} (${top[0].points} pkt)`);
  for (const { title, nick, detail } of evening.titles) lines.push(`${title}: ${nick} (${detail})`);
  lines.push("games.figielak.dev");
  return lines.join("\n");
}
