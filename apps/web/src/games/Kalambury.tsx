import { ArrowCounterClockwise, Check, PencilSimple, Trash } from "@phosphor-icons/react";
import { KALAMBURY_ANSWER_MAX, KALAMBURY_BATCH_POINTS, KALAMBURY_MAX_POINTS, KALAMBURY_SIDE, type KalamburyMove, type KalamburyView, type LobbyPlayer } from "@kwadrans/games";
import { type FormEvent, type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Scores, StickyBar } from "../screens/ui.tsx";

interface Props {
  view: KalamburyView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  /** Pasek czasu fazy; bez niego (koniec partii) nagłówek gry chowa się, bo pokazuje go ekran gry. */
  timer?: ReactNode;
  onMove: (move: KalamburyMove) => void;
}

/** Co tyle kreska leci na serwer; 5 ruchów na sekundę mieści się w limicie wiadomości pokoju. */
const SEND_MS = 200;
/** Krótszych odcinków nie zapisujemy (w jednostkach płótna 0-1000): mniej danych, a linia dalej gładka. */
const MIN_STEP = 8;
/** Ile ostatnich pudeł widać pod rysunkiem. */
const CHAT_LINES = 3;
/** Miejsce na czat, pole tekstowe i „Pasuję” pod płótnem, gdy klawiatura zabiera pół ekranu. */
const BELOW_CANVAS_PX = 210;

export function Kalambury({ view, me, players, ranking, timer, onMove }: Props) {
  const player = (id: string) => players.find((p) => p.id === id);
  const nick = (id: string) => player(id)?.nick ?? "Gracz";
  const drawing = view.drawer === me;
  const guessing = view.players.includes(me) && !drawing;
  const live = view.phase === "choose" || view.phase === "draw";

  return (
    <div className="flex flex-col gap-3">
      {timer && (
        <header className="flex flex-col gap-2">
          <span className="label">
            Runda {view.round + 1}/{view.rounds} · rysuje {drawing ? "ty" : nick(view.drawer)}
          </span>
          <h1 className="text-xl leading-tight font-semibold">
            {view.phase === "choose" ? (
              drawing ? "Wybierz hasło" : `${nick(view.drawer)} wybiera hasło`
            ) : view.word ? (
              <span style={drawing && live ? { color: player(me)?.color } : undefined}>{view.word}</span>
            ) : (
              <span className="font-mono tracking-[0.3em]" aria-label={`Hasło, liter: ${view.hint.length}`}>
                {view.hint}
              </span>
            )}
          </h1>
          {timer}
        </header>
      )}

      {/* Gracze z punktami: ołówek przy rysującym, fajka przy tych, którzy zgadli. */}
      {timer && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" aria-label="Gracze">
          {view.players.map((id) => (
            <li key={id} className={`flex items-center gap-1.5 ${id === view.drawer || view.guessed.includes(id) ? "" : "text-fg-muted"}`}>
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: player(id)?.color }} aria-hidden />
              {nick(id)}
              {id === me && <span className="text-fg-muted">(ty)</span>}
              <span className="font-mono text-fg-muted tabular-nums">{view.totals[id]}</span>
              {id === view.drawer && <PencilSimple size={14} weight="bold" aria-label="rysuje" />}
              {view.guessed.includes(id) && <Check size={14} weight="bold" className="text-success" aria-label="trafione" />}
            </li>
          ))}
          {!view.players.includes(me) && <li className="ml-auto text-fg-muted">Oglądasz</li>}
        </ul>
      )}

      {view.phase === "choose" && drawing && (
        <div className="flex flex-col gap-2">
          {view.choices.map((word, i) => (
            <button key={word} type="button" className="btn btn-ghost w-full text-lg" onClick={() => onMove({ type: "choose", index: i })}>
              {word}
            </button>
          ))}
        </div>
      )}

      {view.phase === "draw" && drawing && <Pad key={view.round} view={view} color={player(me)?.color} onMove={onMove} />}

      {((view.phase === "choose" && !drawing) || (view.phase === "draw" && !drawing)) && (
        <Guess view={view} me={me} color={player(me)?.color} ink={player(view.drawer)?.color} canGuess={guessing && view.phase === "draw"} nick={nick} onMove={onMove} />
      )}

      {(view.phase === "reveal" || view.phase === "over") && (
        <>
          {/* Po partii własnego nagłówka nie ma, więc ostatnie hasło stoi nad rysunkiem. */}
          {!timer && (
            <p className="text-xl font-semibold">
              <span className="label mr-2 font-normal">Ostatnie hasło</span>
              {view.word}
            </p>
          )}
          <Canvas strokes={view.strokes} color={player(view.drawer)?.color} />
          <ul className="tile flex flex-col gap-1 p-4 text-sm" aria-label="Punkty rundy">
            {view.guessed.length === 0 && <li className="text-fg-muted">Nikt nie zgadł.</li>}
            {[view.drawer, ...view.guessed].map((id) => (
              <li key={id} className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: player(id)?.color }} aria-hidden />
                {nick(id)}
                <span className="text-fg-muted">{id === view.drawer ? "za rysunek" : "trafienie"}</span>
                <span className="ml-auto font-mono tabular-nums">+{view.roundScores[id] ?? 0}</span>
              </li>
            ))}
          </ul>
          <Scores
            rows={(ranking ?? [...view.players].sort((a, b) => view.totals[b] - view.totals[a])).map((id) => ({
              id,
              nick: nick(id),
              color: player(id)?.color,
              me: id === me,
              score: String(view.totals[id]),
            }))}
          />
          {view.phase === "reveal" && view.players.includes(me) && (
            <StickyBar>
              <button type="button" className="btn w-full text-bg" style={{ backgroundColor: player(me)?.color }} disabled={view.ready.includes(me)} onClick={() => onMove({ type: "next" })}>
                {view.ready.includes(me) ? "Czekamy na resztę" : "Dalej"}
              </button>
            </StickyBar>
          )}
        </>
      )}
    </div>
  );
}

/** Kreski jako ścieżki; pojedynczy punkt to kropka dzięki zaokrąglonym końcom. */
/** Kreski w kolorze rysującego, u niego i u zgadujących. */
function Canvas({ strokes, size, color, children, ...pointer }: { strokes: number[][]; size?: number; color?: string; children?: ReactNode } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${KALAMBURY_SIDE} ${KALAMBURY_SIDE}`}
      className="mx-auto block aspect-square w-full touch-none select-none rounded-tile border border-line bg-surface [-webkit-touch-callout:none]"
      style={{ maxWidth: size, color }}
      {...pointer}
    >
      {strokes.map((s, i) => (
        <path key={i} d={path(s)} fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
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
function Pad({ view, color, onMove }: { view: KalamburyView; color?: string; onMove: Props["onMove"] }) {
  const [strokes, setStrokes] = useState(view.strokes);
  /** To samo co `strokes`, ale od razu po zmianie (zdarzenia wskaźnika przychodzą szybciej niż render). */
  const local = useRef(view.strokes);
  const finger = useRef<number | null>(null);
  /** Punkty jeszcze niewysłane i czy zaczynają nową kreskę. */
  const pending = useRef<{ points: number[]; start: boolean } | null>(null);
  const count = (all: number[][]) => all.reduce((n, s) => n + s.length / 2, 0);
  const full = count(strokes) >= KALAMBURY_MAX_POINTS;
  const draw = (next: number[][]) => setStrokes((local.current = next));

  function flush() {
    const p = pending.current;
    if (!p || p.points.length === 0) return;
    pending.current = { points: [], start: false };
    for (let i = 0; i < p.points.length; i += KALAMBURY_BATCH_POINTS * 2) {
      onMove({ type: "line", points: p.points.slice(i, i + KALAMBURY_BATCH_POINTS * 2), start: p.start && i === 0 });
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
    pending.current = { points: [...p], start: true };
    draw([...local.current, p]);
  }

  function move(e: PointerEvent<SVGSVGElement>) {
    if (e.pointerId !== finger.current || !pending.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const all = local.current;
    const last = [...all[all.length - 1]];
    let room = KALAMBURY_MAX_POINTS - count(all);
    for (const ev of events.length ? events : [e]) {
      const [x, y] = at(ev, r);
      if (room <= 0 || Math.hypot(x - last[last.length - 2], y - last[last.length - 1]) < MIN_STEP) continue;
      last.push(x, y);
      pending.current.points.push(x, y);
      room--;
    }
    if (last.length !== all[all.length - 1].length) draw([...all.slice(0, -1), last]);
  }

  function up(e: PointerEvent<SVGSVGElement>) {
    if (e.pointerId !== finger.current) return;
    finger.current = null;
    flush();
  }

  function edit(type: "undo" | "clear") {
    flush();
    draw(type === "undo" ? local.current.slice(0, -1) : []);
    onMove({ type });
  }

  return (
    <>
      <div className="relative">
        <Canvas strokes={strokes} color={color} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        {full && <span className="pointer-events-none absolute top-2 left-3 text-xs text-fg-muted">Rysunek pełny: cofnij albo wyczyść</span>}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn btn-ghost flex-1" disabled={strokes.length === 0} onClick={() => edit("undo")}>
          <ArrowCounterClockwise size={18} aria-hidden />
          Cofnij
        </button>
        <button type="button" className="btn btn-ghost flex-1" disabled={strokes.length === 0} onClick={() => edit("clear")}>
          <Trash size={18} aria-hidden />
          Wyczyść
        </button>
      </div>
    </>
  );
}

/** Wysokość widocznej części ekranu: przy otwartej klawiaturze mniejsza niż okno. */
function useViewportHeight() {
  const [h, setH] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => setH(vv.height);
    vv.addEventListener("resize", on);
    return () => vv.removeEventListener("resize", on);
  }, []);
  return h;
}

/** Rysunek z serwera, ostatnie pudła i pole do zgadywania. Płótno maleje przy klawiaturze, żeby pole zostało widoczne. */
function Guess({ view, me, color, ink, canGuess, nick, onMove }: { view: KalamburyView; me: string; color?: string; ink?: string; canGuess: boolean; nick: (id: string) => string; onMove: Props["onMove"] }) {
  const [text, setText] = useState("");
  const top = useRef<HTMLDivElement>(null);
  const height = useViewportHeight();
  const hit = view.guessed.includes(me);
  const passed = view.passed.includes(me);

  // Klawiatura się otworzyła: płótno na górę widocznej części, pole tekstowe zostaje pod nim.
  useEffect(() => {
    if (document.activeElement?.id === "kalambury-guess") top.current?.scrollIntoView({ block: "start" });
  }, [height]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onMove({ type: "guess", text });
    setText("");
  }

  return (
    <>
      <div ref={top} className="scroll-mt-2">
        <Canvas strokes={view.strokes} size={height - BELOW_CANVAS_PX} color={ink} />
      </div>
      <ul className="flex min-h-[4.5rem] flex-col justify-end text-sm" aria-live="polite" aria-label="Strzały">
        {view.chat.slice(-CHAT_LINES).map((m, i) => (
          <li key={view.chat.length - CHAT_LINES + i} className="truncate">
            <span className="text-fg-muted">{nick(m.player)}:</span> {m.text}
          </li>
        ))}
        {view.guessed.length > 0 && <li className="truncate text-success">Trafione: {view.guessed.map(nick).join(", ")}</li>}
      </ul>
      {canGuess && !hit && !passed && (
        <form className="flex flex-col gap-2" onSubmit={submit}>
          <div className="flex gap-2">
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
          <button type="submit" className="btn text-bg" style={{ backgroundColor: color }} onPointerDown={(e) => e.preventDefault()}>
            Zgadnij
          </button>
          </div>
          <button type="button" className="btn btn-ghost w-full" onClick={() => onMove({ type: "pass" })}>
            Pasuję
          </button>
        </form>
      )}
      {hit && <p className="tile p-4 text-success">Trafione! Czekamy na resztę.</p>}
      {passed && <p className="tile p-4 text-fg-muted">Pasujesz. Czekamy na resztę.</p>}
    </>
  );
}
