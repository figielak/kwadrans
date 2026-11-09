import type { Icon } from "@phosphor-icons/react";
import { ArrowLeft, CaretDown, Check, HandTap, ShareNetwork, SignOut, Smiley, Timer, Trophy, WifiSlash } from "@phosphor-icons/react";
import { REACTIONS, type RoomView } from "@kwadrans/games";
import { createContext, Fragment, type ReactNode, type Ref, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { liveDots, type LiveStore } from "../live.ts";
import type { MomentStore, ReactionStore } from "../moments.ts";
import { autoStart, introStage, secondsLeft, startsAfterClose } from "./intro.ts";
import { bestRound, type Hero, revealOrder } from "./results.ts";

/**
 * Tabela wieczoru: punkty za wszystkie partie w pokoju. Tylko przy 2+ grach, zwięzła (jeden wiersz na osobę, bez tytułów),
 * żeby przy wynikach nie była większa od bohatera. Remis dzieli miejsce; kto wyszedł, zostaje i jest przygaszony.
 */
export function EveningTable({ evening, present, meKey }: { evening: RoomView["evening"]; present: string[]; meKey: string }) {
  if (evening.games < 2 || evening.table.length === 0) return null;
  const places = evening.table.map((r) => 1 + evening.table.filter((o) => o.points > r.points).length);
  return (
    <section className="tile px-4 py-3" aria-label="Tabela wieczoru">
      <h2 className="label mb-1.5 flex justify-between">
        Wieczór · {evening.games} {evening.games % 10 >= 2 && evening.games % 10 <= 4 && (evening.games < 12 || evening.games > 14) ? "gry" : "gier"}
        <span>pkt</span>
      </h2>
      <ol className="flex flex-col gap-0.5 text-sm">
        {evening.table.map((r, i) => (
          <li key={r.key} className={`flex items-center gap-2 ${present.includes(r.key) ? "" : "text-fg-muted"}`}>
            <span className="w-5 font-mono text-fg-muted tabular-nums">{places[i]}.</span>
            <span className="min-w-0 flex-1 truncate">
              {r.nick}
              {r.key === meKey && <span className="text-fg-muted"> (ty)</span>}
              {!present.includes(r.key) && <span className="text-xs"> · wyszedł</span>}
            </span>
            <span className="font-mono font-semibold tabular-nums">{r.points}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Karty głosowania „Inna gra”: ikona, nazwa i kropki głosujących w ich kolorach, trzy w jednym rzędzie (też w poziomym Kampus Tour).
 * Własny wybór ma obrys w moim kolorze. Obserwator widzi te same karty bez dotyku.
 */
export function VoteCards({ options, votes, nicks, colors, msLeft, me, seated, onVote }: {
  options: { id: string; name: string; icon: Icon }[];
  votes: Record<string, string>;
  nicks: Record<string, string>;
  colors: Record<string, string>;
  msLeft: number;
  me: string;
  seated: boolean;
  onVote: (id: string) => void;
}) {
  // Czas liczony od odebrania wiadomości, jak w Countdown: zegary telefonu i serwera się różnią.
  const deadline = useMemo(() => Date.now() + msLeft, [msLeft]);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  return (
    <div className="flex w-full basis-full flex-col gap-2" role="group" aria-label="Głosowanie na następną grę">
      <p className="flex justify-between text-sm" role="status">
        <span className="font-semibold">{seated ? "Co dalej?" : "Głosują gracze"}</span>
        <span className="font-mono text-fg-muted tabular-nums">{seconds} s</span>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ id, name, icon: CardIcon }) => {
          const voters = Object.entries(votes).filter(([, vote]) => vote === id).map(([voter]) => voter);
          const mine = votes[me] === id;
          const label = `${name}, ${voters.length ? `głosują: ${voters.map((v) => nicks[v] ?? "?").join(", ")}` : "bez głosów"}`;
          const body = (
            <>
              <CardIcon size={22} weight={mine ? "fill" : "regular"} aria-hidden />
              <span className="text-center text-xs leading-tight break-words">{name}</span>
              <span className="flex min-h-3 flex-wrap justify-center gap-1" aria-hidden>
                {voters.map((v) => <span key={v} className="size-3 rounded-full" style={{ backgroundColor: colors[v] }} />)}
              </span>
            </>
          );
          const style = mine ? { borderColor: colors[me], backgroundColor: `color-mix(in srgb, ${colors[me]} 16%, transparent)` } : undefined;
          const cls = "flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-inset border border-line p-2";
          return seated ? (
            <button key={id} type="button" aria-pressed={mine} aria-label={label} className={`${cls} transition-colors duration-180 enabled:hover:border-line-hover`} style={style} onClick={() => onVote(id)}>
              {body}
            </button>
          ) : (
            <div key={id} role="img" aria-label={label} className={cls}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type Send = (type: string, payload?: unknown) => void;

/** Wspólny układ ekranu: jedna kolumna, akcje przy dolnej krawędzi (strefa kciuka). */
export function Screen({ dropped, children }: { dropped: boolean; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-3 px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {dropped && (
        <p role="status" className="flex items-center gap-2 rounded-inset bg-accent-soft px-4 py-3 text-sm">
          <WifiSlash size={18} aria-hidden />
          Łączenie ponownie…
        </p>
      )}
      {children}
    </main>
  );
}

/** Udostępnia link do pokoju; bez arkusza systemowego kopiuje go i zwraca `true`, żeby ekran mógł to potwierdzić. */
export async function shareRoom(code: string): Promise<boolean> {
  const url = `${location.origin}/?kod=${code}`;
  if (navigator.share) {
    // Anulowanie arkusza udostępniania to nie błąd.
    await navigator.share({ title: "Kwadrans", text: `Dołącz do pokoju ${code}`, url }).catch(() => {});
    return false;
  }
  await navigator.clipboard.writeText(url);
  return true;
}

/** Górny wiersz ekranów przed partią: gospodarz wraca do listy gier, gość wychodzi z pokoju; po prawej kod pokoju z udostępnianiem, w środku opcjonalny dodatek ekranu. */
export function TopBar({ code, onBack, onLeave, children }: { code: string; onBack?: () => void; onLeave: () => void; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (!(await shareRoom(code))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between">
      <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 px-2 text-sm text-fg-muted" onClick={onBack ?? onLeave}>
        {onBack ? <ArrowLeft size={16} weight="bold" aria-hidden /> : <SignOut size={16} weight="bold" aria-hidden />}
        {onBack ? "Gry" : "Wyjdź"}
      </button>
      {children}
      <button type="button" className="-mr-2 flex min-h-12 items-center gap-2 px-2" onClick={share} aria-label={`Kod pokoju ${code}, udostępnij link`}>
        <span className="text-sm text-fg-muted">{copied ? "Skopiowano!" : "Kod"}</span>
        <span className="font-mono tabular-nums text-lg font-medium tracking-[0.12em]">{code}</span>
        {copied ? <Check size={16} weight="bold" aria-hidden /> : <ShareNetwork size={16} weight="bold" aria-hidden />}
      </button>
    </div>
  );
}

/** Gracze jako kropki w `TopBar`: kolor wybiera się w lobby, tu liczy się tylko, kto jest i kto gotów. */
export function PlayerDots({ view }: { view: RoomView }) {
  const chosen = !!view.gameId || !!view.tournament;
  return (
    <ul className="flex gap-1" aria-label="Gracze">
      {view.players.map((p) => {
        const ready = chosen && view.seats.includes(p.id) && (p.ready || p.id === view.hostId);
        return (
          <li
            key={p.id}
            className={`grid size-4 place-items-center rounded-full transition-opacity duration-180 ${p.connected ? "" : "opacity-40"}`}
            style={{ backgroundColor: p.color }}
            aria-label={`${p.nick}${ready ? ", gotowe" : ""}${p.connected ? "" : ", rozłączony"}`}
          >
            {ready && <Check size={10} weight="bold" className="text-bg" aria-hidden />}
          </li>
        );
      })}
    </ul>
  );
}

export interface GameDot {
  id: string;
  /** Inicjał z `initials` (core.ts), najwyżej dwa znaki. */
  label: string;
  nick: string;
  color?: string;
  me: boolean;
  /** Punkty wieczoru w pokoju albo punkty turnieju; zera nie pokazujemy. */
  badge: number;
  /** „+1” nad kropką zwycięzcy. */
  plus: boolean;
  /** Pierścień wokół kropki: postęp partii od 0 do 1, pełny po oddaniu wyniku. */
  fraction: number;
  /** Jeszcze czyta zasady. */
  reading: boolean;
  connected: boolean;
  /** Stan słownie, do `aria-label`. */
  status?: string;
  /** Na żywo w grach na punkty: dekoracja, wynik liczy serwer. */
  score?: number;
  /** Reakcje nadawcy, które właśnie się unoszą. */
  reactions?: { key: number; index: number }[];
}

/**
 * Gracze jako kropki z inicjałem: nicki zajęłyby przy sześciu osobach trzy rzędy nad polem gry.
 * Dotknięcie rzędu rozwija pełną listę z nickami (rysuje ją `Game.tsx`). `square`: odznaka z punktami turnieju, a nie z wygranymi.
 */
export function GameDots({ dots, square, open, onToggle, compact = false }: { dots: GameDot[]; square: boolean; open: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <button type="button" className={`-my-2.5 flex min-h-12 shrink-0 items-center ${compact ? "gap-1" : "gap-1.5"}`} aria-expanded={open} aria-label={open ? "Zwiń graczy" : "Pokaż graczy"} onClick={onToggle}>
      {dots.map((d) => (
        <span
          key={d.id}
          role="img"
          aria-label={`${d.nick}${d.me ? " (ty)" : ""}${d.status ? `, ${d.status}` : ""}${d.badge ? `, ${square ? "punkty w turnieju" : "punkty wieczoru"}: ${d.badge}` : ""}${d.score !== undefined ? `, wynik: ${d.score}` : ""}`}
          // Rozłączony ma przerywany obrys zamiast pierścienia: samo przygaszenie znaczy „czyta zasady”.
          className={`relative grid size-9 place-items-center rounded-full ${d.connected ? "" : "border border-dashed border-fg-muted"}`}
          style={d.connected ? { background: `conic-gradient(${d.color} ${d.fraction * 100}%, var(--color-line) 0)` } : undefined}
        >
          <span className="grid size-8 place-items-center rounded-full bg-bg" aria-hidden>
            <span
              className={`grid size-7 place-items-center rounded-full leading-none font-semibold text-bg transition-opacity duration-180 ${d.label.length > 1 ? "text-[11px]" : "text-sm"} ${d.reading || !d.connected ? "opacity-40" : ""}`}
              style={{ backgroundColor: d.color }}
            >
              {d.label}
            </span>
          </span>
          {d.me && <span className="absolute top-full left-1/2 mt-0.5 h-0.5 w-3 -translate-x-1/2 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />}
          {d.badge > 0 && (
            // Klucz z wyniku: po wygranej liczba montuje się od nowa i wskakuje.
            <span
              key={d.badge}
              className={`absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center border border-line bg-surface px-0.5 font-mono text-[10px] leading-none text-fg tabular-nums ${square ? "rounded-sm" : "rounded-full"} ${d.plus ? "animate-[stone-pop_0.35s_ease-out]" : ""}`}
              aria-hidden
            >
              {d.badge}
            </span>
          )}
          {d.score !== undefined && (
            <span className="absolute -right-1 -bottom-1 grid h-4 min-w-4 place-items-center rounded-full border border-line bg-surface px-0.5 font-mono text-[10px] leading-none text-fg tabular-nums" aria-hidden>
              {d.score}
            </span>
          )}
          {d.reactions?.map((r) => (
            <span key={r.key} className="pointer-events-none absolute bottom-full left-1/2 z-20 -translate-x-1/2 animate-[reaction-float_1.2s_ease-out_forwards] text-xl leading-none" aria-hidden>
              {REACTIONS[r.index]}
            </span>
          ))}
          {d.plus && (
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 animate-[float-up_1.6s_ease-out_forwards] font-mono tabular-nums text-sm" style={{ color: d.color }} aria-hidden>
              +1
            </span>
          )}
        </span>
      ))}
    </button>
  );
}

type LiveProps = {
  store: LiveStore;
  def: Parameters<typeof liveDots>[0];
  /** `null` poza pomiarem: kropki bez wartości na żywo. */
  room: Parameters<typeof liveDots>[1] | null;
  progressOf: Parameters<typeof liveDots>[3];
};

/** Kropki z wartościami na żywo. Czytają magazyn same, więc nowa wiadomość nie renderuje gry. */
export function LiveGameDots({ store, reactions, def, room, progressOf, dots, ...rest }: LiveProps & { reactions: ReactionStore } & Parameters<typeof GameDots>[0]) {
  const live = useSyncExternalStore(store.subscribe, store.get);
  const floating = useSyncExternalStore(reactions.subscribe, reactions.get);
  const rows = room ? liveDots(def, room, live, progressOf) : [];
  const merged = dots.map((d) => {
    const row = rows.find((r) => r.id === d.id);
    const own = floating.filter((r) => r.id === d.id);
    return { ...d, fraction: row?.fraction ?? d.fraction, score: row?.score, reactions: own.length ? own : undefined };
  });
  return <GameDots dots={merged} {...rest} />;
}

/** Sześć emotek, pola 48 px: mieszczą się w 360 px. Nazwy tylko dla czytników ekranu. */
const REACTION_NAMES = ["Super", "Śmieszne", "Wow", "Smutne", "Ogień", "Brawo"];
export function ReactionBar({ onReact, className = "" }: { onReact: (index: number) => void; className?: string }) {
  return (
    <div className={`flex justify-center gap-1 ${className}`} role="group" aria-label="Reakcje">
      {REACTIONS.map((emoji, i) => (
        <button key={emoji} type="button" className="grid size-12 place-items-center rounded-full text-2xl leading-none transition-colors duration-100 active:bg-line-hover" aria-label={REACTION_NAMES[i]} onClick={() => onReact(i)}>
          {emoji}
        </button>
      ))}
    </div>
  );
}

/** Ekran partii nie ma miejsca na pasek: jeden przycisk, a pasek otwiera się nad planszą i niczego nie przesuwa. */
export function ReactionToggle({ onReact }: { onReact: (index: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative -my-3 ml-auto">
      <button type="button" className="btn-icon" aria-expanded={open} aria-label={open ? "Zwiń reakcje" : "Pokaż reakcje"} onClick={() => setOpen(!open)}>
        <Smiley size={24} aria-hidden />
      </button>
      {open && (
        <ReactionBar
          className="absolute top-full right-0 z-40 rounded-full border border-line bg-surface p-1"
          onReact={(i) => {
            onReact(i);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** Reakcje bez kropki, nad którą mogłyby się unieść: obserwator, Kampus Tour, własne nagłówki gier, ekran po partii. Kropka koloru mówi, od kogo. */
export function ReactionOverlay({ store, anchored, color, landscape = false }: { store: ReactionStore; anchored: string[]; color: (id: string) => string | undefined; landscape?: boolean }) {
  const floating = useSyncExternalStore(store.subscribe, store.get).filter((r) => !anchored.includes(r.id));
  const row = (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-50 flex justify-center gap-3" aria-hidden>
      {floating.map((r) => (
        <span key={r.key} className="flex animate-[reaction-float_1.2s_ease-out_forwards] items-center gap-1 text-2xl leading-none">
          <span className="size-2 rounded-full" style={{ backgroundColor: color(r.id) }} />
          {REACTIONS[r.index]}
        </span>
      ))}
    </div>
  );
  // Kampus Tour w pionie jest obrócony: nakładka obraca się razem z nim.
  return landscape ? <div className="landscape pointer-events-none z-50">{row}</div> : row;
}

/** Gracze na żywo u tego, kto skończył, i u obserwatora: zamiast samego czekania. */
export function LiveBoard({ store, def, room, progressOf, nick, color, me }: LiveProps & { nick: (id: string) => string; color: (id: string) => string | undefined; me: string }) {
  const live = useSyncExternalStore(store.subscribe, store.get);
  if (!room) return null;
  const rows = [...liveDots(def, room, live, progressOf)].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return (
    <ul className="tile flex flex-col gap-1.5 p-3" aria-label="Wyniki na żywo">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-2 text-sm">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color(r.id) }} aria-hidden />
          <span className="min-w-0 flex-1 truncate">{nick(r.id)}{r.id === me && " (ty)"}</span>
          <span className="text-xs text-fg-muted">{r.done ? "skończył" : "gra"}</span>
          <span className="w-8 text-right font-mono font-semibold tabular-nums">{r.score}</span>
        </li>
      ))}
    </ul>
  );
}

/** Wspólny komunikat o ważnej chwili, w kolorze gracza, którego dotyczy. Nieklikalny i poza układem: nie zjada dotknięć ani nie przesuwa gry. */
export function Moment({ store, color }: { store: MomentStore; color: (id: string) => string | undefined }) {
  const moment = useSyncExternalStore(store.subscribe, store.get);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4" role="status">
      {moment && (
        <span key={moment.id} className="animate-[moment-in_1.2s_ease-out_forwards] rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-semibold" style={{ color: color(moment.playerId) }}>
          {moment.text}
        </span>
      )}
    </div>
  );
}

const REVEAL_STEP_MS = 600;

/** Miejsce w bohaterze na linię najlepszej rundy z gry; poza ekranem po partii (np. „Rekordy”) brak, więc linii nie ma. */
export const HeroSlot = createContext<HTMLElement | null>(null);

/**
 * Bohater po partii: tytuł i po wierszu na gracza. `reveal`: wiersze od ostatniego co 0,6 s, tytuł na końcu;
 * dotknięcie gdziekolwiek kończy pokaz, a przyciski działają przez cały czas. `rowsOnly`: same wiersze pod cudzym tytułem (Kampus Tour).
 */
export function ResultHero({ hero, winner, me, nick, color, reveal = false, rowsOnly = false, onDone, slot }: {
  hero: Hero;
  winner?: string;
  me: string;
  nick: (id: string) => string;
  color: (id: string) => string | undefined;
  reveal?: boolean;
  rowsOnly?: boolean;
  onDone?: () => void;
  slot?: Ref<HTMLDivElement>;
}) {
  const count = hero.rows.length;
  const animated = reveal && !rowsOnly;
  const [shown, setShown] = useState(animated ? 1 : count);
  // Pop tylko dla wierszy z pokazu: dotknięcie stawia resztę od razu.
  const [pop, setPop] = useState(animated);
  useEffect(() => {
    if (!animated) return;
    if (shown >= count) return onDone?.();
    const timer = setTimeout(() => setShown((n) => n + 1), REVEAL_STEP_MS);
    const finish = () => {
      setPop(false);
      setShown(count);
    };
    window.addEventListener("pointerdown", finish);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", finish);
    };
    // `animated` i `onDone` z chwili montażu: rodzic gasi `reveal` właśnie przez `onDone`.
  }, [shown, count]);

  const visible = new Set(revealOrder(hero.rows).slice(0, shown).map((r) => r.id));
  const list = count > 0 && (
    <ol className={`flex flex-col gap-1 overflow-x-clip ${rowsOnly ? "text-sm" : ""}`}>
      {hero.rows.map((r) => (
        <li
          key={r.id}
          className={`flex items-center gap-3 ${visible.has(r.id) ? (pop ? "animate-[stone-pop_0.35s_ease-out]" : "") : "invisible"}`}
        >
          <span className="w-5 shrink-0 font-mono text-fg-muted tabular-nums">{r.place}.</span>
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color(r.id) }} aria-hidden />
          <span className={`min-w-0 flex-1 break-words ${r.place === 1 ? "font-semibold" : ""}`}>
            {nick(r.id)}
            {r.id === me && <span className="font-normal text-fg-muted"> (ty)</span>}
          </span>
          {r.score && (
            <span className="flex shrink-0 flex-col items-end font-mono tabular-nums">
              <span className={r.place === 1 ? "font-semibold" : ""}>{r.score}</span>
              {r.gap && <span className="text-xs text-fg-muted">{r.gap}</span>}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
  if (rowsOnly) return list || null;

  const titleShown = shown >= count;
  return (
    <section aria-label="Wynik partii" className="tile flex flex-col gap-3 p-4">
      {/* Największy tekst po partii; podbicie tylko u zwycięzcy, jak dotąd w nagłówku. */}
      <h1
        className={`origin-left text-3xl font-semibold tracking-tight break-words ${titleShown ? (winner === me ? "animate-[title-pop_0.5s_cubic-bezier(0.2,0.8,0.4,1)]" : "") : "invisible"}`}
        style={winner ? { color: color(winner) } : undefined}
      >
        {hero.title}
      </h1>
      {list}
      {slot && <div ref={slot} className={`text-sm text-fg-muted empty:hidden ${titleShown ? "" : "invisible"}`} />}
    </section>
  );
}

/**
 * Własny ekran gry pod „Szczegółami”. Zawsze ten sam element, także w trakcie partii (bez pudełka, `contents`):
 * `<details>` tylko po partii przemontowałby grę w chwili końca i zgubił wibrację szkody z ostatniego ruchu.
 */
export function ResultDetails({ collapsible, children }: { collapsible: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!collapsible) setOpen(false);
  }, [collapsible]);
  return (
    <>
      {collapsible && (
        <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" aria-expanded={open} onClick={() => setOpen(!open)}>
          <CaretDown size={16} weight="bold" className={`transition-transform duration-180 ${open ? "rotate-180" : ""}`} aria-hidden />
          Szczegóły
        </button>
      )}
      <div className={collapsible && !open ? "hidden" : "contents"}>{children}</div>
    </>
  );
}

/** Wyniki mini-gry: wiersz na gracza, w kolejności rankingu po końcu partii. */
export function Scores({ rows }: { rows: { id: string; nick: string; color?: string; me: boolean; score: string | null }[] }) {
  return (
    <ol className="tile flex flex-col gap-1 p-4">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: r.color }} aria-hidden />
          <span className="flex-1">
            {r.nick}
            {r.me && <span className="text-fg-muted"> (ty)</span>}
          </span>
          <span className={`text-right font-mono tabular-nums ${r.score === null ? "text-fg-muted" : ""}`}>{r.score ?? "gra…"}</span>
        </li>
      ))}
    </ol>
  );
}

/** Komórka `ScoreTable`: `span` łączy kolumny (np. „brak trafień”), `muted` to tekst zamiast liczby, `warn` barwi liczbę (błędy). */
export interface ScoreCell {
  value: ReactNode;
  span?: number;
  muted?: boolean;
  warn?: boolean;
}

/**
 * Drugi wspólny wzorzec wyników (obok `Scores`): gracz i kilka kolumn liczb, gdy jedna liczba nie wystarcza
 * (quizy, Dziesiątki, Stój!, Refleks). Puchar u zwycięzcy, miejsca z remisami po końcu (`ranked`), „(ty)”, „gra…” dla grających.
 */
export function ScoreTable({
  heads,
  rows,
  winner,
  ranked = false,
  note,
  children,
}: {
  heads: ReactNode[];
  /** `cells: null` = gracz jeszcze gra. */
  rows: { id: string; nick: string; color?: string; me: boolean; place?: number; cells: ScoreCell[] | null }[];
  winner?: string;
  ranked?: boolean;
  note?: ReactNode;
  /** Szczegół pod tabelą, np. wykres reakcji w Refleksie. */
  children?: ReactNode;
}) {
  return (
    <section className="tile flex flex-col gap-3 p-4">
      <table className="w-full border-separate border-spacing-y-1 whitespace-nowrap tabular-nums">
        <thead>
          <tr className="label text-right">
            <th className="w-full px-2 text-left font-normal">Gracz</th>
            {heads.map((head, i) => (
              <th key={i} className="px-1.5 font-normal">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={`text-right font-mono tabular-nums text-sm ${r.id === winner ? "font-semibold" : ""}`}
              style={r.id === winner ? { backgroundColor: `color-mix(in srgb, ${r.color} 16%, transparent)` } : undefined}
            >
              <td className="max-w-0 rounded-l-inset px-2 py-1.5 text-left font-sans text-base">
                <span className="flex items-center gap-2">
                  {r.id === winner ? (
                    <Trophy size={16} weight="fill" color={r.color} className="w-5 shrink-0" aria-label="Zwycięzca" />
                  ) : ranked && r.place !== undefined ? (
                    <span className="w-5 shrink-0 font-mono tabular-nums" style={{ color: r.color }}>
                      {r.place}.
                    </span>
                  ) : (
                    <span className="mx-[5px] size-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} aria-hidden />
                  )}
                  {/* Nick się zawija, nie ucina: kolumny liczb zostawiają mu mało miejsca. */}
                  <span className="min-w-0 whitespace-normal break-words">
                    {r.nick}
                    {r.me && <span className="text-fg-muted"> (ty)</span>}
                  </span>
                </span>
              </td>
              {r.cells === null ? (
                <td colSpan={heads.length} className="rounded-r-inset px-2 font-sans text-fg-muted">
                  gra…
                </td>
              ) : (
                r.cells.map((c, i) => (
                  <td
                    key={i}
                    colSpan={c.span}
                    className={`${i === r.cells!.length - 1 ? "rounded-r-inset pr-2 pl-1.5" : "px-1.5"} ${c.muted ? "font-sans text-fg-muted" : ""} ${c.warn ? "text-warning" : ""}`}
                  >
                    {c.value}
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {children}
      {note && <p className="text-sm text-fg-muted">{note}</p>}
    </section>
  );
}

/** Pasek statystyk nad planszą mini-gry: każda liczba ma etykietę, `warn` barwi wartość (kara, błędy). */
export function Stats({ items }: { items: { label: string; value: ReactNode; warn?: boolean }[] }) {
  return (
    <dl className="flex justify-between gap-3 rounded-inset border border-line bg-surface px-4 py-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center first:items-start last:items-end">
          <dt className="label">{item.label}</dt>
          <dd className={`font-mono text-lg leading-tight font-semibold tabular-nums ${item.warn ? "text-warning" : ""}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** „12,3”: jedno miejsce po przecinku, z przecinkiem. */
/** Krok odświeżania pasków czasu; przejście szerokości trwa tyle samo, więc pasek jedzie płynnie i liniowo. */
export const TICK_MS = 250;

/**
 * Pasek czasu liczony z zegara od zamontowania: działa przy prefers-reduced-motion (wtedy skacze co krok) i po powrocie do karty.
 * `fill` rośnie od zera, bez niego maleje. Kolor z `color` albo z klasy `bar`.
 */
export function TimeBar({ ms, fill = false, color, bar = "" }: { ms: number; fill?: boolean; color?: string; bar?: string }) {
  const [start] = useState(() => performance.now());
  const [now, setNow] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);
  const done = Math.min(1, (now - start) / ms);
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
      <div className={`h-full transition-[width] duration-250 ease-linear ${bar}`} style={{ width: `${(fill ? done : 1 - done) * 100}%`, backgroundColor: color }} />
    </div>
  );
}

/** Liczba z przecinkiem dziesiętnym i typograficznym minusem; zaokrąglone do zera nie dostaje znaku („0,0”, nie „−0,0”). */
/** „do minuty”, „do 3 minut”: limit całej partii mini-gry w punkcie `time` ekranu Intro. */
export const upTo = (seconds: number) => (seconds === 60 ? "do minuty" : seconds % 60 ? `do ${seconds} s` : `do ${seconds / 60} minut`);

export function decimal(n: number, digits: number): string {
  const text = Math.abs(n).toFixed(digits).replace(".", ",");
  return n < 0 && Number(text.replace(",", ".")) !== 0 ? `−${text}` : text;
}

export const tenth = (n: number) => decimal(n, 1);

/** Kolor według celności błędu: do `perfect` zielony, powyżej `close` ostrzegawczy. */
export const grade = (d: number, perfect: number, close: number) =>
  d <= perfect ? { text: "text-success", stroke: "stroke-success" } : d <= close ? { text: "", stroke: "stroke-fg" } : { text: "text-warning", stroke: "stroke-warning" };

/** „Najlepsza runda: Ola, Gdańsk, 4 km”; null, gdy gra nie ma błędów do porównania (`best`) albo najlepszej chwili nie ma jednej. */
export function bestRoundLine({ rows, heads, labels, unit, shortUnit, format, best = true }: {
  rows: { id: string; nick: string; errors: number[] }[];
  heads: ReactNode[];
  labels?: string[];
  unit: string;
  shortUnit?: string;
  format: (d: number, round: number, row: string) => ReactNode;
  best?: boolean;
}) {
  const top = best ? bestRound(rows) : null;
  if (!top) return null;
  const head = heads[top.round];
  const name = labels?.[top.round] ?? (typeof head === "number" ? `runda ${head}` : head);
  const cell = format(top.error, top.round, top.id);
  const value = typeof cell === "string" || typeof cell === "number" ? cell : top.error;
  const short = shortUnit ?? unit;
  const nick = rows.find((r) => r.id === top.id)!.nick;
  return `Najlepsza runda: ${nick}, ${name}, ${value}${short === "%" || !short ? short : ` ${short}`}`;
}

/**
 * Tabela rund po mini-grze „na oko”: rundy w kolumnach, gracze w wierszach, w komórce błąd rundy (mniej lepiej).
 * Jedyny najmniejszy błąd w rundzie ma tło w kolorze gracza; przy remisie albo jednym graczu nikt.
 */
export function RoundTable({
  heads,
  rows,
  perfect,
  close,
  unit,
  format = tenth,
  legend,
  children,
  goal,
  tone,
  caption,
  labels,
  shortUnit,
  best = true,
}: {
  heads: ReactNode[];
  /** Pusta lista `errors` = gracz nie odpowiedział (limit czasu). `score` (opcjonalny) stoi w wierszu gracza; `null` = gra…. */
  rows: { id: string; nick: string; color?: string; me: boolean; errors: number[]; score?: string | null }[];
  perfect: number;
  close: number;
  /** Czego dotyczy liczba, np. „% tortu”. */
  unit: string;
  /** Zapis błędu w komórce (np. ze znakiem kierunku); domyślnie jedno miejsce po przecinku. */
  format?: (d: number, round: number, row: string) => ReactNode;
  /** Tekst progów pod tabelą; domyślnie progi w procentach. */
  legend?: ReactNode;
  /** Dopisek między tabelą a legendą, np. lista miast w Mapie. */
  children?: ReactNode;
  /** Wiersz celów pod nagłówkami (prawdziwe wartości rund), np. „Cel” w Przytrzymaj. */
  goal?: { label: ReactNode; values: ReactNode[] };
  /** Własny kolor komórki zamiast progów; wyłącza wyróżnienie najlepszego w rundzie (Balon: stuknięcia, nie błąd). */
  tone?: (d: number, round: number) => { className: string; label?: string };
  /** Własny podpis pod tabelą zamiast opisu błędu i progów. */
  caption?: ReactNode;
  /** Nazwy rund do linii najlepszej rundy (miasta w Mapie). */
  labels?: string[];
  /** Jednostka w linii najlepszej rundy, gdy `unit` to cały opis („% tortu do przełożenia”); pusta, gdy zapis komórki ma ją już w sobie. */
  shortUnit?: string;
  /** false: bez linii najlepszej rundy (Balon: stuknięcia, nie błąd; Przytrzymaj: cisza pomiaru). */
  best?: boolean;
}) {
  const slot = useContext(HeroSlot);
  const line = slot && bestRoundLine({ rows, heads, labels, unit, shortUnit, format, best });
  const played = rows.filter((r) => r.errors.length);
  const bestIn = (round: number) => {
    const sorted = [...played].sort((a, b) => a.errors[round] - b.errors[round]);
    return !tone && sorted.length > 1 && sorted[0].errors[round] < sorted[1].errors[round] ? sorted[0].id : null;
  };
  return (
    <section className="tile flex flex-col gap-2 p-3">
      {line && slot && createPortal(<p>{line}</p>, slot)}
      <div className="grid gap-1 text-center font-mono text-xs tabular-nums" style={{ gridTemplateColumns: `repeat(${heads.length}, minmax(0, 1fr))` }}>
        {heads.map((head, i) => (
          <span key={i} className="text-fg-muted">
            {head}
          </span>
        ))}
        {goal && (
          <>
            <span className="col-span-full text-left font-sans text-sm text-fg-muted">{goal.label}</span>
            {goal.values.map((v, i) => (
              <span key={i} className="rounded-inset border border-line py-1 text-fg-muted">
                {v}
              </span>
            ))}
          </>
        )}
        {rows.map((r) => (
          <Fragment key={r.id}>
            <span className="col-span-full mt-1 flex items-center gap-2 text-left font-sans text-sm">
              <span className="size-2 rounded-full" style={{ backgroundColor: r.color }} aria-hidden />
              {r.nick}
              {r.me && <span className="text-fg-muted">(ty)</span>}
              {/* Z wynikiem w wierszu puste rundy mogą być po prostu ukryte (rywal w trakcie), więc bez dopisku. */}
              {!r.errors.length && r.score === undefined && <span className="text-fg-muted">bez odpowiedzi</span>}
              {r.score !== undefined && (
                <span className={`ml-auto font-mono tabular-nums ${r.score === null ? "text-fg-muted" : "font-semibold"}`}>{r.score ?? "gra…"}</span>
              )}
            </span>
            {r.errors.map((d, i) => {
              const own = tone?.(d, i);
              return (
                <span
                  role="img"
                  key={i}
                  aria-label={own?.label}
                  className={`rounded-inset border py-1 ${own ? own.className : `${grade(d, perfect, close).text} ${d <= perfect ? "font-semibold" : ""}`} ${bestIn(i) === r.id ? "" : "border-line"}`}
                  style={bestIn(i) === r.id ? { borderColor: r.color, backgroundColor: `color-mix(in srgb, ${r.color} 28%, transparent)` } : undefined}
                >
                  {format(d, i, r.id)}
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      {children}
      <p className="text-xs text-fg-muted">
        {caption ?? (
          <>
            Błąd w każdej rundzie ({unit}){played.length > 1 && "; tło w kolorze gracza ma najlepszy w rundzie"}. {legend ?? `Zielony: do ${perfect}%, czerwony: ponad ${close}%.`}
          </>
        )}
      </p>
    </section>
  );
}

/** Przycisk przyklejony do dołu ekranu: przy otwartej klawiaturze i długiej liście zostaje pod kciukiem. */
export function StickyBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`sticky bottom-0 -mx-4 flex items-center gap-3 bg-bg/90 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur ${className}`}>{children}</div>;
}

/** To, czego ekran instrukcji potrzebuje z pokoju; podaje `Game.tsx`, żeby nie przeciągać tego przez propsy każdej gry. */
export const IntroContext = createContext<{
  game: NonNullable<RoomView["game"]>;
  seated: boolean;
  me: string;
  myNick: string;
  myColor: string;
  others: { id: string; nick: string; color: string; began: boolean }[];
  begin: () => void;
  /** Rekord gry do pobicia, jedna linia pod przyciskiem „Start”. */
  record?: string;
} | null>(null);

/**
 * Ekran instrukcji mini-gry: podgląd, trzy punkty (czas, co zrobić, jak liczone są punkty) i „Start”.
 * Limit gry jeszcze nie tyka; serwer zamyka instrukcję po Start wszystkich albo po INTRO_SECONDS przy 2+ grających.
 * Rewanż solo pomija instrukcję na prośbę serwera, z tym samym zabezpieczeniem przed podwójnym startem.
 */
export function Intro({ time, task, score, preview, onStart }: { time: ReactNode; task: ReactNode; score: ReactNode; preview: ReactNode; onStart: () => void }) {
  const room = useContext(IntroContext);
  const live = room?.game.intro ?? false;
  const stage = introStage({ seated: room?.seated ?? true, solo: !room || room.others.length === 0, began: room?.game.began.includes(room.me) ?? false, countdown: room?.game.countdown ?? false, intro: live });
  // Termin od chwili odebrania wiadomości, jak w liczniku tury.
  const { deadline, receivedAt } = useMemo(() => {
    const at = Date.now();
    return { deadline: live && room?.game.msLeft != null ? at + room.game.msLeft : null, receivedAt: at };
  }, [room?.game]);
  const [now, setNow] = useState(Date.now);
  const seen = useRef(live);
  const began = useRef(false);
  const started = useRef(false);

  function startGame() {
    if (started.current) return;
    started.current = true;
    onStart();
  }

  // „Gotowy” zgłasza się raz. Przy 2+ grających pomiar rusza dopiero po zamknięciu instrukcji przez serwer (po 3-2-1).
  function ready() {
    if (began.current) return;
    began.current = true;
    room?.begin();
    if (!room || room.others.length === 0) startGame();
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), stage === "countdown" ? 100 : 250);
    return () => clearInterval(id);
  }, [stage === "countdown"]);

  // Po odświeżeniu w trakcie partii instrukcja jest już zamknięta: wtedy nic nie rusza samo, tyka zwykły limit.
  useEffect(() => {
    if (room && autoStart(room.game)) ready();
    if (live) seen.current = true;
    else if (startsAfterClose({ seen: seen.current, intro: live })) startGame();
  }, [live, room?.game.skipIntro]);

  const seconds = secondsLeft({ deadline, now, receivedAt });
  return (
    <section className="tile my-auto flex flex-col gap-4 p-4">
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-inset border border-line bg-bg" aria-hidden>
        {preview}
        {stage === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/80">
            <span key={seconds} className="intro-count text-6xl font-bold tabular-nums">
              {seconds}
            </span>
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {(
          [
            [Timer, time],
            [HandTap, task],
            [Trophy, score],
          ] as const
        ).map(([PointIcon, text], i) => (
          <li key={i} className="flex items-start gap-3">
            <PointIcon size={20} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1">
        {stage === "reads" && (
          <button type="button" className="btn btn-primary w-full" onClick={ready}>
            {room && room.others.length > 0 ? "Gotowy" : "Start"}
          </button>
        )}
        {stage === "ready" && <p className="text-center text-fg-muted">Czekamy na pozostałych</p>}
        {stage === "countdown" && (
          <p className="text-center text-fg-muted" role="status">
            Start za {seconds}
          </p>
        )}
        {(stage === "reads" || stage === "watching") && deadline !== null && room && room.others.length > 0 && (
          <p className="text-center text-sm text-fg-muted tabular-nums">Start automatycznie za {seconds} s</p>
        )}
        {room?.record && <p className="text-center text-sm text-fg-muted tabular-nums">{room.record}</p>}
      </div>
      {room && room.others.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-fg-muted" role="status">
          {room.others.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
              {p.nick} {p.began ? "gotowy" : "czyta zasady"}
            </li>
          ))}
          {room.seated && (
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: room.myColor }} aria-hidden />
              {room.myNick} {room.game.began.includes(room.me) ? "gotowy" : "czyta zasady"}
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

/**
 * Klucze zastane przy montażu (wejście, odświeżenie, reconnect) i obecne od tamtej pory bez przerwy.
 * Klucz, który zniknie (np. rewanż czyści planszę), przestaje być zastany, więc jego ponowne pojawienie jest nowe.
 */
export function seenAtMount<K>(seen: Set<K> | null, present: Iterable<K>): Set<K> {
  const now = new Set(present);
  if (!seen) return now;
  for (const k of seen) if (!now.has(k)) seen.delete(k);
  return seen;
}

/** O tyle musi zmaleć widoczna wysokość, żeby uznać to za klawiaturę, a nie pasek przeglądarki. */
const KEYBOARD_PX = 120;

/** Czy jest otwarta klawiatura: widoczna wysokość wyraźnie mniejsza od największej zauważonej przy tej szerokości. */
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    const visible = () => viewport?.height ?? window.innerHeight;
    let width = window.innerWidth;
    let tallest = visible();
    const check = () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        tallest = 0;
      }
      tallest = Math.max(tallest, visible());
      setOpen(visible() < tallest - KEYBOARD_PX);
    };
    viewport?.addEventListener("resize", check);
    window.addEventListener("resize", check);
    return () => {
      viewport?.removeEventListener("resize", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  return open;
}

/** Zastany stan pokazujemy od razu; `isNew` mówi, czy element pojawił się po montażu i może dostać animację pojawienia. */
export function useFresh<K>(present: Iterable<K>) {
  const seen = useRef<Set<K> | null>(null);
  seen.current = seenAtMount(seen.current, present);
  const initial = seen.current;
  return { isNew: (k: K) => !initial.has(k) };
}
