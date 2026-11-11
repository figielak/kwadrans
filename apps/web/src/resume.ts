/** Ile razy pytamy o miejsce, gdy serwer milczy, i co ile: razem około 2 minut. */
export const RESUME_TRIES = 24;
export const RESUME_WAIT_MS = 5000;

interface Deps<T> {
  reconnect(): Promise<T>;
  /** Czy serwer odpowiada na zwykłe zapytanie HTTP. */
  serverUp(): Promise<boolean>;
  wait(): Promise<void>;
  tries?: number;
}

/**
 * Powrót do pokoju po odświeżeniu strony. Restart serwera (deploy) trwa kilkanaście sekund i pokoje go przeżywają,
 * więc nieudana próba przy milczącym serwerze to powód, żeby poczekać, a nie żeby wyrzucić token.
 * `gone`: serwer działa i dwa razy z rzędu nie wpuścił, czyli miejsca już nie ma.
 */
export async function resume<T>({ reconnect, serverUp, wait, tries = RESUME_TRIES }: Deps<T>): Promise<{ room: T | null; gone: boolean }> {
  let refused = false;
  for (let i = 0; i < tries; i++) {
    try {
      return { room: await reconnect(), gone: false };
    } catch {
      // niżej: czy to odmowa, czy cisza
    }
    if (await serverUp()) {
      // Serwer mógł wstać tuż po nieudanej próbie, więc odmowę potwierdza dopiero druga próba.
      if (refused) return { room: null, gone: true };
      refused = true;
    } else {
      refused = false;
      await wait();
    }
  }
  return { room: null, gone: false };
}
