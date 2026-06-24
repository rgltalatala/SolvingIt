import type { CubeState } from '../../../cube/cubeState';
import { faceCentersFromCubeState } from '../../../cube/cubeState';
import { lastLayerSteps } from '../../../content/lastLayer';
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

function completeStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: lastLayerSteps.lastLayerEdgesComplete.title,
    body: lastLayerSteps.lastLayerEdgesComplete.body,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceBlueEdges.title,
    body: lastLayerSteps.faceBlueEdges.body,
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
    title: lastLayerSteps.faceSideTitle(faceLabel),
    body: lastLayerSteps.reorientEdges(faceLabel),
    demoMoves: reorientMovesForPermuteSetup(currentHoldIndex, targetHoldIndex),
    targetHoldIndex,
  };
}

function buildPermuteEdgesStep(
  permuteCase: 'adjacent' | 'opposite',
): LastLayerLessonStep {
  const caseNote =
    permuteCase === 'adjacent'
      ? lastLayerSteps.permuteEdgesAdjacentNote
      : lastLayerSteps.permuteEdgesOppositeNote;
  return {
    kind: 'permute-edges',
    title: lastLayerSteps.permuteTopEdges.title,
    body: lastLayerSteps.permuteTopEdges.body(caseNote),
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
      title: lastLayerSteps.alignTopLayer.title,
      body: lastLayerSteps.alignTopLayer.body,
      demoMoves: permuteCase.alignMoves,
    };
  }

  if (permuteCase.inspectPrefix.length > 0) {
    const visible = permutedEdgeSlots(studentState);
    if (visible.length !== 2) {
      return {
        kind: 'align-u',
        subLesson: 'permute-edges',
        title: lastLayerSteps.inspectTopLayer.title,
        body: lastLayerSteps.inspectTopLayer.body,
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
