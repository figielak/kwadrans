import { type LabiryntCell, labiryntPawnMoves, labiryntWallError, type LabiryntView, type LabiryntWall, type LobbyPlayer } from "@kwadrans/games";
import { type PointerEvent, useEffect, useState } from "react";
import { StickyBar } from "../screens/ui.tsx";

interface Props {
  view: LabiryntView;
  me: string;
  players: LobbyPlayer[];
  canMove: boolean;
  onMove: (move: { type: "step"; x: number; y: number } | ({ type: "wall" } & LabiryntWall) | { type: "pass" }) => void;
}

/** Bok pola w jednostkach SVG; ściany leżą w szczelinach między polami. */
const CELL = 10;
const GAP = 1.6;
/** Margines viewBoxa na paski mety (sięgają 1,4 poza pola). */
const PAD = 2;

/** Obrót planszy, po którym własny start jest na dole, a meta u góry. */
const TURN: Record<LabiryntView["sides"][number], number> = { bottom: 0, left: -90, top: 180, right: 90 };

/** Ściana jako prostokąt w szczelinie: `h` pod wierszem y, `v` na prawo od kolumny x, dwa pola długości. */
function wallRect({ x, y, dir }: LabiryntWall) {
  const long = 2 * CELL - GAP;
  return dir === "h"
    ? { x: x * CELL + GAP / 2, y: (y + 1) * CELL - GAP / 2, width: long, height: GAP }
    : { x: (x + 1) * CELL - GAP / 2, y: y * CELL + GAP / 2, width: GAP, height: long };
}

/** Pasek mety przy krawędzi naprzeciw startu. */
function goalRect(side: LabiryntView["sides"][number], size: number) {
  const full = size * CELL;
  const t = 0.8;
  if (side === "bottom") return { x: 0, y: -t - 0.6, width: full, height: t };
  if (side === "top") return { x: 0, y: full + 0.6, width: full, height: t };
  if (side === "left") return { x: full + 0.6, y: 0, width: t, height: full };
  return { x: -t - 0.6, y: 0, width: t, height: full };
}

/**
 * Ściana z punktu planszy: kotwiczy się przy najbliższej krawędzi dotkniętego pola i biegnie w stronę bliższego sąsiada.
 * Szczelina ma kilka pikseli, więc nie trzeba w nią trafiać; palec można przesuwać, a podgląd idzie za nim.
 */
function wallAt(px: number, py: number, size: number): LabiryntWall {
  const cx = Math.min(size - 1, Math.max(0, Math.floor(px / CELL)));
  const cy = Math.min(size - 1, Math.max(0, Math.floor(py / CELL)));
  const fx = px / CELL - cx;
  const fy = py / CELL - cy;
  const clamp = (v: number) => Math.min(size - 2, Math.max(0, v));
  // Bliżej górnej lub dolnej krawędzi niż bocznej: ściana pozioma.
  if (Math.min(fy, 1 - fy) < Math.min(fx, 1 - fx)) return { dir: "h", x: clamp(fx < 0.5 ? cx - 1 : cx), y: clamp(fy < 0.5 ? cy - 1 : cy) };
  return { dir: "v", x: clamp(fx < 0.5 ? cx - 1 : cx), y: clamp(fy < 0.5 ? cy - 1 : cy) };
}

/**
 * Nazwa kroku tak, jak widzi go gracz na obróconej planszy: „Idź w górę”, „Przeskocz w lewo”, „Idź w prawo i w dół”.
 * Pole ma ~30 px, więc krok też idzie przez wybór i potwierdzenie.
 */
function stepName(from: LabiryntCell, to: LabiryntCell, angle: number) {
  const r = (angle * Math.PI) / 180;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const sx = Math.round(dx * Math.cos(r) - dy * Math.sin(r));
  const sy = Math.round(dx * Math.sin(r) + dy * Math.cos(r));
  const h = sx < 0 ? "w lewo" : sx > 0 ? "w prawo" : "";
  const v = sy < 0 ? "w górę" : sy > 0 ? "w dół" : "";
  if (h && v) return `Idź ${h} i ${v}`;
  return `${Math.abs(sx) + Math.abs(sy) > 1 ? "Przeskocz" : "Idź"} ${h || v}`;
}

/**
 * Dwa tryby w przełączniku: „Pionek” (kropki dozwolonych pól; dotknięcie wybiera pole, „Idź…” albo drugie dotknięcie robi krok)
 * i „Ściana” (podgląd półprzezroczysty z przerywanym obrysem, „Obróć”, „Postaw”). Plansza jest obrócona tak, żeby własny pionek stał na dole.
 */
export function Labirynt({ view, me, players, canMove, onMove }: Props) {
  const [mode, setMode] = useState<"step" | "wall">("step");
  const [picked, setPicked] = useState<LabiryntWall | null>(null);
  const [aim, setAim] = useState<LabiryntCell | null>(null);
  // Po ruchu za gracza (limit) stary wybór nie może czekać na następną turę.
  useEffect(() => setAim(null), [view.turn]);
  const [dragging, setDragging] = useState(false);
  const { size } = view;
  const full = size * CELL;
  const player = (seat: number) => players.find((p) => p.id === view.players[seat]);
  const colorOf = (seat: number) => player(seat)?.color ?? "var(--color-fg-muted)";
  const mySeat = view.players.indexOf(me);
  const myColor = colorOf(mySeat);
  const myWalls = mySeat < 0 ? 0 : view.wallsLeft[mySeat];
  const angle = mySeat < 0 ? 0 : TURN[view.sides[mySeat]];
  const targets = canMove && mode === "step" ? labiryntPawnMoves(view, view.turn) : [];
  const stuck = canMove && labiryntPawnMoves(view, view.turn).length === 0;
  const walling = canMove && mode === "wall";
  const error = walling && picked ? labiryntWallError(view, picked) : null;
  const last = view.last?.type === "wall" ? view.walls.length - 1 : -1;
  const aimed = aim && targets.some((c) => c.x === aim.x && c.y === aim.y) ? aim : null;

  /** Punkt dotknięcia w układzie planszy (przed obrotem). */
  function point(e: PointerEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const side = full + 2 * PAD;
    const sx = ((e.clientX - box.left) / box.width) * side - PAD - full / 2;
    const sy = ((e.clientY - box.top) / box.height) * side - PAD - full / 2;
    const r = (-angle * Math.PI) / 180;
    return { px: sx * Math.cos(r) - sy * Math.sin(r) + full / 2, py: sx * Math.sin(r) + sy * Math.cos(r) + full / 2 };
  }

  function down(e: PointerEvent<SVGSVGElement>) {
    if (!walling) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const { px, py } = point(e);
    setPicked(wallAt(px, py, size));
  }

  function move(e: PointerEvent<SVGSVGElement>) {
    if (!walling || !dragging) return;
    const { px, py } = point(e);
    setPicked(wallAt(px, py, size));
  }

  function up(e: PointerEvent<SVGSVGElement>) {
    setDragging(false);
    if (!canMove || mode !== "step") return;
    const { px, py } = point(e);
    const cell = { x: Math.floor(px / CELL), y: Math.floor(py / CELL) };
    if (!targets.some((c) => c.x === cell.x && c.y === cell.y)) return;
    if (aimed && aimed.x === cell.x && aimed.y === cell.y) step(aimed);
    else setAim(cell);
  }

  function step(cell: LabiryntCell) {
    setAim(null);
    onMove({ type: "step", ...cell });
  }

  function switchMode(next: "step" | "wall") {
    setMode(next);
    setPicked(null);
    setAim(null);
  }

  function place() {
    if (!picked || error) return;
    onMove({ type: "wall", ...picked });
    switchMode("step");
  }

  const previewColor = error === "blocks" ? "var(--color-warning)" : error ? "var(--color-fg-muted)" : myColor;

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Szerokość jak kafelek nagłówka: z dwurzędowym paskiem akcji plansza mieści się w 640 px. */}
      <div className="rounded-inset border border-line bg-surface-inset p-1">
        <svg
          viewBox={`${-PAD} ${-PAD} ${full + 2 * PAD} ${full + 2 * PAD}`}
          className="block w-full touch-none select-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => setDragging(false)}
          role="img"
          aria-label="Plansza labiryntu"
        >
          <g transform={`rotate(${angle} ${full / 2} ${full / 2})`}>
            {view.sides.map((side, i) => (
              <rect key={side} {...goalRect(side, size)} rx={0.4} fill={colorOf(i)} opacity={0.7} />
            ))}
            {Array.from({ length: size * size }, (_, i) => (
              <rect key={i} x={(i % size) * CELL + GAP / 2} y={Math.floor(i / size) * CELL + GAP / 2} width={CELL - GAP} height={CELL - GAP} rx={1.2} fill="var(--color-surface)" />
            ))}
            {targets.map((c) =>
              aimed && aimed.x === c.x && aimed.y === c.y ? (
                // Wybrane pole: duch pionka z przerywanym obrysem, jak podgląd ściany.
                <circle
                  key={`${c.x},${c.y}`}
                  cx={(c.x + 0.5) * CELL}
                  cy={(c.y + 0.5) * CELL}
                  r={3.3}
                  fill={myColor}
                  fillOpacity={0.3}
                  stroke={myColor}
                  strokeWidth={0.5}
                  strokeDasharray="1 0.7"
                />
              ) : (
                <circle key={`${c.x},${c.y}`} cx={(c.x + 0.5) * CELL} cy={(c.y + 0.5) * CELL} r={1.6} fill={myColor} className="animate-pulse" />
              ),
            )}
            {view.walls.map((w, i) => (
              <rect
                key={`${w.dir}${w.x},${w.y}`}
                {...wallRect(w)}
                rx={0.6}
                fill={colorOf(w.by)}
                className={i === last ? "animate-[stone-pop_0.35s_ease-out]" : ""}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            ))}
            {walling && picked && (
              <rect
                {...wallRect(picked)}
                rx={0.6}
                fill={previewColor}
                fillOpacity={error ? 0.25 : 0.5}
                stroke={previewColor}
                strokeWidth={0.35}
                strokeDasharray="1 0.7"
              />
            )}
            {view.pawns.map((p, i) => (
              <g key={i} className="transition-transform duration-200 ease-out" style={{ transform: `translate(${(p.x + 0.5) * CELL}px, ${(p.y + 0.5) * CELL}px)` }}>
                {/* Biały pierścień: czyj ruch. */}
                <circle r={3.3} fill={colorOf(i)} stroke={i === view.turn && view.winner === null ? "var(--color-fg)" : "none"} strokeWidth={0.5} />
              </g>
            ))}
          </g>
          {/* „To ja”: kreska pod własnym pionkiem, poza obróconą grupą, żeby zawsze była pod spodem. */}
          {mySeat >= 0 && (() => {
            const p = view.pawns[mySeat];
            const r = (angle * Math.PI) / 180;
            const dx = (p.x + 0.5) * CELL - full / 2;
            const dy = (p.y + 0.5) * CELL - full / 2;
            const x = dx * Math.cos(r) - dy * Math.sin(r) + full / 2;
            const y = dx * Math.sin(r) + dy * Math.cos(r) + full / 2;
            return <rect x={x - 2.4} y={y + 4} width={4.8} height={0.7} rx={0.35} fill="var(--color-fg)" className="transition-all duration-200 ease-out" aria-hidden />;
          })()}
        </svg>
      </div>

      {canMove && (
        <StickyBar>
          <div className="flex w-full flex-col gap-2">
            {/* Przełącznik dwóch stanów: zaznaczony kafel w kolorze gracza. */}
            <div className="flex gap-2" role="group" aria-label="Rodzaj ruchu">
              {(["step", "wall"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  disabled={m === "wall" && myWalls === 0}
                  className="btn btn-ghost h-12 flex-1 disabled:opacity-40"
                  style={mode === m ? { borderColor: myColor, backgroundColor: `color-mix(in srgb, ${myColor} 16%, transparent)` } : undefined}
                  onClick={() => switchMode(m)}
                >
                  {m === "step" ? "Pionek" : `Ściana (${myWalls})`}
                </button>
              ))}
            </div>
            {mode === "step" ? (
              stuck ? (
                <button type="button" className="btn btn-ghost h-14 w-full" onClick={() => onMove({ type: "pass" })}>
                  Nie masz kroku, czekam
                </button>
              ) : (
                <button
                  type="button"
                  className="btn h-14 w-full text-lg font-semibold text-bg disabled:opacity-40"
                  style={{ backgroundColor: myColor }}
                  disabled={!aimed}
                  onClick={() => aimed && step(aimed)}
                >
                  {aimed ? stepName(view.pawns[view.turn], aimed, angle) : "Dotknij pola z kropką"}
                </button>
              )
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost h-14 px-5 disabled:opacity-40"
                  disabled={!picked}
                  onClick={() => picked && setPicked({ ...picked, dir: picked.dir === "h" ? "v" : "h" })}
                >
                  Obróć
                </button>
                <button
                  type="button"
                  className={`btn h-14 flex-1 font-semibold disabled:opacity-40 ${error === "blocks" ? "border border-warning text-warning" : "text-bg"}`}
                  style={error === "blocks" ? undefined : { backgroundColor: myColor }}
                  disabled={!picked || error !== null}
                  onClick={place}
                >
                  {!picked ? "Dotknij krawędzi pola" : error === "taken" ? "Zajęte" : error === "blocks" ? "Zamyka drogę" : "Postaw"}
                </button>
              </div>
            )}
          </div>
        </StickyBar>
      )}
    </div>
  );
}
