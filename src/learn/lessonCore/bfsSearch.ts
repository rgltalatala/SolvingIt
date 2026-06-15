import {
  applyMove,
  cloneCubeState,
  compressConsecutiveFaceQuarterTurns,
} from '../../cube/cubeState';
import type { CubeState, Move } from '../../cube/cubeState';
import { cubeStateToCubeJsString } from '../../cube/cubeStateToFacelets';

export type BfsSearchOptions = {
  moves: Move[];
  maxDepth?: number;
  maxSeen?: number;
  /** Abort when wall-clock elapsed time exceeds this many milliseconds. */
  maxMs?: number;
};

const BFS_YIELD_EVERY = 1_500;
const BFS_SYNC_DEADLINE_CHECK_EVERY = 2_000;

function bfsDeadline(options: BfsSearchOptions): number | undefined {
  return options.maxMs !== undefined ? Date.now() + options.maxMs : undefined;
}

function isPastBfsDeadline(deadline: number | undefined): boolean {
  return deadline !== undefined && Date.now() >= deadline;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function cubeStateSearchKey(state: CubeState): string {
  return cubeStateToCubeJsString(state);
}

export function bfsShortestPath(
  initial: CubeState,
  isGoal: (state: CubeState) => boolean,
  options: BfsSearchOptions,
): Move[] | null {
  const maxDepth = options.maxDepth ?? 16;
  const maxSeen = options.maxSeen ?? 80_000;
  const { moves: moveSet } = options;
  const deadline = bfsDeadline(options);

  type SearchNode = { state: CubeState; path: Move[] };
  const queue: SearchNode[] = [{ state: cloneCubeState(initial), path: [] }];
  const seen = new Set<string>();
  seen.add(cubeStateSearchKey(initial));
  let expansionsSinceDeadlineCheck = 0;

  while (queue.length) {
    if (isPastBfsDeadline(deadline)) return null;

    const { state, path } = queue.shift()!;
    if (path.length > maxDepth) continue;

    if (isGoal(state)) {
      return path.length ? compressConsecutiveFaceQuarterTurns(path) : null;
    }

    for (const move of moveSet) {
      const nextState = applyMove(state, move);
      const key = cubeStateSearchKey(nextState);
      if (seen.has(key)) continue;
      seen.add(key);
      if (seen.size > maxSeen) return null;
      queue.push({ state: nextState, path: [...path, move] });
      if (deadline !== undefined) {
        expansionsSinceDeadlineCheck += 1;
        if (expansionsSinceDeadlineCheck >= BFS_SYNC_DEADLINE_CHECK_EVERY) {
          expansionsSinceDeadlineCheck = 0;
          if (isPastBfsDeadline(deadline)) return null;
        }
      }
    }
  }
  return null;
}

/** Same as {@link bfsShortestPath} but yields so the UI thread can stay responsive. */
export async function bfsShortestPathAsync(
  initial: CubeState,
  isGoal: (state: CubeState) => boolean,
  options: BfsSearchOptions,
): Promise<Move[] | null> {
  const maxDepth = options.maxDepth ?? 16;
  const maxSeen = options.maxSeen ?? 80_000;
  const { moves: moveSet } = options;
  const deadline = bfsDeadline(options);

  type SearchNode = { state: CubeState; path: Move[] };
  const queue: SearchNode[] = [{ state: cloneCubeState(initial), path: [] }];
  const seen = new Set<string>();
  seen.add(cubeStateSearchKey(initial));
  let expansionsSinceYield = 0;

  while (queue.length) {
    if (isPastBfsDeadline(deadline)) return null;

    const { state, path } = queue.shift()!;
    if (path.length > maxDepth) continue;

    if (isGoal(state)) {
      return path.length ? compressConsecutiveFaceQuarterTurns(path) : null;
    }

    for (const move of moveSet) {
      const nextState = applyMove(state, move);
      const key = cubeStateSearchKey(nextState);
      if (seen.has(key)) continue;
      seen.add(key);
      if (seen.size > maxSeen) return null;
      queue.push({ state: nextState, path: [...path, move] });
      if (++expansionsSinceYield >= BFS_YIELD_EVERY) {
        expansionsSinceYield = 0;
        await yieldToMain();
        if (isPastBfsDeadline(deadline)) return null;
      }
    }
  }
  return null;
}
