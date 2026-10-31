// Pomiar reakcji (P4-061, D4-049 A): bodziec od pierwszej klatki, w której jest narysowany, dotyk od znacznika zdarzenia.
// rAF to chwila przed pokazaniem klatki, nie emisja piksela; opóźnienia ekranu i dotyku telefonu to nie usuwa.

/** Ustawia odniesienie bodźca od razu na chwilę zmiany stanu, a w pierwszej klatce na jej znacznik. */
export function markFrame(set: (t: number) => void) {
  set(performance.now());
  requestAnimationFrame(set);
}

/** Czas od klatki z bodźcem do dotknięcia w ms; ujemny, gdy palec był szybszy niż pierwsza klatka. */
export const reaction = (frame: number, e: { timeStamp: number }) => Math.round(e.timeStamp - frame);
