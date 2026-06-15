import { applyMovesInStudentHold } from '../../cube/cubeState';
import type { CubeState, Move } from '../../cube/cubeState';
import {
  demoStepsToMoves,
  expandDemoSteps,
  type ExpandDemoStepsResult,
} from './expandDemoSteps';
import type { BuildExecutionResult, StudentHold } from './types';
import { noneHold } from './types';

/** Expanded demo steps for preview UI (chips, rotation labels) and execution move list. */
export function getLessonDemoExpansion(
  rawDemoMoves: Move[],
  avoidBackMoves: boolean,
  initialHold: StudentHold = noneHold(),
): ExpandDemoStepsResult {
  return expandDemoSteps(rawDemoMoves, initialHold, avoidBackMoves);
}

/**
 * Moves to show in the demo preview or apply on the physical cube — shared by store and UI.
 * When `avoidBackMoves` is false, returns raw lesson `demoMoves` (cube state already encodes y-rotations).
 */
export function getLessonExecutionMoves(
  rawDemoMoves: Move[],
  avoidBackMoves: boolean,
  initialHold: StudentHold = noneHold(),
): BuildExecutionResult {
  const { steps, finalHold } = getLessonDemoExpansion(
    rawDemoMoves,
    avoidBackMoves,
    initialHold,
  );
  return { moves: demoStepsToMoves(steps), finalHold };
}

export type ApplyLessonToStorageResult = {
  cubeState: CubeState;
  studentHold: StudentHold;
  moves: Move[];
};

/** Apply a lesson step to storage cube; returns null when there is nothing to apply. */
export function applyLessonToStorage(
  storageState: CubeState,
  rawDemoMoves: Move[],
  studentHold: StudentHold,
  avoidBackMoves: boolean,
): ApplyLessonToStorageResult | null {
  if (rawDemoMoves.length === 0) return null;

  const { moves } = getLessonExecutionMoves(
    rawDemoMoves,
    avoidBackMoves,
    studentHold,
  );
  const cubeState = applyMovesInStudentHold(storageState, moves);
  return {
    cubeState,
    /** y-rotations are applied on the cube; hold is only used during avoid-back expansion. */
    studentHold: noneHold(),
    moves,
  };
}
