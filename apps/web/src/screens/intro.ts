/** Pomijamy instrukcję tylko na prośbę serwera i tylko zanim zacznie się limit gry. */
export function autoStart({ skipIntro, intro }: { skipIntro: boolean; intro: boolean }): boolean {
  return skipIntro && intro;
}
