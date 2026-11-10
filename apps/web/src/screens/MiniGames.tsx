import { Play, Shuffle, Trophy } from "@phosphor-icons/react";
import { GAMES, MAX_PLAYERS, nickKey, type RecordRow, type RoomView, standing } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import { fetchRecords } from "../net.ts";
import { BLURBS, ICONS, MINI_GAMES, StartBar, WishMarks, wishDots } from "./Lobby.tsx";
import { formatBest, formatRecord, plural, RecordList } from "./Records.tsx";
import { PlayerDots, Screen, type Send, StickyBar, TopBar } from "./ui.tsx";

interface Props {
  view: RoomView;
  me: string;
  dropped: boolean;
  send: Send;
  onLeave: () => void;
  onBack: () => void;
  onRecords: () => void;
}

/** Nagłówki sekcji na liście, po sześć gier, czyli dwa pełne rzędy; gra spoza tej listy trafia do „Inne”, więc nowa nigdy nie znika. */
const CATEGORIES: [string, string[]][] = [
  ["Refleks i czas", ["refleks", "stoj", "stoper", "przytrzymaj", "zaslona", "rytm"]],
  ["Pamięć i wiedza", ["simon", "w-pamieci", "kubki", "zakupy", "rok", "mapa"]],
  ["Liczby", ["liczenie", "kropki", "dziesiatki", "sudoku", "schulte", "kat"]],
  ["Precyzja", ["kolo", "srodek", "kolor", "tort", "nozyczki", "wieza"]],
  ["Uwaga i ryzyko", ["stroop", "inny", "obrot", "literowka", "sledzenie", "balon"]],
];
const SORTED = CATEGORIES.flatMap(([, ids]) => ids);
export const SECTIONS = [...CATEGORIES, ["Inne", MINI_GAMES.map((g) => g.id).filter((id) => !SORTED.includes(id))] as [string, string[]]]
  .map(([title, ids]) => [title, ids.filter((id) => GAMES[id])] as const)
  .filter(([, ids]) => ids.length > 0);

/** Rekordy z serwera: undefined do odpowiedzi, null, gdy serwer nie odpowie (wtedy kafle nie mają miejsc). */
type Loaded = Record<string, RecordRow[]> | null | undefined;

/** Zamiast rekordów, póki ich nie ma: czasownik przy wczytywaniu, zdanie przy błędzie. */
const notLoaded = (records: null | undefined) => (records === null ? "Nie udało się wczytać rekordów." : "Wczytywanie…");

interface GridProps {
  records: Loaded;
  nick: string | null;
  color?: string;
  picked?: string | null;
  disabled?: boolean;
  /** Życzenia gości: gra → kropki graczy. */
  wishes?: ReturnType<typeof wishDots>;
  onPick: (gameId: string) => void;
}

/** Kafle wszystkich mini-gier w kategoriach, z miejscem gracza w rekordach; w pokoju wybiera grę, na ekranie głównym od razu ją startuje. */
export function MiniGameGrid({ records, nick, color, picked, disabled, wishes, onPick }: GridProps) {
  return SECTIONS.map(([title, ids]) => (
    <section key={title}>
      <h3 className="mb-2 px-1 text-sm text-fg-muted">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {ids.map((id) => {
          const TileIcon = ICONS[id] ?? Play;
          const place = records && nick && GAMES[id].record && standing(records[id] ?? [], nick, GAMES[id].record)?.place;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={picked === undefined ? undefined : picked === id}
              disabled={disabled}
              data-game={id}
              className={`relative flex min-h-20 flex-col items-start gap-1 rounded-inset border p-2 text-left transition-colors duration-180 ${
                picked === id ? "border-accent bg-accent-soft" : "border-transparent bg-surface hover:border-line-hover"
              }`}
              onClick={() => onPick(id)}
            >
              <TileIcon size={20} weight={picked === id ? "fill" : "regular"} aria-hidden />
              <span className="text-sm leading-tight">{GAMES[id].name}</span>
              {/* Podpis tylko przy rozegranej grze: własne miejsce w rekordach, w kolorze gracza, gdy to on prowadzi. */}
              {!!place && (
                <span className="mt-auto font-mono text-xs text-fg-muted tabular-nums" style={place === 1 ? { color } : undefined}>
                  {place}. miejsce
                </span>
              )}
              <WishMarks wishes={wishes?.[id]} />
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
  const [records, setRecords] = useState<Loaded>();
  useEffect(() => {
    fetchRecords().then(setRecords);
  }, []);
  const mine = (gameId: string) => records?.[gameId]?.find((r) => self && nickKey(r.nick) === nickKey(self.nick));
  const top = def && records?.[def.id]?.[0];

  const wishes = wishDots(view);
  const myWish = view.wishes[me];
  // Gość bez wybranej gry dotyka gier jak życzeń; wybiera gospodarz. Drugie dotknięcie zdejmuje życzenie.
  const browsing = !isHost && !def;

  // Wylosowana gra bywa poza ekranem, więc po odpowiedzi serwera przewijamy do jej kafla.
  const revealPick = useRef(false);
  useEffect(() => {
    if (!revealPick.current || !view.gameId) return;
    revealPick.current = false;
    document.querySelector(`[data-game="${view.gameId}"]`)?.scrollIntoView({
      block: "center",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [view.gameId]);

  function random() {
    revealPick.current = true;
    const others = MINI_GAMES.filter((g) => g.id !== view.gameId);
    send("pickGame", { gameId: others[Math.floor(Math.random() * others.length)].id });
  }

  return (
    <Screen dropped={dropped}>
      <TopBar code={view.code} onBack={isHost || browsing ? onBack : undefined} onLeave={onLeave}>
        <PlayerDots view={view} />
      </TopBar>

      <div className="flex items-center gap-2 px-1">
        <div className="mr-auto">
          <h1 className="text-3xl font-semibold tracking-tight">Mini-gry</h1>
          <p className="font-mono text-xs text-fg-muted tabular-nums">
            {plural(MINI_GAMES.length, "gra", "gry", "gier")} · 1-{MAX_PLAYERS} osób
          </p>
        </div>
        <button type="button" className="btn btn-ghost size-12 shrink-0 p-0" onClick={onRecords} aria-label="Rekordy wszystkich mini-gier">
          <Trophy size={18} weight="bold" aria-hidden />
        </button>
      </div>

      {browsing && <p className="px-1 text-sm text-fg-muted">Dotknij gry, w którą chcesz zagrać. Wybiera gospodarz.</p>}
      {(isHost || browsing) && (
        <MiniGameGrid
          records={records}
          nick={self?.nick ?? null}
          color={self?.color}
          picked={isHost ? view.gameId : (myWish ?? null)}
          wishes={wishes}
          onPick={(gameId) => (isHost ? send("pickGame", { gameId }) : send("wish", { id: myWish === gameId ? null : gameId }))}
        />
      )}

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
            {records ? (
              <RecordList gameId={def.id} rows={records[def.id] ?? []} me={self?.nick ?? null} color={self?.color} />
            ) : (
              <p role="status" className="text-sm text-fg-muted">
                {notLoaded(records)}
              </p>
            )}
          </section>
        </>
      )}

      {/* Opis i rekord wybranej gry jadą razem z przyciskiem, żeby były tam, gdzie gospodarz wybiera. */}
      <div className="sticky bottom-0 -mx-4 mt-auto bg-bg/90 px-4 backdrop-blur">
        {isHost && def && (
          <div className="flex flex-col gap-1 pt-3">
            <div className="flex items-start gap-2.5">
              <DefIcon size={24} weight="fill" className="shrink-0" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{def.name}</p>
                <p className="text-sm text-fg-muted">{BLURBS[def.id]}</p>
              </div>
            </div>
            <p className="font-mono text-xs text-fg-muted tabular-nums">
              {top
                ? `Rekord: ${formatRecord(def.id, top)} (${top === mine(def.id) ? "ty" : top.nick})`
                : records
                  ? "Nikt jeszcze nie grał"
                  : notLoaded(records)}
              {mine(def.id) && top !== mine(def.id) && ` · twój: ${formatBest(def.id, mine(def.id)!.best)}`}
            </p>
          </div>
        )}
        {isHost && !def ? (
          <StickyBar>
            <button type="button" className="btn btn-ghost w-full" onClick={random}>
              <Shuffle size={18} weight="bold" aria-hidden />
              Losuj grę
            </button>
          </StickyBar>
        ) : (
          <StartBar
            view={view}
            me={me}
            send={send}
            aside={
              isHost && (
                <button type="button" className="btn btn-ghost size-12 shrink-0 p-0" onClick={random} aria-label="Losuj inną grę">
                  <Shuffle size={18} weight="bold" aria-hidden />
                </button>
              )
            }
          />
        )}
      </div>
    </Screen>
  );
}
