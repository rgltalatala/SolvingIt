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
  holdIndexFromFrontColor,
  isPairAtBackRight,
  findReorientToPlacePairAtWorldBackRight,
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
  studentState: CubeState,
  targetHoldIndex: CornerHoldIndex,
  options?: { syncHoldOnly?: boolean },
): LastLayerLessonStep {
  const physicalHold = holdIndexFromFrontColor(
    faceCentersFromCubeState(studentState).F,
  );
  const faceLabel = formatHoldFaceLabel(targetHoldIndex);
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceSideTitle(faceLabel),
    body: lastLayerSteps.reorientEdges(faceLabel),
    demoMoves: options?.syncHoldOnly
      ? []
      : reorientMovesForPermuteSetup(physicalHold, targetHoldIndex),
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
  const frontColor = faceCentersFromCubeState(studentState).F;
  const physicalHold = holdIndexFromFrontColor(frontColor);
  const permuteCase = recognizePermuteEdgesCase(studentState, physicalHold);

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
    if (currentHoldIndex !== physicalHold) {
      return buildReorientForPermuteStep(studentState, physicalHold, {
        syncHoldOnly: true,
      });
    }

    if (isPairAtBackRight(permuteCase.slots)) {
      return buildPermuteEdgesStep('adjacent');
    }

    const setup = findReorientToPlacePairAtWorldBackRight(
      studentState,
      physicalHold,
    );
    if (setup && setup.demoMoves.length > 0) {
      return buildReorientForPermuteStep(
        studentState,
        setup.targetHoldIndex,
      );
    }

    return buildReorientForPermuteStep(
      studentState,
      permuteCase.targetHoldIndex,
    );
  }

  return buildPermuteEdgesStep('opposite');
}
