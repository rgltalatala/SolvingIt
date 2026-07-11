import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import { formatColorLabel } from '../../../../cube/cubeState';
import { middleLayerSteps } from '../../../../content/middleLayer';
import { edgeIdentity } from '../../../../content/pieceIdentity';
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

const COMPLETE_BODY = middleLayerSteps.complete.body;

const PREREQUISITE_BODY = middleLayerSteps.prerequisite.body;

function completeStep(): MiddleLayerEdgesLessonStep {
  return {
    kind: 'complete',
    title: middleLayerSteps.complete.title,
    body: COMPLETE_BODY,
  };
}

function prerequisiteStep(): MiddleLayerEdgesLessonStep {
  return {
    kind: 'cross-corners-prerequisite',
    title: middleLayerSteps.prerequisite.title,
    body: PREREQUISITE_BODY,
  };
}

function strategyIntroStep(): MiddleLayerEdgesLessonStep {
  return {
    kind: 'intro',
    title: middleLayerSteps.intro.title,
    body: middleLayerSteps.intro.body,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): MiddleLayerEdgesLessonStep {
  return {
    kind: 'reorient-hold',
    title: middleLayerSteps.faceBlue.title,
    body: middleLayerSteps.faceBlue.body,
    demoMoves: returnToBlueY(currentHoldIndex),
    returnToInitialHold: true,
  };
}

function buildReorientToPartnerStep(
  partnerColor: Color,
  currentHoldIndex: CornerHoldIndex,
  edgeColors: [Color, Color],
  targetSlotId: MiddleEdgeSlotId,
  onUAligned = false,
): MiddleLayerEdgesLessonStep {
  const targetHold = targetHoldForMiddleEdgeInsert(targetSlotId, partnerColor);
  const demoMoves = relativeY(currentHoldIndex, targetHold);
  const faceLabel = formatColorHoldLabel(targetHold);
  const body = onUAligned
    ? middleLayerSteps.reorientAligned(
        faceLabel,
        edgeIdentity(edgeColors[0], edgeColors[1]),
      )
    : middleLayerSteps.reorient(
        faceLabel,
        edgeIdentity(edgeColors[0], edgeColors[1]),
      );
  return {
    kind: 'reorient-hold',
    title: middleLayerSteps.faceSideTitle(formatColorLabel(partnerColor)),
    body,
    demoMoves,
    targetHoldIndex: targetHold,
  };
}

function buildReorientToBackStep(
  currentHoldIndex: CornerHoldIndex,
): MiddleLayerEdgesLessonStep {
  return {
    kind: 'reorient-hold',
    title: middleLayerSteps.faceBack.title,
    body: middleLayerSteps.faceBack.body,
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
    title: middleLayerSteps.alignPartnerTitle(formatColor(partnerColor)),
    body: middleLayerSteps.alignU(
      edgeIdentity(edgeColors[0], edgeColors[1]),
      formatColor(partnerColor),
    ),
    demoMoves,
    edgeColors,
  };
}

function buildSolveEdgeStep(
  edgeColors: [Color, Color],
  slot: 'FL' | 'FR',
  action: 'insert' | 'extract',
  demoMoves: Move[],
  onUAligned = false,
): MiddleLayerEdgesLessonStep {
  const algName = slot === 'FL' ? 'left' : 'right';
  const edgeLabel = edgeIdentity(edgeColors[0], edgeColors[1]);
  const body =
    action === 'extract'
      ? middleLayerSteps.extract(slot, algName)
      : onUAligned
        ? middleLayerSteps.insertAligned(edgeLabel, slot, algName)
        : middleLayerSteps.insert(edgeLabel, slot, algName);
  return {
    kind: 'solve-edge',
    title:
      action === 'extract'
        ? middleLayerSteps.extractEdge
        : edgeLabel,
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
      const onUAligned = isPartnerAlignedToCenter(studentState, edgeColors);
      return buildSolveEdgeStep(edgeColors, slot, 'insert', demo, onUAligned);
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
      `${edgeIdentity(edgeColors[0], edgeColors[1])} ` +
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

  if (!options?.hasSeenStrategyIntro) {
    return strategyIntroStep();
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
          isPartnerAlignedToCenter(studentState, edgeColors),
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
