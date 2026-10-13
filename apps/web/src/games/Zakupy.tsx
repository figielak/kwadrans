import { type LobbyPlayer, ZAKUPY_LIST, ZAKUPY_MAX_MS, ZAKUPY_SHOW_MS, type ZakupyView } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import { Intro, Scores, Stats, tenth } from "../screens/ui.tsx";

interface Props {
  view: ZakupyView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; picked: number[]; ms: number }) => void;
}

type Phase = "intro" | "show" | "pick" | "sent";

/** „1 błąd”, „2 błędy”, „5 błędów”. */
const wrongLabel = (n: number) => `${n} ${n === 1 ? "błąd" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "błędy" : "błędów"}`;

/** Podgląd na ekranie instrukcji: kilka przedmiotów, z których część migają jako „z listy”. */
function Preview({ color }: { color?: string }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {["🍎", "🥛", "🍞", "🧀", "🍌", "🍫"].map((emoji, i) => (
        <span key={emoji} className="relative flex size-9 items-center justify-center rounded-inset border border-line bg-surface text-xl">
          {emoji}
          {i % 2 === 0 && (
            <span
              className="absolute -inset-px animate-[preview-half_3s_linear_infinite] rounded-inset border-2 opacity-0"
              style={{ borderColor: color, animationDelay: `${i * -0.5}s` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

export function Zakupy({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [picked, setPicked] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  /** Pasek pokazu startuje od pełnego i po zamontowaniu przechodzi do zera. */
  const [draining, setDraining] = useState(false);
  const start = useRef(0);
  const color = players.find((p) => p.id === me)?.color;

  useEffect(() => {
    if (phase !== "show") return;
    setDraining(true);
    const id = setTimeout(() => {
      start.current = performance.now();
      setPhase("pick");
    }, ZAKUPY_SHOW_MS);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "pick") return;
    const id = setInterval(() => setElapsed(performance.now() - start.current), 200);
    return () => clearInterval(id);
  }, [phase]);

  function toggle(i: number) {
    if (phase !== "pick") return;
    setPicked((list) => (list.includes(i) ? list.filter((n) => n !== i) : [...list, i]));
  }

  function done() {
    if (phase !== "pick") return;
    setPhase("sent");
    onMove({ type: "result", picked, ms: Math.min(ZAKUPY_MAX_MS, Math.round(performance.now() - start.current)) });
  }

  if (!playing || phase === "sent") {
    const all = (ranking ?? view.players).map((id) => {
      const p = players.find((pl) => pl.id === id);
      const r = view.results[id];
      return {
        id,
        nick: p?.nick ?? "Gracz",
        color: p?.color,
        me: id === me,
        score: r ? `${r.score} pkt (${r.hits} traf., ${wrongLabel(r.wrong)}) · ${tenth(r.ms / 1000)} s` : null,
      };
    });
    const who = view.players.map((id) => ({ id, color: players.find((p) => p.id === id)?.color }));
    return (
      <>
        <Scores rows={all} />
        <p className="text-sm text-fg-muted">Trafienia minus zaznaczenia spoza listy. Przy remisie wygrywa szybszy.</p>
        <section className="tile flex flex-col gap-2 p-3">
          <span className="text-sm text-fg-muted">Lista zakupów</span>
          <div className="grid grid-cols-5 gap-1">
            {view.items.map((item, i) => {
              const onList = view.listed.includes(i);
              return (
                <span
                  key={i}
                  className={`relative flex aspect-square items-center justify-center rounded-inset border text-2xl ${onList ? "border-success bg-surface" : "border-line opacity-60"}`}
                  aria-label={onList ? `${item}, z listy` : item}
                >
                  {item}
                  <span className="absolute bottom-0.5 flex gap-0.5">
                    {who.filter((w) => view.picked[w.id]?.includes(i)).map((w) => (
                      <span key={w.id} className="size-1.5 rounded-full" style={{ backgroundColor: w.color }} aria-hidden />
                    ))}
                  </span>
                </span>
              );
            })}
          </div>
          <p className="text-xs text-fg-muted">Zielona ramka: przedmiot był na liście. Kropki: kto go zaznaczył.</p>
        </section>
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview color={color} />}
        time="10 s na zapamiętanie, potem zaznaczasz"
        task={`Zapamiętaj ${ZAKUPY_LIST} przedmiotów z listy, potem wskaż je na półce pełnej innych`}
        score="Trafienia minus pomyłki, przy remisie wygrywa szybszy"
        onStart={() => setPhase("show")}
      />
    );
  }

  if (phase === "show") {
    return (
      <section className="flex flex-col gap-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div className="h-full" style={{ width: draining ? "0%" : "100%", backgroundColor: color, transition: `width ${ZAKUPY_SHOW_MS}ms linear` }} />
        </div>
        <div className="tile grid grid-cols-5 gap-1 p-3">
          {view.listed.map((i) => (
            <span key={i} className="flex aspect-square items-center justify-center rounded-inset border border-line text-3xl">
              {view.items[i]}
            </span>
          ))}
        </div>
        <p className="text-center text-sm text-fg-muted">Zapamiętaj te przedmioty. Za chwilę znikną.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Zaznaczone", value: picked.length },
          { label: "Czas", value: `${tenth(elapsed / 1000)} s` },
        ]}
      />
      <div className="tile grid touch-none grid-cols-5 gap-1 p-3 select-none">
        {view.items.map((item, i) => {
          const on = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              aria-pressed={on}
              className="flex aspect-square min-h-12 items-center justify-center rounded-inset border border-line bg-surface text-2xl"
              style={on ? { borderColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined}
              onPointerDown={() => toggle(i)}
              // Klawiatura (Enter, spacja) daje click bez wskaźnika; dotyk i mysz obsługuje już pointerdown.
              onClick={(e) => e.detail === 0 && toggle(i)}
            >
              {item}
            </button>
          );
        })}
      </div>
      <button type="button" className="btn text-bg" style={{ backgroundColor: color }} onClick={done}>
        Gotowe
      </button>
      <p className="text-center text-sm text-fg-muted">Zaznacz przedmioty z listy. Każdy zły zabiera punkt.</p>
    </section>
  );
}
