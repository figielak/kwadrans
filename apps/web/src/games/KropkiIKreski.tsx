import { initials, kreskiEdgeEnds, type KropkiIKreskiMove, type KropkiIKreskiView, type LobbyPlayer } from "@kwadrans/games";
import { useState } from "react";
import { StickyBar, useFresh } from "../screens/ui.tsx";

interface Props {
  view: KropkiIKreskiView;
  players: LobbyPlayer[];
  canMove: boolean;
  onMove: (move: KropkiIKreskiMove) => void;
}

/** Nazwa kropki jak pola w Statkach: litera kolumny i numer wiersza („B2”). */
const dotName = (x: number, y: number) => `${String.fromCharCode(65 + x)}${y + 1}`;

/** Nazwa kreski to nazwy jej dwóch kropek („A1-B1”). */
export function edgeName(size: number, edge: number): string {
  const [[x1, y1], [x2, y2]] = kreskiEdgeEnds(size, edge);
  return `${dotName(x1, y1)}-${dotName(x2, y2)}`;
}

/** Pierwsze dotknięcie wybiera kreskę, drugie w tym samym miejscu ją wysyła, inne miejsce zmienia wybór. */
export function tap(picked: number | null, edge: number): { picked: number | null; send: number | null } {
  return picked === edge ? { picked: null, send: edge } : { picked: edge, send: null };
}

/** Wybór liczony z widoku: znika, gdy kreska jest zajęta albo gracz nie ma ruchu. */
export function freePick(view: KropkiIKreskiView, canMove: boolean, picked: number | null): number | null {
  return picked !== null && canMove && view.edges[picked] === false ? picked : null;
}

interface ScreenProps {
  view: KropkiIKreskiView;
  players: LobbyPlayer[];
  canMove: boolean;
  picked: number | null;
  onTap: (edge: number) => void;
  onSend: () => void;
}

/**
 * Kreska ma kilkanaście pikseli, więc ruch idzie w dwóch krokach (D-03): dotknięcie wybiera, drugie w tym samym miejscu
 * albo „Postaw kreskę A1-B1” wysyła. Cele dotykowe to romby rozpięte między kropkami: cztery romby wypełniają każdy kwadrat bez nakładania.
 */
export function KropkiIKreskiScreen({ view, players, canMove, picked, onTap, onSend }: ScreenProps) {
  const n = view.size;
  const colorOf = (seat: number) => players.find((p) => p.id === view.players[seat])?.color ?? "var(--color-fg-muted)";
  const nicks = view.players.map((id) => players.find((p) => p.id === id)?.nick ?? "Gracz");
  const labels = initials(nicks);
  const over = view.edges.every(Boolean);
  const myColor = colorOf(view.turn);
  const pickedFree = freePick(view, canMove, picked);
  const counts = view.players.map((_, seat) => view.boxes.filter((b) => b === seat).length);
  // Kreski i kwadraty zastane po odświeżeniu stoją od razu; animuje się tylko to, co pojawiło się po wejściu.
  const { isNew } = useFresh([...view.edges.flatMap((e, i) => (e ? [`e${i}`] : [])), ...view.boxes.flatMap((b, i) => (b === null ? [] : [`b${i}`]))]);
  const lastEdge = view.last?.edge ?? null;
  const again = canMove && !over && view.last !== null && view.last.boxes.length > 0 && view.last.seat === view.turn;
  const pct = (v: number) => `${((v + 0.5) / (n + 1)) * 100}%`;

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${view.players.length}, minmax(0, 1fr))` }}>
        {view.players.map((id, seat) => (
          <div
            key={id}
            aria-current={!over && view.turn === seat ? "true" : undefined}
            className="flex min-w-0 items-center justify-between gap-1.5 rounded-inset border border-line px-2 py-1.5 text-sm"
            style={!over && view.turn === seat ? { borderColor: colorOf(seat) } : undefined}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorOf(seat) }} aria-hidden />
              <span className="truncate">{nicks[seat]}</span>
            </span>
            <b data-count={seat} className="tabular-nums">{counts[seat]}</b>
          </div>
        ))}
      </div>

      <div className="rounded-inset border border-line bg-surface-inset p-1">
        <div className="relative aspect-square w-full">
          <svg viewBox={`-0.5 -0.5 ${n + 1} ${n + 1}`} className="absolute inset-0 size-full" role="img" aria-label={`Plansza ${n} na ${n} kwadratów`}>
            {view.boxes.map((owner, box) => {
              const x = box % n;
              const y = Math.floor(box / n);
              return (
                <g
                  key={box}
                  data-box={box}
                  className={owner !== null && isNew(`b${box}`) ? "animate-[stone-pop_0.35s_ease-out]" : undefined}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {owner !== null && (
                    <>
                      <rect x={x + 0.06} y={y + 0.06} width={0.88} height={0.88} rx={0.08} fill={`color-mix(in srgb, ${colorOf(owner)} 24%, transparent)`} />
                      <text x={x + 0.5} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={0.38} fontWeight={600} fill={colorOf(owner)}>
                        {labels[owner]}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            {view.edges.map((taken, edge) => {
              const [[x1, y1], [x2, y2]] = kreskiEdgeEnds(n, edge);
              const preview = pickedFree === edge;
              if (!taken && !preview) return <line key={edge} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-line)" strokeWidth={0.03} />;
              const isLast = lastEdge === edge && taken;
              return (
                <line
                  key={edge}
                  data-preview={preview ? "" : undefined}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={preview ? myColor : isLast && view.last ? colorOf(view.last.seat) : "var(--color-fg-muted)"}
                  strokeOpacity={preview ? 0.6 : 1}
                  strokeWidth={preview ? 0.11 : 0.09}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={preview ? "0.12 0.1" : 1}
                  className={isLast && isNew(`e${edge}`) ? "animate-[line-draw_0.5s_ease-out_backwards]" : undefined}
                />
              );
            })}
            {Array.from({ length: (n + 1) ** 2 }, (_, i) => (
              <circle key={i} data-dot cx={i % (n + 1)} cy={Math.floor(i / (n + 1))} r={0.085} fill="var(--color-fg)" />
            ))}
          </svg>
          {view.edges.map((taken, edge) => {
            const [[x1, y1], [x2, y2]] = kreskiEdgeEnds(n, edge);
            return (
              <button
                key={edge}
                type="button"
                data-edge-button
                disabled={!canMove || taken || over}
                aria-label={`Kreska ${edgeName(n, edge)}`}
                className="absolute"
                style={{
                  left: pct((x1 + x2) / 2),
                  top: pct((y1 + y2) / 2),
                  width: `${100 / (n + 1)}%`,
                  height: `${100 / (n + 1)}%`,
                  transform: "translate(-50%, -50%)",
                  clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
                }}
                onClick={() => onTap(edge)}
              />
            );
          })}
        </div>
      </div>

      {again && (
        <p role="status" className="text-center text-fg-muted">
          Masz kwadrat! Postaw następną kreskę.
        </p>
      )}

      {canMove && !over ? (
        <StickyBar>
          <button
            type="button"
            data-confirm
            className="btn h-14 w-full text-lg font-semibold btn-player disabled:opacity-40"
            style={{ backgroundColor: myColor }}
            disabled={pickedFree === null}
            onClick={onSend}
          >
            {pickedFree === null ? "Wybierz kreskę" : `Postaw kreskę ${edgeName(n, pickedFree)}`}
          </button>
        </StickyBar>
      ) : (
        !over && (
          <p role="status" className="flex h-14 items-center justify-center gap-2 text-fg-muted">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: myColor }} aria-hidden />
            {nicks[view.turn]} się zastanawia…
          </p>
        )
      )}
    </div>
  );
}

export function KropkiIKreski({ view, players, canMove, onMove }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const current = freePick(view, canMove, picked);

  function send(edge: number) {
    setPicked(null);
    onMove({ edge });
  }

  return (
    <KropkiIKreskiScreen
      view={view}
      players={players}
      canMove={canMove}
      picked={picked}
      onTap={(edge) => {
        const next = tap(current, edge);
        if (next.send !== null) send(next.send);
        else setPicked(next.picked);
      }}
      onSend={() => current !== null && send(current)}
    />
  );
}
