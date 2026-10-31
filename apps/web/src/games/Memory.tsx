import { DiamondsFour } from "@phosphor-icons/react";
import { initials, type LobbyPlayer, type MemoryView } from "@kwadrans/games";
import { useEffect, useState } from "react";
import { useFresh } from "../screens/ui.tsx";

interface Props {
  view: MemoryView;
  players: LobbyPlayer[];
  canMove: boolean;
  onMove: (move: { card: number }) => void;
}

/** Jak długo widać nietrafioną parę. Tura już wtedy należy do następnego gracza, a jego ruch zakrywa karty wcześniej. */
const MISS_MS = 1500;

/** Emoji i nazwa (dla czytników ekranu) każdego symbolu; kolejność to numer symbolu z serwera (MEMORY_SYMBOLS = 18).
 * Dobrane tak, żeby żadne dwa nie miały podobnego koloru i kształtu naraz. */
const EMOJI: [string, string][] = [
  ["🍎", "jabłko"],
  ["🐸", "żaba"],
  ["⭐", "gwiazda"],
  ["🐳", "wieloryb"],
  ["🍇", "winogrona"],
  ["🎃", "dynia"],
  ["🐷", "świnia"],
  ["🐼", "panda"],
  ["👻", "duch"],
  ["🌈", "tęcza"],
  ["🚀", "rakieta"],
  ["🎸", "gitara"],
  ["💎", "diament"],
  ["🍄", "grzyb"],
  ["🌵", "kaktus"],
  ["🍪", "ciastko"],
  ["🦄", "jednorożec"],
  ["🌍", "Ziemia"],
];

export function Memory({ view, players, canMove, onMove }: Props) {
  const colorOf = (id: string | null) => players.find((p) => p.id === id)?.color ?? "var(--color-fg-muted)";
  // Drugi znak oprócz koloru: inicjał właściciela na zebranej parze.
  const labels = initials(view.players.map((id) => players.find((p) => p.id === id)?.nick ?? "?"));
  const turnId = view.players[view.turn];
  const turnColor = colorOf(turnId);
  const turnNick = players.find((p) => p.id === turnId)?.nick ?? "Przeciwnik";
  const over = view.owner.every((o) => o !== null);
  // Pary zastane po odświeżeniu leżą od razu; wskakuje tylko para zebrana po wejściu.
  const { isNew } = useFresh(view.owner.flatMap((o, i) => (o === null ? [] : [i])));

  // Widok trzyma pudło do następnego ruchu; ekran zakrywa je sam po MISS_MS.
  const missKey = view.miss?.join();
  const [missShown, setMissShown] = useState(true);
  useEffect(() => {
    setMissShown(true);
    if (!missKey) return;
    const id = setTimeout(() => setMissShown(false), MISS_MS);
    return () => clearTimeout(id);
  }, [missKey]);

  // Plansza wyższa niż szersza (4×6) dostaje niższe karty, żeby zmieścić się na ekranie 360×640.
  const tall = view.faces.length / view.cols > view.cols;

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${view.cols}, minmax(0, 1fr))` }}>
        {view.faces.map((face, i) => {
          const owner = view.owner[i];
          const up = face !== null && (owner !== null || i === view.first || (missShown && !!view.miss?.includes(i)));
          const [emoji, name] = face === null ? ["", ""] : EMOJI[face];
          // Karta „w grze” (pierwsza w tej turze) świeci i pulsuje kolorem gracza na ruchu; zebrana para jest przygaszona
          // w kolorze właściciela, a pudło zostaje neutralne.
          const live = owner === null && i === view.first;
          const color = owner !== null ? colorOf(owner) : live ? turnColor : undefined;
          return (
            <button
              key={i}
              type="button"
              disabled={!canMove || up}
              aria-label={`Karta ${i + 1}, ${up ? name : "zakryta"}${owner !== null ? `, para: ${players.find((p) => p.id === owner)?.nick ?? "Gracz"}` : ""}`}
              className={`${tall ? "aspect-5/4" : "aspect-square"} min-h-12 perspective-[600px]`}
              onClick={() => onMove({ card: i })}
            >
              <span className={`relative block size-full transition-transform duration-180 transform-3d ${up ? "rotate-y-180" : ""}`}>
                {/* Rewers: jaśniejszy od tła, żeby karta wyglądała na kartę; poza moją turą przygaszony („teraz nic nie klikasz”). */}
                <span
                  className={`absolute inset-0 grid place-items-center rounded-inset border border-line-hover bg-linear-to-br from-[color-mix(in_srgb,var(--color-fg)_12%,var(--color-bg))] to-surface text-fg-subtle transition-opacity duration-180 backface-hidden ${
                    canMove ? "" : "opacity-40"
                  }`}
                  aria-hidden
                >
                  <DiamondsFour className="size-[38%]" weight="fill" />
                </span>
                <span
                  className={`@container absolute inset-0 grid rotate-y-180 place-items-center rounded-inset border bg-surface-inset backface-hidden ${
                    live ? "animate-[ring-pulse_1.2s_ease-in-out_infinite] border-2 outline-2" : owner !== null ? "opacity-60" : "border-line-hover"
                  }`}
                  style={
                    color === undefined ? undefined : {
                      borderColor: color,
                      outlineColor: color,
                      color,
                      backgroundColor: `color-mix(in srgb, ${color} ${live ? 22 : 12}%, var(--color-surface-inset))`,
                    }
                  }
                  aria-hidden
                >
                  {/* Animacja na emoji, nie na ściance: transform z keyframes nadpisałby jej obrót. */}
                  <span className={`text-[50cqw] leading-none ${owner !== null && isNew(i) ? "animate-[stone-pop_0.35s_ease-out]" : ""}`}>{emoji}</span>
                  {owner !== null && (
                    <span className="absolute top-0.5 left-1 font-mono tabular-nums text-[18cqw] leading-none font-semibold" style={{ color }}>
                      {labels[view.players.indexOf(owner)]}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {!over && (
        <p role="status" className="flex h-8 items-center justify-center gap-2 text-fg-muted">
          {/* Pełny kolor gracza; fala rozchodzi się tylko wtedy, gdy czekamy na rywala. */}
          <span className="relative size-2.5 rounded-full" style={{ backgroundColor: turnColor }} aria-hidden>
          </span>
          {canMove ? (view.first === null ? "Odkryj pierwszą kartę" : "Odkryj drugą kartę") : `${turnNick} szuka pary…`}
        </p>
      )}
    </div>
  );
}
