import {
  Angle,
  ArrowsClockwise,
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
  DiceFive,
  DotsNine,
  GameController,
  Eyedropper,
  GlobeHemisphereEast,
  GridFour,
  PintGlass,
  GridNine,
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
  NumberCircleZero,
  NumberSquareOne,
  Palette,
  Play,
  ShareNetwork,
  SignOut,
  Scissors,
  SquaresFour,
  Stack,
  TextAa,
  Timer,
  Trophy,
} from "@phosphor-icons/react";
import { DEFAULT_LENGTH, GAMES, type LobbyPlayer, MAX_PLAYERS, PLAYER_COLORS, type RoomView } from "@mini-games/games";
import { useState } from "react";
import { Screen, type Send, StickyBar } from "./ui.tsx";


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
        <div className="tile h-36 animate-pulse" aria-label="Wczytywanie" />
        <div className="tile h-24 animate-pulse" />
      </Screen>
    );
  }
  const isHost = view.hostId === me;

  return (
    <Screen dropped={dropped}>
      <Code code={view.code} alone={view.players.length === 1} onLeave={onLeave} />
      <Players view={view} me={me} send={send} />

      {/* Gospodarz: szerokie kafle prowadzą do turnieju i listy mini-gier (zbiory, nie pojedyncze gry), gry główne otwierają ekran gry (Setup.tsx). */}
      {isHost && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="label px-1">Zestawy</h2>
            <Tile wide icon={GameController} name="Mini-gry" hint={`${MINI_GAMES.length} gier, także solo`} onClick={onMini} />
            <Tile wide icon={Trophy} name="Turniej" hint={`seria mini-gier, 1-${MAX_PLAYERS} os.`} onClick={() => send("pickTournament", { length: DEFAULT_LENGTH })} />
          </section>
          <section>
            <h2 className="label mb-2 px-1">Gry</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(GAMES)
                .filter((g) => g.minPlayers > 1)
                .map((g) => (
                  <GameTile key={g.id} game={g} players={view.players.length} onClick={() => send("pickGame", { gameId: g.id })} />
                ))}
            </div>
          </section>
        </>
      )}

      <StartBar view={view} me={me} send={send} />
    </Screen>
  );
}

/** Lista graczy z miejscami, gotowością i wyborem koloru; wspólna dla lobby i ekranu gry. */
export function Players({ view, me, send }: { view: RoomView; me: string; send: Send }) {
  const isHost = view.hostId === me;
  const def = picked(view);
  return (
    <section className="tile">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="label">Gracze</h2>
        <span className="font-mono text-sm text-fg-muted">
          W pokoju {view.players.length}/{MAX_PLAYERS}
        </span>
      </div>
      {(
        (def
          ? [
              // Limit miejsc widać dopiero, gdy pokój jest większy niż gra.
              [view.players.length > def.maxPlayers ? `Grają ${view.seats.length}/${def.maxPlayers} (limit gry)` : "Grają", view.seats.map((id) => view.players.find((p) => p.id === id)!)],
              ["Oglądają", view.players.filter((p) => !view.seats.includes(p.id))],
            ]
          : [["", view.players]]
        ) as [string, LobbyPlayer[]][]
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
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
                    <span className="truncate">
                      {p.nick}
                      {p.id === me && <span className="text-fg-muted"> (ty)</span>}
                    </span>
                    <span className="ml-auto flex items-center gap-2 text-sm text-fg-muted">
                      {!p.connected && "rozłączony"}
                      {def &&
                        seated &&
                        (p.ready || p.id === view.hostId ? (
                          <span className="flex items-center gap-1 text-fg">
                            <Check size={14} weight="bold" aria-hidden />
                            gotowe
                          </span>
                        ) : (
                          "czeka"
                        ))}
                      {p.id === view.hostId && <Crown size={18} weight="fill" aria-label="Gospodarz" />}
                    </span>
                  </>
                );
                const className = `flex w-full min-h-11 items-center gap-3 rounded-inset px-3 text-left transition-opacity ${p.connected ? "" : "opacity-50"}`;
                const style = { backgroundColor: `color-mix(in srgb, ${p.color} ${seated || !def ? 10 : 4}%, transparent)` };
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
export function StartBar({ view, me, send }: { view: RoomView; me: string; send: Send }) {
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

  return (
    <StickyBar>
      {isHost && !startBlocker ? (
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
          <span className="truncate">{meReady ? `Gotowe, czekamy na ${hostNick}` : `Zgłaszam gotowość: ${def.name}`}</span>
        </button>
      ) : (
        <p className="flex min-h-12 w-full items-center justify-center text-center text-sm text-fg-muted">
          {def ? `Oglądasz. Czekamy, aż ${hostNick} zacznie` : `Czekamy, aż ${hostNick} wybierze grę`}
        </p>
      )}
    </StickyBar>
  );
}

/** To, co gospodarz wybrał do grania: gra albo turniej (wszyscy w pokoju, także solo). */
export function picked(view: RoomView): { name: string; minPlayers: number; maxPlayers: number } | undefined {
  if (view.tournament) return { name: "Turniej", minPlayers: 1, maxPlayers: MAX_PLAYERS };
  return view.gameId ? GAMES[view.gameId] : undefined;
}

/** Mini-gry to gry, w które da się grać solo (minPlayers 1); reszta to gry główne. */
export const MINI_GAMES = Object.values(GAMES).filter((g) => g.minPlayers === 1);

/** Kafel w siatce gier: ikona, nazwa i jedna linijka pod spodem; `wide` to wiersz na całą szerokość, `dim` przygasza bez blokowania. */
export function Tile({ icon: TileIcon, name, hint, picked, disabled, dim, wide, onClick }: { icon: Icon; name: string; hint: string; picked?: boolean; disabled?: boolean; dim?: boolean; wide?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      disabled={disabled}
      className={`flex rounded-inset border p-3 text-left transition-[color,border-color,opacity] ${wide ? "min-h-14 items-center gap-3" : "min-h-20 flex-col items-start gap-1"} ${
        picked ? "border-accent bg-accent-soft" : "border-line enabled:hover:border-line-hover"
      } ${disabled ? "opacity-40" : dim ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <TileIcon size={22} weight={picked ? "fill" : "regular"} aria-hidden />
      <span className="leading-tight">{name}</span>
      <span className={`font-mono text-xs text-fg-muted ${wide ? "ml-auto" : ""}`}>{hint}</span>
    </button>
  );
}

/** Kafel gry; nieaktywny, gdy w pokoju jest więcej osób, niż gra ma miejsc, przygaszony (ale do wybrania), gdy graczy brakuje. */
export function GameTile({ game: g, players, picked, onClick }: { game: { id: string; name: string; minPlayers: number; maxPlayers: number }; players: number; picked?: boolean; onClick: () => void }) {
  const tooMany = players > g.maxPlayers;
  const missing = g.minPlayers - players;
  return (
    <Tile
      icon={ICONS[g.id] ?? Play}
      name={g.name}
      hint={tooMany ? (g.minPlayers === g.maxPlayers ? "tylko " : "max ") + `${g.maxPlayers} os.` : missing > 0 ? `brakuje ${missing} ${missing === 1 ? "gracza" : "graczy"}` : seats(g)}
      picked={picked}
      dim={missing > 0}
      disabled={tooMany}
      onClick={onClick}
    />
  );
}

export const ICONS: Record<string, Icon> = {
  "piec-w-rzedzie": GridNine,
  statki: Boat,
  chinczyk: DiceFive,
  memory: Cards,
  "kampus-tour": Buildings,
  "panstwa-miasta": GlobeHemisphereEast,
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
  nozyczki: Scissors,
};

export function seats(g: { minPlayers: number; maxPlayers: number }) {
  return g.minPlayers === g.maxPlayers ? `${g.minPlayers} os.` : `${g.minPlayers}-${g.maxPlayers} os.`;
}

/** Jedno zdanie o grze dla gościa, zanim zgłosi gotowość. */
export const BLURBS: Record<string, string> = {
  "piec-w-rzedzie": "Na zmianę stawiacie kamienie na planszy 15×15. Wygrywa pięć lub więcej w linii.",
  statki: "Rozstawiasz flotę, potem strzelacie na zmianę. Trafienie daje kolejny strzał, wygrywa ten, kto zatopi wszystko.",
  chinczyk: "Rzucasz kostką i prowadzisz pionki dookoła planszy do domku. Stając na pionku rywala, odsyłasz go na start.",
  memory: "Na zmianę odkrywacie po dwie karty. Para zostaje u ciebie i daje kolejny ruch, wygrywa najwięcej par.",
  "kampus-tour": "Planszówka ekonomiczna: rzut dwiema kośćmi, kupujesz pola kampusu, rozbudowujesz je i zbierasz czynsz. Wygrywa ostatni wypłacalny albo najbogatszy po 20 rundach.",
  "panstwa-miasta": "5 rund, każda na inną literę i 6 kategorii. Kto pierwszy odda kartkę, daje STOP, potem głosujecie nad odpowiedziami.",
  refleks: "Dotknij pola, gdy zmieni kolor. 12 zmian, liczy się średni czas reakcji, falstart to 1000 ms.",
  simon: "Powtarzasz coraz dłuższą sekwencję 4 kolorów. Liczy się najdłuższa seria.",
  stoper: "Licznik znika po 3 s. Dotknij dokładnie w wylosowanej sekundzie, wygrywa najmniejsza odchyłka.",
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
  dziesiatki: "Siatka liczb od 1 do 9. Dotykasz dwóch, które razem dają 10, a w ich miejsce wchodzą nowe. 30 s, liczą się pary.",
  "w-pamieci": "Liczba i kolejne działania migają po kolei, wyniku nie widać. Wpisujesz, ile wyszło. Ciąg jest coraz dłuższy, pierwsza pomyłka kończy grę.",
  balon: "Pompujesz balon stuknięciami, każde to punkt. Zgarniasz punkty, kiedy chcesz, ale pęknięty balon daje 0. 10 balonów, liczy się suma.",
  wieza: "Klocek jeździ w poziomie, zatrzymujesz go nad poprzednim. To, co wystaje, zostaje ucięte. Liczy się wysokość wieży.",
};

/** Nazwy kolorów z PLAYER_COLORS (ta sama kolejność), dla czytników ekranu. */
const COLOR_NAMES = ["niebieski", "żółty", "zielony", "fioletowy", "morski", "różowy"];

/** Wybór własnego koloru: zajęte przez innych są przygaszone, nieaktywne i podpisane inicjałem właściciela. */
function ColorPicker({ view, me, send }: { view: RoomView; me: string; send: Send }) {
  const mine = view.players.find((p) => p.id === me)?.color;
  return (
    <div className="mt-4 flex flex-col gap-1">
      <span className="text-sm text-fg-muted">Twój kolor</span>
      <div className="flex justify-between" role="radiogroup" aria-label="Twój kolor">
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
              className="grid size-10 place-items-center rounded-full"
              onClick={() => send("pickColor", { color })}
            >
              <span
                className={`grid size-7 place-items-center rounded-full font-mono text-xs text-fg-muted ${color === mine ? "outline-2 outline-offset-2 outline-fg" : ""}`}
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
  const url = `${location.origin}/?kod=${code}`;

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (navigator.share) {
      // Anulowanie arkusza udostępniania to nie błąd.
      await navigator.share({ title: "Kwadrans", text: `Dołącz do pokoju ${code}`, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="tile">
      <div className="flex items-center justify-between">
        <h2 className="label">{copied ? "Skopiowano!" : "Kod pokoju"}</h2>
        <button type="button" className="-m-2 flex items-center gap-1.5 p-2 text-sm text-fg-muted" onClick={onLeave}>
          <SignOut size={16} aria-hidden />
          Wyjdź
        </button>
      </div>
      <div className="mt-1 flex items-end justify-between gap-4">
        <button type="button" className="text-left" onClick={copy} aria-label={`Kod pokoju ${code}, kopiuj`}>
          <span className="font-mono text-6xl font-medium tracking-[0.12em]">{code}</span>
        </button>
        <button type="button" className="btn btn-ghost size-12 shrink-0 p-0" onClick={share} aria-label="Udostępnij link">
          {copied ? <Check size={20} weight="bold" aria-hidden /> : <ShareNetwork size={20} weight="bold" aria-hidden />}
        </button>
      </div>
      {alone && <p className="mt-2 text-sm text-fg-muted">Podaj kod znajomym, żeby dołączyli. Dotknij go, żeby skopiować.</p>}
    </section>
  );
}
