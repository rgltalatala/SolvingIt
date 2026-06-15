import type { Move } from '../../cube/cubeState';

const lessonDemoCacheClearers: Array<() => void> = [];

/** Register a lesson-specific demo cache clear function (e.g. cross BFS cache). */
export function registerLessonDemoCache(clear: () => void): void {
  lessonDemoCacheClearers.push(clear);
}

/** Drop all registered lesson demo caches (e.g. when entering a fresh lesson session). */
export function clearAllLessonDemoCaches(): void {
  for (const clear of lessonDemoCacheClearers) {
    clear();
  }
}

export type DemoCache<TKey extends string> = {
  has: (key: TKey) => boolean;
  get: (key: TKey) => Move[] | null | undefined;
  set: (key: TKey, value: Move[] | null) => void;
  clear: () => void;
};

export function createDemoCache<TKey extends string>(
  maxSize: number,
): DemoCache<TKey> {
  const cache = new Map<TKey, Move[] | null>();

  function evictOldestIfNeeded(): void {
    if (cache.size >= maxSize) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
  }

  return {
    has: (key) => cache.has(key),
    get: (key) => (cache.has(key) ? (cache.get(key) ?? null) : undefined),
    set: (key, value) => {
      evictOldestIfNeeded();
      cache.set(key, value);
    },
    clear: () => cache.clear(),
  };
}
