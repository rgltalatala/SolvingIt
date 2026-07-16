const NOTATION_INTRO_COMPLETED_KEY = 'solving-it.notation.introCompleted';

/** Whether the user opted out of the notation intro on future lesson starts. */
export function getNotationIntroCompleted(): boolean {
  try {
    return localStorage.getItem(NOTATION_INTRO_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setNotationIntroCompleted(completed: boolean): void {
  try {
    localStorage.setItem(
      NOTATION_INTRO_COMPLETED_KEY,
      completed ? 'true' : 'false',
    );
  } catch {
    // private mode / blocked storage
  }
}

/** Initial app phase: notation intro unless the user marked it complete. */
export function initialAppPhase(): 'notation' | 'scanning' {
  return getNotationIntroCompleted() ? 'scanning' : 'notation';
}
