import { type Duel, nickKey, type RoomView } from "@kwadrans/games";
import { useEffect, useState } from "react";
import { fetchDuels } from "../net.ts";
import { duelLines } from "./profile.ts";

/**
 * Pojedynki gracza z obecnymi w pokoju: „Ty : Ola 7:4” (kto był wyżej w ukończonych partiach 2+ osób).
 * `gameId` zawęża do jednej gry (po partii, ekran gry głównej). Bez wspólnych partii albo bez odpowiedzi serwera nic nie pokazuje.
 * Pobiera od nowa, gdy zmienia się skład albo kończy partia (wtedy historia ma już nowy wpis).
 */
export function Duels({ view, me, gameId }: { view: RoomView; me: string; gameId?: string | null }) {
  const self = view.players.find((p) => p.id === me);
  const nicks = Object.fromEntries(view.players.map((p) => [nickKey(p.nick), p.nick]));
  const names = Object.values(nicks);
  const [duels, setDuels] = useState<Duel[] | null>(null);
  const deps = `${names.join("\n")}|${gameId ?? ""}|${view.phase}`;
  useEffect(() => {
    if (!self || names.length < 2) return setDuels(null);
    let live = true;
    fetchDuels(names, gameId).then((d) => live && setDuels(d));
    return () => {
      live = false;
    };
  }, [deps]);
  if (!self || !duels) return null;
  const lines = duelLines(duels, nickKey(self.nick), nicks);
  if (lines.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-0.5 px-1 text-sm text-fg-muted" aria-label={gameId ? "Pojedynki w tej grze" : "Pojedynki"}>
      {lines.map((line) => (
        <span key={line.key} className="whitespace-nowrap">
          Ty : {line.nick}{" "}
          <span className="font-mono text-fg tabular-nums">
            {line.mine}:{line.theirs}
          </span>
        </span>
      ))}
    </p>
  );
}
