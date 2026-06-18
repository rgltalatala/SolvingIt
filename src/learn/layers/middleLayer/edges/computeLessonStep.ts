import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import { isWhiteCrossComplete } from '../../bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '../../bottomLayer/corners/cornerSlotModel';
import {
  returnToBlueY,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import {
  anyUnsolvedMiddleEdgeOnU,
  colorsOfEdgeAtSlot,
  formatColor,
  isMiddleLayerEdgesComplete,
  pickActiveUnsolvedEdge,
  pickBuriedExtractSlot,
  slotNeedsExtract,
  algSideForStudentFrontSlot,
  isMiddleEdgeSlotOnStudentFront,
  targetFrontSlotBetweenCenters,
  unsolvedEdgeCubieOnU,
} from './edgeSlotModel';
import {
  formatColorHoldLabel,
  holdFacingOpposite,
  reorientMovesToFaceBack,
  relativeY,
  targetHoldForMiddleEdgeInsert,
} from './edgeHold';
import {
  alignMovesToPartnerCenter,
  isPartnerAlignedToCenter,
  partnerColorOnU,
} from './uLayerAlign';
import { algorithmForFrontSlot } from './edgeAlgorithms';
import {
  isVerifiedMiddleEdgeExtractDemo,
  isVerifiedMiddleEdgeInsertDemo,
} from './preserveLessonState';
import type {
  MiddleEdgeSlotId,
  MiddleLayerEdgeLessonStepOptions,
  MiddleLayerEdgesLessonStep,
} from './types';

const COMPLETE_BODY =
  'All four middle-layer edges match their side centers (no yellow or white on these pieces). Hold the cube with the blue face toward you (white on bottom, yellow on top) and confirm it matches the diagram below.';

const PREREQUISITE_BODY =
  'Finish the white cross and all four white corners first—the bottom layer must be complete before solving middle-layer edges.';

function completeStep(): MiddleLayerEdgesLessonStep {
  return {
    kind: 'complete',
    title: 'Middle layer edges complete',
    body: COMPLETE_BODY,
  };
}

function prerequisiteStep(): MiddleLayerEdgesLessonStep {
  return {
    kind: 'cross-corners-prerequisite',
    title: 'Complete the bottom layer first',
    body: PREREQUISITE_BODY,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): MiddleLayerEdgesLessonStep {
  return {
    kind: 'reorient-hold',
    title: 'Face the blue side',
    body: 'All four middle-layer edges are done. Turn the cube so the blue face is toward you again (white on bottom, yellow on top).',
    demoMoves: returnToBlueY(currentHoldIndex),
    returnToInitialHold: true,
  };
}

function buildReorientToPartnerStep(
  partnerColor: Color,
  currentHoldIndex: CornerHoldIndex,
  edgeColors: [Color, Color],
  targetSlotId: MiddleEdgeSlotId,
): MiddleLayerEdgesLessonStep {
  const targetHold = targetHoldForMiddleEdgeInsert(targetSlotId, partnerColor);
  const demoMoves = relativeY(currentHoldIndex, targetHold);
  const faceLabel = formatColorHoldLabel(targetHold);
  return {
    kind: 'reorient-hold',
    title: `Face the ${formatColor(partnerColor)} side`,
    body: `Turn the whole cube so the ${faceLabel} face is toward you. You will insert the ${formatColor(edgeColors[0])}–${formatColor(edgeColors[1])} edge into the middle layer between its centers.`,
    demoMoves,
    targetHoldIndex: targetHold,
  };
}

function buildReorientToBackStep(
  currentHoldIndex: CornerHoldIndex,
): MiddleLayerEdgesLessonStep {
  return {
    kind: 'reorient-hold',
    title: 'Face the back side',
    body: 'The front middle-layer edges are already correct, but the back edges still need work. Turn the cube so the back face is toward you (white stays on bottom, yellow on top).',
    demoMoves: reorientMovesToFaceBack(currentHoldIndex),
    targetHoldIndex: holdFacingOpposite(currentHoldIndex),
  };
}

function buildAlignUStep(
  edgeColors: [Color, Color],
  demoMoves: Move[],
  partnerColor: Color,
): MiddleLayerEdgesLessonStep {
  return {
    kind: 'align-u',
    title: `Align ${formatColor(partnerColor)} to its center`,
    body: `The ${formatColor(edgeColors[0])}–${formatColor(edgeColors[1])} edge is on the top layer. Rotate U so the ${formatColor(partnerColor)} sticker lines up with the ${formatColor(partnerColor)} center before you turn the cube.`,
    demoMoves,
    edgeColors,
  };
}

function buildSolveEdgeStep(
  edgeColors: [Color, Color],
  slot: 'FL' | 'FR',
  action: 'insert' | 'extract',
  demoMoves: Move[],
): MiddleLayerEdgesLessonStep {
  const algName = slot === 'FL' ? 'left' : 'right';
  const body =
    action === 'extract'
      ? `The edge in the ${slot === 'FL' ? 'front-left' : 'front-right'} middle slot needs to come out. Use the ${algName} algorithm to lift it to the top layer while keeping your bottom layer intact.`
      : `Insert the ${formatColor(edgeColors[0])}–${formatColor(edgeColors[1])} edge into the ${slot === 'FL' ? 'front-left' : 'front-right'} middle slot using the ${algName} algorithm. Your white cross, white corners, and any middle edges you already placed stay intact.`;
  return {
    kind: 'solve-edge',
    title: action === 'extract' ? 'Extract edge' : 'Insert edge',
    body,
    demoMoves,
    edgeColors,
    action,
    slot,
  };
}

function tryExtractAtSlot(
  studentState: CubeState,
  holdIndex: CornerHoldIndex,
  worldSlot: MiddleEdgeSlotId,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): MiddleLayerEdgesLessonStep | null {
  if (!slotNeedsExtract(studentState, worldSlot, holdIndex)) return null;

  const extractColors = colorsOfEdgeAtSlot(studentState, worldSlot, holdIndex);
  if (!extractColors) return null;

  const preferredSide = algSideForStudentFrontSlot(holdIndex, worldSlot);
  const algOrder: Array<'FL' | 'FR'> =
    preferredSide === 'FL' ? ['FL', 'FR'] : ['FR', 'FL'];
  for (const algSide of algOrder) {
    const demo = algorithmForFrontSlot(algSide);
    const verified = isVerifiedMiddleEdgeExtractDemo(
      studentState,
      extractColors,
      demo,
      holdIndex,
      solvedSlots,
      worldSlot,
    );
    if (verified) {
      return buildSolveEdgeStep(extractColors, algSide, 'extract', demo);
    }
  }

  return null;
}

function tryBuriedExtractStep(
  studentState: CubeState,
  holdIndex: CornerHoldIndex,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): MiddleLayerEdgesLessonStep | null {
  const buried = pickBuriedExtractSlot(studentState, holdIndex);
  if (!buried || buried.needsFaceBackReorient) return null;
  if (!slotNeedsExtract(studentState, buried.worldSlot, holdIndex)) return null;

  const { worldSlot } = buried;
  const extractColors = colorsOfEdgeAtSlot(studentState, worldSlot, holdIndex);
  if (!extractColors) return null;

  const algOrder: Array<'FL' | 'FR'> =
    buried.algSide === 'FL' ? ['FL', 'FR'] : ['FR', 'FL'];
  for (const algSide of algOrder) {
    const demo = algorithmForFrontSlot(algSide);
    const verified = isVerifiedMiddleEdgeExtractDemo(
      studentState,
      extractColors,
      demo,
      holdIndex,
      solvedSlots,
      worldSlot,
    );
    if (verified) {
      return buildSolveEdgeStep(extractColors, algSide, 'extract', demo);
    }
  }

  return null;
}

/** When no unsolved edge cubie is on U: face back if needed, otherwise extract. */
function planWhenNoEdgeOnU(
  studentState: CubeState,
  holdIndex: CornerHoldIndex,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): MiddleLayerEdgesLessonStep | null {
  if (anyUnsolvedMiddleEdgeOnU(studentState, holdIndex)) return null;

  const buried = pickBuriedExtractSlot(studentState, holdIndex);
  if (buried?.needsFaceBackReorient) {
    return buildReorientToBackStep(holdIndex);
  }

  return tryBuriedExtractStep(studentState, holdIndex, solvedSlots);
}

function tryInsertAtHold(
  studentState: CubeState,
  targetSlotId: MiddleEdgeSlotId,
  edgeColors: [Color, Color],
  partner: Color,
  holdIndex: CornerHoldIndex,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): MiddleLayerEdgesLessonStep | null {
  const preferredSlot = targetFrontSlotBetweenCenters(
    studentState,
    partner,
    edgeColors,
    holdIndex,
  );
  const worldSlotSide = algSideForStudentFrontSlot(holdIndex, targetSlotId);
  const slotOrder = [
    preferredSlot,
    preferredSlot === 'FL' ? 'FR' : 'FL',
    worldSlotSide,
  ].filter(
    (slot, index, slots): slot is 'FL' | 'FR' =>
      slots.indexOf(slot) === index,
  );

  for (const slot of slotOrder) {
    const demo = algorithmForFrontSlot(slot);
    if (
      isVerifiedMiddleEdgeInsertDemo(
        studentState,
        targetSlotId,
        edgeColors,
        demo,
        holdIndex,
        solvedSlots,
      )
    ) {
      return buildSolveEdgeStep(edgeColors, slot, 'insert', demo);
    }
  }

  return null;
}

function assertPlannerExhausted(
  studentState: CubeState,
  holdIndex: CornerHoldIndex,
  targetSlotId: MiddleEdgeSlotId,
  edgeColors: [Color, Color],
): never {
  throw new Error(
    `Middle-layer edge lesson planner exhausted all cases for ` +
      `${formatColor(edgeColors[0])}–${formatColor(edgeColors[1])} ` +
      `(slot ${targetSlotId}, hold ${holdIndex}, ` +
      `onU=${unsolvedEdgeCubieOnU(studentState, targetSlotId, holdIndex)}, ` +
      `anyOnU=${anyUnsolvedMiddleEdgeOnU(studentState, holdIndex)})`,
  );
}

function computeMiddleLayerEdgeLessonStep(
  studentState: CubeState,
  options?: MiddleLayerEdgeLessonStepOptions,
): MiddleLayerEdgesLessonStep {
  const holdIndex = (options?.currentHoldIndex ?? 0) as CornerHoldIndex;
  const solvedSlots = options?.solvedMiddleEdgeSlots;

  if (
    !isWhiteCrossComplete(studentState) ||
    !isWhiteCornersComplete(studentState)
  ) {
    return prerequisiteStep();
  }

  if (isMiddleLayerEdgesComplete(studentState, holdIndex)) {
    if (holdIndex !== 0) {
      return buildReturnToBlueStep(holdIndex);
    }
    return completeStep();
  }

  const active = pickActiveUnsolvedEdge(studentState, holdIndex);
  if (!active) {
    if (holdIndex !== 0) return buildReturnToBlueStep(holdIndex);
    return completeStep();
  }

  const { slotId: targetSlotId, colors: edgeColors } = active;

  const activeExtractStep =
    slotNeedsExtract(studentState, targetSlotId, holdIndex) &&
    !unsolvedEdgeCubieOnU(studentState, targetSlotId, holdIndex)
      ? tryExtractAtSlot(
          studentState,
          holdIndex,
          targetSlotId,
          solvedSlots,
        )
      : null;
  if (activeExtractStep) return activeExtractStep;

  const buriedStep = planWhenNoEdgeOnU(studentState, holdIndex, solvedSlots);
  if (buriedStep) return buriedStep;

  if (unsolvedEdgeCubieOnU(studentState, targetSlotId, holdIndex)) {
    const partner = partnerColorOnU(studentState, edgeColors);
    if (partner) {
      if (!isPartnerAlignedToCenter(studentState, edgeColors)) {
        const alignMoves = alignMovesToPartnerCenter(studentState, edgeColors);
        if (alignMoves && alignMoves.length > 0) {
          return buildAlignUStep(edgeColors, alignMoves, partner);
        }
      }

      const insertHold = targetHoldForMiddleEdgeInsert(targetSlotId, partner);

      if (isMiddleEdgeSlotOnStudentFront(targetSlotId, holdIndex)) {
        const insertStep = tryInsertAtHold(
          studentState,
          targetSlotId,
          edgeColors,
          partner,
          holdIndex,
          solvedSlots,
        );
        if (insertStep) return insertStep;
      }

      if (holdIndex !== insertHold) {
        return buildReorientToPartnerStep(
          partner,
          holdIndex,
          edgeColors,
          targetSlotId,
        );
      }
    }
  }

  return assertPlannerExhausted(
    studentState,
    holdIndex,
    targetSlotId,
    edgeColors,
  );
}

export function getMiddleLayerEdgeLessonStep(
  studentState: CubeState,
  options?: MiddleLayerEdgeLessonStepOptions,
): MiddleLayerEdgesLessonStep {
  return computeMiddleLayerEdgeLessonStep(studentState, options);
}

export async function getMiddleLayerEdgeLessonStepAsync(
  studentState: CubeState,
  options?: MiddleLayerEdgeLessonStepOptions,
): Promise<MiddleLayerEdgesLessonStep> {
  return computeMiddleLayerEdgeLessonStep(studentState, options);
}
