import { KUBKI_ROUNDS, KUBKI_SHOW_MS, kubkiBallAt, kubkiSwapMs, type KubkiView, type LobbyPlayer } from "@kwadrans/games";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { Intro, Scores, Stats } from "../screens/ui.tsx";

interface Props {
  view: KubkiView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; picks: number[] }) => void;
}

type Phase = "intro" | "wait" | "show" | "shuffle" | "pick" | "reveal" | "sent";

/** Fazy na zegarze: kubki opadają, kulka pod uniesionym kubkiem, prawdziwe miejsce kulki po wskazaniu. */
const TIMED: Partial<Record<Phase, number>> = { wait: 300, show: KUBKI_SHOW_MS, reveal: 1000 };

const CUPS = [0, 1, 2];
const IDENTITY = CUPS;
/** Środek miejsca w % szerokości kafla. */
const slotX = (slot: number) => (slot + 0.5) * (100 / CUPS.length);
/** Wysokość łuku zamiany w % wysokości kubka. */
const ARC = 30;

/** Miejsce każdego kubka po kolejnych zamianach (kubek ma numer swojego miejsca na starcie). */
const settle = (swaps: number[][], from = IDENTITY) => swaps.reduce((slots, [a, b]) => slots.map((s) => (s === a ? b : s === b ? a : s)), from);

/** „1 runda”, „3 rundy”, „7 rund”. */
const roundsLabel = (n: number) => `${n} ${n === 1 ? "runda" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "rundy" : "rund"}`;

const CUP_SHAPE = "polygon(12% 0, 88% 0, 100% 100%, 0 100%)";

function Preview({ color }: { color?: string }) {
  return (
    <div className="flex items-end gap-4">
      {CUPS.map((i) => (
        <div key={i} className="relative flex h-16 w-12 flex-col items-center justify-end">
          {i === 1 && <span className="absolute -top-1 size-4 animate-[preview-half_3s_linear_infinite] rounded-full" style={{ backgroundColor: color }} />}
          <span className="h-12 w-full bg-fg" style={{ clipPath: CUP_SHAPE }} />
        </div>
      ))}
    </div>
  );
}

export function Kubki({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  /** Wskazane miejsca z zakończonych rund. */
  const [picks, setPicks] = useState<number[]>([]);
  const cups = useRef<(HTMLDivElement | null)[]>([]);
  const color = players.find((p) => p.id === me)?.color;

  const round = Math.min(phase === "reveal" ? picks.length - 1 : picks.length, KUBKI_ROUNDS - 1);
  const { ball, swaps } = view.rounds[round];
  const ballSlot = kubkiBallAt(view.rounds[round]);
  const failed = phase === "reveal" && picks[round] !== ballSlot;

  /** Gdzie stoi każdy kubek: po zamianach, a przy opadaniu przed nową rundą jeszcze tam, gdzie skończyła poprzednia. */
  const slots = phase === "pick" || phase === "reveal" ? settle(swaps) : phase === "wait" && round > 0 ? settle(view.rounds[round - 1].swaps) : IDENTITY;

  useEffect(() => {
    const ms = TIMED[phase];
    if (ms === undefined) return;
    const id = setTimeout(() => {
      if (phase === "wait") return setPhase("show");
      if (phase === "show") return setPhase("shuffle");
      if (failed || picks.length >= KUBKI_ROUNDS) {
        setPhase("sent");
        return onMove({ type: "result", picks });
      }
      setPhase("wait");
    }, ms);
    return () => clearTimeout(id);
  }, [phase]);

  // Tasowanie ustawia pozycje wprost w DOM (jak Śledzenie): kubki są identyczne, więc przejście CSS zerowane przez
  // `prefers-reduced-motion` zamieniłoby ruch w przeskoki, których nie da się śledzić. Jeden kubek idzie łukiem górą, drugi dołem.
  useEffect(() => {
    if (phase !== "shuffle") return;
    const ms = kubkiSwapMs(round);
    const total = swaps.length * ms;
    const put = (cup: number, x: number, dy: number) => {
      const el = cups.current[cup];
      if (!el) return;
      el.style.left = `${x}%`;
      el.style.transform = `translate(-50%, ${dy}%)`;
    };
    const start = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      // Znacznik klatki bywa sprzed `start`: ujemny czas dałby krok -1 i wyjątek, który zamraża tasowanie.
      const t = Math.max(0, now - start);
      if (t >= total) {
        settle(swaps).forEach((slot, cup) => put(cup, slotX(slot), 0));
        return setPhase("pick");
      }
      const step = Math.floor(t / ms);
      const p = (t - step * ms) / ms;
      const [a, b] = swaps[step];
      settle(swaps.slice(0, step)).forEach((slot, cup) => {
        if (slot !== a && slot !== b) return put(cup, slotX(slot), 0);
        const to = slot === a ? b : a;
        const arc = Math.sin(Math.PI * p) * ARC * (slot === a ? -1 : 1);
        put(cup, slotX(slot) + (slotX(to) - slotX(slot)) * p, arc);
      });
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [phase]);

  // Dotyk łapie cały kafel i wybiera najbliższe miejsce: kubek jest tylko celem, pole dotyku ma pełną szerokość.
  function tap(e: PointerEvent<HTMLDivElement>) {
    if (phase !== "pick") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const slot = Math.min(CUPS.length - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * CUPS.length)));
    setPicks([...picks, slot]);
    setPhase("reveal");
    if (slot !== ballSlot) navigator.vibrate?.(60);
  }

  if (!playing || phase === "sent") {
    const rows = (ranking ?? view.players).map((id) => {
      const p = players.find((pl) => pl.id === id);
      const r = view.results[id];
      return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: r === undefined ? null : roundsLabel(r) };
    });
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Liczą się rundy bez pomyłki (najwyżej {KUBKI_ROUNDS}). Pierwsza pomyłka kończy partię.</p>
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview color={color} />}
        time={`Do ${KUBKI_ROUNDS} rund, kubki mieszają się coraz szybciej`}
        task="Zapamiętaj, pod którym kubkiem jest kulka, śledź go przy tasowaniu i wskaż po zatrzymaniu"
        score="Pierwsza pomyłka kończy partię, liczą się zaliczone rundy"
        onStart={() => setPhase("wait")}
      />
    );
  }

  const status = phase === "shuffle" ? "Śledź" : phase === "pick" ? "Wskaż" : phase === "reveal" ? (failed ? "Pomyłka" : "Dobrze") : "Patrz";

  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Runda", value: `${round + 1}/${KUBKI_ROUNDS}` },
          { label: "Teraz", value: status, warn: failed },
        ]}
      />
      <div className="tile relative mx-auto aspect-[3/2] w-full max-w-[calc(100dvh-19rem)] touch-none select-none overflow-hidden" onPointerDown={tap}>
        {CUPS.map((cup) => {
          // Kulka jedzie z kubkiem, pod którym ją położono; uniesiony jest ten kubek (na początku rundy i po wskazaniu).
          const hasBall = cup === ball;
          const lifted = phase === "show" || (phase === "reveal" && slots[cup] === ballSlot);
          return (
            <div
              key={cup}
              ref={(el) => {
                cups.current[cup] = el;
              }}
              className="absolute top-[30%] h-[45%] w-[24%]"
              style={{ left: `${slotX(slots[cup])}%`, transform: "translate(-50%, 0)" }}
            >
              {hasBall && <span className="absolute bottom-0 left-1/2 aspect-square w-[40%] -translate-x-1/2 rounded-full" style={{ backgroundColor: color }} />}
              <span
                className="absolute inset-0 bg-fg transition-transform duration-150"
                style={{
                  clipPath: CUP_SHAPE,
                  transform: lifted ? "translateY(-55%)" : undefined,
                  opacity: failed && slots[cup] === picks[round] ? 0.3 : 1,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
