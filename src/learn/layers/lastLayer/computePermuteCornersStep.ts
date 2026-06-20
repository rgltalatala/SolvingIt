import type { CubeState, Move } from '../../../cube/cubeState';
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

const COMPLETE_BODY =
  'All four top-layer corner side stickers match their adjacent centers (F, R, B, L). Hold the cube with the blue face toward you (white on bottom, yellow on top) and confirm it matches the diagram below.';

export function lastLayerCornersPermuteCompleteStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: 'Last-layer corners permuted',
    body: COMPLETE_BODY,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: 'Face the blue side',
    body: 'All four top corners are permuted. Turn the cube so the blue face is toward you again (white on bottom, yellow on top).',
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
    title: `Face the ${faceLabel} side`,
    body: `One top corner already has its side colors matching the centers. Turn the whole cube so the ${faceLabel} face is toward you and that corner sits at front-right on U — then run the permutation algorithm on the next step.`,
    demoMoves,
    targetHoldIndex,
  };
}

function buildZeroFlowY2Step(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: 'Turn the cube over in your hands',
    body: 'Rotate the whole cube with y2 (a half turn) so the green face is toward you, then run the same corner permutation algorithm again on the next step.',
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
      title: 'Permute top corners',
      body: "No top corners have their side colors in place yet. Run U R U' L' U R' U' L, then turn the cube with y2, then run the same algorithm again — all four corners will be permuted.",
      demoMoves: PERMUTE_CORNERS_ALG,
      permuteCase,
    };
  }

  if (permuteCase === 'zero-flow-second') {
    return {
      kind: 'permute-corners',
      title: 'Permute top corners again',
      body: "Run U R U' L' U R' U' L one more time. All four top corner side stickers should now match their adjacent centers.",
      demoMoves: PERMUTE_CORNERS_ALG,
      permuteCase,
    };
  }

  return {
    kind: 'permute-corners',
    title: 'Permute top corners',
    body: "The correct corner is at front-right on U. Run U R U' L' U R' U' L to cycle the top-layer corners. If not all four side colors match their centers afterward, run the same algorithm again.",
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
    return lastLayerCornersPermuteCompleteStep();
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
