import { Check, HandPalm, ThumbsDown, Warning, X } from "@phosphor-icons/react";
import { initials, type LobbyPlayer, type PanstwaMiastaMove, type PanstwaMiastaView, PM_ANSWER_MAX, PM_CATEGORIES, pmFits } from "@kwadrans/games";
import { type CSSProperties, Fragment, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Scores, StickyBar, useKeyboardOpen } from "../screens/ui.tsx";
import { useHarm } from "../vibrate.ts";

interface Props {
  view: PanstwaMiastaView;
  me: string;
  players: LobbyPlayer[];
  /** Na kogo czeka serwer: w nagłówku znaczek przy tych, którzy już skończyli. */
  waitingFor: string[];
  ranking?: string[];
  /** Pasek czasu fazy; bez niego (koniec partii) nagłówek gry chowa się, bo pokazuje go ekran gry. */
  timer?: ReactNode;
  /** Ikona „Jak grać” z ekranu gry; stoi w nagłówku obok paska czasu. */
  help?: ReactNode;
  onMove: (move: PanstwaMiastaMove) => void;
}

const DRAFT_MS = 500;
/** Tyle sekund STOP przy niepełnej kartce czeka na drugie dotknięcie. */
const ARM_MS = 3000;
const PHASE = { write: "Wpisywanie", vote: "Sprawdzanie odpowiedzi", summary: "Wyniki rundy", over: "" };

export function PanstwaMiasta({ view, me, players, waitingFor, ranking, timer, help, onMove }: Props) {
  const player = (id: string) => players.find((p) => p.id === id);
  const letter = view.letters[view.round];
  const playing = view.players.includes(me);
  const keyboard = useKeyboardOpen();
  // Przy klawiaturze nagłówek zwija się do litery i czasu, żeby zostało miejsce na pola.
  const compact = view.phase === "write" && keyboard;
  const stopNick = view.phase === "write" && view.stop ? (player(view.stop)?.nick ?? "Ktoś") : null;
  const labels = initials(view.players.map((id) => player(id)?.nick ?? "Gracz"));
  const dots = view.players.map((id, i) => ({ id, label: labels[i] })).sort((a, b) => Number(b.id === me) - Number(a.id === me));
  // STOP od innego gracza ucina mi czas pisania: szkoda od rywala, raz na rundę.
  useHarm(view.phase === "write" && playing && view.stop && view.stop !== me && !view.done.includes(me) ? `${view.round}:${view.stop}` : null);

  return (
    <div className="flex flex-col gap-3">
      {timer && (
        <header className="flex items-center gap-3">
          <span
            role="img"
            className={`flex shrink-0 items-center justify-center border border-line bg-surface font-semibold ${compact ? "size-12 rounded-inset text-3xl" : "size-16 rounded-tile text-5xl"}`}
            aria-label={`Litera ${letter}`}
          >
            {letter}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {!compact && (
              <span className="label">
                Runda {view.round + 1}/{view.letters.length}
              </span>
            )}
            {/* STOP trafia tutaj, poza przewijaną listę, żeby widział go każdy, także przy ostatnim polu. */}
            {stopNick ? (
              <h1 className="text-sm leading-tight font-semibold">
                <StopBanner nick={stopNick} />
              </h1>
            ) : (
              // Przy pisaniu faza jest oczywista: zostaje tylko dla czytników. Pozostałe w moim kolorze, gdy czekamy na mnie.
              <h1 className={view.phase === "write" ? "sr-only" : "text-lg leading-tight font-semibold"} style={playing && waitingFor.includes(me) ? { color: player(me)?.color } : undefined}>
                {PHASE[view.phase]}
              </h1>
            )}
            {timer}
          </div>
          {help}
        </header>
      )}

      {/* Kropki z inicjałami mieszczą 6 osób w linii; ja pierwszy, fajka przy tych, którzy skończyli bieżący krok. Punkty są w wynikach rundy. */}
      {timer && !compact && (
        <ul className="flex items-center gap-3" aria-label="Gracze">
          {dots.map(({ id, label }) => {
            const finished = !waitingFor.includes(id);
            return (
              <li key={id} className="relative">
                <span
                  className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold text-bg ${id === me ? "outline-1 outline-offset-2 outline-fg-muted" : ""}`}
                  style={{ backgroundColor: player(id)?.color }}
                  aria-hidden
                >
                  {label}
                </span>
                <span className="sr-only">
                  {player(id)?.nick ?? "Gracz"}
                  {id === me && " (ty)"}, {view.totals[id]} pkt
                </span>
                {finished && (
                  <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border border-line bg-bg">
                    <Check size={10} weight="bold" className="text-fg" aria-label="gotowe" />
                  </span>
                )}
              </li>
            );
          })}
          {!playing && <li className="ml-auto text-sm text-fg-muted">Oglądasz</li>}
        </ul>
      )}

      {view.phase === "write" &&
        (playing && !view.done.includes(me) ? (
          <Writing key={view.round} view={view} me={me} color={player(me)?.color} onMove={onMove} />
        ) : (
          <p className="tile p-4 text-fg-muted">
            {playing ? "Czekamy, aż reszta skończy pisać." : "Gracze piszą."}
          </p>
        ))}

      {view.phase === "vote" &&
        (playing && !(me in view.votes) ? (
          <Voting key={view.round} view={view} me={me} player={player} onMove={onMove} />
        ) : (
          <>
            <p className="tile p-4 text-fg-muted">Czekamy na głosy reszty.</p>
            <Answers
              view={view}
              player={player}
              me={me}
              rejected={new Set(view.votes[me]?.map((x) => `${x.category}:${x.player}`))}
            />
          </>
        ))}

      {(view.phase === "summary" || view.phase === "over") && (
        <>
          <Answers view={view} player={player} me={me} scored />
          <Scores
            rows={(ranking ?? view.players).map((id) => ({
              id,
              nick: player(id)?.nick ?? "Gracz",
              color: player(id)?.color,
              me: id === me,
              score: String(view.totals[id]),
            }))}
          />
          {view.phase === "summary" && playing && (
            <StickyBar>
              <button type="button" className="btn w-full btn-player" style={{ backgroundColor: player(me)?.color }} disabled={view.ready.includes(me)} onClick={() => onMove({ type: "next" })}>
                {view.ready.includes(me) ? `Czekamy na: ${view.players.filter((p) => !view.ready.includes(p)).map((p) => player(p)?.nick ?? "Gracz").join(", ")}…` : "Dalej"}
              </button>
            </StickyBar>
          )}
        </>
      )}
    </div>
  );
}

function StopBanner({ nick }: { nick: string }) {
  return (
    <span role="status" className="flex animate-[stone-pop_0.35s_ease-out] items-center gap-1.5 text-warning">
      <HandPalm size={18} weight="fill" className="shrink-0" aria-hidden />
      <span className="min-w-0 break-words">STOP! {nick} oddaje kartkę</span>
    </span>
  );
}

/** Pola odpowiedzi. Szkic idzie na serwer w tle, więc przepada najwyżej pół sekundy pisania. */
function Writing({ view, me, color, onMove }: { view: PanstwaMiastaView; me: string; color?: string; onMove: Props["onMove"] }) {
  const letter = view.letters[view.round];
  const [answers, setAnswers] = useState(() => view.answers[me] ?? PM_CATEGORIES.map(() => ""));
  const timer = useRef<number>(undefined);
  const form = useRef<HTMLFormElement>(null);
  const [height, setHeight] = useState<number>();
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    const element = form.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const measure = () => {
      const y = element.getBoundingClientRect().top + window.scrollY;
      const padding = parseFloat(getComputedStyle(element.closest("main")!).paddingBottom);
      // Z klawiaturą zostaje przynajmniej miejsce na jedno pole i dolną akcję.
      setHeight(Math.max(192, Math.floor((viewport?.height ?? window.innerHeight) - y - padding)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const sibling of element.parentElement!.children) if (sibling !== element) observer.observe(sibling);
    viewport?.addEventListener("resize", measure);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      viewport?.removeEventListener("resize", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);
  // Dopiero po zmianie układu przewijamy aktywne pole, aby nie schowało się w krótszej liście.
  useLayoutEffect(() => {
    const element = form.current;
    if (element?.contains(document.activeElement)) {
      element.scrollIntoView({ block: "end" });
      document.activeElement?.scrollIntoView({ block: "nearest" });
    }
  }, [height]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(false), ARM_MS);
    return () => clearTimeout(id);
  }, [armed]);

  function change(i: number, value: string) {
    const next = answers.map((a, j) => (j === i ? value : a));
    setAnswers(next);
    setArmed(false);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onMove({ type: "write", answers: next, done: false }), DRAFT_MS);
  }

  function handIn() {
    clearTimeout(timer.current);
    onMove({ type: "write", answers, done: true });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    handIn();
  }

  // Niepełna kartka ucina wszystkim czas, więc pierwszy STOP wymaga potwierdzenia. Po cudzym STOP oddaję tylko swoją.
  function stopEarly() {
    if (view.stop || armed) handIn();
    else setArmed(true);
  }

  // Enter przechodzi dalej (bez kompletu do pustego pola); oddaje kartkę tylko w ostatnim polu przy komplecie.
  function enter(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key !== "Enter" || (complete && i === PM_CATEGORIES.length - 1)) return;
    e.preventDefault();
    if (complete) document.getElementById(`pm-${i + 1}`)?.focus();
    else nextEmpty();
  }

  // Liczą się tylko odpowiedzi na właściwą literę: zła nie domyka kartki.
  const valid = answers.map((a) => a.trim() !== "" && pmFits(letter, a));
  const filled = valid.filter(Boolean).length;
  const complete = filled === PM_CATEGORIES.length;

  // Bez kompletu „Dalej” przechodzi do kolejnego pola bez poprawnej odpowiedzi, oddanie jest osobno.
  function nextEmpty() {
    const at = PM_CATEGORIES.findIndex((_, i) => document.activeElement?.id === `pm-${i}`);
    const order = PM_CATEGORIES.map((_, k) => (at + 1 + k) % PM_CATEGORIES.length);
    const i = order.find((j) => !valid[j]) ?? 0;
    document.getElementById(`pm-${i}`)?.focus();
  }

  return (
    <form ref={form} className="flex min-h-0 flex-col gap-3" style={{ maxHeight: height }} onSubmit={submit}>
      {/* Jedna kartka z liniami: etykieta obok pola, ramki tylko na zewnątrz, aktywny wiersz w moim kolorze. */}
      <div className="tile flex min-h-0 flex-col divide-y divide-line overflow-y-auto p-0" style={{ "--pm-color": color } as CSSProperties} aria-label="Kategorie odpowiedzi">
        {PM_CATEGORIES.map((category, i) => {
          const typed = answers[i].trim() !== "";
          const ok = valid[i];
          return (
            <div key={category} className="shrink-0 px-4 focus-within:bg-surface-inset focus-within:shadow-[inset_3px_0_0_var(--pm-color)]">
              <div className="flex min-h-14 items-center gap-3">
                <label htmlFor={`pm-${i}`} className="w-18 shrink-0 text-sm font-medium text-fg-muted">
                  {category}
                </label>
                <input
                  id={`pm-${i}`}
                  autoFocus={i === 0}
                  className="min-h-14 min-w-0 flex-1 bg-transparent text-[16px] text-fg outline-none"
                  value={answers[i]}
                  maxLength={PM_ANSWER_MAX}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  enterKeyHint={complete && i === PM_CATEGORIES.length - 1 ? "done" : "next"}
                  aria-invalid={typed && !ok}
                  onKeyDown={(e) => enter(e, i)}
                  onChange={(e) => change(i, e.target.value)}
                />
                {ok && <Check size={18} weight="bold" className="pointer-events-none shrink-0 text-success" aria-hidden />}
              </div>
              {/* Zła pierwsza litera: ikona i tekst (DESIGN §4, błąd formularza), wyrównane do pola. */}
              {typed && !ok && (
                <p role="alert" className="flex items-center gap-1.5 pb-2 pl-21 text-sm text-warning">
                  <Warning size={16} weight="fill" className="shrink-0" aria-hidden />
                  Zła litera: zacznij od {letter}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-3 bg-bg pt-2 pb-3">
        <span role="img" className="w-10 shrink-0 font-mono text-sm text-fg-muted tabular-nums" aria-label={`Poprawne ${filled} z ${PM_CATEGORIES.length}`}>
          {filled}/{PM_CATEGORIES.length}
        </span>
        {complete ? (
          <button type="submit" className="btn flex-1 btn-player" style={{ backgroundColor: color }}>
            {view.stop ? "Gotowe" : "STOP!"}
          </button>
        ) : (
          <>
            {/* Oba przyciski onPointerDown bez utraty fokusu: inaczej klawiatura chowa się i skacze. */}
            <button type="button" className={`btn ${armed ? "flex-1 btn-player" : "btn-ghost"}`} style={armed ? { backgroundColor: color } : undefined} onPointerDown={(e) => e.preventDefault()} onClick={stopEarly}>
              {armed ? `Na pewno? Brakuje ${PM_CATEGORIES.length - filled}` : view.stop ? "Gotowe" : "STOP"}
            </button>
            {!armed && (
              <button type="button" className="btn flex-1 btn-ghost" onPointerDown={(e) => e.preventDefault()} onClick={nextEmpty}>
                Dalej
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}

type PlayerOf = (id: string) => LobbyPlayer | undefined;

function Voting({ view, me, player, onMove }: { view: PanstwaMiastaView; me: string; player: PlayerOf; onMove: Props["onMove"] }) {
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setRejected((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  function submit() {
    onMove({
      type: "vote",
      // id sesji Colyseus nie zawiera dwukropka
      rejected: [...rejected].map((key) => ({ category: Number(key.split(":")[0]), player: key.split(":")[1] })),
    });
  }

  return (
    <>
      <p className="text-sm text-fg-muted">Dotknij cudzej odpowiedzi, żeby ją odrzucić. Swoich nie oceniasz.</p>
      <Answers view={view} player={player} me={me} rejected={rejected} onToggle={toggle} />
      <StickyBar>
        <button type="button" className="btn w-full btn-player" style={{ backgroundColor: player(me)?.color }} onClick={submit}>
          {rejected.size ? `Zatwierdź (odrzucam ${rejected.size})` : "Wszystko się zgadza"}
        </button>
      </StickyBar>
    </>
  );
}

/** Przy 4+ osobach kategorie osobno, gracze w wierszach; przy 2/3 kompaktowa tabela. */
function Answers({
  view,
  player,
  me,
  rejected,
  onToggle,
  scored,
}: {
  view: PanstwaMiastaView;
  player: PlayerOf;
  me?: string;
  rejected?: Set<string>;
  onToggle?: (key: string) => void;
  scored?: boolean;
}) {
  const letter = view.letters[view.round];
  const myColor = me ? player(me)?.color : undefined;
  const label = (id: string) => (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: player(id)?.color }} aria-hidden />
      <span className="min-w-0 break-words">{player(id)?.nick ?? "Gracz"}{id === me && " (ty)"}</span>
    </span>
  );
  const cell = (id: string, c: number) => {
    const category = PM_CATEGORIES[c];
    const answer = view.answers[id]?.[c]?.trim() ?? "";
    const fits = pmFits(letter, answer);
    const key = `${c}:${id}`;
    const canToggle = onToggle && fits && id !== me;
    // Mój głos (w trakcie głosowania) albo ostateczny werdykt (w podsumowaniu).
    const voted = rejected?.has(key) ?? false;
    const out = scored && fits && view.roundScores[id]?.[c] === 0;
    // Cudze głosy są jawne dopiero w podsumowaniu.
    const against = scored ? view.players.filter((v) => view.votes[v]?.some((x) => x.player === id && x.category === c)).length : 0;
    const Cell = canToggle ? "button" : "div";
    return (
      <Cell
        {...(canToggle && {
          type: "button" as const,
          onClick: () => onToggle(key),
          "aria-pressed": voted,
          "aria-label": `${player(id)?.nick ?? "Gracz"}, ${category}: ${answer}. ${voted ? "Odrzucasz" : "Uznajesz"}`,
        })}
        className={`flex min-h-12 w-full items-center gap-1.5 rounded-inset border px-2 py-1.5 text-left ${
          canToggle && !voted ? "bg-surface-inset" : ""
        } ${canToggle ? (voted ? "" : "border-line-hover") : "border-transparent"} ${onToggle && id === me ? "opacity-60" : ""}`}
        // Mój głos przeciw to mój wybór: obrys w moim kolorze; odrzucenie mówią ikona X, przekreślenie i 0 pkt, bez tła.
        style={canToggle && voted ? { borderColor: myColor } : undefined}
      >
        {answer ? (
          <span className={`min-w-0 flex-1 break-words ${!fits || out ? "text-fg-muted line-through" : ""}`}>{answer}</span>
        ) : (
          <span className="flex-1 text-fg-muted">brak</span>
        )}
        {voted ? (
          <X size={16} weight="bold" className="shrink-0 text-warning" aria-hidden />
        ) : (
          canToggle && <Check size={16} weight="bold" className="shrink-0 text-success" aria-hidden />
        )}
        {scored && (
          <span className="flex shrink-0 flex-col items-end font-mono tabular-nums">
            {view.roundScores[id]?.[c] ?? 0}
            {against > 0 && (
              <span role="img" className="flex items-center gap-0.5 text-xs text-fg-muted" aria-label={`Przeciw: ${against}`}>
                <ThumbsDown size={12} aria-hidden />
                {against}
              </span>
            )}
          </span>
        )}
      </Cell>
    );
  };
  if (view.players.length >= 4) {
    return (
      <div className="flex flex-col gap-3">
        {PM_CATEGORIES.map((category, c) => (
          <table key={category} className="tile w-full table-fixed border-separate border-spacing-1 p-2 text-sm">
            <caption className="label px-3 pt-2 text-left">{category}</caption>
            <thead className="sr-only"><tr><th scope="col">Gracz</th><th scope="col">Odpowiedź</th></tr></thead>
            <tbody>
              {view.players.map((id) => (
                <tr key={id}>
                  <th scope="row" className="w-1/3 px-1 text-left text-xs font-medium">{label(id)}</th>
                  <td className="p-0">{cell(id, c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    );
  }
  return (
    <div className="tile p-2">
      <table className="w-full table-fixed border-separate border-spacing-1 text-sm">
        <thead><tr>{view.players.map((id) => <th key={id} scope="col" className="px-1 pb-1 text-left text-xs font-medium">{label(id)}</th>)}</tr></thead>
        <tbody>
          {PM_CATEGORIES.map((category, c) => (
            <Fragment key={category}>
              <tr><th scope="colgroup" colSpan={view.players.length} className="label px-1 pt-2 text-left font-normal">{category}</th></tr>
              <tr>{view.players.map((id) => <td key={id} className="p-0 align-top">{cell(id, c)}</td>)}</tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
