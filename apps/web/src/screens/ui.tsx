import { ArrowLeft, Check, HandTap, ShareNetwork, SignOut, Timer, Trophy, WifiSlash } from "@phosphor-icons/react";
import type { RoomView } from "@kwadrans/games";
import { createContext, Fragment, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

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

/** Górny wiersz ekranów przed partią: gospodarz wraca do listy gier, gość wychodzi z pokoju; po prawej kod pokoju z udostępnianiem, w środku opcjonalny dodatek ekranu. */
export function TopBar({ code, onBack, onLeave, children }: { code: string; onBack?: () => void; onLeave: () => void; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${location.origin}/?kod=${code}`;
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
    <div className="flex items-center justify-between">
      <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 px-2 text-sm text-fg-muted" onClick={onBack ?? onLeave}>
        {onBack ? <ArrowLeft size={16} aria-hidden /> : <SignOut size={16} aria-hidden />}
        {onBack ? "Gry" : "Wyjdź"}
      </button>
      {children}
      <button type="button" className="-mr-2 flex min-h-12 items-center gap-2 px-2" onClick={share} aria-label={`Kod pokoju ${code}, udostępnij link`}>
        <span className="text-sm text-fg-muted">{copied ? "Skopiowano!" : "Kod"}</span>
        <span className="font-mono text-lg font-medium tracking-[0.12em]">{code}</span>
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
  /** Wygrane partie w pokoju albo punkty turnieju; zera nie pokazujemy. */
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
          aria-label={`${d.nick}${d.me ? " (ty)" : ""}${d.status ? `, ${d.status}` : ""}${d.badge ? `, ${square ? "punkty w turnieju" : "wygrane partie"}: ${d.badge}` : ""}`}
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
          {d.plus && (
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 animate-[float-up_1.6s_ease-out_forwards] font-mono text-sm" style={{ color: d.color }} aria-hidden>
              +1
            </span>
          )}
        </span>
      ))}
    </button>
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
              className={`text-right font-mono text-sm ${r.id === winner ? "font-semibold" : ""}`}
              style={r.id === winner ? { backgroundColor: `color-mix(in srgb, ${r.color} 16%, transparent)` } : undefined}
            >
              <td className="max-w-0 rounded-l-inset px-2 py-1.5 text-left font-sans text-base">
                <span className="flex items-center gap-2">
                  {r.id === winner ? (
                    <Trophy size={16} weight="fill" color={r.color} className="w-5 shrink-0" aria-label="Zwycięzca" />
                  ) : ranked && r.place !== undefined ? (
                    <span className="w-5 shrink-0 font-mono" style={{ color: r.color }}>
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

export const tenth = (n: number) => n.toFixed(1).replace(".", ",");

/** Kolor według celności błędu: do `perfect` zielony, powyżej `close` ostrzegawczy. */
export const grade = (d: number, perfect: number, close: number) =>
  d <= perfect ? { text: "text-success", stroke: "stroke-success" } : d <= close ? { text: "", stroke: "stroke-fg" } : { text: "text-warning", stroke: "stroke-warning" };

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
}) {
  const played = rows.filter((r) => r.errors.length);
  const best = (round: number) => {
    const sorted = [...played].sort((a, b) => a.errors[round] - b.errors[round]);
    return !tone && sorted.length > 1 && sorted[0].errors[round] < sorted[1].errors[round] ? sorted[0].id : null;
  };
  return (
    <section className="tile flex flex-col gap-2 p-3">
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
                  key={i}
                  aria-label={own?.label}
                  className={`rounded-inset border py-1 ${own ? own.className : `${grade(d, perfect, close).text} ${d <= perfect ? "font-semibold" : ""}`} ${best(i) === r.id ? "" : "border-line"}`}
                  style={best(i) === r.id ? { borderColor: r.color, backgroundColor: `color-mix(in srgb, ${r.color} 28%, transparent)` } : undefined}
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
  others: { id: string; nick: string; color: string; began: boolean }[];
  begin: () => void;
  /** Rekord gry do pobicia, jedna linia pod przyciskiem „Start”. */
  record?: string;
} | null>(null);

/**
 * Ekran instrukcji mini-gry: podgląd, trzy punkty (czas, co zrobić, jak liczone są punkty) i „Start”.
 * Limit gry jeszcze nie tyka; gdy serwer zamknie instrukcję (wszyscy wystartowali albo minęło INTRO_SECONDS), gra rusza sama.
 */
export function Intro({ time, task, score, preview, onStart }: { time: ReactNode; task: ReactNode; score: ReactNode; preview: ReactNode; onStart: () => void }) {
  const room = useContext(IntroContext);
  const live = room?.game.intro ?? false;
  // Termin od chwili odebrania wiadomości, jak w liczniku tury.
  const deadline = useMemo(() => (live && room?.game.msLeft != null ? Date.now() + room.game.msLeft : null), [room?.game]);
  const [now, setNow] = useState(Date.now);
  const seen = useRef(live);
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    room?.begin();
    onStart();
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Po odświeżeniu w trakcie partii instrukcja jest już zamknięta: wtedy nic nie rusza samo, tyka zwykły limit.
  useEffect(() => {
    if (live) seen.current = true;
    else if (seen.current) start();
  }, [live]);

  return (
    <section className="tile my-auto flex flex-col gap-4 p-4">
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-inset border border-line bg-bg" aria-hidden>
        {preview}
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
        <button type="button" className="btn btn-primary w-full" onClick={start}>
          Start
        </button>
        {deadline !== null && (
          <p className="text-center text-sm text-fg-muted tabular-nums">Start automatycznie za {Math.max(0, Math.ceil((deadline - now) / 1000))} s</p>
        )}
        {room?.record && <p className="text-center text-sm text-fg-muted tabular-nums">{room.record}</p>}
      </div>
      {room && room.others.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-fg-muted" role="status">
          {room.others.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.nick} {p.began ? "już gra" : "czyta zasady"}
            </li>
          ))}
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

/** Zastany stan pokazujemy od razu; `isNew` mówi, czy element pojawił się po montażu i może dostać animację pojawienia. */
export function useFresh<K>(present: Iterable<K>) {
  const seen = useRef<Set<K> | null>(null);
  seen.current = seenAtMount(seen.current, present);
  const initial = seen.current;
  return { isNew: (k: K) => !initial.has(k) };
}
