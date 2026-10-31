import { useEffect, useRef, useState } from "react";
import { ArrowRight, DiceFive, DiceFour, DiceOne, DiceSix, DiceThree, DiceTwo } from "@phosphor-icons/react";
import { CHINCZYK_TRACK as TRACK, type ChinczykView, type LobbyPlayer } from "@kwadrans/games";
import { StickyBar } from "../screens/ui.tsx";

type Move = { type: "roll" } | { type: "move"; pawn: number };

interface Props {
  view: ChinczykView;
  me: string;
  players: LobbyPlayer[];
  canMove: boolean;
  onMove: (move: Move) => void;
}

type Cell = [x: number, y: number];

/** Tor 40 pól na siatce 11×11, zgodnie z ruchem wskazówek zegara, od startu z lewego ramienia krzyża. */
const TRACK_CELLS: Cell[] = [
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [5, 0],
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [10, 5],
  [10, 6], [9, 6], [8, 6], [7, 6], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [5, 10],
  [4, 10], [4, 9], [4, 8], [4, 7], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 5],
];
/** Domki końcowe i startowe dla startów 0, 10, 20, 30 (lewo, góra, prawo, dół). */
const HOMES: Cell[][] = [
  [[1, 5], [2, 5], [3, 5], [4, 5]],
  [[5, 1], [5, 2], [5, 3], [5, 4]],
  [[9, 5], [8, 5], [7, 5], [6, 5]],
  [[5, 9], [5, 8], [5, 7], [5, 6]],
];
const BASES: Cell[][] = [
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[9, 0], [10, 0], [9, 1], [10, 1]],
  [[9, 9], [10, 9], [9, 10], [10, 10]],
  [[0, 9], [1, 9], [0, 10], [1, 10]],
];
/** Kierunek ruchu z pola startowego każdego miejsca (obrót strzałki w prawo). */
const START_ARROW = [0, 90, 180, 270];
const CENTER = 5 * 11 + 5;
const DICE = [DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix];

const key = ([x, y]: Cell) => y * 11 + x;
const mix = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, var(--color-bg))`;
/** Kolor gracza o stałej jasności (OKLCH): niebieski i żółty wychodzą równie wyraźne. */
const tint = (color: string, lightness: number, chroma: number) => `oklch(from ${color} ${lightness} calc(c * ${chroma}) h)`;
/** Meta miejsca bez gracza: ledwo widoczna. */
const UNUSED = mix("var(--color-fg)", 6);

/** Tempo animacji: krok pionka o jedno pole i czas turlania kostki; w trybie Szybkim krótsze. */
const STEP_MS = 180;
const ROLL_MS = 700;
const QUICK_STEP_MS = 110;
const QUICK_ROLL_MS = 400;
const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Zdarzenie, od którego zaczyna się pokaz: nowy rzut albo ruch pionka po wyborze w tym samym rzucie. */
const eventKey = (view: ChinczykView) => (view.last ? `${view.last.roll}:${view.last.move ? view.last.move.pawn : "-"}` : "");

/** Pionek idzie pole po polu (wyjście z domku to jeden krok); zbicia i dalekie skoki zmieniają się od razu. */
const walking = (from: number | undefined, to: number) => from !== undefined && to > from && to - from <= 6;

/**
 * Jeden przerywalny pokaz: turlanie kostki, potem marsz pionka. Nowe zdarzenie z serwera zastępuje poprzedni pokaz
 * i zaczyna od poprzedniego widoku serwera, bez zaległej kolejki; `finish` od razu pokazuje stan serwera.
 * Po odświeżeniu strony pozycje są od razu aktualne.
 */
function useShow(view: ChinczykView, rollMs: number, stepMs: number) {
  const [frame, setFrame] = useState({ view, shown: view.pawns, rollEnd: 0 });
  if (frame.view !== view) {
    const fresh = eventKey(view) !== eventKey(frame.view);
    const newRoll = fresh && !!view.last && view.last.roll !== frame.view.last?.roll;
    if (reducedMotion) setFrame({ view, shown: view.pawns, rollEnd: 0 });
    else if (fresh) setFrame({ view, shown: frame.view.pawns, rollEnd: newRoll ? performance.now() + rollMs : 0 });
    else setFrame({ ...frame, view });
  }
  const rolling = frame.rollEnd > 0;
  useEffect(() => {
    if (frame.view !== view) return;
    if (frame.rollEnd) {
      const id = setTimeout(() => setFrame({ ...frame, rollEnd: 0 }), Math.max(0, frame.rollEnd - performance.now()));
      return () => clearTimeout(id);
    }
    const ids = Object.keys(view.pawns);
    if (ids.every((p) => view.pawns[p].every((pos, i) => frame.shown[p]?.[i] === pos))) return;
    if (!ids.some((p) => view.pawns[p].some((to, i) => walking(frame.shown[p]?.[i], to)))) {
      setFrame({ ...frame, shown: view.pawns });
      return;
    }
    const id = setTimeout(() => {
      const shown = Object.fromEntries(
        ids.map((p) => [p, view.pawns[p].map((to, i) => {
          const from = frame.shown[p]?.[i];
          return walking(from, to) ? (from! < 0 ? 0 : from! + 1) : (from ?? to);
        })]),
      );
      setFrame({ ...frame, shown });
    }, stepMs);
    return () => clearTimeout(id);
  }, [frame, view, stepMs]);
  return {
    shown: frame.shown,
    rolling,
    settled: frame.view === view && !rolling && view.players.every((p) => frame.shown[p]?.every((pos, i) => pos === view.pawns[p][i])),
    finish: () => setFrame({ view, shown: view.pawns, rollEnd: 0 }),
  };
}

/** Kostka: w trakcie turlania co chwilę losowe oczka i podskakiwanie, potem wynik z serwera. */
function Die({ value, rolling, color }: { value: number; rolling: boolean; color?: string }) {
  const [face, setFace] = useState(value);
  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 90);
    return () => clearInterval(id);
  }, [rolling]);
  const Face = DICE[(rolling ? face : value) - 1];
  return (
    <Face
      size={48}
      weight="fill"
      className={`shrink-0 ${rolling ? "animate-[dice-tumble_0.3s_ease-in-out_infinite]" : ""}`}
      style={{ color }}
      aria-label={rolling ? "Rzut kostką" : `Wyrzucono ${value}`}
    />
  );
}

/** Nazwa wybranego ruchu na przycisku: „Wyjdź na start”, „Wejdź do domku”, „Rusz o 4 pola”, przy biciu „… i zbij”. */
function moveName(from: number, to: number, capture: boolean) {
  const n = to - from;
  const name = from < 0 ? "Wyjdź na start" : from < TRACK && to >= TRACK ? "Wejdź do domku" : `Rusz o ${n} ${n === 1 ? "pole" : n < 5 ? "pola" : "pól"}`;
  return capture ? `${name} i zbij` : name;
}

export function Chinczyk({ view, me, players, canMove, onMove }: Props) {
  const color = (id: string) => players.find((p) => p.id === id)?.color ?? "var(--color-fg-muted)";
  const nick = (id: string) => players.find((p) => p.id === id)?.nick ?? "?";
  const last = view.last;
  const quick = view.mode === "szybki";
  const { shown, rolling, settled, finish } = useShow(view, quick ? QUICK_ROLL_MS : ROLL_MS, quick ? QUICK_STEP_MS : STEP_MS);
  const myMove = canMove && settled && view.phase === "move";
  const event = eventKey(view);

  // Pierwsze dotknięcie w trakcie pokazu tylko go kończy. Warstwa zostaje do końca gestu,
  // żeby puszczenie palca po naturalnym końcu pokazu nie trafiło w odsłonięty przycisk.
  const [holding, setHolding] = useState(false);

  // Wybrany pionek pokazuje cel; „Rusz pionek” albo drugie dotknięcie (pionka albo celu) wykonuje ruch.
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => setSelected(null), [event, view.phase, view.turn]);
  const pick = selected !== null && myMove && view.movable.includes(selected) ? selected : null;

  // Zbity pionek: wibracja u właściciela raz na ruch, gdy pokaz dojdzie do zbicia (albo zastąpi go kolejne zdarzenie).
  // Ruch zastany przy wejściu do gry nie wibruje.
  const seen = useRef(event);
  const pending = useRef(false);
  useEffect(() => {
    if (seen.current === event) return;
    seen.current = event;
    if (pending.current) navigator.vibrate?.([60, 40, 60]);
    pending.current = !!last?.move?.captured.includes(me);
  }, [event, last, me]);
  useEffect(() => {
    if (!settled || !pending.current) return;
    pending.current = false;
    navigator.vibrate?.([60, 40, 60]);
  }, [settled]);

  const seatOf = (player: string) => view.starts[player] / (TRACK / 4);
  const cellOf = (player: string, pos: number, index: number) =>
    pos < 0 ? BASES[seatOf(player)][index] : pos < TRACK ? TRACK_CELLS[(view.starts[player] + pos) % TRACK] : HOMES[seatOf(player)][pos - TRACK];

  // Gracz na każdym z czterech miejsc (przy dwóch graczach dwa miejsca puste).
  const seats = [0, 1, 2, 3].map((seat) => view.players.find((p) => seatOf(p) === seat));

  // Każde pole planszy: tło (tor, start, domek gracza), strzałka kierunku na starcie i ewentualny pionek.
  const cells = new Map<number, { background?: string; ring?: string; empty?: boolean; arrow?: number; pawn?: { player: string; index: number } }>();
  for (const c of TRACK_CELLS) cells.set(key(c), {});
  seats.forEach((player, seat) => {
    const c = player && color(player);
    // Start: zabarwione pole z obwódką, która zostaje widoczna także pod pionkiem.
    if (c) cells.set(key(TRACK_CELLS[seat * (TRACK / 4)]), { background: tint(c, 0.5, 0.8), ring: c, arrow: START_ARROW[seat] });
    // Domek końcowy bez gracza wygląda jak zwykłe pole: ciemniejszy pas wyglądał jak cień.
    // Domki miejsca bez gracza: sama cienka obwódka, żeby plansza była kompletna, a pola wyraźnie puste.
    for (const cell of HOMES[seat]) cells.set(key(cell), c ? { background: tint(c, 0.42, 0.7) } : { empty: true });
    for (const cell of BASES[seat]) cells.set(key(cell), c ? { background: tint(c, 0.3, 0.5) } : { empty: true });
  });
  for (const player of view.players) {
    (shown[player] ?? view.pawns[player]).forEach((pos, index) => {
      const k = key(cellOf(player, pos, index));
      cells.set(k, { ...cells.get(k), pawn: { player, index } });
    });
  }

  // Podgląd celu wybranego pionka; cel liczy serwer (w trybie Szybkim nadwyżka oczek przepada).
  const to = pick !== null ? (view.targets[pick] ?? null) : null;
  const targetKey = to === null ? null : key(cellOf(me, to, pick!));
  const victim = targetKey === null ? undefined : cells.get(targetKey)?.pawn;
  const capture = victim && victim.player !== me ? victim.player : null;

  const status = (() => {
    if (!last || rolling) return null;
    if (last.note === "sixes") return "Trzecia szóstka z rzędu, tura przepada.";
    if (last.note === "none") {
      if (last.dice === 6) return "Brak ruchu, ale szóstka daje kolejny rzut.";
      if (view.pawns[last.player].some((p) => p >= 0 && p < TRACK)) return "Brak możliwego ruchu.";
      const miss = quick ? "Bez 1 i 6" : "Bez szóstki";
      return view.turn === last.player ? `${miss}. Próba ${4 - view.tries} z 3.` : `${miss}, tura przechodzi.`;
    }
    if (!last.move || !settled) return null;
    if (last.move.to >= TRACK && view.ranking.includes(last.player))
      return `${nick(last.player)} kończy na ${view.ranking.indexOf(last.player) + 1}. miejscu!`;
    const again = view.turn === last.player;
    if (last.move.captured.length)
      return `${nick(last.player)} zbija: ${last.move.captured.map(nick).join(", ")}!${again && last.dice !== 6 ? " Kolejny rzut." : ""}`;
    if (last.dice === 6 && again) return "Szóstka, kolejny rzut.";
    if (again && last.move.from < TRACK && last.move.to >= TRACK) return "Pionek w domku, kolejny rzut.";
    return null;
  })();

  const prompt = (() => {
    if (view.phase === "over" || !view.turn) return null;
    if (!settled) return null;
    if (canMove) return null;
    return view.phase === "move" ? `${nick(view.turn)} wybiera pionek…` : `${nick(view.turn)} rzuca kostką…`;
  })();

  const rollNow = canMove && settled && view.phase === "roll";
  const move = (pawn: number) => onMove({ type: "move", pawn });

  return (
    <div className="relative flex flex-1 flex-col gap-3">
      <div className="tile grid aspect-square w-full gap-[3px] p-2" style={{ gridTemplate: "repeat(11, minmax(0, 1fr)) / repeat(11, minmax(0, 1fr))" }}>
        {Array.from({ length: 121 }, (_, i) => {
          if (i === CENTER) return <Finish key={i} colors={seats.map((p) => (p ? tint(color(p), 0.62, 0.9) : UNUSED))} />;
          const cell = cells.get(i);
          if (!cell) return <span key={i} />;
          if (cell.empty) return <span key={i} className="m-[3px] rounded-full border border-fg/15" aria-hidden />;
          const pawn = cell.pawn;
          const movable = !!pawn && myMove && pawn.player === me && view.movable.includes(pawn.index);
          const isPick = movable && pawn!.index === pick;
          const isTarget = i === targetKey;
          const inner = pawn ? (
            <span
              className={`size-[70%] rounded-full border-2 border-bg ${
                isPick ? "outline-2 outline-offset-1" : movable ? "animate-[ring-pulse_1s_ease-in-out_infinite] outline-2" : ""
              }`}
              style={{ backgroundColor: color(pawn.player), outlineColor: color(pawn.player) }}
            />
          ) : isTarget ? (
            // Duch pionka na polu docelowym.
            <span className="size-[60%] rounded-full border-2 border-dashed opacity-70" style={{ borderColor: color(me) }} />
          ) : (
            cell.arrow !== undefined && (
              <ArrowRight weight="bold" className="size-[55%] text-bg" style={{ transform: `rotate(${cell.arrow}deg)` }} aria-hidden />
            )
          );
          // Tor wyraźnie jaśniejszy od tła: surface-inset zlewał się ze stroną.
          const className = `grid place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-fg)_11%,var(--color-bg))] ${
            isTarget ? `outline-2 outline-offset-1 ${capture ? "outline-warning" : "outline-fg"}` : ""
          }`;
          const action = isTarget ? () => move(pick!) : movable ? () => (isPick ? move(pawn!.index) : setSelected(pawn!.index)) : null;
          return action ? (
            <button
              key={i}
              type="button"
              aria-label={isTarget ? `Rusz pionek ${pick! + 1} tutaj` : isPick ? `Rusz pionek ${pawn!.index + 1}` : `Wybierz pionek ${pawn!.index + 1}`}
              className={className}
              style={{ backgroundColor: cell.background, boxShadow: cell.ring && `inset 0 0 0 2px ${cell.ring}` }}
              onClick={action}
            >
              {inner}
            </button>
          ) : (
            <span key={i} className={className} style={{ backgroundColor: cell.background, boxShadow: cell.ring && `inset 0 0 0 2px ${cell.ring}` }}>
              {inner}
            </span>
          );
        })}
      </div>

      {/* Odstęp spycha dolny obszar na dół ekranu; sticky trzyma go pod kciukiem, gdy plansza się nie mieści. */}
      <span className="-mt-3 flex-1" aria-hidden />

      {/* Jeden obszar na dole: przy rzucie i wyborze ruchu duży przycisk w kolorze gracza, poza tym ostatni rzut i podpowiedź. */}
      <StickyBar>
        <div className="flex w-full flex-col gap-2" aria-live="polite">
          {rollNow ? (
            <>
              {/* Kolejną próbę na szóstkę pokazuje już przycisk. */}
              {status && !(last?.note === "none" && last.dice !== 6) && <p className="text-center text-sm font-semibold">{status}</p>}
              <button
                type="button"
                className="btn h-14 w-full text-lg font-semibold text-bg"
                style={{ backgroundColor: color(me) }}
                onClick={() => onMove({ type: "roll" })}
              >
                <DiceFive size={24} weight="fill" aria-hidden />
                Rzuć
                {!view.pawns[me].some((p) => p >= 0 && p < TRACK) && <span className="font-normal">(próba {4 - view.tries} z 3)</span>}
              </button>
            </>
          ) : myMove && last ? (
            // Pole ma ~29 px, więc wybrany ruch potwierdza duży przycisk (albo drugie dotknięcie pionka lub celu).
            <div className="flex items-center gap-3">
              <Die value={last.dice} rolling={false} color={color(me)} />
              <button
                type="button"
                className="btn h-14 flex-1 text-lg font-semibold text-bg disabled:opacity-40"
                style={{ backgroundColor: color(me) }}
                disabled={pick === null}
                onClick={() => pick !== null && move(pick)}
              >
                {pick === null ? "Dotknij pionka" : moveName(view.pawns[me][pick], to!, !!capture)}
              </button>
            </div>
          ) : (
            <div className="tile flex min-h-14 items-center gap-3 px-4 py-2">
              {last ? (
                <Die value={last.dice} rolling={rolling} color={color(last.player)} />
              ) : (
                <span className="size-12 shrink-0 rounded-inset border border-line" aria-hidden />
              )}
              <div className="flex flex-1 flex-col gap-0.5">
                {last && (
                  <p className="text-sm">
                    <span className="font-semibold" style={{ color: color(last.player) }}>
                      {last.player === me ? "Ty" : nick(last.player)}
                    </span>{" "}
                    {last.player === me ? (rolling ? "rzucasz…" : `wyrzucasz ${last.dice}`) : rolling ? "rzuca…" : `wyrzuca ${last.dice}`}
                  </p>
                )}
                {status && <p className="text-sm font-semibold">{status}</p>}
                {/* Komunikat o rzucie wypiera „X rzuca kostką…”: kto ma ruch, mówi już nagłówek, a czwarta linia wypychała ekran. */}
                {!status && prompt && <p className="text-sm text-fg-muted">{prompt}</p>}
              </div>
            </div>
          )}
        </div>
      </StickyBar>

      {(!settled || holding) && (
        <button
          type="button"
          className="absolute -inset-x-4 inset-y-0 z-40 cursor-pointer"
          aria-label="Pomiń animację"
          onPointerDown={() => setHolding(true)}
          onPointerCancel={() => setHolding(false)}
          onPointerUp={() => setTimeout(() => setHolding(false))}
          onClick={(e) => {
            e.stopPropagation();
            finish();
            setHolding(false);
          }}
        />
      )}
    </div>
  );
}

/** Meta na środku krzyża: cztery trójkąty skierowane do domków (lewo, góra, prawo, dół). */
function Finish({ colors }: { colors: string[] }) {
  const triangles = ["0,0 1,1 0,2", "0,0 2,0 1,1", "2,0 2,2 1,1", "0,2 2,2 1,1"];
  return (
    <svg viewBox="0 0 2 2" className="size-full overflow-hidden rounded-[6px]" role="img" aria-label="Meta">
      {triangles.map((points, i) => (
        <polygon key={points} points={points} fill={colors[i]} />
      ))}
    </svg>
  );
}
