import type { CubeState, Move } from '../../../cube/cubeState';
import { faceCentersFromCubeState } from '../../../cube/cubeState';
import {
  formatHoldFaceLabel,
  returnToBlueY,
  type CornerHoldIndex,
} from '../bottomLayer/corners/cornerHold';
import { recognizePermuteEdgesCase } from './permuteEdges/permuteEdgesCases';
import { PERMUTE_EDGES_ALG } from './permuteEdges/permuteEdgesAlgs';
import {
  holdMatchesFaceColor,
  isPairAtBackRight,
  reorientMovesForPermuteSetup,
} from './permuteEdges/permuteHold';
import { permutedEdgeSlots } from './permuteEdges/uLayerEdgePermuteModel';
import type { LastLayerLessonStep, LastLayerLessonStepOptions } from './types';

const COMPLETE_BODY =
  'All four top-layer edge side stickers match their adjacent centers (F, R, B, L). Hold the cube with the blue face toward you (white on bottom, yellow on top) and confirm it matches the diagram below.';

function completeStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: 'Last-layer edges complete',
    body: COMPLETE_BODY,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: 'Face the blue side',
    body: 'All four top edges are permuted. Turn the cube so the blue face is toward you again (white on bottom, yellow on top).',
    demoMoves: returnToBlueY(currentHoldIndex),
    targetHoldIndex: 0,
    returnToInitialHold: true,
  };
}

function buildReorientForPermuteStep(
  currentHoldIndex: CornerHoldIndex,
  targetHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  const faceLabel = formatHoldFaceLabel(targetHoldIndex);
  return {
    kind: 'reorient-hold',
    title: `Face the ${faceLabel} side`,
    body: `Two top edges already match their side centers. Turn the whole cube so the ${faceLabel} face is toward you and those edges sit at the back and right on U — then run the permutation algorithm on the next step.`,
    demoMoves: reorientMovesForPermuteSetup(currentHoldIndex, targetHoldIndex),
    targetHoldIndex,
  };
}

function buildPermuteEdgesStep(
  permuteCase: 'adjacent' | 'opposite',
): LastLayerLessonStep {
  const caseNote =
    permuteCase === 'adjacent'
      ? 'The two correct edges are at back and right on U.'
      : 'Two opposite edges match their centers; one algorithm pass usually sets up the adjacent case.';
  return {
    kind: 'permute-edges',
    title: 'Permute top edges',
    body: `${caseNote} Run R U R' U R U2 R' U to cycle the top-layer edges. Side stickers should line up with their centers when done.`,
    demoMoves: PERMUTE_EDGES_ALG,
    permuteCase,
  };
}

export function computePermuteEdgesStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  const currentHoldIndex = (options.currentHoldIndex ?? 0) as CornerHoldIndex;
  const permuteCase = recognizePermuteEdgesCase(studentState, currentHoldIndex);

  if (permuteCase.kind === 'solved') {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return completeStep();
  }

  if (permuteCase.kind === 'u-only') {
    if (permuteCase.alignMoves.length === 0) {
      if (currentHoldIndex !== 0) {
        return buildReturnToBlueStep(currentHoldIndex);
      }
      return completeStep();
    }
    return {
      kind: 'align-u',
      subLesson: 'permute-edges',
      title: 'Align the top layer',
      body: 'All four top edges can be permuted with a single U turn. Rotate U so each edge side sticker lines up with its center.',
      demoMoves: permuteCase.alignMoves,
    };
  }

  if (permuteCase.inspectPrefix.length > 0) {
    const visible = permutedEdgeSlots(studentState);
    if (visible.length !== 2) {
      return {
        kind: 'align-u',
        subLesson: 'permute-edges',
        title: 'Inspect the top layer',
        body: 'Rotate U to check which top edges already match their side centers — you should see two correct edges for the next step.',
        demoMoves: permuteCase.inspectPrefix,
      };
    }
  }

  if (permuteCase.kind === 'adjacent') {
    const frontColor = faceCentersFromCubeState(studentState).F;
    const cubeMatchesHold = holdMatchesFaceColor(frontColor, currentHoldIndex);
    if (!cubeMatchesHold || !isPairAtBackRight(permuteCase.slots)) {
      return buildReorientForPermuteStep(
        currentHoldIndex,
        permuteCase.targetHoldIndex,
      );
    }
    return buildPermuteEdgesStep('adjacent');
  }

  return buildPermuteEdgesStep('opposite');
}
