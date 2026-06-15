import type { CubeState, Move } from '../../cube/cubeState';
import type { DemoCache } from './demoCache';

export type VerifiedDemoSearchTier = {
  maxDepth?: number;
  maxSeen?: number;
};

type TierSearchOptions = VerifiedDemoSearchTier & {
  maxMs?: number;
};

function remainingBudgetMs(
  searchStartedAt: number,
  maxMs: number | undefined,
): number | undefined {
  if (maxMs === undefined) return undefined;
  return Math.max(0, maxMs - (Date.now() - searchStartedAt));
}

function cacheVerifiedDemo(
  cache: DemoCache<string>,
  cacheKey: string,
  demo: Move[] | null,
  cacheNullOnMiss: boolean,
): Move[] | null {
  if (demo) {
    cache.set(cacheKey, demo);
  } else if (cacheNullOnMiss) {
    cache.set(cacheKey, demo);
  }
  return demo;
}

export type FindVerifiedDemoOptions = {
  cache: DemoCache<string>;
  cacheKey: string;
  searchTiers: VerifiedDemoSearchTier[];
  maxMs?: number;
  /** When false, failed searches are not cached (used when a wall-clock cap may miss later). */
  cacheNullOnMiss?: boolean;
  solveTier: (tier: TierSearchOptions) => Move[] | null;
  verifyDemo: (demo: Move[]) => boolean;
};

/** Tiered BFS search with demo cache and optional wall-clock budget. */
export function findVerifiedDemoWithTiers({
  cache,
  cacheKey,
  searchTiers,
  maxMs,
  cacheNullOnMiss = true,
  solveTier,
  verifyDemo,
}: FindVerifiedDemoOptions): Move[] | null {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null;
  }

  const searchStartedAt = Date.now();
  for (const tier of searchTiers) {
    if (remainingBudgetMs(searchStartedAt, maxMs) === 0) break;

    const demo = solveTier({
      ...tier,
      maxMs: remainingBudgetMs(searchStartedAt, maxMs),
    });
    if (demo?.length && verifyDemo(demo)) {
      return cacheVerifiedDemo(cache, cacheKey, demo, cacheNullOnMiss);
    }
  }
  return cacheVerifiedDemo(cache, cacheKey, null, cacheNullOnMiss);
}

export type FindVerifiedDemoAsyncOptions = Omit<
  FindVerifiedDemoOptions,
  'solveTier'
> & {
  solveTier: (tier: TierSearchOptions) => Promise<Move[] | null>;
};

/** Async variant of {@link findVerifiedDemoWithTiers}. */
export async function findVerifiedDemoWithTiersAsync({
  cache,
  cacheKey,
  searchTiers,
  maxMs,
  cacheNullOnMiss = true,
  solveTier,
  verifyDemo,
}: FindVerifiedDemoAsyncOptions): Promise<Move[] | null> {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null;
  }

  const searchStartedAt = Date.now();
  for (const tier of searchTiers) {
    if (remainingBudgetMs(searchStartedAt, maxMs) === 0) break;

    const demo = await solveTier({
      ...tier,
      maxMs: remainingBudgetMs(searchStartedAt, maxMs),
    });
    if (demo?.length && verifyDemo(demo)) {
      return cacheVerifiedDemo(cache, cacheKey, demo, cacheNullOnMiss);
    }
  }
  return cacheVerifiedDemo(cache, cacheKey, null, cacheNullOnMiss);
}
