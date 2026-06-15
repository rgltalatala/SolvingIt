import { applyMove } from '../../../../cube/cubeState';
import type { Color, CubeState, Face, Move } from '../../../../cube/cubeState';
import {
  CROSS_ORDER,
  crossSlotsSolvedInState,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  slotSolved,
} from './crossSlotModel';
import { demoChangesState } from '../../../lessonCore';
import {
  edgeAlignedToSideCenter,
  findEdgeWithColors,
  isMiddleLayerEdge,
  whiteStickerOnD,
  whiteStickerOnU,
} from '../shared/pieceQueries';
import type { PermuteReadyCandidate, WhiteCrossLessonStep } from './types';

/**
 * Middle-layer cross edge hugging its side center: pick clockwise vs counterclockwise quarter turn.
 */
export function middleLayerConnectDemoMove(
  studentState: CubeState,
  partner: Color,
  alignedFace: Face,
): Move {
  const clockwiseMove = alignedFace as Move;
  const counterClockwiseMove = `${alignedFace}'` as Move;
  const solvedSlotsToPreserve = crossSlotsSolvedInState(studentState);

  const rankEdgeAfterMove = (nextState: CubeState): number => {
    const edgePosition = findEdgeWithColors(nextState, 'white', partner);
    if (!edgePosition) return -1;
    if (whiteStickerOnD(nextState, edgePosition)) return 4;
    if (edgePosition[1] === -1) return 3;
    if (whiteStickerOnU(nextState, edgePosition)) return 2;
    if (edgePosition[1] === 1) return 1;
    return 0;
  };

  let best: { move: Move; rank: number } | null = null;
  for (const move of [clockwiseMove, counterClockwiseMove]) {
    const nextState = applyMove(studentState, move);
    const preservesSolvedSlots = solvedSlotsToPreserve.every((id) =>
      slotSolved(nextState, id),
    );
    if (!preservesSolvedSlots) continue;
    const rank = rankEdgeAfterMove(nextState);
    if (rank < 0) continue;
    if (
      !best ||
      rank > best.rank ||
      (rank === best.rank && move === clockwiseMove)
    ) {
      best = { move, rank };
    }
  }
  return best?.move ?? clockwiseMove;
}

function buildMiddleLayerSideConnectStep(
  studentState: CubeState,
  partner: Color,
  turnFace: Face,
  alignedToCenter: boolean,
): WhiteCrossLessonStep {
  const demo = middleLayerConnectDemoMove(studentState, partner, turnFace);
  const turnWord = demo.endsWith("'") ? 'counterclockwise' : 'clockwise';
  const body = alignedToCenter
    ? `The white–${formatColor(partner)} edge sits in the middle layer with ${formatColor(partner)} already next to the ${formatColor(partner)} center — we finish edges that are already lined up with their center before other cross edges. One quarter turn on ${turnFace} (${turnWord} here) moves it toward the bottom so it can be slotted into the cross.`
    : `The white–${formatColor(partner)} edge is in the middle layer but not lined up with the ${formatColor(partner)} center yet. One quarter turn on ${turnFace} (${turnWord} here) sets it up while keeping cross edges you already placed.`;
  return {
    kind: 'side-connect',
    title: 'Middle layer: bring edge up or down',
    body,
    face: turnFace,
    demoMoves: [demo],
  };
}

export function collectMiddleLayerPermuteCandidates(
  studentState: CubeState,
): PermuteReadyCandidate[] {
  const crossPartners = new Set(
    CROSS_ORDER.map((id) => partnerColorForSlot(studentState, id)),
  );
  const candidates: PermuteReadyCandidate[] = [];

  for (const id of CROSS_ORDER) {
    const partner = partnerColorForSlot(studentState, id);
    if (!crossPartners.has(partner)) continue;
    if (slotSolved(studentState, id)) continue;
    const edgePosition = findEdgeWithColors(studentState, 'white', partner);
    if (!edgePosition || !isMiddleLayerEdge(edgePosition)) continue;
    const alignedFace = edgeAlignedToSideCenter(studentState, edgePosition);
    const turnFace = alignedFace ?? SLOT_DEF[id].sideFace;
    const step = buildMiddleLayerSideConnectStep(
      studentState,
      partner,
      turnFace,
      !!alignedFace,
    );
    if (
      !step.demoMoves?.length ||
      !demoChangesState(studentState, step.demoMoves)
    )
      continue;
    candidates.push({ id, step });
  }
  return candidates;
}
