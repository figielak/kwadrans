import { type BalonView, type DziesiatkiView, type InnyView, type KatView, type KoloView, type KolorView, type KropkiView, type KubkiView, type LiczenieView, type LiterowkaView, type MapaView, type NozyczkiView, type ObrotView, type PrzytrzymajView, type RefleksView, type RokView, type RytmView, type SchulteView, type SimonView, type SledzenieView, type SrodekView, type StojView, type StoperView, type StroopView, type SudokuView, type TortView, type WPamieciView, type WiezaView, type ZakupyView, type ZaslonaView, type LobbyPlayer } from "@kwadrans/games";
import { Balon } from "./Balon.tsx";
import { Dziesiatki } from "./Dziesiatki.tsx";
import { Inny } from "./Inny.tsx";
import { Kat } from "./Kat.tsx";
import { Kolo } from "./Kolo.tsx";
import { Kolor } from "./Kolor.tsx";
import { Kropki } from "./Kropki.tsx";
import { Liczenie } from "./Liczenie.tsx";
import { Literowka } from "./Literowka.tsx";
import { Mapa } from "./Mapa.tsx";
import { Nozyczki } from "./Nozyczki.tsx";
import { Obrot } from "./Obrot.tsx";
import { Przytrzymaj } from "./Przytrzymaj.tsx";
import { Refleks } from "./Refleks.tsx";
import { Rok } from "./Rok.tsx";
import { Rytm } from "./Rytm.tsx";
import { Schulte } from "./Schulte.tsx";
import { Sudoku } from "./Sudoku.tsx";
import { Simon } from "./Simon.tsx";
import { Kubki } from "./Kubki.tsx";
import { Sledzenie } from "./Sledzenie.tsx";
import { Srodek } from "./Srodek.tsx";
import { Stoj } from "./Stoj.tsx";
import { Stoper } from "./Stoper.tsx";
import { Stroop } from "./Stroop.tsx";
import { Tort } from "./Tort.tsx";
import { WPamieci } from "./WPamieci.tsx";
import { Wieza } from "./Wieza.tsx";
import { Zakupy } from "./Zakupy.tsx";
import { Zaslona } from "./Zaslona.tsx";

interface Props {
  id: string;
  /** Stan gry: widok z pokoju albo zapisana rekordowa partia (`soloState`). */
  view: unknown;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  winner?: string;
  // Każda gra ma swój typ ruchu; sprawdza go serwer.
  onMove: (move: object) => void;
  onRound?: (msLeft: number | null) => void;
}

/** Mini-gra o danym `id` (dla innych gier nic): w pokoju (`Game.tsx`) i na ekranie rekordów, gdzie pokazuje koniec rekordowej partii. */
export function MiniGame({ id, view, me, players, ranking, winner, onMove, onRound }: Props) {
  return (
    <>
      {/* Klucz z wylosowanego wyzwania: rewanż montuje grę od nowa, bez stanu poprzedniej partii. */}
      {id === "refleks" && (
        <Refleks
          key={(view as RefleksView).delays.join()}
          view={view as RefleksView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
        />
      )}

      {id === "stoper" && (
        <Stoper
          key={(view as StoperView).nonce}
          view={view as StoperView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "kolo" && (
        <Kolo
          key={(view as KoloView).nonce}
          view={view as KoloView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "kolor" && (
        <Kolor
          key={JSON.stringify((view as KolorView).targets)}
          view={view as KolorView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "kat" && (
        <Kat
          key={JSON.stringify((view as KatView).rounds)}
          view={view as KatView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "kropki" && (
        <Kropki
          key={JSON.stringify((view as KropkiView).rounds)}
          view={view as KropkiView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "rok" && (
        <Rok
          key={JSON.stringify((view as RokView).events)}
          view={view as RokView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "srodek" && (
        <Srodek
          key={JSON.stringify((view as SrodekView).segments)}
          view={view as SrodekView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "mapa" && (
        <Mapa
          key={(view as MapaView).cities.map((c) => c.name).join()}
          view={view as MapaView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "stoj" && (
        <Stoj
          key={(view as StojView).reds.join()}
          view={view as StojView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
        />
      )}

      {id === "sledzenie" && (
        <Sledzenie
          key={JSON.stringify((view as SledzenieView).rounds)}
          view={view as SledzenieView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "kubki" && (
        <Kubki
          key={JSON.stringify((view as KubkiView).rounds)}
          view={view as KubkiView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "w-pamieci" && (
        <WPamieci
          key={JSON.stringify((view as WPamieciView).rounds)}
          view={view as WPamieciView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "balon" && (
        <Balon
          key={JSON.stringify((view as BalonView).limits)}
          view={view as BalonView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "tort" && (
        <Tort
          key={JSON.stringify((view as TortView).cakes)}
          view={view as TortView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "zaslona" && (
        <Zaslona
          key={JSON.stringify((view as ZaslonaView).rounds)}
          view={view as ZaslonaView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "zakupy" && (
        <Zakupy
          key={JSON.stringify((view as ZakupyView).items)}
          view={view as ZakupyView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "nozyczki" && (
        <Nozyczki
          key={JSON.stringify((view as NozyczkiView).shapes)}
          view={view as NozyczkiView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "przytrzymaj" && (
        <Przytrzymaj
          key={JSON.stringify((view as PrzytrzymajView).targets)}
          view={view as PrzytrzymajView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "rytm" && (
        <Rytm
          key={(view as RytmView).nonce}
          view={view as RytmView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "wieza" && (
        <Wieza
          key={JSON.stringify((view as WiezaView).sides)}
          view={view as WiezaView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "schulte" && (
        <Schulte
          key={(view as SchulteView).grid.join()}
          view={view as SchulteView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "sudoku" && (
        <Sudoku
          key={(view as SudokuView).puzzle.join()}
          view={view as SudokuView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}

      {id === "dziesiatki" && (
        <Dziesiatki
          key={[...(view as DziesiatkiView).board, ...(view as DziesiatkiView).refills.slice(0, 8)].join("")}
          view={view as DziesiatkiView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
          onRound={onRound}
        />
      )}

      {id === "literowka" && (
        <Literowka
          key={(view as LiterowkaView).trials.map((t) => t.wrong).join("")}
          view={view as LiterowkaView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
          onRound={onRound}
        />
      )}

      {id === "obrot" && (
        <Obrot
          key={(view as ObrotView).trials.map((t) => +t.mirror).join("")}
          view={view as ObrotView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
          onRound={onRound}
        />
      )}

      {id === "inny" && (
        <Inny
          key={(view as InnyView).trials.map((t) => t.odd).join()}
          view={view as InnyView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
          onRound={onRound}
        />
      )}

      {id === "stroop" && (
        <Stroop
          key={(view as StroopView).trials.map((t) => t.word * 4 + t.ink).join("")}
          view={view as StroopView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
          onRound={onRound}
        />
      )}

      {id === "liczenie" && (
        <Liczenie
          key={(view as LiczenieView).problems.map((p) => p.text).join()}
          view={view as LiczenieView}
          me={me}
          players={players}
          ranking={ranking}
          winner={winner}
          onMove={onMove}
          onRound={onRound}
        />
      )}

      {id === "simon" && (
        <Simon
          key={(view as SimonView).sequence.join("")}
          view={view as SimonView}
          me={me}
          players={players}
          ranking={ranking}
          onMove={onMove}
        />
      )}
    </>
  );
}
