import type { CubeState } from '../../../../cube/cubeState';
import { whiteCornersSteps, formatCornerLabel } from '../../../../content/whiteCorners';
import { normalizeLessonDemoMovesInStep } from '../../../lessonCore';
import { isWhiteCrossComplete } from '../cross/crossSlotModel';
import {
  formatHoldFaceLabel,
  relativeY,
  returnToBlueY,
  targetHoldIndex,
  type CornerHoldIndex,
} from './cornerHold';
import {
  activeCornerId,
  expectedCornerColors,
  formatColor,
  isWhiteCornersComplete,
} from './cornerSlotModel';
import {
  tryDirectSolveStepForCornerId,
  tryFrdTwistedInSlot,
  tryFrdULayerInsert,
  tryFrdWrongDLayerExtract,
} from './directSolveSteps';
import type {
  CornerSlotId,
  WhiteCornerLessonStepOptions,
  WhiteCornersLessonStep,
} from './types';

const WHITE_CORNERS_COMPLETE_BODY = whiteCornersSteps.complete.body;

const CROSS_PREREQUISITE_BODY = whiteCornersSteps.prerequisite.body;

function whiteCornersCompleteStep(): WhiteCornersLessonStep {
  return {
    kind: 'complete',
    title: whiteCornersSteps.complete.title,
    body: WHITE_CORNERS_COMPLETE_BODY,
  };
}

function crossPrerequisiteStep(): WhiteCornersLessonStep {
  return {
    kind: 'cross-prerequisite',
    title: whiteCornersSteps.prerequisite.title,
    body: CROSS_PREREQUISITE_BODY,
  };
}

function strategyIntroStep(): WhiteCornersLessonStep {
  return {
    kind: 'intro',
    title: whiteCornersSteps.intro.title,
    body: whiteCornersSteps.intro.body,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): WhiteCornersLessonStep {
  const demoMoves = returnToBlueY(currentHoldIndex);
  return {
    kind: 'reorient-hold',
    title: whiteCornersSteps.faceBlue.title,
    body: whiteCornersSteps.faceBlue.body,
    demoMoves,
    returnToInitialHold: true,
  };
}

function buildReorientHoldStep(
  targetCornerId: CornerSlotId,
  currentHoldIndex: number,
  targetHold: CornerHoldIndex,
): WhiteCornersLessonStep {
  const demoMoves = relativeY(currentHoldIndex, targetHold);
  const faceLabel = formatHoldFaceLabel(targetHold);

  const delta = (((targetHold - currentHoldIndex) % 4) + 4) % 4;
  const skipNote =
    delta === 2
      ? whiteCornersSteps.reorientSkipTwoSteps
      : delta === 3
        ? whiteCornersSteps.reorientSkipThreeSteps
        : '';

  return {
    kind: 'reorient-hold',
    title: whiteCornersSteps.faceSideTitle(faceLabel),
    body: whiteCornersSteps.reorient(
      faceLabel,
      formatCornerLabel(targetCornerId).toLowerCase(),
      skipNote,
    ),
    demoMoves,
    targetCornerId,
  };
}

function buildSolveCornerPlaceholderStep(
  studentState: CubeState,
  cornerId: CornerSlotId,
  currentHoldIndex: CornerHoldIndex,
): WhiteCornersLessonStep {
  const [, colorA, colorB] = expectedCornerColors(
    studentState,
    cornerId,
    currentHoldIndex,
  );
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: whiteCornersSteps.placeholder(
      formatColor(colorA),
      formatColor(colorB),
    ),
  };
}

/** Interactive lesson: case-matched algs first, then fixed fallbacks; never BFS. */
function tryInteractiveCornerSolveStep(
  studentState: CubeState,
  cornerId: CornerSlotId,
  currentHoldIndex: CornerHoldIndex,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const uLayerStep = tryFrdULayerInsert(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (uLayerStep?.demoMoves?.length) return uLayerStep;

  const caseSteps = [
    tryFrdWrongDLayerExtract(
      studentState,
      cornerId,
      currentHoldIndex,
      solvedCornerIds,
    ),
    tryFrdTwistedInSlot(
      studentState,
      cornerId,
      currentHoldIndex,
      solvedCornerIds,
    ),
  ];
  for (const step of caseSteps) {
    if (step?.demoMoves?.length) return normalizeLessonDemoMovesInStep(step);
  }

  const fixed = tryDirectSolveStepForCornerId(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (fixed?.demoMoves?.length) return normalizeLessonDemoMovesInStep(fixed);

  return null;
}

function computeWhiteCornerLessonStepSync(
  studentState: CubeState,
  options?: WhiteCornerLessonStepOptions,
): WhiteCornersLessonStep {
  const currentHoldIndex = (options?.currentHoldIndex ?? 0) as CornerHoldIndex;
  const solvedCornerIds = options?.solvedCornerIds;

  if (!isWhiteCrossComplete(studentState)) {
    return crossPrerequisiteStep();
  }

  if (isWhiteCornersComplete(studentState, currentHoldIndex, solvedCornerIds)) {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return whiteCornersCompleteStep();
  }

  if (!options?.hasSeenStrategyIntro) {
    return strategyIntroStep();
  }

  const cornerId = activeCornerId(
    studentState,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (!cornerId) {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return whiteCornersCompleteStep();
  }

  const target = targetHoldIndex(cornerId);
  if (currentHoldIndex !== target) {
    const reorientMoves = relativeY(currentHoldIndex, target);
    if (reorientMoves.length) {
      return buildReorientHoldStep(cornerId, currentHoldIndex, target);
    }
  }

  const direct = tryInteractiveCornerSolveStep(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (direct?.demoMoves?.length) return direct;

  return buildSolveCornerPlaceholderStep(
    studentState,
    cornerId,
    currentHoldIndex,
  );
}

export function getWhiteCornerLessonStep(
  studentState: CubeState,
  options?: WhiteCornerLessonStepOptions,
): WhiteCornersLessonStep {
  return computeWhiteCornerLessonStepSync(studentState, options);
}

export async function getWhiteCornerLessonStepAsync(
  studentState: CubeState,
  options?: WhiteCornerLessonStepOptions,
): Promise<WhiteCornersLessonStep> {
  const currentHoldIndex = (options?.currentHoldIndex ?? 0) as CornerHoldIndex;
  const solvedCornerIds = options?.solvedCornerIds;

  if (!isWhiteCrossComplete(studentState)) {
    return crossPrerequisiteStep();
  }

  if (isWhiteCornersComplete(studentState, currentHoldIndex, solvedCornerIds)) {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return whiteCornersCompleteStep();
  }

  if (!options?.hasSeenStrategyIntro) {
    return strategyIntroStep();
  }

  const cornerId = activeCornerId(
    studentState,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (!cornerId) {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return whiteCornersCompleteStep();
  }

  const target = targetHoldIndex(cornerId);
  if (currentHoldIndex !== target) {
    const reorientMoves = relativeY(currentHoldIndex, target);
    if (reorientMoves.length) {
      return buildReorientHoldStep(cornerId, currentHoldIndex, target);
    }
  }

  const direct = tryInteractiveCornerSolveStep(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (direct?.demoMoves?.length) return direct;

  return buildSolveCornerPlaceholderStep(
    studentState,
    cornerId,
    currentHoldIndex,
  );
}
