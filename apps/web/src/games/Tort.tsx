import { type LobbyPlayer, TORT_CAKES, type TortCake, tortError, type TortView } from "@kwadrans/games";
import { type PointerEvent, type SVGProps, useEffect, useState } from "react";
import { grade, Intro, RoundTable, Scores, Stats, tenth } from "../screens/ui.tsx";

interface Props {
  view: TortView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; cuts: number[][] }) => void;
}

/** Tyle ms widać idealne cięcia i błąd, zanim wskoczy następny tort. */
const REVEAL_MS = 1500;
/** Progi celności w % tortu: do PERFECT „Idealnie!” na zielono, powyżej CLOSE kolor ostrzeżenia. */
const PERFECT = 2;
const CLOSE = 8;
/** Dotknięcie do tylu px ekranu od odcinka własnego cięcia łapie je, zamiast stawiać nowe. */
const GRAB_PX = 24;
/** Promień tortu i martwa strefa przy środku (tam kąt palca jest przypadkowy), w jednostkach viewBox (100 = bok kafla). */
const RADIUS = 44;
const DEAD = 6;

const percent = (n: number) => `${tenth(n)}%`;
/** Koniec cięcia pod kątem `deg` (0° = godzina dwunasta, zgodnie z zegarem). */
const rim = (deg: number, r = RADIUS) => ({ x: 50 + r * Math.sin((deg * Math.PI) / 180), y: 50 - r * Math.cos((deg * Math.PI) / 180) });

/**
 * Indeks cięcia najbliższego punktowi (jednostki viewBox), jeśli jego odcinek środek → brzeg jest bliżej niż `reach`; inaczej null.
 * Odległość od odcinka, nie kąt: przy środku kąt palca jest przypadkowy, a przy brzegu mały kąt to daleko.
 */
export function grab(cuts: number[], point: { x: number; y: number }, reach: number): number | null {
  let best: number | null = null;
  let bestDist = reach;
  cuts.forEach((deg, i) => {
    const end = rim(deg);
    const [ex, ey] = [end.x - 50, end.y - 50];
    const t = Math.max(0, Math.min(1, ((point.x - 50) * ex + (point.y - 50) * ey) / (ex * ex + ey * ey)));
    const dist = Math.hypot(point.x - 50 - t * ex, point.y - 50 - t * ey);
    if (dist <= bestDist) [best, bestDist] = [i, dist];
  });
  return best;
}
const ideal = ({ pieces, first }: TortCake) => Array.from({ length: pieces - 1 }, (_, i) => (first + ((i + 1) * 360) / pieces) % 360);

function Cut({ deg, ...rest }: { deg: number } & SVGProps<SVGLineElement>) {
  const end = rim(deg);
  return <line x1={50} y1={50} x2={end.x} y2={end.y} strokeLinecap="round" {...rest} />;
}

/** Podgląd na ekranie instrukcji: tort z dwoma cięciami, trzecie miga na swoim miejscu. */
function Preview() {
  return (
    <svg viewBox="0 0 100 100" className="h-28">
      <circle cx={50} cy={50} r={RADIUS} className="fill-surface stroke-line" />
      <Cut deg={0} className="stroke-fg" strokeWidth={2} />
      <Cut deg={120} className="stroke-fg" strokeWidth={2} />
      <Cut deg={240} className="animate-[preview-half_2s_linear_infinite] stroke-success opacity-0 [animation-delay:-1s]" strokeWidth={2} />
    </svg>
  );
}

type Phase = "intro" | "play" | "reveal" | "sent";

export function Tort({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  /** Pokrojone torty. */
  const [done, setDone] = useState<number[][]>([]);
  /** Cięcia bieżącego tortu i to, które jest pod palcem. */
  const [cuts, setCuts] = useState<number[]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const index = phase === "reveal" ? done.length - 1 : done.length;
  const color = players.find((p) => p.id === me)?.color;
  const errors = (list: number[][]) => list.map((c, i) => tortError(view.cakes[i], c));

  useEffect(() => {
    if (phase !== "reveal") return;
    const id = setTimeout(() => {
      setCuts([]);
      if (done.length < TORT_CAKES) return setPhase("play");
      setPhase("sent");
      onMove({ type: "result", cuts: done });
    }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [phase]);

  /** Kąt palca względem środka tortu; null w martwej strefie. */
  function angle(e: PointerEvent<HTMLDivElement>): number | null {
    const box = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - box.left) / box.width) * 100 - 50;
    const dy = ((e.clientY - box.top) / box.height) * 100 - 50;
    if (Math.hypot(dx, dy) < DEAD) return null;
    // Zakres [0, 360): serwer odrzuca 360.
    return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  }

  function down(e: PointerEvent<HTMLDivElement>) {
    const a = angle(e);
    if (phase !== "play" || a === null) return;
    const box = e.currentTarget.getBoundingClientRect();
    const point = { x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 };
    const near = grab(cuts, point, (GRAB_PX / box.width) * 100);
    if (near === null && cuts.length === view.cakes[index].pieces - 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const at = near ?? cuts.length;
    setCuts(cuts.toSpliced(at, 1, a));
    setHeld(at);
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const a = angle(e);
    if (held !== null && a !== null) setCuts(cuts.with(held, a));
  }

  function confirm() {
    setHeld(null);
    setDone([...done, cuts]);
    setPhase("reveal");
  }

  const over = ranking !== undefined;
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? percent(view.results[id] / 10) : null };
  });

  if (!playing || phase === "sent") {
    // Na koniec torty wszystkich w jednej tabeli; w trakcie tylko własne.
    const shown = rows.filter((r) => (over || r.me) && view.cuts[r.id]).map((r) => ({ ...r, errors: errors(view.cuts[r.id]) }));
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Suma błędów z {TORT_CAKES} tortów, mniej znaczy lepiej.</p>
        {shown.length > 0 && <RoundTable heads={view.cakes.map((c) => `${c.pieces} kaw.`)} rows={shown} perfect={PERFECT} close={CLOSE} unit="% tortu do przełożenia" />}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${TORT_CAKES} tortów, każdy na 3 do 7 kawałków`}
        task="Podziel tort na równe kawałki. Dotknięcie stawia cięcie, każde swoje możesz złapać i przesunąć"
        score="Liczy się, ile tortu trzeba by przełożyć, żeby było równo. Mniej znaczy lepiej"
        onStart={() => setPhase("play")}
      />
    );
  }

  const cake = view.cakes[index];
  const mine = phase === "reveal" ? done[index] : cuts;
  const left = cake.pieces - 1 - cuts.length;
  const error = phase === "reveal" ? tortError(cake, mine) : 0;
  const tone = grade(error, PERFECT, CLOSE);

  // Na niskim ekranie kafel maleje, żeby przycisk pod nim mieścił się bez przewijania (25rem = nagłówek gry + wiersze nad i pod kaflem).
  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Tort", value: `${index + 1}/${TORT_CAKES}` },
          { label: "Kawałki", value: cake.pieces },
          { label: "Suma błędów", value: percent(errors(done).reduce((s, d) => s + d, 0)) },
        ]}
      />
      <div
        className="tile relative mx-auto aspect-square w-full max-w-[calc(100dvh-25rem)] touch-none select-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => setHeld(null)}
        onPointerCancel={() => setHeld(null)}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <circle cx={50} cy={50} r={RADIUS} className="fill-surface stroke-line-hover" strokeWidth={0.8} />
          {phase === "reveal" && ideal(cake).map((deg, i) => <Cut key={i} deg={deg} className={tone.stroke} strokeWidth={0.6} strokeDasharray="2 2" />)}
          <Cut deg={cake.first} className="stroke-fg" strokeWidth={1.2} />
          {mine.map((deg, i) => (
            <Cut key={i} deg={deg} stroke={color} strokeWidth={held === i ? 1.8 : 1.2} />
          ))}
          {/* Uchwyt na brzegu: widać, za co złapać, i które cięcia są moje. */}
          {phase === "play" && mine.map((deg, i) => <circle key={i} cx={rim(deg).x} cy={rim(deg).y} r={held === i ? 3 : 2.2} fill={color} />)}
          <circle cx={50} cy={50} r={1.4} className="fill-fg" />
        </svg>
      </div>
      <p className="flex h-10 items-center justify-center gap-3" role="status">
        {phase === "reveal" ? (
          <>
            {error <= PERFECT && <span className="text-lg font-semibold text-success">Idealnie!</span>}
            <span className={`font-mono text-3xl font-semibold tabular-nums ${tone.text}`}>{percent(error)}</span>
          </>
        ) : (
          <span className="text-sm text-fg-muted">
            {left ? `Podziel na ${cake.pieces} ${cake.pieces < 5 ? "równe kawałki" : "równych kawałków"}. Zostało cięć: ${left}` : "Popraw cięcia albo pokrój"}
          </span>
        )}
      </p>
      <button type="button" className="btn w-full text-bg disabled:opacity-40" style={{ backgroundColor: color }} disabled={phase !== "play" || left > 0} onClick={confirm}>
        Pokrój
      </button>
    </section>
  );
}
