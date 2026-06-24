import type { CubeState, Move } from '../../../cube/cubeState';
import { lastLayerSteps } from '../../../content/lastLayer';
import {
  formatHoldFaceLabel,
  relativeY,
  returnToBlueY,
  type CornerHoldIndex,
} from '../bottomLayer/corners/cornerHold';
import { recognizePermuteCornersCase } from './permuteCorners/permuteCornersCases';
import { PERMUTE_CORNERS_ALG } from './permuteCorners/permuteCornersAlgs';
import {
  findReorientToPlacePermutedCornerAtWorldUrf,
  WORLD_URF_SLOT,
  ZERO_FLOW_Y2_TARGET_HOLD,
} from './permuteCorners/permuteHold';
import { cornerPermutedAtSlot } from './permuteCorners/uLayerCornerPermuteModel';
import type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  PermuteCornersCaseKind,
} from './types';

export function lastLayerCornersPermuteCompleteStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: lastLayerSteps.lastLayerCornersPermuted.title,
    body: lastLayerSteps.lastLayerCornersPermuted.body,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceBlueCorners.title,
    body: lastLayerSteps.faceBlueCorners.body,
    demoMoves: returnToBlueY(currentHoldIndex),
    targetHoldIndex: 0,
    returnToInitialHold: true,
  };
}

function buildReorientForCornerStep(
  targetHoldIndex: CornerHoldIndex,
  demoMoves: Move[],
): LastLayerLessonStep {
  const faceLabel = formatHoldFaceLabel(targetHoldIndex);
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceSideTitle(faceLabel),
    body: lastLayerSteps.reorientCorners(faceLabel),
    demoMoves,
    targetHoldIndex,
  };
}

function buildZeroFlowY2Step(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.turnCubeOver.title,
    body: lastLayerSteps.turnCubeOver.body,
    demoMoves: relativeY(currentHoldIndex, ZERO_FLOW_Y2_TARGET_HOLD),
    targetHoldIndex: ZERO_FLOW_Y2_TARGET_HOLD,
    zeroFlowStep: 1,
  };
}

function buildPermuteCornersStep(
  permuteCase: PermuteCornersCaseKind,
): LastLayerLessonStep {
  if (permuteCase === 'zero-flow-first') {
    return {
      kind: 'permute-corners',
      title: lastLayerSteps.permuteCornersZeroFlowFirst.title,
      body: lastLayerSteps.permuteCornersZeroFlowFirst.body,
      demoMoves: PERMUTE_CORNERS_ALG,
      permuteCase,
    };
  }

  if (permuteCase === 'zero-flow-second') {
    return {
      kind: 'permute-corners',
      title: lastLayerSteps.permuteCornersZeroFlowSecond.title,
      body: lastLayerSteps.permuteCornersZeroFlowSecond.body,
      demoMoves: PERMUTE_CORNERS_ALG,
      permuteCase,
    };
  }

  return {
    kind: 'permute-corners',
    title: lastLayerSteps.permuteCornersOne.title,
    body: lastLayerSteps.permuteCornersOne.body,
    demoMoves: PERMUTE_CORNERS_ALG,
    permuteCase,
  };
}

export function computePermuteCornersStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  const currentHoldIndex = (options.currentHoldIndex ?? 0) as CornerHoldIndex;
  const zeroFlowStep = options.permuteCornersZeroFlowStep;

  if (zeroFlowStep === 1) {
    if (currentHoldIndex === ZERO_FLOW_Y2_TARGET_HOLD) {
      return buildPermuteCornersStep('zero-flow-second');
    }
    return buildZeroFlowY2Step(currentHoldIndex);
  }

  if (zeroFlowStep === 2) {
    return buildPermuteCornersStep('zero-flow-second');
  }

  const permuteCase = recognizePermuteCornersCase(
    studentState,
    currentHoldIndex,
  );

  if (permuteCase.kind === 'solved') {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    throw new Error(
      'computePermuteCornersStep: corners permuted at blue hold should route to orient',
    );
  }

  if (permuteCase.kind === 'none-permuted') {
    return buildPermuteCornersStep('zero-flow-first');
  }

  if (!cornerPermutedAtSlot(studentState, WORLD_URF_SLOT)) {
    const setup = findReorientToPlacePermutedCornerAtWorldUrf(
      studentState,
      currentHoldIndex,
    );
    if (setup && setup.demoMoves.length > 0) {
      return buildReorientForCornerStep(
        setup.targetHoldIndex,
        setup.demoMoves,
      );
    }
  }

  return buildPermuteCornersStep('one-permuted');
}
