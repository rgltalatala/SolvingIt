import {
  applyMoves,
  compressConsecutiveFaceQuarterTurns,
  faceDoubleTurn,
} from '../../../../cube/cubeState';
import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import {
  whiteCrossSteps,
  whitePartnerEdgeHeading,
} from '../../../../content/whiteCross';
import {
  crossSlotsToPreserve,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  slotShowsRotateBottomPattern,
  slotSolved,
} from './crossSlotModel';
import { findEdgeWithColors, whiteStickerOnD } from '../shared/pieceQueries';
import { isVerifiedSlotDemo, preservesSlotsAfterDemo } from './crossSolveBfs';
import type { CrossEdgeId, WhiteCrossLessonStep } from './types';

function formatBottomSpinForLesson(demo: Move[]): string {
  if (demo.length === 1 && demo[0] === "D'") return 'D′';
  return demo.join(' ');
}

const MINIMAL_BOTTOM_SPINS: Move[][] = [['D'], ['D2'], ["D'"]];

/** Fewest quarter D turns (as D, D2, or D′) that align this cross slot, or null if none. */
function findMinimalBottomSpinToSolveSlot(
  studentState: CubeState,
  id: CrossEdgeId,
): Move[] | null {
  for (const demo of MINIMAL_BOTTOM_SPINS) {
    if (slotSolved(applyMoves(studentState, demo), id)) return demo;
  }
  return null;
}

function tryDPrefixOrInsertSolveSlot(
  studentState: CubeState,
  id: CrossEdgeId,
): Move[] | null {
  const mustPreserve = crossSlotsToPreserve(studentState, id);
  const slot = SLOT_DEF[id];
  const partner = partnerColorForSlot(studentState, id);
  const edgeAtStart = findEdgeWithColors(studentState, 'white', partner);
  if (!edgeAtStart || !whiteStickerOnD(studentState, edgeAtStart)) return null;
  if (slotShowsRotateBottomPattern(studentState, id)) return null;

  const dQuarterTurns = (count: number): Move[] =>
    count === 0 ? [] : count === 1 ? ['D'] : count === 2 ? ['D2'] : ["D'"];

  for (let spinCount = 0; spinCount < 4; spinCount += 1) {
    const dPart = dQuarterTurns(spinCount);

    const tryDemo = (extra: Move[]): Move[] | null => {
      const raw = [...dPart, ...extra];
      const demo = compressConsecutiveFaceQuarterTurns(raw);
      if (!preservesSlotsAfterDemo(studentState, demo, mustPreserve))
        return null;
      const after = applyMoves(studentState, demo);
      return slotSolved(after, id) ? demo : null;
    };

    const onlyD = tryDemo([]);
    if (onlyD) return onlyD;

    const withDoubleTurn = tryDemo([faceDoubleTurn(slot.sideFace)]);
    if (withDoubleTurn) return withDoubleTurn;
  }
  return null;
}

function insertFaceFromDemo(demo: Move[], fallback: Face): Face {
  const faceTurn = demo.find(
    (m) => m === 'F2' || m === 'R2' || m === 'L2' || m === 'B2',
  );
  return faceTurn ? (faceTurn[0] as Face) : fallback;
}

/** White on D at this slot but wrong center — D / D2 / D′ only. */
export function tryRotateBottomStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;
  if (!slotShowsRotateBottomPattern(studentState, id)) return null;

  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  if (!edgePosition || !whiteStickerOnD(studentState, edgePosition)) return null;

  const bottomSpinMoves = findMinimalBottomSpinToSolveSlot(studentState, id);
  if (
    !bottomSpinMoves ||
    !isVerifiedSlotDemo(studentState, id, bottomSpinMoves)
  ) {
    return null;
  }

  const label = `${formatColor(partner)} edge`;
  const slot = SLOT_DEF[id];

  return {
    kind: 'rotate-bottom',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: whiteCrossSteps.dLayerRotate(
      formatColor(partner),
      formatBottomSpinForLesson(bottomSpinMoves),
    ),
    targetFace: slot.sideFace,
    demoMoves: bottomSpinMoves,
  };
}

/** White on the edge cubie on D; slot with D setup + side double turn if needed. */
export function tryDLayerInsertStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;

  const insert = tryDPrefixOrInsertSolveSlot(studentState, id);
  if (!insert?.length || !isVerifiedSlotDemo(studentState, id, insert)) {
    return null;
  }

  const partner = partnerColorForSlot(studentState, id);
  const label = `${formatColor(partner)} edge`;
  const slot = SLOT_DEF[id];
  const face = insertFaceFromDemo(insert, slot.sideFace);

  return {
    kind: 'insert-double',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: whiteCrossSteps.dLayerInsert(formatColor(partner), face),
    face,
    demoMoves: insert,
  };
}
