import type { CubeState } from '../../../cube/cubeState';
import { isWhiteCrossComplete } from '../bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '../bottomLayer/corners/cornerSlotModel';
import { isMiddleLayerEdgesComplete } from '../middleLayer/edges/edgeSlotModel';
import { computeOrientEdgesStep } from './computeOrientEdgesStep';
import { computePermuteCornersStep } from './computePermuteCornersStep';
import { computePermuteEdgesStep } from './computePermuteEdgesStep';
import { isYellowCrossComplete } from './orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from './permuteEdges/uLayerEdgePermuteModel';
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

function computeLastLayerLessonStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  if (isPrerequisiteIncomplete(studentState)) {
    return prerequisiteStep();
  }

  if (!isYellowCrossComplete(studentState)) {
    return computeOrientEdgesStep(studentState);
  }

  if (!isEdgesFullyPermuted(studentState)) {
    return computePermuteEdgesStep(studentState, options);
  }

  return computePermuteCornersStep(studentState, options);
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
