import { Check, Minus, Play, Plus } from "@phosphor-icons/react";
import { GAMES, MAX_PLAYERS, MIN_LENGTH, type RoomView } from "@kwadrans/games";
import { BLURBS, ICONS, MINI_GAMES, Players, seats, StartBar } from "./Lobby.tsx";
import { SECTIONS } from "./MiniGames.tsx";
import { plural } from "./Records.tsx";
import { PlayerDots, Screen, type Send, TopBar } from "./ui.tsx";

interface Props {
  view: RoomView;
  me: string;
  dropped: boolean;
  send: Send;
  onLeave: () => void;
}

/** Ekran gry głównej przed partią: opis, tryb, gracze i start. Gospodarz ustawia, goście widzą to samo tylko do odczytu. */
export function Setup({ view, me, dropped, send, onLeave }: Props) {
  const isHost = view.hostId === me;
  const def = GAMES[view.gameId!];
  const GameIcon = ICONS[def.id] ?? Play;
  return (
    <Screen dropped={dropped}>
      <TopBar code={view.code} onBack={isHost ? () => send("pickGame", { gameId: null }) : undefined} onLeave={onLeave} />

      <section className="tile">
        <div className="flex items-center gap-3">
          <GameIcon size={28} weight="fill" className="shrink-0" aria-hidden />
          <div className="min-w-0">
            <h1 className="leading-tight">{def.name}</h1>
            <p className="font-mono text-xs text-fg-muted tabular-nums">{seats(def)}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-fg-muted">{BLURBS[def.id]}</p>
      </section>

      {def.modes && (
        <section className="flex flex-col gap-2" role="radiogroup" aria-label="Tryb">
          <h2 className="label px-1">Tryb</h2>
          {def.modes.map((m) => {
            const on = view.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={!isHost}
                className={`flex min-h-12 flex-col items-start justify-center rounded-inset border px-3 py-2 text-left transition-colors ${
                  on ? "border-accent bg-accent-soft" : "border-line enabled:hover:border-line-hover disabled:opacity-50"
                }`}
                onClick={() => send("pickMode", { mode: m.id })}
              >
                <span className="leading-tight">{m.name}</span>
                <span className="font-mono text-xs text-fg-muted tabular-nums">{m.hint}</span>
              </button>
            );
          })}
        </section>
      )}

      <Players view={view} me={me} send={send} />
      <StartBar view={view} me={me} send={send} />
    </Screen>
  );
}

/** Gotowe długości turnieju; serwer i tak przytnie liczbę do zaznaczonych i niewykluczonych gier. */
const PRESETS = [
  ["Szybki", 5],
  ["Kwadrans", 10],
  ["Długi", 15],
] as const;
// ponytail: jedna stała na grę (instrukcja + partia + wyniki); liczyć z limitów gier, gdy szacunek zacznie się rozjeżdżać.
const minutes = (games: number) => Math.round(games * 1.5);

/**
 * Ekran turnieju przed startem: liczba gier (gospodarz) i dobór mini-gier. Każdą grę da się oznaczyć jako pewną albo wykluczoną,
 * resztę losuje serwer. Gry zaznacza każdy w pokoju, lista jest wspólna; przy zaznaczonej grze widać kropkę w kolorze gracza, który to zrobił.
 */
export function TournamentSetup({ view, me, dropped, send, onLeave }: Props) {
  const isHost = view.hostId === me;
  const { length, must, skip } = view.tournament!.config;
  const available = MINI_GAMES.length - skip.length;
  const random = length - must.length;
  const pick = (config: { length: number }) => send("pickTournament", config);

  // Dotknięcie przełącza: losowo → na pewno → bez → losowo. Wykluczyć się nie da, gdy zostałoby za mało gier.
  function cycle(id: string) {
    const next = skip.includes(id) ? "any" : !must.includes(id) ? "must" : available > MIN_LENGTH ? "skip" : "any";
    send("markGame", { id, mark: next });
  }

  const chosen = plural(must.length, "wybrana", "wybrane", "wybranych");
  const drawn = `${plural(random, "losowa", "losowe", "losowych")} z ${available - must.length}`;
  const summary = must.length === 0 ? drawn : random === 0 ? `${chosen}, bez losowania` : `${chosen} + ${drawn}`;
  // Liczba gier sama idzie za zaznaczeniami (serwer ją przycina), więc zamiast blokady jest jedno zdanie wyjaśnienia.
  const adjusted =
    random === 0 && must.length > MIN_LENGTH
      ? "Liczba gier rośnie razem z wybranymi."
      : length === available
        ? "Grane będą wszystkie niewykluczone gry."
        : null;

  return (
    <Screen dropped={dropped}>
      <TopBar code={view.code} onBack={isHost ? () => send("pickGame", { gameId: null }) : undefined} onLeave={onLeave}>
        <PlayerDots view={view} />
      </TopBar>

      <div className="flex flex-col gap-1 px-1">
        <h1 className="label">Turniej · 1-{MAX_PLAYERS} osób</h1>
        <p className="text-sm text-fg-muted">
          {view.seats.length > 1
            ? "Seria mini-gier po kolei. Za każdą grę dostajesz punkt za każdego pokonanego rywala, wygrywa najwięcej punktów."
            : "Seria mini-gier po kolei. Grasz sam, więc punktów nie ma: liczą się twoje rekordy w każdej grze."}
        </p>
      </div>

      <section className="tile flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="label" id="tournament-length">
              Liczba gier
            </h2>
            <p className="font-mono text-xs text-fg-muted tabular-nums">ok. {minutes(length)} min</p>
          </div>
          <div className="flex items-center gap-3" role="group" aria-labelledby="tournament-length">
            {isHost && (
              <button
                type="button"
                className="btn btn-ghost size-12 shrink-0 p-0"
                disabled={length <= Math.max(MIN_LENGTH, must.length)}
                onClick={() => pick({ length: length - 1 })}
                aria-label="Mniej gier"
              >
                <Minus size={18} weight="bold" aria-hidden />
              </button>
            )}
            <span className="min-w-8 text-center font-mono text-2xl font-semibold tabular-nums" aria-live="polite">
              {length}
            </span>
            {isHost && (
              <button type="button" className="btn btn-ghost size-12 shrink-0 p-0" disabled={length >= available} onClick={() => pick({ length: length + 1 })} aria-label="Więcej gier">
                <Plus size={18} weight="bold" aria-hidden />
              </button>
            )}
          </div>
        </div>
        {isHost && (
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(([name, games]) => (
              <button
                key={name}
                type="button"
                aria-pressed={length === games}
                className={`flex min-h-12 flex-col items-center justify-center rounded-inset border text-sm transition-colors ${
                  length === games ? "border-accent bg-accent-soft" : "border-line hover:border-line-hover"
                }`}
                onClick={() => pick({ length: games })}
              >
                {name}
                <span className="font-mono text-xs text-fg-muted tabular-nums">{games} gier</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <p className="px-1 text-sm text-fg-muted">Dotknij gry: na pewno · jeszcze raz: wyklucz · trzeci raz: losowo. Lista jest wspólna, zaznacza każdy.</p>

      {SECTIONS.map(([title, ids]) => (
        <section key={title}>
          <h3 className="mb-2 px-1 text-sm text-fg-muted">{title}</h3>
          <div className="grid grid-cols-3 gap-2">
            {ids.map((id) => {
              const state = must.includes(id) ? "na pewno" : skip.includes(id) ? "bez" : "losowo";
              const GameIcon = ICONS[id] ?? Play;
              const author = view.players.find((p) => p.id === view.markedBy[id]);
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`${GAMES[id].name}: ${state}${author && state !== "losowo" ? `, zaznaczył(a) ${author.nick}` : ""}`}
                  className={`flex min-h-20 flex-col items-start gap-1 rounded-inset border p-2 text-left transition-colors ${
                    state === "na pewno" ? "border-accent bg-accent-soft" : state === "bez" ? "border-line opacity-50" : "border-line hover:border-line-hover"
                  }`}
                  onClick={() => cycle(id)}
                >
                  <span className="flex w-full items-center justify-between">
                    <GameIcon size={20} weight={state === "na pewno" ? "fill" : "regular"} aria-hidden />
                    {author && state !== "losowo" && <span className="size-2.5 rounded-full" style={{ backgroundColor: author.color }} aria-hidden />}
                  </span>
                  <span className={`text-sm leading-tight ${state === "bez" ? "line-through" : ""}`}>{GAMES[id].name}</span>
                  {/* Podpis mają tylko gry zmienione; domyślne „losowo” na każdym kaflu zagłuszałoby wybory. */}
                  {state === "na pewno" && (
                    <span className="mt-auto flex items-center gap-1 font-mono text-xs tabular-nums">
                      <Check size={12} weight="bold" className="text-accent" aria-hidden />
                      na pewno
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Podsumowanie jedzie razem z przyciskiem: od razu mówi, co się stanie po starcie. */}
      <div className="sticky bottom-0 -mx-4 mt-auto bg-bg/90 px-4 backdrop-blur">
        <p className="pt-3 text-sm" aria-live="polite">
          {summary} <span className="text-fg-muted">· ok. {minutes(length)} min</span>
        </p>
        {adjusted && <p className="text-xs text-fg-muted">{adjusted}</p>}
        <StartBar view={view} me={me} send={send} />
      </div>
    </Screen>
  );
}
