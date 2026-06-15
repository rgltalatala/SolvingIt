import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAvoidBackDefaultPreference,
  setAvoidBackDefaultPreference,
} from './lessonPreferences';

describe('lessonPreferences', () => {
  const storage = new Map<string, string>();

  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });

  it('reads and writes avoid-back default', () => {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
    });

    expect(getAvoidBackDefaultPreference()).toBe(false);
    setAvoidBackDefaultPreference(true);
    expect(getAvoidBackDefaultPreference()).toBe(true);
    setAvoidBackDefaultPreference(false);
    expect(getAvoidBackDefaultPreference()).toBe(false);
  });
});
