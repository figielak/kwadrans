import { ArrowCounterClockwise, Check, Eraser, PaperPlaneRight, PencilSimple, Trash } from "@phosphor-icons/react";
import { initials, KALAMBURY_ANSWER_MAX, KALAMBURY_BATCH_POINTS, KALAMBURY_ERASER, KALAMBURY_MAX_POINTS, KALAMBURY_SIDE, type KalamburyMove, type KalamburyStroke, type KalamburyView, type LobbyPlayer } from "@kwadrans/games";
import { type FormEvent, type PointerEvent, type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Scores, StickyBar, useKeyboardOpen } from "../screens/ui.tsx";

interface Props {
  view: KalamburyView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  /** Pasek czasu fazy; bez niego (koniec partii) nagłówek gry chowa się, bo pokazuje go ekran gry. */
  timer?: ReactNode;
  /** Ikona „Jak grać” z ekranu gry; stoi w nagłówku obok rundy. */
  help?: ReactNode;
  onMove: (move: KalamburyMove) => void;
}

/** Co tyle kreska leci na serwer; 5 ruchów na sekundę mieści się w limicie wiadomości pokoju. */
const SEND_MS = 200;
/** Krótszych odcinków nie zapisujemy (w jednostkach płótna 0-1000): mniej danych, a linia dalej gładka. */
const MIN_STEP = 8;
/** Kolory palety w kolejności indeksów z zasad; ostatni (gumka) to kolor płótna. Czarnego nie ma: zniknąłby na ciemnym tle. */
const PALETTE = [
  { name: "Biały", color: "var(--color-fg)" },
  { name: "Żółty", color: "#facc15" },
  { name: "Zielony", color: "#4ade80" },
  { name: "Niebieski", color: "#60a5fa" },
  { name: "Brązowy", color: "#b4763a" },
  { name: "Gumka", color: "var(--color-surface)" },
];
const WIDTH = 10;
const ERASER_WIDTH = 40;
/** Ile czasu czeka drugie dotknięcie „Pasuję”. */
const CONFIRM_MS = 3000;
/** Ile ostatnich pudeł widać pod rysunkiem. */
const CHAT_LINES = 3;
/** Poniżej tej wysokości ekranu rysujący widzi jeden strzał: płótno jest ważniejsze. */
const ROOMY_PX = 720;

const outcome = (v: KalamburyView) => (v.guessed.length ? `Zgadło ${v.guessed.length} z ${v.players.length - 1}` : "Nikt nie zgadł");

/** „6 liter”, „2 litery”, „1 litera”. */
function lettersLabel(n: number) {
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `${n} ${n === 1 ? "litera" : few ? "litery" : "liter"}`;
}

export function Kalambury({ view, me, players, ranking, timer, help, onMove }: Props) {
  const player = (id: string) => players.find((p) => p.id === id);
  const nick = (id: string) => player(id)?.nick ?? "Gracz";
  const drawing = view.drawer === me;
  const guessing = view.players.includes(me) && !drawing;
  const live = view.phase === "choose" || view.phase === "draw";
  const keyboard = useKeyboardOpen();
  // Zgadujący pisze: zostają hasło, czas, rysunek i pole.
  const compact = keyboard && view.phase === "draw" && guessing;
  const big = !compact && view.phase !== "choose";
  const labels = initials(view.players.map(nick));
  const dots = view.players.map((id, i) => ({ id, label: labels[i] })).sort((a, b) => Number(b.id === me) - Number(a.id === me));

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Wszystko w jednym nagłówku, bo jego wysokość mierzy płótno. Pozycje dzieci są stałe: przestawiony pasek czasu liczyłby od nowa. */}
      {timer && (
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {!compact && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="label min-w-0">
                Runda {view.round + 1}/{view.rounds} · {view.phase === "reveal" ? "to było" : drawing ? "rysujesz" : `rysuje ${nick(view.drawer)}`}
                {!view.players.includes(me) && " · oglądasz"}
              </span>
              {help}
            </div>
          )}
          {/* Tytuł w kolorze gracza tylko u rysującego: to jego tura, jak „Twój ruch” w innych grach. */}
          <h1 className={`leading-tight font-semibold ${compact ? "text-xl" : "w-full"} ${big ? "text-3xl" : "text-xl"}`} style={drawing && live ? { color: player(me)?.color } : undefined}>
            {view.phase === "choose" ? (
              drawing ? "Wybierz hasło" : `${nick(view.drawer)} wybiera hasło`
            ) : view.word ? (
              view.word
            ) : (
              <>
                <span role="img" className="font-mono tabular-nums tracking-[0.3em]" aria-label={`Hasło, liter: ${view.hint.length}${view.revealed.length ? `, odsłonięta: ${view.hint.replace(/_/g, "")}` : ""}`}>
                  {view.hint}
                </span>
                {!compact && <span className="ml-1 text-sm font-normal whitespace-nowrap text-fg-muted" aria-hidden>{lettersLabel(view.hint.replace(/ /g, "").length)}</span>}
              </>
            )}
          </h1>
          {view.phase === "reveal" && <p className="w-full text-sm text-fg-muted">{outcome(view)}</p>}
          {/* Kropki mają stałą szerokość i odznaki poza układem: 6 osób w linii, a trafienie nie zmienia rozmiaru płótna. W odsłonie punkty są w tabeli. */}
          {!compact && view.phase !== "reveal" && (
            <ul className="flex w-full items-center gap-2" aria-label="Gracze">
              {dots.map(({ id, label }) => (
                <li key={id} className="flex w-12 shrink-0 items-center gap-1">
                  <span className="relative shrink-0">
                    <span className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold text-bg ${id === me ? "outline-1 outline-offset-2 outline-fg-muted" : ""}`} style={{ backgroundColor: player(id)?.color }} aria-hidden>
                      {label}
                    </span>
                    {id === view.drawer && (
                      <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border border-line bg-bg">
                        <PencilSimple size={10} weight="bold" className="text-fg" aria-label="rysuje" />
                      </span>
                    )}
                    {view.guessed.includes(id) && (
                      <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border border-line bg-bg">
                        <Check size={10} weight="bold" className="text-success" aria-label="trafione" />
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-xs text-fg-muted tabular-nums" aria-hidden>{view.totals[id]}</span>
                  <span className="sr-only">
                    {nick(id)}
                    {id === me && " (ty)"}, {view.totals[id]} pkt
                  </span>
                </li>
              ))}
            </ul>
          )}
          {/* Czas tuż nad płótnem; przy klawiaturze w jednym wierszu z hasłem. */}
          <div className={compact ? "min-w-24 flex-1" : "-mb-1.5 w-full"}>{timer}</div>
        </header>
      )}

      {/* Hasła przy dolnej krawędzi, w zasięgu kciuka; w pustym miejscu wyjaśnienie, co zrobi limit. */}
      {view.phase === "choose" && drawing && (
        <div className="flex flex-1 flex-col gap-2">
          <p className="grid flex-1 place-items-center text-center text-sm text-fg-muted">Gdy czas minie, dostaniesz pierwsze hasło z listy.</p>
          {view.choices.map((word, i) => (
            <button key={word} type="button" className="btn btn-ghost w-full text-lg" onClick={() => onMove({ type: "choose", index: i })}>
              {word}
            </button>
          ))}
        </div>
      )}

      {view.phase === "draw" && drawing && <Pad key={view.round} view={view} nick={nick} onMove={onMove} />}

      {((view.phase === "choose" && !drawing) || (view.phase === "draw" && !drawing)) && (
        <Guess view={view} me={me} color={player(me)?.color} canGuess={guessing && view.phase === "draw"} compact={compact} nick={nick} onMove={onMove} />
      )}

      {(view.phase === "reveal" || view.phase === "over") && <Outcome view={view} me={me} ranking={ranking} color={(id) => player(id)?.color} nick={nick} onMove={onMove} />}
    </div>
  );
}

/** Rysunek i wyniki po rundzie. Odsłona trwa chwilę, więc mieści się bez przewijania: płótno dostaje to, co zostaje po tabeli. Po partii ekran i tak się przewija. */
function Outcome({ view, me, ranking, color, nick, onMove }: { view: KalamburyView; me: string; ranking?: string[]; color: (id: string) => string | undefined; nick: (id: string) => string; onMove: Props["onMove"] }) {
  const reveal = view.phase === "reveal";
  const top = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const size = useCanvasSize(top, controls, reveal);
  return (
    <>
      {/* Po partii własnego nagłówka nie ma, więc ostatnie hasło stoi nad rysunkiem. */}
      {!reveal && (
        <div>
          <p className="text-xl font-semibold">
            <span className="label mr-2 font-normal">Ostatnie hasło</span>
            {view.word}
          </p>
          <p className="text-sm text-fg-muted">{outcome(view)}</p>
        </div>
      )}
      <div ref={top}>{view.strokes.length ? <Canvas strokes={view.strokes} size={reveal ? size : undefined} /> : <p className="tile p-4 text-center text-sm text-fg-muted">Bez rysunku</p>}</div>
      <div ref={controls} className="mt-auto flex flex-col gap-3">
        <Scores
          rows={(ranking ?? [...view.players].sort((a, b) => view.totals[b] - view.totals[a])).map((id) => ({
            id,
            nick: nick(id),
            color: color(id),
            me: id === me,
            score: String(view.totals[id]),
            // Punkty tej rundy przy sumie; zero nic nie mówi, więc go nie ma.
            detail: (
              <span className="flex items-center gap-1.5 font-mono text-sm text-fg-muted tabular-nums">
                {id === view.drawer && <PencilSimple size={14} weight="bold" aria-label="rysunek" />}
                {view.roundScores[id] > 0 && `+${view.roundScores[id]}`}
              </span>
            ),
          }))}
        />
        {reveal && view.players.includes(me) && (
          <StickyBar>
            <button type="button" className="btn w-full btn-player" style={{ backgroundColor: color(me) }} disabled={view.ready.includes(me)} onClick={() => onMove({ type: "next" })}>
              {view.ready.includes(me) ? `Czekamy na: ${view.players.filter((p) => !view.ready.includes(p)).map(nick).join(", ")}…` : "Dalej"}
            </button>
          </StickyBar>
        )}
      </div>
    </>
  );
}

/** Kreski jako ścieżki; pojedynczy punkt to kropka dzięki zaokrąglonym końcom. Gumka maluje kolorem płótna. */
function Canvas({ strokes, size, children, ...pointer }: { strokes: KalamburyStroke[]; size?: number; children?: ReactNode } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${KALAMBURY_SIDE} ${KALAMBURY_SIDE}`}
      className="mx-auto block aspect-square w-full touch-none select-none rounded-tile border border-line bg-surface [-webkit-touch-callout:none]"
      style={{ maxWidth: size }}
      role="img"
      aria-label="Rysunek"
      {...pointer}
    >
      {strokes.map((s, i) => (
        <path
          key={i}
          d={path(s.points)}
          fill="none"
          stroke={PALETTE[s.color]?.color}
          strokeWidth={s.color === KALAMBURY_ERASER ? ERASER_WIDTH : WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {children}
    </svg>
  );
}

const path = (s: number[]) => "M" + s.slice(0, 2).join(" ") + s.reduce((d, n, i) => (i % 2 ? d : `${d}L${n} ${s[i + 1]}`), "");

/**
 * Płótno rysującego. Rysunek żyje lokalnie (bez czekania na serwer), na serwer leci w paczkach co SEND_MS.
 * Start z rysunku z serwera, więc po odświeżeniu strony nic nie znika.
 */
function Pad({ view, nick, onMove }: { view: KalamburyView; nick: (id: string) => string; onMove: Props["onMove"] }) {
  const [strokes, setStrokes] = useState(view.strokes);
  /** To samo co `strokes`, ale od razu po zmianie (zdarzenia wskaźnika przychodzą szybciej niż render). */
  const local = useRef(view.strokes);
  const [ink, setInk] = useState(0);
  /** Rysunek sprzed „Wyczyść”; „Cofnij” na pustym płótnie go przywraca (tak samo liczy serwer). */
  const [cleared, setCleared] = useState(view.cleared);
  const finger = useRef<number | null>(null);
  /** Punkty jeszcze niewysłane, czy zaczynają nową kreskę i jej kolor. */
  const pending = useRef<{ points: number[]; start: boolean; color: number } | null>(null);
  const count = (all: KalamburyStroke[]) => all.reduce((n, s) => n + s.points.length / 2, 0);
  const top = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const size = useCanvasSize(top, controls);
  const lines = useViewportHeight() >= ROOMY_PX ? CHAT_LINES : 1;
  const full = count(strokes) >= KALAMBURY_MAX_POINTS;
  const draw = (next: KalamburyStroke[]) => setStrokes((local.current = next));

  function flush() {
    const p = pending.current;
    if (!p || p.points.length === 0) return;
    pending.current = { points: [], start: false, color: p.color };
    for (let i = 0; i < p.points.length; i += KALAMBURY_BATCH_POINTS * 2) {
      onMove({ type: "line", points: p.points.slice(i, i + KALAMBURY_BATCH_POINTS * 2), start: p.start && i === 0, color: p.color });
    }
  }

  useEffect(() => {
    const id = setInterval(flush, SEND_MS);
    return () => {
      clearInterval(id);
      flush();
    };
  }, []);

  function at(e: { clientX: number; clientY: number }, r: DOMRect) {
    const c = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * KALAMBURY_SIDE);
    return [c((e.clientX - r.left) / r.width), c((e.clientY - r.top) / r.height)];
  }

  function down(e: PointerEvent<SVGSVGElement>) {
    if (finger.current !== null || full) return;
    finger.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    flush();
    const p = at(e, e.currentTarget.getBoundingClientRect());
    pending.current = { points: [...p], start: true, color: ink };
    draw([...local.current, { color: ink, points: p }]);
  }

  function move(e: PointerEvent<SVGSVGElement>) {
    if (e.pointerId !== finger.current || !pending.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const all = local.current;
    const last = [...all[all.length - 1].points];
    let room = KALAMBURY_MAX_POINTS - count(all);
    for (const ev of events.length ? events : [e]) {
      const [x, y] = at(ev, r);
      if (room <= 0 || Math.hypot(x - last[last.length - 2], y - last[last.length - 1]) < MIN_STEP) continue;
      last.push(x, y);
      pending.current.points.push(x, y);
      room--;
    }
    if (last.length !== all[all.length - 1].points.length) draw([...all.slice(0, -1), { ...all[all.length - 1], points: last }]);
  }

  function up(e: PointerEvent<SVGSVGElement>) {
    if (e.pointerId !== finger.current) return;
    finger.current = null;
    flush();
  }

  function edit(type: "undo" | "clear") {
    flush();
    if (type === "clear") {
      setCleared(local.current);
      draw([]);
    } else if (local.current.length) draw(local.current.slice(0, -1));
    else {
      draw(cleared);
      setCleared([]);
    }
    onMove({ type });
  }

  return (
    <>
      <div ref={top} className="relative">
        <Canvas size={size} strokes={strokes} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        {full && <span className="pointer-events-none absolute top-2 left-3 text-xs text-fg-muted">Rysunek pełny: cofnij albo wyczyść</span>}
      </div>
      {/* mt-auto, nie flex-1: pomiar płótna bierze wysokość tego bloku, a narzędzia mają być w zasięgu kciuka. */}
      <div ref={controls} className="mt-auto flex flex-col gap-3">
        <Shots chat={view.chat} lines={lines} nick={nick} />
        <div className="flex justify-between" role="radiogroup" aria-label="Kolor">
          {PALETTE.map((p, i) => (
            <button
              key={p.name}
              type="button"
              role="radio"
              aria-checked={ink === i}
              aria-label={p.name}
              className={`flex size-12 items-center justify-center rounded-full border border-line-hover transition-colors duration-100 ${ink === i ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : ""}`}
              style={{ backgroundColor: p.color }}
              onClick={() => setInk(i)}
            >
              {i === KALAMBURY_ERASER && <Eraser size={22} aria-hidden />}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" disabled={strokes.length === 0 && cleared.length === 0} onClick={() => edit("undo")}>
            <ArrowCounterClockwise size={18} weight="bold" aria-hidden />
            Cofnij
          </button>
          <button type="button" className="btn btn-ghost flex-1" disabled={strokes.length === 0} onClick={() => edit("clear")}>
            <Trash size={18} weight="bold" aria-hidden />
            Wyczyść
          </button>
        </div>
      </div>
    </>
  );
}

/** Wysokość widocznej części ekranu: przy otwartej klawiaturze mniejsza niż okno. */
function useViewportHeight() {
  const [h, setH] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  useEffect(() => {
    const vv = window.visualViewport;
    const on = () => setH(vv?.height ?? window.innerHeight);
    window.addEventListener("resize", on);
    vv?.addEventListener("resize", on);
    return () => {
      window.removeEventListener("resize", on);
      vv?.removeEventListener("resize", on);
    };
  }, []);
  return h;
}

/** Mierzymy nagłówek nad płótnem i kontrolki pod nim zamiast zgadywać ich wysokość. */
function useCanvasSize(top: RefObject<HTMLDivElement | null>, controls: RefObject<HTMLDivElement | null>, active = true) {
  const height = useViewportHeight();
  const [size, setSize] = useState<number>();
  useLayoutEffect(() => {
    const canvas = top.current;
    const footer = controls.current;
    if (!active || !canvas || !footer) return;
    const measure = () => {
      const bottomPadding = parseFloat(getComputedStyle(canvas.closest("main")!).paddingBottom);
      const gap = parseFloat(getComputedStyle(canvas.parentElement!).rowGap) || 0;
      const y = canvas.getBoundingClientRect().top + window.scrollY;
      setSize(Math.max(48, Math.floor(height - y - footer.getBoundingClientRect().height - gap - bottomPadding)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas.parentElement!);
    for (const sibling of canvas.parentElement!.children) {
      if (sibling !== canvas) observer.observe(sibling);
    }
    return () => observer.disconnect();
  }, [height, top, controls, active]);
  return size;
}

/** Ostatnie pudła; stała wysokość, żeby nowy strzał nie zmieniał rozmiaru płótna. Linia „Trafione” idzie tylko zgadującym, rysujący ma odznaki przy kropkach. */
function Shots({ chat, guessed, lines, nick }: { chat: KalamburyView["chat"]; guessed?: string[]; lines: number; nick: (id: string) => string }) {
  const hits = lines > 1 && guessed?.length ? guessed : null;
  const shown = chat.slice(-(hits ? lines - 1 : lines));
  const first = chat.length - shown.length;
  return (
    <ul className="flex flex-col justify-end overflow-hidden text-sm leading-6" style={{ height: `${lines * 1.5}rem` }} aria-live="polite" aria-label="Strzały">
      {shown.map((m, i) => (
        <li key={first + i} className="truncate">
          <span className="text-fg-muted">{nick(m.player)}:</span> {m.text}
        </li>
      ))}
      {hits && <li className="truncate text-success">Trafione: {hits.map(nick).join(", ")}</li>}
    </ul>
  );
}

/** Rysunek z serwera, ostatnie pudła i pole do zgadywania. Płótno maleje przy klawiaturze, żeby pole zostało widoczne. */
function Guess({ view, me, color, canGuess, compact, nick, onMove }: { view: KalamburyView; me: string; color?: string; canGuess: boolean; compact: boolean; nick: (id: string) => string; onMove: Props["onMove"] }) {
  const [text, setText] = useState("");
  /** „Pasuję” wymaga drugiego dotknięcia w ciągu CONFIRM_MS: jedno przypadkowe nie kończy rundy. */
  const [sure, setSure] = useState(false);
  useEffect(() => {
    if (!sure) return;
    const id = setTimeout(() => setSure(false), CONFIRM_MS);
    return () => clearTimeout(id);
  }, [sure]);
  const top = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const size = useCanvasSize(top, controls);
  const height = useViewportHeight();
  const hit = view.guessed.includes(me);
  const passed = view.passed.includes(me);

  // Klawiatura się otworzyła: płótno na górę widocznej części, pole tekstowe zostaje pod nim.
  useEffect(() => {
    if (document.activeElement?.id === "kalambury-guess") top.current?.scrollIntoView({ block: "start" });
  }, [height, size]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onMove({ type: "guess", text });
    setText("");
  }

  return (
    <>
      <div ref={top} className="relative scroll-mt-2">
        <Canvas strokes={view.strokes} size={size} />
        {/* Stan pusty: zanim padnie pierwsza kreska, płótno mówi, na co czekamy. */}
        {view.strokes.length === 0 && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center text-sm text-fg-muted">
            {view.phase === "choose" ? "Czekamy na hasło…" : `${nick(view.drawer)} zaczyna rysować…`}
          </p>
        )}
      </div>
      <div ref={controls} className="mt-auto flex flex-col gap-3">
        <Shots chat={view.chat} guessed={view.guessed} lines={compact ? 1 : CHAT_LINES} nick={nick} />
        {canGuess && !hit && !passed && (
          <form className="flex gap-2" onSubmit={submit}>
            <input
              id="kalambury-guess"
              className="field min-w-0 flex-1"
              value={text}
              placeholder="Co to jest?"
              maxLength={KALAMBURY_ANSWER_MAX}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              aria-label="Twój strzał"
              onChange={(e) => setText(e.target.value)}
            />
            {/* onPointerDown bez utraty fokusu: klawiatura zostaje otwarta między strzałami */}
            <button type="submit" className="btn btn-player w-12 shrink-0 px-0" style={{ backgroundColor: color }} aria-label="Zgadnij" onPointerDown={(e) => e.preventDefault()}>
              <PaperPlaneRight size={20} weight="fill" aria-hidden />
            </button>
            {!compact && (
              <button type="button" className={`btn btn-ghost w-26 shrink-0 px-0 ${sure ? "border-fg" : ""}`} onClick={() => (sure ? onMove({ type: "pass" }) : setSure(true))}>
                {sure ? "Na pewno?" : "Pasuję"}
              </button>
            )}
          </form>
        )}
        {hit && <p className="tile p-4 text-success">Trafione! Czekamy na resztę.</p>}
        {passed && <p className="tile p-4 text-fg-muted">Pasujesz. Czekamy na resztę.</p>}
      </div>
    </>
  );
}
