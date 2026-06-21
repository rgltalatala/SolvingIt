import type { CubeState } from '../../../cube/cubeState';
import { isWhiteCrossComplete } from '../bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '../bottomLayer/corners/cornerSlotModel';
import { isMiddleLayerEdgesComplete } from '../middleLayer/edges/edgeSlotModel';
import { computeOrientCornersStep, lastLayerCompleteStep } from './computeOrientCornersStep';
import { computeOrientEdgesStep } from './computeOrientEdgesStep';
import { computePermuteCornersStep } from './computePermuteCornersStep';
import { computePermuteEdgesStep } from './computePermuteEdgesStep';
import { isYellowCrossComplete } from './orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from './permuteEdges/uLayerEdgePermuteModel';
import {
  isCornersFullyPermuted,
  isLastLayerComplete,
} from './permuteCorners/uLayerCornerPermuteModel';
import type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
} from './types';

const PREREQUISITE_BODY =
  'Finish the white cross, all four white corners, and all four middle-layer edges first. The bottom two layers must be complete before orienting the last-layer edges.';

function prerequisiteStep(): LastLayerLessonStep {
  return {
    kind: 'prerequisite',
    title: 'Complete the first two layers first',
    body: PREREQUISITE_BODY,
  };
}

function isPrerequisiteIncomplete(studentState: CubeState): boolean {
  return (
    !isWhiteCrossComplete(studentState) ||
    !isWhiteCornersComplete(studentState) ||
    !isMiddleLayerEdgesComplete(studentState, 0)
  );
}

/** Orient-corners may temporarily disturb F2L; skip that gate once the sub-lesson has started. */
function isOrientCornersPhase(
  studentState: CubeState,
  options: LastLayerLessonStepOptions,
): boolean {
  if (options.inOrientCornersPhase) return true;
  return (
    isYellowCrossComplete(studentState) &&
    isEdgesFullyPermuted(studentState) &&
    isCornersFullyPermuted(studentState) &&
    !isLastLayerComplete(studentState)
  );
}

function computeLastLayerLessonStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  if (
    !isOrientCornersPhase(studentState, options) &&
    isPrerequisiteIncomplete(studentState)
  ) {
    return prerequisiteStep();
  }

  if (!isYellowCrossComplete(studentState)) {
    return computeOrientEdgesStep(studentState);
  }

  if (
    options.inOrientCornersPhase &&
    !isLastLayerComplete(studentState)
  ) {
    return computeOrientCornersStep(studentState, options);
  }

  if (!isEdgesFullyPermuted(studentState)) {
    return computePermuteEdgesStep(studentState, options);
  }

  if (!isCornersFullyPermuted(studentState)) {
    return computePermuteCornersStep(studentState, options);
  }

  if (!isLastLayerComplete(studentState)) {
    return computeOrientCornersStep(studentState, options);
  }

  // Corners solved but cube may still be on green/orange/red hold (e.g. zero-flow permute).
  if ((options.currentHoldIndex ?? 0) !== 0) {
    return computeOrientCornersStep(studentState, options);
  }

  return lastLayerCompleteStep();
}

export function getLastLayerLessonStep(
  studentState: CubeState,
  options?: LastLayerLessonStepOptions,
): LastLayerLessonStep {
  return computeLastLayerLessonStep(studentState, options);
}

export async function getLastLayerLessonStepAsync(
  studentState: CubeState,
  options?: LastLayerLessonStepOptions,
): Promise<LastLayerLessonStep> {
  return computeLastLayerLessonStep(studentState, options);
}
