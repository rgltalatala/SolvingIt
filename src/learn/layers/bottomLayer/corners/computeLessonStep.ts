import { isWhiteCrossComplete } from '../cross/crossSlotModel';
import type { CubeState } from '../../../../cube/cubeState';
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
  formatCornerLabel,
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

const WHITE_CORNERS_COMPLETE_BODY =
  'All four white corners are in place on the bottom layer (white on D, side colors matching centers). Hold the cube with the blue face toward you (white on bottom, yellow on top) and confirm it matches the diagram below.';

const CROSS_PREREQUISITE_BODY =
  'Finish the white cross first—all four white edges must be on the bottom with their colored stickers matching the side centers. Return to the white cross lesson, then come back here.';

function whiteCornersCompleteStep(): WhiteCornersLessonStep {
  return {
    kind: 'complete',
    title: 'White corners complete',
    body: WHITE_CORNERS_COMPLETE_BODY,
  };
}

function crossPrerequisiteStep(): WhiteCornersLessonStep {
  return {
    kind: 'cross-prerequisite',
    title: 'Complete the white cross first',
    body: CROSS_PREREQUISITE_BODY,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): WhiteCornersLessonStep {
  const demoMoves = returnToBlueY(currentHoldIndex);
  return {
    kind: 'reorient-hold',
    title: 'Face the blue side',
    body: 'All four corners are done. Turn the cube so the blue face is toward you again—the same hold you started with (white on bottom, yellow on top).',
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
      ? ' The next corner to solve is two steps ahead, so turn halfway around in one move.'
      : delta === 3
        ? ' The next corner to solve is three steps ahead—use a single counter-clockwise turn.'
        : '';

  return {
    kind: 'reorient-hold',
    title: `Face the ${faceLabel.toLowerCase()} side`,
    body: `Turn the whole cube so the ${faceLabel} face is toward you (white stays on bottom, yellow on top). You will slot the ${formatCornerLabel(targetCornerId).toLowerCase()} into the front-right position.${skipNote}`,
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
    body: `Slot the White–${formatColor(colorA)}–${formatColor(colorB)} corner: white on the bottom (D), ${formatColor(colorA)} and ${formatColor(colorB)} matching their centers. Align the piece with its centers on your own, or reset the scramble and try again.`,
  };
}

/** Interactive lesson: case-matched algs first, then fixed fallbacks; never BFS. */
function tryInteractiveCornerSolveStep(
  studentState: CubeState,
  cornerId: CornerSlotId,
  currentHoldIndex: CornerHoldIndex,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const caseSteps = [
    tryFrdULayerInsert(
      studentState,
      cornerId,
      currentHoldIndex,
      solvedCornerIds,
    ),
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
    if (step?.demoMoves?.length) return step;
  }

  const fixed = tryDirectSolveStepForCornerId(
    studentState,
    cornerId,
    currentHoldIndex,
    solvedCornerIds,
  );
  if (fixed?.demoMoves?.length) return fixed;

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
