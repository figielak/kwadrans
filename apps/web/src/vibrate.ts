import { useEffect, useRef } from "react";

/** Wzory wibracji z tabeli w ZASADY.md §5; gry nie wpisują własnych liczb. */
export const VIBRATE = {
  /** Moja nowa decyzja (robi to Game.tsx). */
  turn: 40,
  /** Rzeczywisty błąd; legalne pudło i zignorowany ruch nie wibrują. */
  mistake: 60,
  /** Coś złego dla mnie od innego gracza. */
  harm: [60, 40, 60],
  /** Uderzenie metronomu w Rytmie: część bodźca, nie informacja zwrotna. */
  beat: 30,
};

/**
 * Klucz decyzji gracza (null: nic ode mnie nie zależy); nowy klucz to nowa decyzja i wibracja tury.
 * Fazy Państw-miast to nowe decyzje, STOP nie. Kalambury mają w `waitingFor` zgadujących dopiero w drugiej połowie
 * (to tylko limit), więc decyzję liczymy z ról: rysujący od wyboru hasła, zgadujący od wejścia w rysowanie; połowy nie wolno zdradzić.
 */
export function decisionKey(gameId: string, view: unknown, me: string, waitingFor: string[]): string | null {
  const v = view as { phase?: string; round?: number; drawer?: string; players?: string[]; guessed?: string[] };
  if (gameId === "kalambury" && (v.phase === "choose" || v.phase === "draw")) {
    if (me === v.drawer) return `pick:${v.round}`;
    return v.phase === "draw" && v.players?.includes(me) && !v.guessed?.includes(me) ? `guess:${v.round}` : null;
  }
  if (!waitingFor.includes(me)) return null;
  return gameId === "panstwa-miasta" || gameId === "kalambury" ? `${v.phase}:${v.round}` : "turn";
}

/** Szkoda od rywala: wibruje raz, gdy pojawia się nowy klucz; zdarzenie zastane przy wejściu do gry nie wibruje. */
export function useHarm(key: string | null) {
  const seen = useRef(key);
  useEffect(() => {
    if (seen.current === key) return;
    seen.current = key;
    if (key !== null) navigator.vibrate?.(VIBRATE.harm);
  }, [key]);
}
