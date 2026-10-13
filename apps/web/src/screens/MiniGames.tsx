import { Play, Shuffle, Trophy } from "@phosphor-icons/react";
import { GAMES, MAX_PLAYERS, nickKey, type RecordRow, type RoomView, standing } from "@mini-games/games";
import { useEffect, useState } from "react";
import { fetchRecords } from "../net.ts";
import { BLURBS, ICONS, MINI_GAMES, StartBar } from "./Lobby.tsx";
import { formatBest, formatRecord, RecordList } from "./Records.tsx";
import { PlayerDots, Screen, type Send, TopBar } from "./ui.tsx";

interface Props {
  view: RoomView;
  me: string;
  dropped: boolean;
  send: Send;
  onLeave: () => void;
  onBack: () => void;
  onRecords: () => void;
}

/** Nagłówki sekcji na liście; gra spoza tej listy trafia do „Inne”, więc nowa nigdy nie znika. */
const CATEGORIES: [string, string[]][] = [
  ["Refleks i czas", ["refleks", "stoj", "stoper", "przytrzymaj", "zaslona", "rytm", "wieza"]],
  ["Pamięć", ["simon", "w-pamieci", "sledzenie", "kubki", "zakupy"]],
  ["Liczby", ["liczenie", "kropki", "dziesiatki", "sudoku", "schulte"]],
  ["Precyzja", ["kolo", "srodek", "kat", "kolor", "tort", "nozyczki"]],
  ["Spostrzegawczość", ["stroop", "inny", "obrot", "literowka"]],
  ["Wiedza i ryzyko", ["rok", "mapa", "balon"]],
];
const SORTED = CATEGORIES.flatMap(([, ids]) => ids);
export const SECTIONS = [...CATEGORIES, ["Inne", MINI_GAMES.map((g) => g.id).filter((id) => !SORTED.includes(id))] as [string, string[]]]
  .map(([title, ids]) => [title, ids.filter((id) => GAMES[id])] as const)
  .filter(([, ids]) => ids.length > 0);

interface GridProps {
  records: Record<string, RecordRow[]>;
  nick: string | null;
  color?: string;
  picked?: string | null;
  disabled?: boolean;
  onPick: (gameId: string) => void;
}

/** Kafle wszystkich mini-gier w kategoriach, z miejscem gracza w rekordach; w pokoju wybiera grę, na ekranie głównym od razu ją startuje. */
export function MiniGameGrid({ records, nick, color, picked, disabled, onPick }: GridProps) {
  return SECTIONS.map(([title, ids]) => (
    <section key={title}>
      <h3 className="mb-2 px-1 text-sm text-fg-muted">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {ids.map((id) => {
          const TileIcon = ICONS[id] ?? Play;
          const place = nick && GAMES[id].record && standing(records[id] ?? [], nick, GAMES[id].record)?.place;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={picked === undefined ? undefined : picked === id}
              disabled={disabled}
              className={`flex min-h-20 flex-col items-start gap-1 rounded-inset border p-2 text-left transition-colors ${
                picked === id ? "border-accent bg-accent-soft" : "border-line hover:border-line-hover"
              }`}
              onClick={() => onPick(id)}
            >
              <TileIcon size={20} weight={picked === id ? "fill" : "regular"} aria-hidden />
              <span className="text-sm leading-tight">{GAMES[id].name}</span>
              {/* Własne miejsce w rekordach zamiast liczby graczy (ta jest wszędzie taka sama); kolor gracza, gdy to on prowadzi. */}
              <span className="mt-auto font-mono text-xs text-fg-muted" style={place === 1 ? { color } : undefined}>
                {place ? `${place}. miejsce` : "nie grane"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  ));
}

/** Lista mini-gier: gospodarz wybiera jedną i daje start, gość widzi opis wybranej. Zasady mini-gier są narzucone z góry. */
export function MiniGames({ view, me, dropped, send, onLeave, onBack, onRecords }: Props) {
  const isHost = view.hostId === me;
  const def = view.gameId ? GAMES[view.gameId] : undefined;
  const DefIcon = (def && ICONS[def.id]) || Play;
  const self = view.players.find((p) => p.id === me);
  const [records, setRecords] = useState<Record<string, RecordRow[]>>({});
  useEffect(() => {
    fetchRecords().then(setRecords);
  }, []);
  const mine = (gameId: string) => records[gameId]?.find((r) => self && nickKey(r.nick) === nickKey(self.nick));
  const top = def && records[def.id]?.[0];

  function random() {
    const others = MINI_GAMES.filter((g) => g.id !== view.gameId);
    send("pickGame", { gameId: others[Math.floor(Math.random() * others.length)].id });
  }

  return (
    <Screen dropped={dropped}>
      <TopBar code={view.code} onBack={isHost ? onBack : undefined} onLeave={onLeave}>
        <PlayerDots view={view} />
      </TopBar>

      <div className="flex items-center gap-2">
        <h2 className="label mr-auto px-1">Mini-gry · 1-{MAX_PLAYERS} osób</h2>
        {isHost && (
          <button type="button" className="btn btn-ghost px-4 text-sm" onClick={random}>
            <Shuffle size={16} weight="bold" aria-hidden />
            Losuj
          </button>
        )}
        <button type="button" className="btn btn-ghost size-12 shrink-0 p-0" onClick={onRecords} aria-label="Rekordy wszystkich mini-gier">
          <Trophy size={18} aria-hidden />
        </button>
      </div>

      {isHost && <MiniGameGrid records={records} nick={self?.nick ?? null} color={self?.color} picked={view.gameId} onPick={(gameId) => send("pickGame", { gameId })} />}

      {!isHost && def && (
        <>
          <section className="tile">
            <h2 className="label mb-3">Wybrana gra</h2>
            <div className="flex items-center gap-3">
              <DefIcon size={28} weight="fill" className="shrink-0" aria-hidden />
              <p className="leading-tight">{def.name}</p>
            </div>
            <p className="mt-3 text-sm text-fg-muted">{BLURBS[def.id]}</p>
          </section>
          <section className="tile flex flex-col gap-3">
            <h2 className="label">Rekordy · {def.name}</h2>
            <RecordList gameId={def.id} rows={records[def.id] ?? []} me={self?.nick ?? null} color={self?.color} />
          </section>
        </>
      )}

      {/* Opis i rekord wybranej gry jadą razem z przyciskiem, żeby były tam, gdzie gospodarz wybiera. */}
      <div className="sticky bottom-0 -mx-4 mt-auto bg-bg/90 px-4 backdrop-blur">
        {isHost && def && (
          <div className="flex flex-col gap-1 pt-3">
            <p className="text-sm">{BLURBS[def.id]}</p>
            <p className="font-mono text-xs text-fg-muted">
              {top ? `Rekord: ${formatRecord(def.id, top)} (${top === mine(def.id) ? "ty" : top.nick})` : "Nikt jeszcze nie grał"}
              {mine(def.id) && top !== mine(def.id) && ` · twój: ${formatBest(def.id, mine(def.id)!.best)}`}
            </p>
          </div>
        )}
        <StartBar view={view} me={me} send={send} />
      </div>
    </Screen>
  );
}
