import type { CubeState, Move } from '../../../cube/cubeState';
import { returnToBlueY, type CornerHoldIndex } from '../bottomLayer/corners/cornerHold';
import { orientRepsAtUrf, recognizeOrientCornersCase } from './orientCorners/orientCornersCases';
import { repeatOrientAlg } from './orientCorners/orientCornersAlgs';
import type { LastLayerLessonStep, LastLayerLessonStepOptions } from './types';

const COMPLETE_BODY =
  'All four top-layer corners show yellow on U and match their side centers. The last layer is complete — hold the cube with blue toward you (white on bottom, yellow on top) and confirm it matches the diagram below.';

export function lastLayerCompleteStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: 'Last layer complete',
    body: COMPLETE_BODY,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: 'Face the blue side',
    body: 'All four top corners are oriented. Turn the cube so the blue face is toward you again (white on bottom, yellow on top).',
    demoMoves: returnToBlueY(currentHoldIndex),
    targetHoldIndex: 0,
    returnToInitialHold: true,
  };
}

function buildAlignUStep(alignMoves: Move[]): LastLayerLessonStep {
  return {
    kind: 'align-u',
    subLesson: 'orient-corners',
    title: 'Align the top layer',
    body: 'The front-right corner on U is already oriented. Rotate U to bring the next unsolved corner to front-right on U, then run the orientation algorithm on the next step.',
    demoMoves: alignMoves,
  };
}

function buildOrientCornersStep(reps: 2 | 4): LastLayerLessonStep {
  const repLabel = reps === 2 ? 'twice' : 'four times';
  return {
    kind: 'orient-corners',
    title: 'Orient the front-right corner',
    body: `The unsolved corner is at front-right on U. Run R' D' R D ${repLabel} until yellow faces up on that corner. Then rotate U to the next unsolved corner and repeat.`,
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
