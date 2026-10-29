import { ArrowCounterClockwise, ArrowLeft, ArrowRight, Check, Timer, Trophy, UsersThree } from "@phosphor-icons/react";
import { BALON_BALLOONS, type BalonView, CHINCZYK_TRACK, type ChinczykView, GAMES, initials, isDone, KALAMBURY_HALF_SECONDS, type KalamburyView, type KampusTourView, type KatView, type KropkiView, type LabiryntView, type MemoryView, type PanstwaMiastaView, type PiecWRzedzieView, QUIZ_DURATION_MS, type RecordRow, type RokView, type RoomView, ROK_ROUNDS, SCHULTE_SIZE, type SchulteView, type SimonView, standing, standings, type StatkiView, SUDOKU_BLANKS, type SudokuView, WIEZA_LEVELS, type WiezaView, winner as tournamentWinner } from "@kwadrans/games";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Chinczyk } from "../games/Chinczyk.tsx";
import { KampusTour } from "../games/KampusTour.tsx";
import { Memory } from "../games/Memory.tsx";
import { MiniGame } from "../games/MiniGame.tsx";
import { Kalambury } from "../games/Kalambury.tsx";
import { PanstwaMiasta } from "../games/PanstwaMiasta.tsx";
import { Labirynt } from "../games/Labirynt.tsx";
import { PiecWRzedzie } from "../games/PiecWRzedzie.tsx";
import { FleetLeft, Statki } from "../games/Statki.tsx";
import { fetchRecords } from "../net.ts";
import { formatRecord, RecordPanel } from "./Records.tsx";
import { type GameDot, GameDots, IntroContext, Screen, StickyBar, type Send } from "./ui.tsx";

interface Props {
  view: RoomView;
  me: string;
  dropped: boolean;
  send: Send;
  onLeave: () => void;
}

export function Game({ view, me, dropped, send, onLeave }: Props) {
  const game = view.game!;
  const def = GAMES[view.gameId!];
  const nick = (id: string | undefined) => view.players.find((p) => p.id === id)?.nick ?? "Gracz";
  const seated = view.seats.includes(me);
  const myTurn = view.phase === "playing" && game.waitingFor.includes(me);
  const waitingNicks = game.waitingFor.filter((id) => id !== me).map(nick).join(" i ");

  // Tryb cichy: krótka wibracja zamiast dźwięku, gdy przychodzi moja tura.
  useEffect(() => {
    if (myTurn) navigator.vibrate?.(40);
  }, [myTurn]);

  // Kalambury: serwer ma dwa limity po 40 s (po pierwszym odsłania literę), a gracz widzi jeden pasek na całe rysowanie.
  // W pierwszej połowie do czasu dochodzi cała druga; memo po wiadomości, żeby termin nie przesuwał się przy każdym renderze.
  const drawTime = useMemo(() => {
    const k = def.id === "kalambury" ? (game.view as KalamburyView) : null;
    if (k?.phase !== "draw" || game.msLeft === null) return null;
    return { msLeft: game.msLeft + (k.half === 0 ? KALAMBURY_HALF_SECONDS * 1000 : 0), total: 2 * KALAMBURY_HALF_SECONDS };
  }, [game, def.id]);

  // Quizy (Kolor liter, Liczenie, Inny element, Dziesiątki): w rundzie pasek w nagłówku pokazuje jej 30 s zamiast limitu platformy.
  const [round, setRound] = useState<{ msLeft: number } | null>(null);
  const onRound = (msLeft: number | null) => setRound(msLeft === null ? null : { msLeft });
  // Dotknięcie kropek rozwija pełne dane graczy; nowa gra i koniec partii zwijają nagłówek.
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [view.phase, view.gameId]);
  // Poświata tła w kolorze gracza, na którego czekamy; poza turą jednej osoby zostaje akcent.
  // Kalambury: zawsze kolor rysującego, bo czekamy na zgadujących, a uwaga jest na rysunku.
  const focus = def.id === "kalambury" ? (game.view as KalamburyView).drawer : game.waitingFor.length === 1 ? game.waitingFor[0] : undefined;
  const turnColor = view.phase === "playing" && focus ? view.players.find((p) => p.id === focus)?.color : undefined;
  useEffect(() => {
    if (!turnColor) return;
    document.body.style.setProperty("--ambient", turnColor);
    return () => {
      document.body.style.removeProperty("--ambient");
    };
  }, [turnColor]);

  // Rekordy mini-gry: stan sprzed partii (cel na ekranie instrukcji, porównanie po partii) i po niej, gdy serwer zapisał wyniki.
  const [records, setRecords] = useState<{ before: RecordRow[] | null; after: RecordRow[] | null }>({ before: null, after: null });
  const scored = !!def.record && (view.phase === "playing" || !!game.result?.ranking);
  useEffect(() => {
    if (!scored) return;
    let stale = false;
    const over = view.phase === "over";
    if (!over) setRecords({ before: null, after: null });
    fetchRecords().then((all) => {
      if (stale) return;
      const rows = all[def.id] ?? [];
      setRecords((r) => (over ? { ...r, after: rows } : { before: rows, after: null }));
    });
    return () => {
      stale = true;
    };
  }, [def.id, view.phase, scored]);

  // Kampus Tour ma własny, poziomy układ na cały ekran: gracze w rogach, licznik i rewanż w środku planszy.
  if (def.id === "kampus-tour") {
    return (
      <KampusTour
        view={game.view as KampusTourView}
        me={me}
        players={view.players}
        dropped={dropped}
        scores={view.scores}
        seated={seated}
        canMove={myTurn}
        result={game.result}
        onMove={(move) => send("move", move)}
        timer={view.phase === "playing" && <Countdown game={game} total={def.turnSeconds} />}
        actions={view.phase === "over" && <OverActions view={view} me={me} send={send} />}
      />
    );
  }

  // Labirynt: przy wygranych liczba ścian, które graczowi zostały.
  const maze = def.id === "labirynt" ? (game.view as LabiryntView) : null;
  // Wspólny nagłówek: wyraźne „Twój ruch” w kolorze gracza i pasek czasu. Chińczyk zamiast punktów pokazuje pionki w domu.
  const ludo = def.id === "chinczyk" ? (game.view as ChinczykView) : null;
  // Memory zamiast punktów pokazuje zebrane pary.
  const memory = def.id === "memory" ? (game.view as MemoryView) : null;
  // Statki w trakcie partii zamiast punktów pokazują flotę (w bitwie: pozostałą).
  const fleet = def.id === "statki" && view.phase === "playing" ? (game.view as StatkiView) : null;
  // Tabela Schultego w trakcie partii zamiast punktów pokazuje postęp każdego gracza.
  const schulte = def.id === "schulte" && view.phase === "playing" ? (game.view as SchulteView) : null;
  // Policz kropki i Kąt tak samo: numer rundy każdego gracza.
  const kropki = (def.id === "kropki" || def.id === "kat") && view.phase === "playing" ? (game.view as KropkiView | KatView) : null;
  // Wieża: wysokość wieży każdego gracza (po oddaniu wyniku ta z wyniku).
  const wieza = def.id === "wieza" && view.phase === "playing" ? (game.view as WiezaView) : null;
  // Balon: numer balonu każdego gracza (bez punktów, zdradzałyby wytrzymałość).
  const balon = def.id === "balon" && view.phase === "playing" ? (game.view as BalonView) : null;
  // Który rok? też.
  // Sudoku: ile pól gracz już wypełnił.
  const sudoku = def.id === "sudoku" && view.phase === "playing" ? (game.view as SudokuView) : null;
  const rok = def.id === "rok" && view.phase === "playing" ? (game.view as RokView) : null;
  const simon = def.id === "simon" && view.phase === "playing" ? (game.view as SimonView) : null;
  /** Postęp gracza w mini-grze z ruchem `progress`; po oddaniu wyniku komplet (w Wieży wysokość z wyniku). */
  const progressOf = (id: string): { done: number; total: number } | null =>
    simon
      ? { done: id in simon.results ? simon.sequence.length : (simon.progress?.[id] ?? 0), total: simon.sequence.length }
      : schulte
      ? { done: id in schulte.results ? SCHULTE_LAST : (schulte.progress[id] ?? 0), total: SCHULTE_LAST }
      : kropki
        ? { done: id in kropki.results ? kropki.rounds.length : (kropki.progress[id] ?? 0), total: kropki.rounds.length }
        : wieza
          ? { done: wieza.results[id]?.height ?? wieza.progress[id] ?? 0, total: WIEZA_LEVELS }
          : balon
            ? { done: id in balon.results ? BALON_BALLOONS : (balon.progress[id] ?? 0), total: BALON_BALLOONS }
            : rok
              ? { done: id in rok.results ? ROK_ROUNDS : (rok.progress[id] ?? 0), total: ROK_ROUNDS }
              : sudoku
                ? { done: id in sudoku.results ? SUDOKU_BLANKS : (sudoku.progress[id] ?? 0), total: SUDOKU_BLANKS }
                : null;
  const myColor = view.players.find((p) => p.id === me)?.color;
  const winner = view.phase === "over" ? game.result?.winner : undefined;
  // Turniej: w nagłówku numer gry i punkty; po ostatniej grze tytuł ogłasza zwycięzcę turnieju, nie gry.
  const t = view.tournament;
  const table = t ? standings(t, view.seats) : null;
  const tournamentOver = !!t && view.phase === "over" && isDone(t);
  const champion = t && tournamentOver ? tournamentWinner(t, view.seats) : undefined;
  const headline = tournamentOver ? champion : winner;
  const winnerColor = view.players.find((p) => p.id === headline)?.color;
  // W trakcie gry `index` to gry już rozegrane, po grze obejmuje też tę na ekranie.
  const gameNo = t ? t.index + (view.phase === "playing" ? 1 : 0) : 0;

  // W aktywnej partii kropki zamiast pigułek; ja pierwszy, pozostali w kolejności miejsc.
  // Gra solo nie ma kogo pokazywać.
  const labels = initials(view.seats.map(nick));
  const dots: GameDot[] | null =
    (def.minPlayers === 1 || view.phase === "playing") && view.seats.length > 1
      ? view.seats
          .map((id, i) => {
            const p = view.players.find((pl) => pl.id === id);
            const playing = view.phase === "playing";
            const reading = playing && game.intro && !game.began.includes(id);
            const done = !playing || !game.waitingFor.includes(id);
            const progress = progressOf(id);
            return {
              id,
              label: labels[i],
              nick: nick(id),
              color: p?.color,
              me: id === me,
              badge: table ? (table.find((r) => r.id === id)?.total ?? 0) : (view.scores[id] ?? 0),
              plus: !table && id === winner,
              fraction: def.minPlayers > 1 ? (game.waitingFor.includes(id) ? 1 : 0) : done ? 1 : progress ? progress.done / progress.total : 0,
              reading,
              connected: p?.connected ?? false,
              status: !p?.connected ? "rozłączony" : reading ? "czyta zasady" : playing ? (def.minPlayers > 1 ? (game.waitingFor.includes(id) ? "ma ruch" : "czeka") : done ? "wynik oddany" : "gra") : undefined,
            };
          })
          .sort((a, b) => Number(b.me) - Number(a.me))
      : null;

  // Gra po kolei: jedna osoba ma ruch. Jej kolor (`turnColor`, jak poświata) dostaje tytuł i pasek limitu, też u czekających.
  const turnOf = view.phase === "playing" && game.waitingFor.length === 1 ? game.waitingFor[0] : undefined;

  // Państwa-miasta i Kalambury w trakcie partii mają własny nagłówek: runda, pasek czasu fazy, litera albo hasło.
  const ownHeader = (def.id === "panstwa-miasta" || def.id === "kalambury") && view.phase === "playing";

  const status =
    tournamentOver
      ? champion
        ? champion === me
          ? "Wygrywasz turniej!"
          : `Turniej wygrywa ${nick(champion)}`
        : view.seats.length > 1
          ? "Turniej: remis"
          : "Koniec turnieju"
      : view.phase === "over"
        ? game.result?.winner
          ? game.result.winner === me
            ? "Wygrywasz!"
            : `Wygrywa ${nick(game.result.winner)}`
          : game.result?.ranking?.length === 1
            ? "Koniec"
            : "Remis"
      : myTurn
        ? (game.view as { phase?: string }).phase === "placing"
          ? "Ustaw statki"
          : MINI_GAMES.has(def.id)
            ? def.name // wszyscy grają naraz, więc to nie jest niczyj „ruch”
            : "Twój ruch"
        : turnOf && !MINI_GAMES.has(def.id)
          ? <>Ruch: <span style={{ color: turnColor }}>{nick(turnOf)}</span></>
          : `Czekamy na: ${waitingNicks}`;

  // Na ekranie instrukcji limit jeszcze nie ruszył. Stoper, Rytm, Przytrzymaj i Za zasłoną: tykający limit zdradzałby upływ sekund, więc grający go nie widzi.
  const timer =
    view.phase === "playing" && !game.intro && !((def.id === "stoper" || def.id === "rytm" || def.id === "przytrzymaj" || def.id === "zaslona") && myTurn);
  // Sam w partii: pigułka z własnym nickiem i postępem nic nie mówi, zostaje tytuł i czas.
  const pillsHidden = (dots && !open) || (seated && view.seats.length === 1);

  const compact = view.phase === "playing" && !!dots;

  const intro = {
    game,
    others: view.seats.filter((id) => id !== me).map((id) => ({ id, nick: nick(id), color: view.players.find((p) => p.id === id)?.color ?? "", began: game.began.includes(id) })),
    begin: () => send("begin"),
    record: recordHint(def.id, records.before, nick(me)),
  };

  return (
    <IntroContext.Provider value={intro}>
      <Screen dropped={dropped}>
        {/* Gra solo nie ma lobby, więc z trwającej partii wychodzi się prosto na ekran główny. */}
        {view.solo && view.phase === "playing" && (
          <button type="button" className="-my-2 -ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={onLeave}>
            <ArrowLeft size={16} aria-hidden />
            Wyjdź
          </button>
        )}
        {/* Sam tytuł (gra solo bez widocznego limitu) nie potrzebuje kafla. */}
        {!ownHeader && (
          <header className={`flex flex-col ${compact ? "tile gap-2 p-3" : `gap-3 ${!t && !timer && pillsHidden && !dots && seated ? "" : "tile p-4"}`}`}>
            {t && (
              <p className="label">
                Turniej · {t.extra && gameNo === t.games.length ? "dogrywka" : `gra ${gameNo}/${t.games.length}`}
                {view.phase === "over" && !tournamentOver && ` · ${def.name}`}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              {/* Koniec partii: tytuł w kolorze zwycięzcy; podbicie tylko u niego, przegrany dostaje spokojną wersję. */}
              <h1
                className={`min-w-0 origin-left break-words ${compact ? "text-base" : "text-xl"} font-semibold ${headline === me ? "animate-[title-pop_0.5s_cubic-bezier(0.2,0.8,0.4,1)]" : ""}`}
                style={{ color: headline ? winnerColor : myTurn ? myColor : undefined }}
              >
                {compact && !open && !myTurn && !turnOf && game.waitingFor.length > 1 ? `Czekamy na: ${game.waitingFor.length} graczy` : status}
              </h1>
              {dots && !compact && <GameDots dots={dots} square={!!table} open={open} onToggle={() => setOpen(!open)} />}
            </div>
            <div className={compact ? "flex min-h-12 items-center gap-2" : "contents"}>
              {compact && <GameDots compact dots={dots!} square={!!table} open={open} onToggle={() => setOpen(!open)} />}
              {timer && (
                <div className="min-w-0 flex-1">
                  <Countdown
                    game={round ?? game}
                    total={round ? QUIZ_DURATION_MS / 1000 : (def.turn?.(game.view).seconds ?? def.turnSeconds)}
                    color={myTurn ? myColor : MINI_GAMES.has(def.id) ? undefined : turnColor}
                    label={compact ? undefined : round ? "Czas" : MINI_GAMES.has(def.id) ? "Limit" : undefined}
                  />
                </div>
              )}
            </div>
            <ul aria-label="Szczegóły graczy" className={`flex flex-wrap gap-2 ${pillsHidden ? "hidden" : ""}`}>
              {view.seats.map((id) => {
                const p = view.players.find((pl) => pl.id === id);
                const active = id === winner || (view.phase === "playing" && game.waitingFor.includes(id));
                const progress = progressOf(id);
                return (
                  <li
                    key={id}
                    className={`flex min-h-9 max-w-full flex-wrap items-center gap-2 rounded-full border px-3 text-sm transition-colors ${fleet ? "w-full" : ""} ${
                      active ? "" : "border-line text-fg-muted"
                    }`}
                    style={active ? { borderColor: p?.color, backgroundColor: `color-mix(in srgb, ${p?.color} 16%, transparent)` } : undefined}
                  >
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: p?.color }} aria-hidden />
                    <span className="min-w-0 break-words">{nick(id)}{id === me && " (ty)"}</span>
                    {p && !p.connected && <span className="text-xs text-fg-muted">rozłączony</span>}
                    {fleet?.phase === "placing" && fleet.boards[id].ready && <Check size={14} weight="bold" aria-label="gotowy" />}
                    {ludo ? (
                      <span className="flex gap-1" aria-label={`W domu: ${ludo.pawns[id].filter((p) => p >= CHINCZYK_TRACK).length} z 4`}>
                        {[...ludo.pawns[id]].sort((a, b) => b - a).map((pos, i) => (
                          <span
                            key={i}
                            className="size-2.5 rounded-full border"
                            style={{ borderColor: p?.color, backgroundColor: pos >= CHINCZYK_TRACK ? p?.color : undefined }}
                            aria-hidden
                          />
                        ))}
                      </span>
                    ) : memory ? (
                      <span className="text-base font-semibold text-fg tabular-nums" aria-label={`Pary: ${memory.owner.filter((o) => o === id).length / 2}`}>
                        {memory.owner.filter((o) => o === id).length / 2}
                      </span>
                    ) : fleet ? (
                      <FleetLeft board={fleet.boards[id]} lengths={fleet.lengths} color={p?.color ?? "var(--color-fg-muted)"} />
                    ) : progress ? (
                      <Progress {...progress} color={p?.color} />
                    ) : table ? (
                      <span className="font-mono text-sm font-semibold text-fg tabular-nums" aria-label={`Punkty w turnieju: ${table.find((r) => r.id === id)?.total ?? 0}`}>
                        {table.find((r) => r.id === id)?.total ?? 0} pkt
                      </span>
                    ) : (
                      // Puchar odróżnia wygrane partie w pokoju od wyniku bieżącej partii.
                      <span className="relative flex items-center gap-1 font-mono text-base font-semibold text-fg tabular-nums" aria-label={`Wygrane partie: ${view.scores[id] ?? 0}`}>
                        <Trophy size={14} weight="fill" className="text-fg-muted" aria-hidden />
                        <span className="font-sans text-xs font-normal text-fg-muted" aria-hidden>
                          wygrane
                        </span>
                        {/* Klucz z wyniku: po wygranej liczba montuje się od nowa i wskakuje. */}
                        <span key={view.scores[id] ?? 0} className={id === winner ? "animate-[stone-pop_0.5s_ease-out]" : ""}>
                          {view.scores[id] ?? 0}
                        </span>
                        {id === winner && (
                          <span
                            className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 animate-[float-up_1.6s_ease-out_forwards] font-mono text-sm"
                            style={{ color: p?.color }}
                            aria-hidden
                          >
                            +1
                          </span>
                        )}
                      </span>
                    )}
                    {compact && (ludo || memory || fleet || progress) && (
                      <span className="flex items-center gap-1 font-mono text-sm text-fg tabular-nums" aria-label={table ? `Punkty w turnieju: ${table.find((r) => r.id === id)?.total ?? 0}` : `Wygrane partie: ${view.scores[id] ?? 0}`}>
                        <span className="font-sans text-xs text-fg-muted">{table ? "punkty" : "wygrane"}</span>
                        {table ? (table.find((r) => r.id === id)?.total ?? 0) : (view.scores[id] ?? 0)}
                      </span>
                    )}
                    {maze && (
                      <span className="flex items-center gap-1 font-mono text-base font-semibold text-fg tabular-nums" aria-label={`Ściany: ${maze.wallsLeft[maze.players.indexOf(id)]}`}>
                        <span className="font-sans text-xs font-normal text-fg-muted" aria-hidden>
                          ściany
                        </span>
                        {maze.wallsLeft[maze.players.indexOf(id)]}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {!seated && (
              <p className="flex items-center gap-2 text-sm text-fg-muted">
                <UsersThree size={16} aria-hidden />
                Oglądasz
              </p>
            )}
          </header>
        )}

        {def.id === "piec-w-rzedzie" && (
          <PiecWRzedzie
            view={game.view as PiecWRzedzieView}
            players={view.players}
            canMove={myTurn}
            onMove={(move) => send("move", move)}
          />
        )}

        {def.id === "labirynt" && <Labirynt view={game.view as LabiryntView} me={me} players={view.players} canMove={myTurn} onMove={(move) => send("move", move)} />}

        {def.id === "statki" && (
          <Statki
            view={game.view as StatkiView}
            me={me}
            players={view.players}
            canMove={myTurn}
            onMove={(move) => send("move", move)}
          />
        )}

        {def.id === "chinczyk" && (
          <Chinczyk
            view={game.view as ChinczykView}
            me={me}
            players={view.players}
            canMove={myTurn}
            onMove={(move) => send("move", move)}
          />
        )}

        {def.id === "memory" && <Memory view={game.view as MemoryView} players={view.players} canMove={myTurn} onMove={(move) => send("move", move)} />}

        <MiniGame id={def.id} view={game.view} me={me} players={view.players} ranking={game.result?.ranking} winner={winner} onMove={(move) => send("move", move)} onRound={onRound} />

        {def.id === "panstwa-miasta" && (
          <PanstwaMiasta
            key={(game.view as PanstwaMiastaView).nonce}
            view={game.view as PanstwaMiastaView}
            me={me}
            players={view.players}
            waitingFor={game.waitingFor}
            ranking={game.result?.ranking}
            timer={ownHeader && <Countdown game={game} total={def.turn?.(game.view).seconds} tense />}
            onMove={(move) => send("move", move)}
          />
        )}

        {def.id === "kalambury" && (
          <Kalambury
            key={(game.view as KalamburyView).nonce}
            view={game.view as KalamburyView}
            me={me}
            players={view.players}
            ranking={game.result?.ranking}
            timer={ownHeader && <Countdown game={drawTime ?? game} total={drawTime?.total ?? def.turn?.(game.view).seconds} color={turnColor} tense />}
            onMove={(move) => send("move", move)}
          />
        )}

        {/* Mini-gry pokazują ranking same, razem z wynikami. */}
        {view.phase === "over" && !MINI_GAMES.has(def.id) && game.result?.ranking && game.result.ranking.length > 2 && (
          <ol className="tile flex flex-col gap-1 p-4">
            {game.result.ranking.map((id, i) => (
              <li key={id} className="flex items-center gap-3">
                <span className="w-5 font-mono text-fg-muted tabular-nums">{i + 1}.</span>
                <span className="size-2.5 rounded-full" style={{ backgroundColor: view.players.find((p) => p.id === id)?.color }} aria-hidden />
                {nick(id)}
                {id === me && <span className="text-fg-muted"> (ty)</span>}
              </li>
            ))}
          </ol>
        )}

        {view.phase === "over" && def.record && game.result?.ranking && records.after && (!seated || Number.isFinite(def.record.score(game.view, me))) && (
          <RecordPanel
            gameId={def.id}
            before={records.before}
            after={records.after}
            nick={nick(me)}
            color={myColor}
            score={seated ? { best: def.record.score(game.view, me), tie: finite(def.record.tie?.score(game.view, me)) } : undefined}
          />
        )}

        {view.phase === "over" && t && table && (
          <section className="tile p-4">
            <h2 className="label mb-2">{tournamentOver ? "Wyniki turnieju" : "Tabela turnieju"}</h2>
            <ol className="flex flex-col gap-1">
              {table.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3">
                  <span className="w-5 font-mono text-fg-muted tabular-nums">{i + 1}.</span>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: view.players.find((p) => p.id === r.id)?.color }} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">
                    {nick(r.id)}
                    {r.id === me && <span className="text-fg-muted"> (ty)</span>}
                  </span>
                  {tournamentOver ? (
                    <span className="flex items-center gap-1 font-mono text-sm text-fg-muted tabular-nums" aria-label={`Wygrane gry: ${r.wins}`}>
                      <Trophy size={14} weight="fill" aria-hidden />
                      {r.wins}
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-fg-muted tabular-nums" aria-label={`Za tę grę: ${r.last}`}>
                      +{r.last}
                    </span>
                  )}
                  <span className="w-14 text-right font-mono font-semibold tabular-nums">{r.total} pkt</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {view.phase === "over" && (
          <StickyBar className="z-10 mt-auto">
            <div className="flex w-full flex-col gap-2">
              {t && !tournamentOver ? <NextActions view={view} me={me} send={send} countdown={<Countdown game={game} />} /> : <OverActions view={view} me={me} send={send} onLeave={onLeave} />}
            </div>
          </StickyBar>
        )}
      </Screen>
    </IntroContext.Provider>
  );
}

/** Drugie kryterium rekordu, jak na serwerze: brak albo wynik nieskończony (średnia z zera trafień) to null. */
const finite = (n: number | undefined) => (n !== undefined && Number.isFinite(n) ? n : null);

/** „Rekord: 215 ms (Ola) · twój: 240 ms”: cel do pobicia na ekranie instrukcji. */
function recordHint(gameId: string, rows: RecordRow[] | null, nick: string) {
  if (!rows?.length) return undefined;
  const mine = standing(rows, nick, GAMES[gameId].record!);
  const top = `Rekord: ${formatRecord(gameId, rows[0])}`;
  if (mine?.place === 1) return `${top} (twój)`;
  return `${top} (${rows[0].nick})${mine ? ` · twój: ${formatRecord(gameId, mine)}` : ""}`;
}

const MINI_GAMES = new Set(["tort", "zakupy", "zaslona", "nozyczki", "refleks", "simon", "stoper", "schulte", "sudoku", "stroop", "liczenie", "kolo", "kolor", "kropki", "rok", "srodek", "stoj", "sledzenie", "kubki", "wieza", "rytm", "inny", "obrot", "literowka", "mapa", "kat", "przytrzymaj", "balon", "w-pamieci", "dziesiatki", "panstwa-miasta"]);

const SCHULTE_LAST = SCHULTE_SIZE * SCHULTE_SIZE;

/** Cienki pasek i licznik postępu (znalezione liczby, rundy) w pigułce gracza. */
function Progress({ done, total, color }: { done: number; total: number; color?: string }) {
  return (
    <>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-line" aria-hidden>
        <span className="block h-full rounded-full transition-[width] duration-200" style={{ width: `${(done / total) * 100}%`, backgroundColor: color }} />
      </span>
      <span className="font-mono text-xs text-fg tabular-nums">
        {done}/{total}
      </span>
    </>
  );
}

/** Rewanż rusza, gdy kliknie go każdy grający; „Do lobby” od jednej osoby kończy serię. */
function OverActions({ view, me, send, onLeave }: { view: RoomView; me: string; send: Send; onLeave?: () => void }) {
  // Gra solo z ekranu głównego nie ma lobby ani rywali: gramy jeszcze raz albo wracamy na start.
  if (view.solo) {
    return (
      <>
        <button type="button" className="btn btn-primary flex-1" onClick={() => send("rematch")}>
          <ArrowCounterClockwise size={18} weight="bold" aria-hidden />
          Jeszcze raz
        </button>
        <button type="button" className="btn btn-ghost flex-1" onClick={onLeave}>
          Wyjdź
        </button>
      </>
    );
  }
  const seated = view.players.filter((p) => view.seats.includes(p.id));
  const wants = seated.filter((p) => p.ready);
  const waiting = seated.filter((p) => !p.ready);
  const iWant = wants.some((p) => p.id === me);
  return (
    <>
      {wants.length > 0 && !iWant && (
        <p className="basis-full text-center text-sm" role="status">
          {wants.map((p) => p.nick).join(", ")} {wants.length === 1 ? "chce" : "chcą"} rewanżu
        </p>
      )}
      {view.seats.includes(me) && (
        <button
          type="button"
          className={`btn btn-primary flex-1 ${wants.length > 0 && !iWant ? "animate-[ring-pulse_1.2s_ease-in-out_infinite] outline-2 outline-fg" : ""}`}
          disabled={iWant}
          onClick={() => send("rematch")}
        >
          <ArrowCounterClockwise size={18} weight="bold" aria-hidden />
          {iWant ? `Czekamy na: ${waiting.map((p) => p.nick).join(", ")}…` : "Rewanż"}
        </button>
      )}
      <button type="button" className="btn btn-ghost flex-1" onClick={() => send("toLobby")}>
        Do lobby
      </button>
    </>
  );
}

/** Między grami turnieju: „Dalej” od wszystkich grających odpala następną grę od razu, inaczej rusza sama po limicie. */
function NextActions({ view, me, send, countdown }: { view: RoomView; me: string; send: Send; countdown: ReactNode }) {
  const t = view.tournament!;
  const waiting = view.players.filter((p) => view.seats.includes(p.id) && !p.ready);
  const iWant = view.seats.includes(me) && !waiting.some((p) => p.id === me);
  return (
    <>
      <p className="flex items-center justify-center gap-3 text-sm" role="status">
        <span>
          Następna gra: <span className="font-semibold">{t.extra && t.index === t.games.length - 1 ? "dogrywka, " : ""}{GAMES[t.games[t.index]]?.name}</span>
        </span>
        {countdown}
      </p>
      {view.seats.includes(me) && (
        <button type="button" className="btn btn-primary w-full" disabled={iWant} onClick={() => send("rematch")}>
          {!iWant && <ArrowRight size={18} weight="bold" aria-hidden />}
          <span className="truncate">{iWant ? `Czekamy na: ${waiting.map((p) => p.nick).join(", ")}…` : "Dalej"}</span>
        </button>
      )}
      {view.hostId === me && (
        <button type="button" className="btn btn-ghost w-full" onClick={() => send("toLobby")}>
          Zakończ turniej
        </button>
      )}
    </>
  );
}

/**
 * Sekundy do końca tury. Liczone od chwili odebrania wiadomości, nie od zegara serwera.
 * Termin zależy od obiektu wiadomości, nie od liczby: każda nowa tura przychodzi z tym samym msLeft (60000).
 */
/**
 * `tense`: jasny pasek (gra na czas, np. Państwa-miasta), a nie spokojny szary.
 * `color`: pasek w kolorze gracza (moja tura). Czerwień i tak przychodzi na ostatnie 10 s.
 * `label`: podpis przed paskiem (mini-gry mają własny zegar partii, więc limit platformy musi być nazwany).
 */
function Countdown({ game, total, tense, color, label }: { game: { msLeft: number | null }; total?: number; tense?: boolean; color?: string; label?: string }) {
  const deadline = useMemo(() => (game.msLeft === null ? null : Date.now() + game.msLeft), [game]);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  if (deadline === null) return null;
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  // Z podanym limitem tury: kurczący się pasek zamiast samej liczby.
  if (total) {
    const left = Math.max(0, deadline - now) / (total * 1000);
    return (
      <div className="flex items-center gap-2">
        {label && <span className="label">{label}</span>}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Czas tury" aria-valuenow={seconds}>
          <div
            className={`h-full rounded-full transition-[width] duration-300 ease-linear ${seconds <= 10 ? "animate-pulse bg-warning" : tense ? "bg-fg" : "bg-fg-muted"}`}
            style={{ width: `${Math.min(1, left) * 100}%`, backgroundColor: seconds > 10 ? color : undefined }}
          />
        </div>
        {/* Twarda spacja i min-w: trzycyfrowy limit („173 s”) nie ściska się ani nie łamie w wąskim polu. */}
        <span className={`min-w-10 text-right font-mono text-sm font-medium whitespace-nowrap tabular-nums ${seconds <= 10 ? "text-warning" : "text-fg"}`}>{seconds}{"\u00a0"}s</span>
      </div>
    );
  }
  return (
    <span className={`flex items-center gap-1 font-mono text-sm tabular-nums ${seconds <= 10 ? "text-warning" : "text-fg-muted"}`}>
      <Timer size={16} aria-hidden />
      {seconds} s
    </span>
  );
}
