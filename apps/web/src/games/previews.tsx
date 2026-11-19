import type { ComponentType, CSSProperties } from "react";
import { Preview as balon } from "./Balon.tsx";
import { Preview as dziesiatki } from "./Dziesiatki.tsx";
import { Preview as inny } from "./Inny.tsx";
import { Preview as kat } from "./Kat.tsx";
import { Preview as kolo } from "./Kolo.tsx";
import { Preview as kolor } from "./Kolor.tsx";
import { Preview as kropki } from "./Kropki.tsx";
import { Preview as kubki } from "./Kubki.tsx";
import { Preview as liczenie } from "./Liczenie.tsx";
import { Preview as literowka } from "./Literowka.tsx";
import { Preview as mapa } from "./Mapa.tsx";
import { Preview as nozyczki } from "./Nozyczki.tsx";
import { Preview as obrot } from "./Obrot.tsx";
import { Preview as przytrzymaj } from "./Przytrzymaj.tsx";
import { Preview as refleks } from "./Refleks.tsx";
import { Preview as rok } from "./Rok.tsx";
import { Preview as rytm } from "./Rytm.tsx";
import { Preview as schulte } from "./Schulte.tsx";
import { Preview as simon } from "./Simon.tsx";
import { Preview as sledzenie } from "./Sledzenie.tsx";
import { Preview as srodek } from "./Srodek.tsx";
import { Preview as stoj } from "./Stoj.tsx";
import { Preview as stoper } from "./Stoper.tsx";
import { Preview as stroop } from "./Stroop.tsx";
import { Preview as sudoku } from "./Sudoku.tsx";
import { Preview as tort } from "./Tort.tsx";
import { Preview as wPamieci } from "./WPamieci.tsx";
import { Preview as wieza } from "./Wieza.tsx";
import { Preview as zakupy } from "./Zakupy.tsx";
import { Preview as zaslona } from "./Zaslona.tsx";

/** Podgląd każdej mini-gry, ten sam co na ekranie instrukcji (`Intro`); część przyjmuje kolor gracza. */
export const PREVIEWS: Record<string, ComponentType<{ color?: string }>> = {
  balon, dziesiatki, inny, kat, kolo, kolor, kropki, kubki, liczenie, literowka, mapa, nozyczki, obrot, przytrzymaj, refleks,
  rok, rytm, schulte, simon, sledzenie, srodek, stoj, stoper, stroop, sudoku, tort, "w-pamieci": wPamieci, wieza, zakupy, zaslona,
};

/** Chwila zatrzymania dla gier, których pierwsza klatka jest pusta (ujemne opóźnienie jedynej animacji). */
const STILL_AT: Record<string, string> = { kolo: "-2.2s", refleks: "-0.2s" };

interface Props {
  id: string;
  color?: string;
  /** Nieruchoma pierwsza klatka (kafel na liście); bez tego podgląd animuje się jak na ekranie instrukcji. */
  still?: boolean;
  /** Pomniejszenie: podgląd widzi ramkę `1 / scale` razy większą od pudełka, więc na małym kaflu mieści się jak na instrukcji. */
  scale?: number;
  className?: string;
}

/** Podgląd gry w pudełku o proporcjach ramki z instrukcji, pomniejszony do kafla. Ozdoba: nazwa gry stoi obok. */
export function GamePreview({ id, color, still, scale = 0.5, className = "w-full" }: Props) {
  const Preview = PREVIEWS[id];
  if (!Preview) return null;
  const at = still ? STILL_AT[id] : undefined;
  return (
    <div
      className={`relative aspect-[8/5] overflow-hidden rounded-inset bg-bg ${still ? "still" : ""} ${at ? "still-at" : ""} ${className}`}
      style={at ? ({ "--still-at": at } as CSSProperties) : undefined}
      aria-hidden
    >
      <div
        className="absolute top-0 left-0 flex items-center justify-center"
        style={{ width: `${100 / scale}%`, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <Preview color={color ?? "var(--color-fg)"} />
      </div>
    </div>
  );
}
