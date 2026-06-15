const AVOID_BACK_DEFAULT_KEY = 'solveit.lesson.avoidBackDefault';

/** Whether to turn on "avoid back face" automatically when a step's demo includes B. */
export function getAvoidBackDefaultPreference(): boolean {
  try {
    return localStorage.getItem(AVOID_BACK_DEFAULT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAvoidBackDefaultPreference(enabled: boolean): void {
  try {
    localStorage.setItem(AVOID_BACK_DEFAULT_KEY, enabled ? 'true' : 'false');
  } catch {
    // private mode / blocked storage
  }
}
