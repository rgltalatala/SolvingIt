import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { isWhiteCrossComplete } from '../cross/crossSlotModel';
import { cornerSolvedInFrdView } from './cornerCases';
import { normalizeHoldToBlue } from './cornerHold';
import { cornerSlotSolved, mustPreserveCornerIds } from './cornerSlotModel';
import type { CornerSlotId } from './types';

/** Whether a previously solved corner is still intact (blue-normalized from current hold). */
export function cornerPreservedAtLessonHold(
  state: CubeState,
  id: CornerSlotId,
  holdIndex: number,
): boolean {
  return cornerSlotSolved(normalizeHoldToBlue(state, holdIndex), id);
}

/** Target corner correctly placed in the FRD working slot for the current hold. */
export function cornerTargetSolvedAtHold(
  state: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
): boolean {
  return cornerSolvedInFrdView(state, targetId, holdIndex);
}

export function isLessonStateValid(studentState: CubeState): boolean {
  return isWhiteCrossComplete(studentState);
}

export function preservesLessonStateAfterDemo(
  studentState: CubeState,
  demo: Move[],
  targetCornerId: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): boolean {
  if (demo.length === 0) return false;
  const after = applyMoves(studentState, demo);
  if (!isWhiteCrossComplete(after)) return false;
  const mustPreserve = mustPreserveCornerIds(
    studentState,
    targetCornerId,
    holdIndex,
    solvedCornerIds,
  );
  return mustPreserve.every((id) =>
    cornerPreservedAtLessonHold(after, id, holdIndex),
  );
}

/**
 * Demo slots the target corner at the current hold and leaves cross plus
 * previously solved corners intact (each preserved corner checked at its lesson hold).
 */
export function isVerifiedCornerSlotDemo(
  studentState: CubeState,
  targetId: CornerSlotId,
  demo: Move[],
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  const mustPreserve = mustPreserveCornerIds(
    studentState,
    targetId,
    holdIndex,
    solvedCornerIds,
  );
  return (
    cornerTargetSolvedAtHold(after, targetId, holdIndex) &&
    isWhiteCrossComplete(after) &&
    mustPreserve.every((id) =>
      cornerPreservedAtLessonHold(after, id, holdIndex),
    )
  );
}
