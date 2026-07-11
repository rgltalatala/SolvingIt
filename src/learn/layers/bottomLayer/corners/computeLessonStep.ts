import type { CubeState } from '../../../../cube/cubeState';
import { whiteCornersSteps } from '../../../../content/whiteCorners';
import { whiteCornerIdentity } from '../../../../content/pieceIdentity';
import { normalizeLessonDemoMovesInStep, stepHasDemoMoves } from '../../../lessonCore';
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
  studentState: CubeState,
  targetCornerId: CornerSlotId,
  currentHoldIndex: number,
  targetHold: CornerHoldIndex,
): WhiteCornersLessonStep {
  const demoMoves = relativeY(currentHoldIndex, targetHold);
  const faceLabel = formatHoldFaceLabel(targetHold);
  const [, colorA, colorB] = expectedCornerColors(
    studentState,
    targetCornerId,
    currentHoldIndex,
  );

  const delta = (((targetHold - currentHoldIndex) % 4) + 4) % 4;
  const skipNote =
    delta === 2 || delta === 3
      ? whiteCornersSteps.reorientSkipAlignNote
      : '';

  return {
    kind: 'reorient-hold',
    title: whiteCornersSteps.faceSideTitle(faceLabel),
    body: whiteCornersSteps.reorient(
      faceLabel,
      whiteCornerIdentity(colorA, colorB),
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
    title: whiteCornerIdentity(colorA, colorB),
    body: whiteCornersSteps.placeholder(whiteCornerIdentity(colorA, colorB)),
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
  if (stepHasDemoMoves(uLayerStep)) return uLayerStep;

  const wrongDStep = tryFrdWrongDLayerExtract(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (stepHasDemoMoves(wrongDStep)) return wrongDStep;

  const caseSteps = [
    tryFrdTwistedInSlot(
      studentState,
      cornerId,
      currentHoldIndex,
      solvedCornerIds,
    ),
  ];
  for (const step of caseSteps) {
    if (stepHasDemoMoves(step)) return normalizeLessonDemoMovesInStep(step);
  }

  const fixed = tryDirectSolveStepForCornerId(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (stepHasDemoMoves(fixed)) return normalizeLessonDemoMovesInStep(fixed);

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
      return buildReorientHoldStep(
        studentState,
        cornerId,
        currentHoldIndex,
        target,
      );
    }
  }

  const direct = tryInteractiveCornerSolveStep(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (direct) return direct;

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
      return buildReorientHoldStep(
        studentState,
        cornerId,
        currentHoldIndex,
        target,
      );
    }
  }

  const direct = tryInteractiveCornerSolveStep(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (direct) return direct;

  return buildSolveCornerPlaceholderStep(
    studentState,
    cornerId,
    currentHoldIndex,
  );
}
