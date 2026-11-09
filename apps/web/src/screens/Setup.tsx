import { Check, Minus, Play, Plus, Prohibit } from "@phosphor-icons/react";
import { GAMES, MIN_LENGTH, type RoomView } from "@kwadrans/games";
import { useState } from "react";
import { BLURBS, ICONS, MINI_GAMES, Players, seats, StartBar } from "./Lobby.tsx";
import { RulesDetails } from "./HowToPlay.tsx";
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

/** Zaznaczony wybór w kolorze tego, kto wybrał (obrys i tło 12%); sam kolor uzupełnia ikona albo `aria-pressed`. */
const chosenStyle = (color = "var(--color-fg-muted)") => ({ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` });

/** Ekran gry głównej przed partią: opis, tryb, gracze i start. Gospodarz ustawia, goście widzą to samo tylko do odczytu. */
export function Setup({ view, me, dropped, send, onLeave }: Props) {
  const isHost = view.hostId === me;
  const def = GAMES[view.gameId!];
  const GameIcon = ICONS[def.id] ?? Play;
  // Tryb wybiera gospodarz: zaznaczenie w jego kolorze i z ikoną, nie w akcencie i nie samym kolorem.
  const hostColor = view.players.find((p) => p.id === view.hostId)?.color;
  return (
    <Screen dropped={dropped}>
      <TopBar code={view.code} onBack={isHost ? () => send("pickGame", { gameId: null }) : undefined} onLeave={onLeave} />

      {/* Bez kafla, jak nagłówek Turnieju: nazwa gry jest tytułem ekranu. */}
      <section className="px-1">
        <div className="flex items-center gap-3">
          <GameIcon size={36} weight="fill" className="shrink-0" aria-hidden />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{def.name}</h1>
            <p className="font-mono text-xs text-fg-muted tabular-nums">{seats(def)}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-fg-muted">{BLURBS[def.id]}</p>
        <RulesDetails gameId={def.id} />
      </section>

      {def.modes && (
        <section className="flex flex-col gap-2" role="radiogroup" aria-label="Tryb">
          <h2 className="label px-1">Tryb</h2>
          {!isHost && <p className="px-1 text-sm text-fg-muted">Tryb wybiera gospodarz.</p>}
          {def.modes.map((m) => {
            const on = view.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={!isHost}
                className={`flex min-h-12 flex-col items-start justify-center rounded-inset border px-3 py-2 text-left transition-colors duration-180 ${
                  on ? "border-2" : "border-line enabled:hover:border-line-hover disabled:opacity-40"
                }`}
                style={on ? chosenStyle(hostColor) : undefined}
                onClick={() => send("pickMode", { mode: m.id })}
              >
                <span className="flex items-center gap-1.5 leading-tight">
                  {on && <Check size={16} weight="bold" aria-hidden />}
                  {m.name}
                </span>
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
 * Ekran turnieju przed startem: liczba gier (gospodarz) i dobór mini-gier. Przełącznik mówi, co robi dotknięcie gry (na pewno albo wyklucz),
 * resztę losuje serwer. Gry zaznacza każdy w pokoju, lista jest wspólna; przy zaznaczonej grze widać kropkę w kolorze gracza, który to zrobił.
 */
export function TournamentSetup({ view, me, dropped, send, onLeave }: Props) {
  const myColor = view.players.find((p) => p.id === me)?.color;
  const isHost = view.hostId === me;
  const [tool, setTool] = useState<"must" | "skip">("must");
  const { length, must, skip } = view.tournament!.config;
  const available = MINI_GAMES.length - skip.length;
  const random = length - must.length;
  const pick = (config: { length: number }) => send("pickTournament", config);

  const authorColor = (id: string) => view.players.find((p) => p.id === view.markedBy[id])?.color;
  const skipBlocked = available <= MIN_LENGTH;

  // Dotknięcie włącza stan wybrany przełącznikiem, a kolejne zdejmuje. Wykluczyć się nie da, gdy zostałoby za mało gier.
  function touch(id: string) {
    const on = tool === "must" ? must.includes(id) : skip.includes(id);
    if (!on && tool === "skip" && skipBlocked) return;
    send("markGame", { id, mark: on ? "any" : tool });
  }

  const chosen = plural(must.length, "wybrana", "wybrane", "wybranych");
  const drawn = `${plural(random, "losowa", "losowe", "losowych")} z ${available - must.length}`;
  const summary = must.length === 0 ? drawn : random === 0 ? `${chosen}, bez losowania` : `${chosen} + ${drawn}`;
  // Liczba gier sama idzie za zaznaczeniami (serwer ją przycina); przy granicy jedno zdanie mówi, czemu dalej się nie da.
  const adjusted =
    random === 0 && must.length > MIN_LENGTH
      ? "Liczba gier rośnie razem z wybranymi, mniej się nie da."
      : length >= available
        ? skip.length > 0
          ? "Więcej gier nie ma: reszta jest wykluczona."
          : "Grane będą wszystkie gry."
        : length <= MIN_LENGTH
          ? `Najmniej ${plural(MIN_LENGTH, "gra", "gry", "gier")} w turnieju.`
          : null;

  return (
    <Screen dropped={dropped}>
      <TopBar code={view.code} onBack={isHost ? () => send("pickGame", { gameId: null }) : undefined} onLeave={onLeave}>
        <PlayerDots view={view} />
      </TopBar>

      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-semibold tracking-tight">Turniej</h1>
        <p className="text-sm text-fg-muted">
          {view.seats.length > 1
            ? "Seria mini-gier. Punkt za każdego pokonanego rywala, wygrywa najwięcej punktów."
            : "Seria mini-gier. Grasz sam, więc liczą się twoje rekordy."}
        </p>
      </div>

      <section className="flex flex-col gap-3 px-1">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <h2 className="label" id="tournament-length">
            Liczba gier
          </h2>
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
        {adjusted && <p className="-mt-1 text-xs text-fg-muted">{adjusted}</p>}
        {isHost && (
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(([name, games]) => (
              <button
                key={name}
                type="button"
                aria-pressed={length === games}
                className={`flex min-h-12 flex-col items-center justify-center rounded-inset border text-sm transition-colors duration-180 ${
                  length === games ? "border-2" : "border-transparent bg-surface hover:border-line-hover"
                }`}
                // Przyciski długości widzi tylko gospodarz, więc wybór jest w jego (moim) kolorze.
                style={length === games ? chosenStyle(myColor) : undefined}
                onClick={() => pick({ length: games })}
              >
                {name}
                <span className="font-mono text-xs text-fg-muted tabular-nums">{games} gier</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Przyklejony, bo lista jest dłuższa niż ekran, a dotknięcie kafla zależy od tego wyboru. */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-bg/90 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur">
        <span className="shrink-0 text-sm text-fg-muted">Dotknij, aby:</span>
        {(
          [
            ["must", "Na pewno", Check],
            ["skip", "Wyklucz", Prohibit],
          ] as const
        ).map(([id, label, ToolIcon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={tool === id}
            className={`flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors duration-180 ${
              tool === id ? "border-2" : "border border-line-hover"
            }`}
            style={tool === id ? chosenStyle(myColor) : undefined}
            onClick={() => setTool(id)}
          >
            <ToolIcon size={16} weight="bold" aria-hidden />
            {label}
          </button>
        ))}
      </div>
      {tool === "skip" && skipBlocked && <p className="-mt-1 px-1 text-xs text-fg-muted">Najmniej {plural(MIN_LENGTH, "gra", "gry", "gier")} w turnieju, więcej nie wykluczysz.</p>}

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
                  className={`relative flex min-h-18 flex-col items-start gap-1 rounded-inset text-left transition-colors duration-180 ${
                    state === "na pewno" ? "border-2 p-[7px]" : `border border-transparent bg-surface p-2 ${state === "bez" ? "opacity-60" : "hover:border-line-hover"}`
                  }`}
                  style={state === "na pewno" ? chosenStyle(author?.color) : undefined}
                  onClick={() => touch(id)}
                >
                  <GameIcon size={20} weight={state === "na pewno" ? "fill" : "regular"} aria-hidden />
                  <span className={`text-sm leading-tight ${state === "bez" ? "line-through" : ""}`}>{GAMES[id].name}</span>
                  {/* Stan w rogu zamiast linii podpisu: domyślne „losowo” nie ma znaku, żeby nie zagłuszać wyborów. */}
                  {state !== "losowo" && (
                    <span className="absolute top-2 right-2 flex items-center gap-1" aria-hidden>
                      {author && <span className="size-2.5 rounded-full" style={{ backgroundColor: author.color }} />}
                      {state === "na pewno" ? <Check size={14} weight="bold" /> : <Prohibit size={14} weight="bold" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Skład i podsumowanie jadą razem z przyciskiem: od razu mówią, co się stanie po starcie. Segment to gra, kolor to ten, kto ją wybrał, obrys to losowanie. */}
      <StartBar
        view={view}
        me={me}
        send={send}
        note={
          <>
            <div className="flex h-2 gap-0.5" aria-hidden>
              {must.map((id) => (
                <span key={id} className="min-w-0 flex-1 rounded-full bg-fg-muted" style={{ backgroundColor: authorColor(id) }} />
              ))}
              {Array.from({ length: random }, (_, i) => (
                <span key={i} className="min-w-0 flex-1 rounded-full border border-line-hover" />
              ))}
            </div>
            <p className="text-sm" aria-live="polite">
              {summary} <span className="text-fg-muted">· ok. {minutes(length)} min</span>
            </p>
          </>
        }
      />
    </Screen>
  );
}
