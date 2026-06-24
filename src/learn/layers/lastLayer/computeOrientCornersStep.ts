import type { CubeState, Move } from '../../../cube/cubeState';
import { returnToBlueY, type CornerHoldIndex } from '../bottomLayer/corners/cornerHold';
import { lastLayerSteps } from '../../../content/lastLayer';
import { orientRepsAtUrf, recognizeOrientCornersCase } from './orientCorners/orientCornersCases';
import { repeatOrientAlg } from './orientCorners/orientCornersAlgs';
import type { LastLayerLessonStep, LastLayerLessonStepOptions } from './types';

export function lastLayerCompleteStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: lastLayerSteps.lastLayerComplete.title,
    body: lastLayerSteps.lastLayerComplete.body,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceBlueOriented.title,
    body: lastLayerSteps.faceBlueOriented.body,
    demoMoves: returnToBlueY(currentHoldIndex),
    targetHoldIndex: 0,
    returnToInitialHold: true,
  };
}

function buildAlignUStep(alignMoves: Move[]): LastLayerLessonStep {
  return {
    kind: 'align-u',
    subLesson: 'orient-corners',
    title: lastLayerSteps.alignOrientCorners.title,
    body: lastLayerSteps.alignOrientCorners.body,
    demoMoves: alignMoves,
  };
}

function buildOrientCornersStep(reps: 2 | 4): LastLayerLessonStep {
  const repLabel =
    reps === 2
      ? lastLayerSteps.orientCornersTwice
      : lastLayerSteps.orientCornersFourTimes;
  return {
    kind: 'orient-corners',
    title: lastLayerSteps.orientFrontRightCorner.title,
    body: lastLayerSteps.orientFrontRightCorner.body(repLabel),
    demoMoves: repeatOrientAlg(reps),
    reps,
  };
}

export function computeOrientCornersStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  const currentHoldIndex = (options.currentHoldIndex ?? 0) as CornerHoldIndex;
  const orientCase = recognizeOrientCornersCase(studentState);

  if (orientCase.kind === 'solved') {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return lastLayerCompleteStep();
  }

  if (orientCase.kind === 'needs-align') {
    if (orientCase.alignMoves.length === 0) {
      return buildOrientCornersStep(orientRepsAtUrf(studentState));
    }
    return buildAlignUStep(orientCase.alignMoves);
  }

  return buildOrientCornersStep(orientCase.reps);
}
