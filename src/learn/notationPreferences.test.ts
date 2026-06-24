import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getNotationIntroCompleted,
  initialAppPhase,
  setNotationIntroCompleted,
} from './notationPreferences';

describe('notationPreferences', () => {
  const storage = new Map<string, string>();

  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });

  function stubStorage() {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
    });
  }

  it('reads and writes notation intro completed', () => {
    stubStorage();
    expect(getNotationIntroCompleted()).toBe(false);
    setNotationIntroCompleted(true);
    expect(getNotationIntroCompleted()).toBe(true);
    setNotationIntroCompleted(false);
    expect(getNotationIntroCompleted()).toBe(false);
  });

  it('initialAppPhase respects completion preference', () => {
    stubStorage();
    expect(initialAppPhase()).toBe('notation');
    setNotationIntroCompleted(true);
    expect(initialAppPhase()).toBe('scanning');
  });
});
