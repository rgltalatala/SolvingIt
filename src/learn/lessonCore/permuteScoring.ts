import { applyMoves } from '../../cube/cubeState';
import type { CubeState, Move } from '../../cube/cubeState';

export function lessonStepHasDemo<TStep extends { demoMoves?: Move[] }>(
  step: TStep,
): step is TStep & { demoMoves: Move[] } {
  return 'demoMoves' in step && !!step.demoMoves?.length;
}

export function slotsGainedAfterDemo(
  studentState: CubeState,
  demo: Move[],
  countSolved: (state: CubeState) => number,
): number {
  const after = applyMoves(studentState, demo);
  return countSolved(after) - countSolved(studentState);
}

export type PermuteCandidate<TId, TStep extends { demoMoves?: Move[] }> = {
  id: TId;
  step: TStep;
};

export function pickBestPermuteInTier<
  TId,
  TStep extends { demoMoves?: Move[] },
>(args: {
  studentState: CubeState;
  candidates: PermuteCandidate<TId, TStep>[];
  countSolved: (state: CubeState) => number;
  orderIndex: (id: TId) => number;
  kindTiebreak: (step: TStep) => number;
  demoChangesState: (state: CubeState, demo: Move[]) => boolean;
}): PermuteCandidate<TId, TStep> | null {
  const valid = args.candidates.filter(
    (candidate) =>
      lessonStepHasDemo(candidate.step) &&
      args.demoChangesState(args.studentState, candidate.step.demoMoves),
  );
  if (valid.length === 0) return null;

  const score = (
    candidate: PermuteCandidate<TId, TStep>,
  ): [number, number, number, number] => {
    if (!lessonStepHasDemo(candidate.step)) return [-1, 999, 0, 999];
    const gained = slotsGainedAfterDemo(
      args.studentState,
      candidate.step.demoMoves,
      args.countSolved,
    );
    return [
      gained,
      -candidate.step.demoMoves.length,
      args.kindTiebreak(candidate.step),
      -args.orderIndex(candidate.id),
    ];
  };

  valid.sort((a, b) => {
    const scoreA = score(a);
    const scoreB = score(b);
    for (let i = 0; i < scoreA.length; i += 1) {
      if (scoreA[i] !== scoreB[i]) return scoreB[i]! - scoreA[i]!;
    }
    return 0;
  });
  return valid[0]!;
}
