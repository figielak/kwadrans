/** Pomijamy instrukcję tylko na prośbę serwera i tylko zanim zacznie się limit gry. */
export function autoStart({ skipIntro, intro }: { skipIntro: boolean; intro: boolean }): boolean {
  return skipIntro && intro;
}

export type IntroStage = "reads" | "ready" | "countdown" | "watching" | "closed";

/**
 * Co pokazuje ekran instrukcji. Solo czyta do własnego „Start” (nikt nie odlicza),
 * obserwator nie ma przycisku, tylko gotowość i odliczanie.
 */
export function introStage({ seated, solo, began, countdown, intro }: { seated: boolean; solo: boolean; began: boolean; countdown: boolean; intro: boolean }): IntroStage {
  if (!intro) return "closed";
  if (countdown) return "countdown";
  if (!seated) return "watching";
  if (solo) return "reads";
  return began ? "ready" : "reads";
}

/** Instrukcja zamknięta po tym, jak ją widzieliśmy: gra rusza. Po odświeżeniu już po zamknięciu (`seen` fałszywe) nic nie startuje samo. */
export function startsAfterClose({ seen, intro }: { seen: boolean; intro: boolean }): boolean {
  return seen && !intro;
}
