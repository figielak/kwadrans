import {
  Angle,
  ArrowsClockwise,
  Bomb,
  Boat,
  Brain,
  Buildings,
  Cake,
  CalendarBlank,
  Calculator,
  Cards,
  Check,
  CircleDashed,
  CirclesThree,
  Crown,
  Detective,
  DiceFive,
  DotsNine,
  GameController,
  Eyedropper,
  EyeSlash,
  GlobeHemisphereEast,
  GridFour,
  PintGlass,
  GridNine,
  Path,
  HandPalm,
  Balloon,
  HandTap,
  HandWaving,
  type Icon,
  Lightning,
  LineSegment,
  MagnifyingGlass,
  MapTrifold,
  Metronome,
  Mountains,
  NumberCircleZero,
  NumberSquareOne,
  Palette,
  PencilSimple,
  Play,
  Plus,
  ShareNetwork,
  SignOut,
  Scissors,
  ShoppingCart,
  SquaresFour,
  Stack,
  TextAa,
  Timer,
  Trophy,
  X,
} from "@phosphor-icons/react";
import { DEFAULT_LENGTH, GAMES, initials, type LobbyPlayer, MAX_PLAYERS, MINI_GAME_IDS, PLAYER_COLORS, QUICK_SERIES_LENGTH, type RoomView } from "@kwadrans/games";
import { type ReactNode, useState } from "react";
import { Screen, type Send, shareRoom, StickyBar, TopBar } from "./ui.tsx";

/** Gry główne z planszą; reszta, także nowe, trafia do „Towarzyskich”. */
const BOARD_GAMES = new Set(["kampus-tour", "chinczyk", "labirynt", "memory", "piec-w-rzedzie", "statki"]);

type MainGame = { name: string; minPlayers: number; maxPlayers: number };

/** Gry, które nie zmieszczą tylu osób, jako jedno zdanie zamiast wyszarzonych kafli. */
function tooManyNote(games: MainGame[], count: number): string | null {
  const byLimit = new Map<string, string[]>();
  for (const g of games) {
    const limit = `${g.minPlayers === g.maxPlayers ? "tylko" : "max"} ${g.maxPlayers} os.`;
    byLimit.set(limit, [...(byLimit.get(limit) ?? []), g.name]);
  }
  if (byLimit.size === 0) return null;
  return `Nie dla ${count} osób: ${[...byLimit].map(([limit, names]) => `${names.join(", ")} (${limit})`).join("; ")}`;
}

interface Props {
  view: RoomView | null;
  me: string;
  dropped: boolean;
  send: Send;
  onLeave: () => void;
  onMini: () => void;
}

export function Lobby({ view, me, dropped, send, onLeave, onMini }: Props) {
  if (!view) {
    return (
      <Screen dropped={dropped}>
        <p role="status" className="py-6 text-center text-fg-muted">
          Wczytywanie…
        </p>
      </Screen>
    );
  }
  const isHost = view.hostId === me;
  const wishes = wishDots(view);
  const myWish = view.wishes[me];
  const alone = view.players.length === 1;
  // Gość nie wybiera gry, tylko wskazuje, w co chce grać; drugie dotknięcie zdejmuje życzenie.
  const wish = (id: string) => send("wish", { id: myWish === id ? null : id });
  const count = view.players.length;
  const hostNick = view.players.find((p) => p.id === view.hostId)?.nick ?? "Gospodarz";
  const main = Object.values(GAMES).filter((g) => g.minPlayers > 1);
  // Gry, do których brakuje osób, dalej można wybrać, więc stoją na końcu swojej grupy.
  const fitting = main.filter((g) => count <= g.maxPlayers).sort((a, b) => Number(count < a.minPlayers) - Number(count < b.minPlayers));
  const groups = [
    { title: "Planszowe", games: fitting.filter((g) => BOARD_GAMES.has(g.id)) },
    { title: "Towarzyskie", games: fitting.filter((g) => !BOARD_GAMES.has(g.id)) },
  ].filter((group) => group.games.length > 0);
  const note = tooManyNote(main.filter((g) => count > g.maxPlayers), count);

  return (
    <Screen dropped={dropped}>
      {/* Sam w pokoju kod jest treścią ekranu (trzeba go przekazać); od dwóch osób zwija się do paska, a gry wchodzą w pierwszy ekran. */}
      {alone ? <Code code={view.code} alone onLeave={onLeave} /> : <TopBar code={view.code} onLeave={onLeave} />}
      <Players view={view} me={me} send={send} />

      {/* Gospodarz: kafle prowadzą do turnieju i listy mini-gier (zbiory, nie pojedyncze gry), gry główne otwierają ekran gry (Setup.tsx).
          Gość dotyka gier, żeby pokazać, w co chce grać (kropka jego koloru); decyduje gospodarz. */}
      <section className="flex flex-col gap-2">
        <h2 className="sr-only">Zestawy</h2>
        {isHost ? (
          <div className="grid grid-cols-2 gap-2">
            <Tile icon={GameController} name="Mini-gry" hint={`${MINI_GAMES.length} gier`} onClick={onMini} />
            <Tile icon={Trophy} name="Turniej" hint={`1-${MAX_PLAYERS} os.`} onClick={() => send("pickTournament", { length: DEFAULT_LENGTH })} />
          </div>
        ) : (
          <Tile icon={GameController} name="Mini-gry" hint={`${MINI_GAMES.length} gier, także solo`} onClick={onMini} />
        )}
      </section>
      {groups.map(({ title, games }) => (
        <section key={title}>
          <h2 className="mb-2 px-1 text-sm text-fg-muted">{title}</h2>
          <div className="grid grid-cols-2 gap-2">
            {games.map((g) => (
              <GameTile
                key={g.id}
                game={g}
                players={count}
                picked={isHost ? undefined : myWish === g.id}
                wishes={wishes[g.id]}
                onClick={() => (isHost ? send("pickGame", { gameId: g.id }) : wish(g.id))}
              />
            ))}
          </div>
        </section>
      ))}
      {note && <p className="px-1 text-sm text-fg-muted">{note}</p>}
      {/* W tym samym miejscu, gdzie na ekranie gry jest „Zagraj”. */}
      <StickyBar className="mt-auto">
        {isHost ? (
          <button type="button" className="btn btn-primary w-full" onClick={() => send("quickSeries")}>
            <Lightning size={18} weight="fill" aria-hidden />
            Szybka seria · {QUICK_SERIES_LENGTH} gier
          </button>
        ) : (
          <p className="flex min-h-12 w-full items-center justify-center text-center text-sm text-fg-muted">{hostNick} wybiera grę. Dotknij tej, w którą chcesz zagrać.</p>
        )}
      </StickyBar>
    </Screen>
  );
}

/** Życzenia gości jako kropki przy grach: gra → kto jej chce. Kto wyszedł, nie ma kropki, nawet gdy serwer jeszcze trzyma jego życzenie. */
export function wishDots(view: Pick<RoomView, "players" | "wishes">): Record<string, { id: string; nick: string; color: string }[]> {
  const dots: Record<string, { id: string; nick: string; color: string }[]> = {};
  for (const p of view.players) {
    const game = view.wishes[p.id];
    if (game) (dots[game] ??= []).push({ id: p.id, nick: p.nick, color: p.color });
  }
  return dots;
}

/** Lobby od dwóch osób: rząd awatarów, kolor zmienia się po dotknięciu własnego, wolne miejsce zaprasza. */
function PlayerRow({ view, me, send }: { view: RoomView; me: string; send: Send }) {
  const [editing, setEditing] = useState(false);
  const [kickId, setKickId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isHost = view.hostId === me;
  const kickTarget = view.players.find((p) => p.id === kickId);
  const labels = initials(view.players.map((p) => p.nick));
  const free = view.players.length < MAX_PLAYERS;

  async function invite() {
    if (!(await shareRoom(view.code))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const cell = "flex min-h-12 w-full min-w-0 flex-col items-center gap-1 pt-1 text-center";
  return (
    <section>
      <h2 className="sr-only">Gracze</h2>
      {/* Kolumny dzielą całą szerokość, więc przy mniejszej liczbie osób nicki mają więcej miejsca. */}
      <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${view.players.length + Number(free)}, minmax(0, 1fr))` }} aria-label="Gracze w pokoju">
        {view.players.map((p, i) => {
          const mine = p.id === me;
          const host = p.id === view.hostId;
          const body = (
            <>
              <span className="relative size-11 shrink-0">
                <span
                  className={`grid size-full place-items-center rounded-full font-mono tabular-nums text-sm font-medium text-bg ${p.connected ? "" : "opacity-40"} ${(mine && editing) || p.id === kickId ? "outline-2 outline-offset-2 outline-fg" : ""}`}
                  style={{ backgroundColor: p.color }}
                  aria-hidden
                >
                  {labels[i]}
                </span>
                {host && (
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-bg">
                    <Crown size={12} weight="fill" aria-label="Gospodarz" />
                  </span>
                )}
                {isHost && !p.connected && (
                  <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-bg">
                    <X size={12} weight="bold" aria-hidden />
                  </span>
                )}
              </span>
              <span className="w-full truncate text-sm leading-tight" title={p.nick}>{p.nick}</span>
              {!p.connected && <span className="w-full truncate text-xs leading-tight text-fg-muted">rozłączony</span>}
              {mine && p.connected && (
                <span className="flex items-center gap-1 text-xs leading-tight text-fg-muted">
                  ty <PencilSimple size={11} weight="bold" aria-hidden />
                </span>
              )}
            </>
          );
          return (
            <li key={p.id} className="min-w-0">
              {mine ? (
                <button type="button" className={cell} aria-expanded={editing} aria-label={`${p.nick} (ty)${host ? ", gospodarz" : ""}, zmień kolor`} onClick={() => { setEditing(!editing); setKickId(null); }}>
                  {body}
                </button>
              ) : isHost ? (
                <button type="button" className={cell} aria-expanded={p.id === kickId} aria-label={`${p.nick}, wyrzuć z pokoju`} onClick={() => { setKickId(p.id === kickId ? null : p.id); setEditing(false); }}>
                  {body}
                </button>
              ) : (
                <div className={cell}>{body}</div>
              )}
            </li>
          );
        })}
        {free && (
          <li className="min-w-0">
            <button type="button" className={cell} onClick={invite}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-line-hover text-fg-muted">
                {copied ? <Check size={18} weight="bold" aria-hidden /> : <Plus size={18} weight="bold" aria-hidden />}
              </span>
              <span className="w-full truncate text-sm leading-tight text-fg-muted">{copied ? "Gotowe" : "Zaproś"}</span>
            </button>
          </li>
        )}
      </ul>
      {editing && <ColorPicker view={view} me={me} send={send} onPicked={() => setEditing(false)} />}
      {kickTarget && (
        <div className="mt-2 flex flex-col gap-2">
          {/* Osobna linia: nick to najważniejsza informacja tej decyzji, więc nie może się uciąć. */}
          <p className="px-1 text-center text-sm wrap-anywhere">Wyrzucić {kickTarget.nick}?</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setKickId(null)}>Anuluj</button>
            <button
              type="button"
              className="btn btn-ghost text-warning"
              onClick={() => {
                send("kick", { id: kickTarget.id });
                setKickId(null);
              }}
            >
              Wyrzuć
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Lista graczy z miejscami, gotowością i wyborem koloru; wspólna dla lobby i ekranu gry. */
export function Players({ view, me, send }: { view: RoomView; me: string; send: Send }) {
  const isHost = view.hostId === me;
  const def = picked(view);
  if (!def && view.players.length > 1) return <PlayerRow view={view} me={me} send={send} />;
  const playing = view.seats.map((id) => view.players.find((p) => p.id === id)!);
  const watching = view.players.filter((p) => !view.seats.includes(p.id));
  const isReady = (p: LobbyPlayer) => p.ready || p.id === view.hostId;
  return (
    <section className="tile">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="label">Gracze</h2>
        <span className="font-mono text-sm text-fg-muted tabular-nums">
          {def ? `Gotowość ${playing.filter(isReady).length}/${playing.length}` : `W pokoju ${view.players.length}/${MAX_PLAYERS}`}
        </span>
      </div>
      {!def ? (
        // Sam w pokoju: jeden znacznik, reszta miejsca należy do kodu i koloru.
        <ul className="flex flex-wrap gap-1.5" aria-label="Gracze w pokoju">
          {view.players.map((p) => (
            <li
              key={p.id}
              className={`flex min-h-9 min-w-0 max-w-full items-center gap-2 rounded-full px-3 text-sm ${p.connected ? "" : "border border-dashed border-line"}`}
              style={{ backgroundColor: `color-mix(in srgb, ${p.color} 12%, transparent)` }}
            >
              <span className={`size-2.5 shrink-0 rounded-full ${p.connected ? "" : "opacity-40"}`} style={{ backgroundColor: p.color }} aria-hidden />
              <span className="truncate" title={p.nick}>
                {p.nick}
                {p.id === me && <span className="text-fg-muted"> (ty)</span>}
              </span>
              {!p.connected && <span className="text-xs text-fg-muted">rozłączony</span>}
              {p.id === view.hostId && <Crown size={14} weight="fill" className="shrink-0" aria-label="Gospodarz" />}
            </li>
          ))}
        </ul>
      ) : (
        (
          [
            // Podpis tylko wtedy, gdy jest od czego odróżnić; limit miejsc widać dopiero, gdy pokój jest większy niż gra.
            [view.players.length > def.maxPlayers ? `Grają ${view.seats.length}/${def.maxPlayers} (limit gry)` : watching.length > 0 ? "Grają" : "", playing],
            ["Oglądają", watching],
          ] as [string, LobbyPlayer[]][]
        )
      )
        .filter(([, players]) => players.length > 0)
        .map(([title, players]) => (
          <div key={title} className="mt-2 first:mt-0">
            {title && <h3 className="mb-1 px-1 text-sm text-fg-muted">{title}</h3>}
            <ul className="flex flex-col gap-1">
              {players.map((p) => {
                const seated = view.seats.includes(p.id);
                const row = (
                  <>
                    <span className={`size-3 shrink-0 rounded-full transition-opacity duration-180 ${p.connected ? "" : "opacity-40"}`} style={{ backgroundColor: p.color }} aria-hidden />
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate">
                        {p.nick}
                        {p.id === me && <span className="text-fg-muted"> (ty)</span>}
                      </span>
                      {p.id === view.hostId && <Crown size={16} weight="fill" className="shrink-0" aria-label="Gospodarz" />}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-2 text-sm text-fg-muted">
                      {!p.connected && "rozłączony"}
                      {seated &&
                        (isReady(p) ? (
                          <span className="flex items-center gap-1 text-fg">
                            <Check size={14} weight="bold" aria-hidden />
                            gotowe
                          </span>
                        ) : (
                          "czeka"
                        ))}
                    </span>
                  </>
                );
                // Rozłączenie mówią przygaszona kropka i słowo; nick zostaje czytelny.
                const className = "flex w-full min-h-12 items-center gap-3 rounded-inset px-3 text-left transition-colors duration-180";
                // Tło znaczy gotowość: lista wypełnia się kolorami, gdy kolejne osoby potwierdzają.
                const style = seated && isReady(p) ? { backgroundColor: `color-mix(in srgb, ${p.color} 10%, transparent)` } : undefined;
                return (
                  <li key={p.id}>
                    {isHost && def ? (
                      <button
                        type="button"
                        className={className}
                        style={style}
                        aria-pressed={seated}
                        onClick={() => send("toggleSeat", { id: p.id })}
                      >
                        {row}
                      </button>
                    ) : (
                      <div className={className} style={style}>
                        {row}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      <ColorPicker view={view} me={me} send={send} />
      {isHost && def && view.players.length > 1 && (
        <p className="mt-3 text-sm text-fg-muted">Dotknij gracza, żeby przenieść go między grającymi a oglądającymi.</p>
      )}
    </section>
  );
}

/** Dolny pasek: start u gospodarza, gotowość u gościa z miejscem, informacja u oglądających. */
/** `note` to linia nad przyciskiem w tym samym pasku (podsumowanie Turnieju); bez niej pasek ma tylko akcję. */
export function StartBar({ view, me, send, note }: { view: RoomView; me: string; send: Send; note?: ReactNode }) {
  const isHost = view.hostId === me;
  const def = picked(view);
  const hostNick = view.players.find((p) => p.id === view.hostId)?.nick ?? "gospodarz";
  const guests = view.seats.filter((id) => id !== view.hostId);
  const unready = view.players.filter((p) => guests.includes(p.id) && !p.ready);
  const meSeated = view.seats.includes(me);
  const meReady = !!view.players.find((p) => p.id === me)?.ready;
  const startBlocker = !def
    ? "Dotknij gry, żeby ją wybrać"
    : view.seats.length < def.minPlayers
      ? `Zaznacz ${def.minPlayers} graczy do gry`
      : unready.length === 1
        ? `Czekamy na: ${unready[0].nick}`
        : unready.length > 1
          ? `Czekamy na gotowość (${guests.length - unready.length}/${guests.length})`
          : null;

  const action =
    isHost && !startBlocker ? (
      <button type="button" className="btn btn-primary w-full" onClick={() => send("start")}>
        <Play size={18} weight="fill" aria-hidden />
        <span className="truncate">Zagraj: {def!.name}</span>
      </button>
    ) : isHost ? (
      // Zwykły podpis zamiast wyszarzonego przycisku: nie udaje czegoś, co da się nacisnąć.
      <p className="flex min-h-12 w-full items-center justify-center text-center text-sm text-fg-muted">{startBlocker}</p>
    ) : def && meSeated ? (
      <button
        type="button"
        className={`btn w-full ${meReady ? "btn-ghost" : "btn-primary"}`}
        aria-pressed={meReady}
        onClick={() => send("ready", { ready: !meReady })}
      >
        {meReady ? <Check size={18} weight="bold" aria-hidden /> : <HandWaving size={18} weight="fill" aria-hidden />}
        <span className="truncate">{meReady ? `Gotowość zgłoszona, czekamy na ${hostNick}` : "Zgłaszam gotowość"}</span>
      </button>
    ) : (
      <p className="flex min-h-12 w-full items-center justify-center text-center text-sm text-fg-muted">
        {def ? `Oglądasz. Czekamy, aż ${hostNick} zacznie` : `Czekamy, aż ${hostNick} wybierze grę`}
      </p>
    );

  return (
    <StickyBar className={note ? "mt-auto" : ""}>
      {note ? (
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {note}
          {action}
        </div>
      ) : (
        action
      )}
    </StickyBar>
  );
}

/** To, co gospodarz wybrał do grania: gra albo turniej (wszyscy w pokoju, także solo). */
export function picked(view: RoomView): { name: string; minPlayers: number; maxPlayers: number } | undefined {
  if (view.tournament) return { name: "Turniej", minPlayers: 1, maxPlayers: MAX_PLAYERS };
  return view.gameId ? GAMES[view.gameId] : undefined;
}

/** Mini-gry z rejestru (gry solo, minPlayers 1); reszta to gry główne. */
export const MINI_GAMES = MINI_GAME_IDS.map((id) => GAMES[id]);

type Wish = { id: string; nick: string; color: string };

/** Życzenia gości przy grze: kropki ich kolorów w rogu kafla, dla czytników ekranu nicki. */
export function WishMarks({ wishes, compact }: { wishes?: Wish[]; compact?: boolean }) {
  if (!wishes?.length) return null;
  return (
    <>
      <span className={`absolute ${compact ? "bottom-2" : "top-2"} right-2 flex gap-1`} aria-hidden>
        {wishes.map((w) => <span key={w.id} className="size-2.5 rounded-full" style={{ backgroundColor: w.color }} />)}
      </span>
      <span className="sr-only">Chcą zagrać: {wishes.map((w) => w.nick).join(", ")}</span>
    </>
  );
}

/** Kafel w siatce gier: ikona w kwadracie, nazwa i jedna linijka pod spodem; `dim` przygasza bez blokowania. */
export function Tile({ icon: TileIcon, name, hint, picked, dim, wishes, onClick }: { icon: Icon; name: string; hint: string; picked?: boolean; dim?: boolean; wishes?: Wish[]; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      className={`relative flex min-h-14 items-center gap-2.5 rounded-inset border p-2 text-left transition-[color,background-color,border-color,opacity] duration-180 ${
        picked ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-hover"
      } ${dim ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-inset ${picked ? "" : "bg-line"}`}>
        <TileIcon size={20} weight={picked ? "fill" : "regular"} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm leading-tight">{name}</span>
        <span className="font-mono text-xs text-fg-muted tabular-nums">{hint}</span>
      </span>
      <WishMarks wishes={wishes} compact />
    </button>
  );
}

/** Kafel gry mieszczącej tyle osób; przygaszony (ale do wybrania), gdy graczy brakuje. */
export function GameTile({ game: g, players, picked, wishes, onClick }: { game: { id: string; name: string; minPlayers: number; maxPlayers: number }; players: number; picked?: boolean; wishes?: Wish[]; onClick: () => void }) {
  const missing = g.minPlayers - players;
  return (
    <Tile
      icon={ICONS[g.id] ?? Play}
      name={g.name}
      hint={missing > 0 ? `brakuje ${missing} ${missing === 1 ? "gracza" : "graczy"}` : seats(g)}
      picked={picked}
      wishes={wishes}
      dim={missing > 0}
      onClick={onClick}
    />
  );
}

export const ICONS: Record<string, Icon> = {
  "piec-w-rzedzie": GridNine,
  labirynt: Path,
  statki: Boat,
  chinczyk: DiceFive,
  memory: Cards,
  "kampus-tour": Buildings,
  "panstwa-miasta": GlobeHemisphereEast,
  kalambury: PencilSimple,
  sabotaz: Bomb,
  wyprawa: Mountains,
  podrobka: Detective,
  refleks: Lightning,
  simon: SquaresFour,
  stoper: Timer,
  schulte: NumberSquareOne,
  sudoku: GridFour,
  stroop: Palette,
  liczenie: Calculator,
  kolo: CircleDashed,
  kolor: Eyedropper,
  kropki: DotsNine,
  rok: CalendarBlank,
  srodek: LineSegment,
  stoj: HandPalm,
  sledzenie: CirclesThree,
  kubki: PintGlass,
  wieza: Stack,
  rytm: Metronome,
  inny: MagnifyingGlass,
  obrot: ArrowsClockwise,
  literowka: TextAa,
  mapa: MapTrifold,
  kat: Angle,
  przytrzymaj: HandTap,
  balon: Balloon,
  "w-pamieci": Brain,
  dziesiatki: NumberCircleZero,
  tort: Cake,
  zakupy: ShoppingCart,
  zaslona: EyeSlash,
  nozyczki: Scissors,
};

export function seats(g: { minPlayers: number; maxPlayers: number }) {
  return g.minPlayers === g.maxPlayers ? `${g.minPlayers} os.` : `${g.minPlayers}-${g.maxPlayers} os.`;
}

/** Jedno zdanie o grze dla gościa, zanim zgłosi gotowość. */
export const BLURBS: Record<string, string> = {
  "piec-w-rzedzie": "Na zmianę stawiacie kamienie na planszy 15×15. Wygrywa pięć lub więcej w linii.",
  labirynt: "W turze idziesz pionkiem o pole albo stawiasz ściankę. Wygrywa ten, kto pierwszy dojdzie na drugą stronę planszy.",
  statki: "Rozstawiasz flotę, potem strzelacie na zmianę. Trafienie daje kolejny strzał, wygrywa ten, kto zatopi wszystko.",
  chinczyk: "Rzucasz kostką i prowadzisz pionki dookoła planszy do domku. Stając na pionku rywala, odsyłasz go na start.",
  memory: "Na zmianę odkrywacie po dwie karty. Para zostaje u ciebie i daje kolejny ruch, wygrywa najwięcej par.",
  "kampus-tour": "Planszówka ekonomiczna: rzut dwiema kośćmi, kupujesz pola kampusu, rozbudowujesz je i zbierasz czynsz. Wygrywa ostatni wypłacalny albo najbogatszy po 20 rundach.",
  "panstwa-miasta": "5 rund, każda na inną literę i 6 kategorii. Kto pierwszy odda kartkę, daje STOP, potem głosujecie nad odpowiedziami.",
  kalambury: "Po kolei rysujecie palcem hasło wybrane z trzech, reszta zgaduje na czacie. Im szybciej trafisz, tym więcej punktów.",
  wyprawa: "Wspólnym szlakiem odkrywacie skarby i zagrożenia, a każdy potajemnie wybiera: idę dalej albo wracam z tym, co niosę.",
  podrobka: "Każdy odpowiada na swoje pytanie, ale jedna osoba dostała inne, podobne. Tajnie głosujecie, kto jest Podróbką.",
  sabotaz: "Dokładasz zakryte karty na swój stos, potem licytujecie, ile Przejść odkryjecie. Uważaj na cudze Pułapki.",
  refleks: "Dotknij pola, gdy zmieni kolor. 12 zmian, liczy się średni czas reakcji, falstart to 1000 ms.",
  simon: "Powtarzasz coraz dłuższą sekwencję 4 kolorów. Liczy się najdłuższa seria.",
  stoper: "Licznik znika po 3 s. Dotknij dokładnie po 10 sekundach, wygrywa najmniejsza odchyłka.",
  sudoku: "Plansza 4×4 do uzupełnienia cyframi 1-4, w każdym wierszu, kolumnie i bloku raz. Liczy się czas, zła cyfra dodaje 5 s.",
  schulte: "Siatka 5×5 z liczbami 1-25, dotykasz po kolei. Liczy się czas, pomyłka dodaje 3 s.",
  stroop: "Nazwa koloru napisana innym kolorem. Wybierasz kolor liter, nie słowo. 30 s.",
  liczenie: "30 s szybkich działań z czterema odpowiedziami. Pomyłka blokuje na sekundę.",
  kolo: "Rysujesz palcem koło, do 10 prób. Liczy się najlepsza, wynik to procent idealności.",
  kolor: "Widzisz kolor przez 2 s, potem odtwarzasz go suwakami. 5 kolorów, wygrywa najmniejszy błąd.",
  kropki: "Kropki migają przez 1,5 s, wpisujesz, ile ich było. 10 rund, wygrywa najmniejsza suma błędów.",
  rok: "Widzisz wydarzenie, ustawiasz jego rok suwakiem. 10 rund, wygrywa najmniejsza suma odchyłek.",
  srodek: "Odcinek pod losowym kątem, dotykasz dokładnie jego środka. 10 rund, wygrywa najmniejsza suma błędów.",
  stoj: "Zielone pole dotykasz, czerwonego nie wolno. 30 s, tempo rośnie, błąd zabiera 2 punkty.",
  kubki: "Kulka pod jednym z trzech kubków, kubki się tasują. Wskazujesz właściwy, z każdą rundą szybciej. Pierwsza pomyłka kończy.",
  sledzenie: "Kulki lecą po polu, trzy z nich są celami. Widzisz je krótko, potem śledzisz ruch i wskazujesz te trzy.",
  rytm: "Metronom gra 8 uderzeń i cichnie, a ty stukasz dalej w tym samym tempie przez 10 s. Wygrywa najmniejsza odchyłka.",
  inny: "Siatka identycznych symboli, jeden różni się obrotem, odcieniem, rozmiarem albo kształtem. 30 s, siatka rośnie po każdym trafieniu.",
  literowka: "Cztery słowa, jedno z błędem ortograficznym. Dotykasz błędnego. 30 s, pomyłka zabiera punkt.",
  obrot: "Dwie figury z klocków: ta sama obrócona czy lustrzane odbicie? 30 s, pomyłka zabiera punkt.",
  mapa: "Nazwa miasta, wskazujesz je na konturze Polski. 10 rund, wygrywa najmniejsza suma kilometrów.",
  kat: "Kąt miga przez 1,5 s, wpisujesz jego miarę w stopniach. 10 rund, wygrywa najmniejsza suma błędów.",
  przytrzymaj: "Pole świeci się od 1 do 5 s, a ty trzymasz palec tak samo długo. 5 rund, wygrywa najmniejsza suma odchyłek.",
  nozyczki: "Jednym ruchem palca przecinasz nieregularny kształt na dwie równe części. 5 kształtów, wygrywa najmniejsza suma błędów.",
  tort: "Okrągły tort dzielisz cięciami na 3 do 7 równych kawałków. 5 tortów, wygrywa najmniejsza suma błędów.",
  zaslona: "Kulka toczy się ze stałą prędkością i znika za zasłoną. Dotykasz w chwili, gdy powinna dotrzeć do mety. 8 rund, wygrywa najmniejsza suma odchyłek.",
  zakupy: "Przez 10 s widzisz listę 10 przedmiotów, potem wskazujesz je na półce z 20. Zły przedmiot zabiera punkt, przy remisie wygrywa szybszy.",
  dziesiatki: "Siatka liczb od 1 do 9. Dotykasz dwóch, które razem dają 10, a w ich miejsce wchodzą nowe. 30 s, liczą się pary.",
  "w-pamieci": "Liczba i kolejne działania migają po kolei, wyniku nie widać. Wpisujesz, ile wyszło. Ciąg jest coraz dłuższy, pierwsza pomyłka kończy grę.",
  balon: "Pompujesz balon stuknięciami, każde to punkt. Zgarniasz punkty, kiedy chcesz, ale pęknięty balon daje 0. 10 balonów, liczy się suma.",
  wieza: "Klocek jeździ w poziomie, zatrzymujesz go nad poprzednim. To, co wystaje, zostaje ucięte. Liczy się wysokość wieży.",
};

/** Nazwy kolorów z PLAYER_COLORS (ta sama kolejność), dla czytników ekranu. */
const COLOR_NAMES = ["niebieski", "żółty", "zielony", "fioletowy", "morski", "różowy"];

/** Wybór własnego koloru: zajęte przez innych są przygaszone, nieaktywne i podpisane inicjałem właściciela. */
function ColorPicker({ view, me, send, onPicked }: { view: RoomView; me: string; send: Send; onPicked?: () => void }) {
  const mine = view.players.find((p) => p.id === me)?.color;
  const def = picked(view);
  return (
    <div className={`flex flex-col gap-1 ${def ? "mt-3 border-t border-line pt-3" : view.players.length > 1 ? "mt-2" : "mt-4"}`}>
      {/* W lobby od dwóch osób sama linia kółek, bez podpisu nad nią (aria-label zostaje); na ekranie gry podpis odróżnia kolory od listy graczy. */}
      {(def || view.players.length === 1) && <span className="label">Twój kolor</span>}
      <div className="-mx-1 flex justify-between" role="radiogroup" aria-label="Twój kolor">
        {PLAYER_COLORS.map((color, i) => {
          const owner = view.players.find((p) => p.color === color);
          const taken = !!owner && owner.id !== me;
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={color === mine}
              aria-label={taken ? `${COLOR_NAMES[i]}, zajęty: ${owner.nick}` : COLOR_NAMES[i]}
              disabled={taken}
              className="grid size-12 shrink-0 place-items-center rounded-full"
              onClick={() => {
                send("pickColor", { color });
                onPicked?.();
              }}
            >
              <span
                className={`grid size-7 place-items-center rounded-full font-mono tabular-nums text-xs text-fg-muted ${color === mine ? "outline-2 outline-offset-2 outline-fg" : ""}`}
                style={{ backgroundColor: taken ? `color-mix(in srgb, ${color} 25%, transparent)` : color }}
              >
                {color === mine && <Check size={14} weight="bold" className="text-bg" aria-hidden />}
                {taken && <span aria-hidden>{owner.nick.charAt(0).toUpperCase()}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Code({ code, alone, onLeave }: { code: string; alone: boolean; onLeave: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (!(await shareRoom(code))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="tile">
      <div className="flex items-center justify-between">
        <h2 className="label">{copied ? "Skopiowano!" : "Kod pokoju"}</h2>
        <button type="button" className="-mt-2 -mr-2 flex min-h-12 min-w-12 items-center gap-1.5 px-2 text-sm text-fg-muted" onClick={onLeave}>
          <SignOut size={16} weight="bold" aria-hidden />
          Wyjdź
        </button>
      </div>
      <div className="mt-1 flex items-end justify-between gap-4">
        <button type="button" className="text-left" onClick={copy} aria-label={`Kod pokoju ${code}, kopiuj`}>
          <span className="font-mono tabular-nums text-6xl font-medium tracking-[0.12em]">{code}</span>
        </button>
        <button type="button" className="btn btn-ghost size-12 shrink-0 p-0" onClick={share} aria-label="Udostępnij link">
          {copied ? <Check size={20} weight="bold" aria-hidden /> : <ShareNetwork size={20} weight="bold" aria-hidden />}
        </button>
      </div>
      {alone && <p className="mt-2 text-sm text-fg-muted">Podaj kod znajomym, żeby dołączyli. Dotknij go, żeby skopiować.</p>}
    </section>
  );
}
