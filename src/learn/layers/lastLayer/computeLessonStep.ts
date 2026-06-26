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
import { lastLayerSteps } from '../../../content/lastLayer';
import {
  maybeLastLayerIntro,
} from './introSteps';

const PREREQUISITE_BODY = lastLayerSteps.prerequisite.body;

function prerequisiteStep(): LastLayerLessonStep {
  return {
    kind: 'prerequisite',
    title: lastLayerSteps.prerequisite.title,
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

  if (isLastLayerComplete(studentState)) {
    if ((options.currentHoldIndex ?? 0) !== 0) {
      return computeOrientCornersStep(studentState, options);
    }
    return lastLayerCompleteStep();
  }

  const overviewIntro = maybeLastLayerIntro(options, 'overview');
  if (overviewIntro) return overviewIntro;

  if (!isYellowCrossComplete(studentState)) {
    const intro = maybeLastLayerIntro(options, 'orient-edges');
    if (intro) return intro;
    return computeOrientEdgesStep(studentState);
  }

  if (
    options.inOrientCornersPhase &&
    !isLastLayerComplete(studentState)
  ) {
    const intro = maybeLastLayerIntro(options, 'orient-corners');
    if (intro) return intro;
    return computeOrientCornersStep(studentState, options);
  }

  if (!isEdgesFullyPermuted(studentState)) {
    const intro = maybeLastLayerIntro(options, 'permute-edges');
    if (intro) return intro;
    return computePermuteEdgesStep(studentState, options);
  }

  if (!isCornersFullyPermuted(studentState)) {
    const intro = maybeLastLayerIntro(options, 'permute-corners');
    if (intro) return intro;
    return computePermuteCornersStep(studentState, options);
  }

  if (!isLastLayerComplete(studentState)) {
    const intro = maybeLastLayerIntro(options, 'orient-corners');
    if (intro) return intro;
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
