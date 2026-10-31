import { type LobbyPlayer, nozyczkiAccepts, type NozyczkiCut, nozyczkiError, type NozyczkiPoint, NOZYCZKI_SHAPES, nozyczkiShare, nozyczkiSplit, type NozyczkiView } from "@kwadrans/games";
import { type PointerEvent, useEffect, useState } from "react";
import { grade, Intro, RoundTable, Scores, Stats, tenth } from "../screens/ui.tsx";

interface Props {
  view: NozyczkiView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; cuts: NozyczkiCut[] }) => void;
}

/** Tyle ms widać obie części i błąd, zanim wskoczy następny kształt. */
const REVEAL_MS = 1500;
/** Progi celności w punktach procentowych: do PERFECT „Idealnie!” na zielono, powyżej CLOSE kolor ostrzeżenia. */
const PERFECT = 1;
const CLOSE = 5;

const percent = (n: number) => `${tenth(n)}%`;
const path = (shape: NozyczkiPoint[]) => shape.map((p) => `${p.x * 100},${p.y * 100}`).join(" ");
/** Końce prostej cięcia daleko poza kaflem (SVG sam ją przytnie), w jednostkach viewBox. */
function line({ a, b }: NozyczkiCut) {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const [dx, dy] = [((b.x - a.x) / length) * 200, ((b.y - a.y) / length) * 200];
  return { x1: a.x * 100 - dx, y1: a.y * 100 - dy, x2: a.x * 100 + dx, y2: a.y * 100 + dy };
}

/** Podgląd na ekranie instrukcji: kształt, przez który miga linia cięcia. */
function Preview() {
  return (
    <svg viewBox="0 0 100 100" className="h-28">
      <path d="M22 48 C20 24 44 14 60 22 S88 40 78 62 S44 90 30 76 S23 60 22 48Z" className="fill-surface stroke-fg" strokeWidth={2} />
      <line x1={10} y1={72} x2={92} y2={26} className="animate-[preview-half_2s_linear_infinite] stroke-success opacity-0 [animation-delay:-1s]" strokeWidth={2} strokeDasharray="5 4" />
    </svg>
  );
}

type Phase = "intro" | "play" | "reveal" | "sent";

export function Nozyczki({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [cuts, setCuts] = useState<NozyczkiCut[]>([]);
  /** Prosta pod palcem: od miejsca dotknięcia do palca; liczy się dopiero puszczenie. */
  const [aim, setAim] = useState<NozyczkiCut | null>(null);
  /** Ile razy z rzędu ruch nie był cięciem; klucz potrząśnięcia i podpowiedzi. */
  const [miss, setMiss] = useState(0);
  const index = phase === "reveal" ? cuts.length - 1 : cuts.length;
  const color = players.find((p) => p.id === me)?.color;
  const errors = (list: NozyczkiCut[]) => list.map((c, i) => nozyczkiError(view.shapes[i], c));

  useEffect(() => {
    if (phase !== "reveal") return;
    const id = setTimeout(() => {
      if (cuts.length < NOZYCZKI_SHAPES) return setPhase("play");
      setPhase("sent");
      onMove({ type: "result", cuts });
    }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [phase]);

  function point(e: PointerEvent<HTMLDivElement>): NozyczkiPoint {
    const box = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - box.left) / box.width, y: (e.clientY - box.top) / box.height };
  }

  function down(e: PointerEvent<HTMLDivElement>) {
    if (phase !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    setAim({ a: p, b: p });
  }

  function up(e: PointerEvent<HTMLDivElement>) {
    if (!aim) return;
    const cut = { a: aim.a, b: point(e) };
    setAim(null);
    // Za krótki ruch albo prosta obok kształtu to nie odpowiedź (serwer też by ją odrzucił): runda trwa dalej, bez kary.
    if (!nozyczkiAccepts(view.shapes[index], cut)) {
      return setMiss(miss + 1);
    }
    setMiss(0);
    setCuts([...cuts, cut]);
    setPhase("reveal");
  }

  const over = ranking !== undefined;
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? percent(view.results[id] / 10) : null };
  });

  if (!playing || phase === "sent") {
    // Na koniec cięcia wszystkich w jednej tabeli; w trakcie tylko własne.
    const shown = rows.filter((r) => (over || r.me) && view.cuts[r.id]).map((r) => ({ ...r, errors: errors(view.cuts[r.id]) }));
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Suma błędów z {NOZYCZKI_SHAPES} kształtów, mniej znaczy lepiej.</p>
        {shown.length > 0 && <RoundTable heads={view.shapes.map((_, i) => i + 1)} rows={shown} perfect={PERFECT} close={CLOSE} unit="o ile % części odbiegają od połowy" />}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${NOZYCZKI_SHAPES} kształtów, każdy na jedno cięcie`}
        task="Przeciągnij palcem przez kształt tak, żeby obie części były równe. Liczy się prosta w chwili puszczenia"
        score="Liczy się, o ile części odbiegają od połowy. Mniej znaczy lepiej"
        onStart={() => setPhase("play")}
      />
    );
  }

  const shape = view.shapes[index];
  const done = phase === "reveal" ? cuts[index] : null;
  const error = done ? nozyczkiError(shape, done) : 0;
  const part = done ? nozyczkiShare(shape, done) * 100 : 0;
  const tone = grade(error, PERFECT, CLOSE);
  // Prostą widać dopiero, gdy ruch ma kierunek (dwa różne punkty).
  const drawn = done ?? (aim && (aim.a.x !== aim.b.x || aim.a.y !== aim.b.y) ? aim : null);

  // Na niskim ekranie kafel maleje, żeby wiersz pod nim mieścił się bez przewijania (21rem = nagłówek gry + wiersze nad i pod kaflem).
  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Kształt", value: `${index + 1}/${NOZYCZKI_SHAPES}` },
          { label: "Suma błędów", value: percent(errors(cuts).reduce((s, d) => s + d, 0)) },
        ]}
      />
      <div
        className="tile relative mx-auto aspect-square w-full max-w-[calc(100dvh-21rem)] touch-none overflow-hidden select-none"
        onPointerDown={down}
        onPointerMove={(e) => aim && setAim({ a: aim.a, b: point(e) })}
        onPointerUp={up}
        onPointerCancel={() => setAim(null)}
      >
        <svg key={miss} viewBox="0 0 100 100" className={`absolute inset-0 size-full ${miss ? "animate-[shake_0.3s_ease-out]" : ""}`} aria-hidden>
          {done ? (
            // Obie części w kolorze gracza, różne krycie; bez obrysu, bo kawałki jednej strony łączą odcinki o zerowej szerokości.
            nozyczkiSplit(shape, done).map((half, i) => <polygon key={i} points={path(half)} fill={color} fillOpacity={i ? 0.35 : 0.8} />)
          ) : (
            <polygon points={path(shape)} className="fill-surface stroke-fg" strokeWidth={0.8} strokeLinejoin="round" />
          )}
          {drawn && <line {...line(drawn)} stroke={done ? "var(--color-fg)" : color} strokeWidth={done ? 0.6 : 0.8} strokeDasharray={done ? undefined : "2 1.5"} />}
        </svg>
      </div>
      <p className="flex h-10 items-center justify-center gap-3" role="status">
        {done ? (
          <>
            {error <= PERFECT && <span className="text-lg font-semibold text-success">Idealnie!</span>}
            <span className={`font-mono text-2xl font-semibold tabular-nums ${tone.text}`}>
              {percent(part)} | {percent(100 - part)}
            </span>
          </>
        ) : miss ? (
          <span className="text-sm text-warning">Przetnij kształt</span>
        ) : (
          <span className="text-sm text-fg-muted">Przetnij kształt na pół jednym ruchem</span>
        )}
      </p>
    </section>
  );
}
