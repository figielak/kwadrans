import { GAMES, type LobbyPlayer, SRODEK_ACCEPT_PX, srodekError, srodekOffset, srodekProject, SRODEK_ROUNDS, type SrodekPoint, type SrodekView } from "@kwadrans/games";
import { type PointerEvent, useEffect, useState } from "react";
import { grade as gradeBy, Intro, RoundTable, Scores, Stats, upTo } from "../screens/ui.tsx";

interface Props {
  view: SrodekView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; taps: SrodekPoint[] }) => void;
}

/** Tyle ms widać prawdziwy środek i własny punkt na odcinku, zanim wskoczy następna runda. */
const REVEAL_MS = 1000;
/** Progi celności w % długości odcinka: do PERFECT „Idealnie!” na zielono, powyżej CLOSE kolor ostrzeżenia. */
const PERFECT = 2;
const CLOSE = 8;
/** Połowa długości poprzecznej kreski na końcu odcinka, w jednostkach viewBox. */
const TICK = 2;

const num = (n: number) => n.toFixed(1).replace(".", ",");
const percent = (n: number) => `${num(n)}%`;
const grade = (d: number) => gradeBy(d, PERFECT, CLOSE);

/** Odcinek z poprzecznymi kreskami na końcach, żeby było jednoznaczne, gdzie się zaczyna i kończy. */
function Segment({ a, b }: { a: SrodekPoint; b: SrodekPoint }) {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const nx = (-(b.y - a.y) / length) * TICK;
  const ny = ((b.x - a.x) / length) * TICK;
  return (
    <g className="stroke-fg" strokeWidth={0.8}>
      <line x1={a.x * 100} y1={a.y * 100} x2={b.x * 100} y2={b.y * 100} />
      {[a, b].map((p, i) => (
        <line key={i} x1={p.x * 100 - nx} y1={p.y * 100 - ny} x2={p.x * 100 + nx} y2={p.y * 100 + ny} />
      ))}
    </g>
  );
}

/** Podgląd na ekranie instrukcji: odcinek, na którego środku miga punkt. */
function Preview() {
  return (
    <>
      <span className="relative h-0.5 w-40 -rotate-12 bg-fg before:absolute before:-top-1.5 before:left-0 before:h-3.5 before:w-0.5 before:bg-fg after:absolute after:-top-1.5 after:right-0 after:h-3.5 after:w-0.5 after:bg-fg" />
      <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 animate-[preview-half_2s_linear_infinite] rounded-full bg-success opacity-0 [animation-delay:-1s]" />
    </>
  );
}

type Phase = "intro" | "play" | "reveal" | "sent";

export function Srodek({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [taps, setTaps] = useState<SrodekPoint[]>([]);
  /** Punkt pod przytrzymanym palcem; liczy się dopiero miejsce puszczenia. */
  const [aim, setAim] = useState<SrodekPoint | null>(null);
  /** Ile razy z rzędu dotknięcie wypadło poza strefą; klucz potrząśnięcia i podpowiedzi. */
  const [miss, setMiss] = useState(0);
  const index = phase === "reveal" ? taps.length - 1 : taps.length;
  const color = players.find((p) => p.id === me)?.color;
  const distances = (list: SrodekPoint[]) => list.map((t, i) => srodekError(view.segments[i], t));

  useEffect(() => {
    if (phase !== "reveal") return;
    const id = setTimeout(() => {
      if (taps.length < SRODEK_ROUNDS) return setPhase("play");
      setPhase("sent");
      onMove({ type: "result", taps });
    }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [phase]);

  function point(e: PointerEvent<HTMLDivElement>): SrodekPoint {
    const box = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - box.left) / box.width, y: (e.clientY - box.top) / box.height };
  }

  function down(e: PointerEvent<HTMLDivElement>) {
    if (phase !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setAim(point(e));
  }

  function up(e: PointerEvent<HTMLDivElement>) {
    if (!aim) return;
    const p = point(e);
    setAim(null);
    // Poza strefą to nie odpowiedź (serwer też by ją odrzucił): runda trwa dalej, bez kary.
    if (srodekOffset(view.segments[index], p) > SRODEK_ACCEPT_PX) {
      return setMiss(miss + 1);
    }
    setMiss(0);
    setTaps([...taps, p]);
    setPhase("reveal");
  }

  const over = ranking !== undefined;
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? percent(view.results[id] / 10) : null };
  });

  if (!playing || phase === "sent") {
    // Na koniec rundy wszystkich w jednej tabeli; w trakcie tylko własne.
    const shown = rows.filter((r) => (over || r.me) && view.taps[r.id]).map((r) => ({ ...r, errors: distances(view.taps[r.id]) }));
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Suma błędów z {SRODEK_ROUNDS} rund, mniej znaczy lepiej.</p>
        {shown.length > 0 && (
          <RoundTable
            heads={view.segments.map((_, i) => i + 1)}
            rows={shown}
            perfect={PERFECT}
            close={CLOSE}
            unit="% długości odcinka"
            // Na ekranie 360 px komórka mieści trzy znaki.
            format={(d) => (d < 10 ? num(d) : `${Math.round(d)}`)}
          />
        )}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${SRODEK_ROUNDS} odcinków, razem ${upTo(GAMES.srodek.turnSeconds!)}`}
        task="Wskaż połowę odcinka. Możesz dotknąć obok i przesunąć palec, liczy się miejsce puszczenia"
        score="Liczy się suma błędów w % długości odcinka, mniej znaczy lepiej"
        onStart={() => setPhase("play")}
      />
    );
  }

  const segment = view.segments[index];
  const mid = { x: (segment.a.x + segment.b.x) / 2, y: (segment.a.y + segment.b.y) / 2 };
  // Liczy się rzut dotknięcia na odcinek, więc to jego pokazujemy: w trakcie celowania (tylko w strefie) i po puszczeniu.
  const spot = aim && srodekOffset(segment, aim) <= SRODEK_ACCEPT_PX ? srodekProject(segment, aim) : null;
  const mine = phase === "reveal" ? srodekProject(segment, taps[index]) : null;
  const error = mine ? srodekError(segment, taps[index]) : 0;

  // Na niskim ekranie kafel maleje, żeby wiersz pod nim mieścił się bez przewijania (21rem = nagłówek gry + wiersze nad i pod kaflem).
  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Runda", value: `${index + 1}/${SRODEK_ROUNDS}` },
          { label: "Suma błędów", value: percent(distances(taps).reduce((s, d) => s + d, 0)) },
        ]}
      />
      <div
        className="tile relative mx-auto aspect-square w-full max-w-[calc(100dvh-21rem)] touch-none select-none"
        onPointerDown={down}
        onPointerMove={(e) => aim && setAim(point(e))}
        onPointerUp={up}
        onPointerCancel={() => setAim(null)}
      >
        <svg key={miss} viewBox="0 0 100 100" className={`absolute inset-0 size-full ${miss ? "animate-[shake_0.3s_ease-out]" : ""}`} aria-hidden>
          <Segment {...segment} />
          {spot && <circle cx={spot.x * 100} cy={spot.y * 100} r={1.6} fill="none" stroke={color} strokeWidth={0.6} />}
          {mine && (
            <>
              {/* Błąd biegnie wzdłuż odcinka: od środka do miejsca rzutu. */}
              <line x1={mid.x * 100} y1={mid.y * 100} x2={mine.x * 100} y2={mine.y * 100} className={grade(error).stroke} strokeWidth={1.8} />
              <circle cx={mine.x * 100} cy={mine.y * 100} r={1.6} fill={color} />
              {/* Pierścień, nie pełna kropka: przy celnym dotknięciu oba punkty widać naraz. Prawda neutralna, ocena na linii błędu. */}
              <circle cx={mid.x * 100} cy={mid.y * 100} r={2.6} fill="none" className="stroke-fg" strokeWidth={0.6} />
            </>
          )}
        </svg>
      </div>
      <p className="flex h-10 items-center justify-center gap-3" role="status">
        {mine ? (
          <>
            {error <= PERFECT && <span className="text-lg font-semibold text-success">Idealnie!</span>}
            <span className={`font-mono text-3xl font-semibold tabular-nums ${grade(error).text}`}>{percent(error)}</span>
          </>
        ) : miss ? (
          <span className="text-sm text-warning">Dotknij bliżej odcinka</span>
        ) : (
          <span className="text-sm text-fg-muted">Dotknij odcinka w połowie długości</span>
        )}
      </p>
    </section>
  );
}
