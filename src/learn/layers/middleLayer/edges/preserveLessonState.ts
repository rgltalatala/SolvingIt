import { applyMoves } from '../../../../cube/cubeState';
import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import { isWhiteCrossComplete } from '../../bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '../../bottomLayer/corners/cornerSlotModel';
import { normalizeHoldToBlue } from '../../bottomLayer/corners/cornerHold';
import { MIDDLE_EDGE_SLOTS } from './types';
import {
  edgePieceOnULayer,
  edgeSlotSolved,
  slotIdForExpectedEdgeColors,
} from './edgeSlotModel';
import type { MiddleEdgeSlotId } from './types';

export function isMiddleLayerLessonStateValid(studentState: CubeState): boolean {
  return (
    isWhiteCrossComplete(studentState) && isWhiteCornersComplete(studentState)
  );
}

export function mustPreserveMiddleEdgeSlots(
  studentState: CubeState,
  targetSlotId: MiddleEdgeSlotId,
  holdIndex = 0,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): MiddleEdgeSlotId[] {
  return MIDDLE_EDGE_SLOTS.filter((id) => {
    if (id === targetSlotId) return false;
    if (solvedSlots?.includes(id)) return true;
    return edgeSlotSolved(studentState, id, holdIndex);
  });
}

export function middleEdgePreservedAtHold(
  state: CubeState,
  id: MiddleEdgeSlotId,
  holdIndex: number,
): boolean {
  return edgeSlotSolved(normalizeHoldToBlue(state, holdIndex), id);
}

function middleEdgeColorsSolved(
  state: CubeState,
  edgeColors: [Color, Color],
  holdIndex: number,
): boolean {
  const slotId = slotIdForExpectedEdgeColors(state, edgeColors, holdIndex);
  return slotId ? edgeSlotSolved(state, slotId, holdIndex) : false;
}

export function isVerifiedMiddleEdgeInsertDemo(
  studentState: CubeState,
  targetSlotId: MiddleEdgeSlotId,
  edgeColors: [Color, Color],
  demo: Move[],
  holdIndex = 0,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  const mustPreserve = mustPreserveMiddleEdgeSlots(
    studentState,
    targetSlotId,
    holdIndex,
    solvedSlots,
  );
  return (
    middleEdgeColorsSolved(after, edgeColors, holdIndex) &&
    isWhiteCrossComplete(after) &&
    isWhiteCornersComplete(after, holdIndex) &&
    mustPreserve.every((id) =>
      middleEdgePreservedAtHold(after, id, holdIndex),
    )
  );
}

export function isVerifiedMiddleEdgeExtractDemo(
  studentState: CubeState,
  edgeColors: [Color, Color],
  demo: Move[],
  holdIndex = 0,
  solvedSlots?: readonly MiddleEdgeSlotId[],
  extractWorldSlot: MiddleEdgeSlotId = 'FR',
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  if (!isWhiteCrossComplete(after)) return false;
  if (!isWhiteCornersComplete(after, holdIndex)) return false;
  if (!edgePieceOnULayer(after, edgeColors)) return false;
  const mustPreserve = MIDDLE_EDGE_SLOTS.filter((id) => {
    if (id === extractWorldSlot) return false;
    if (solvedSlots?.includes(id)) return true;
    return edgeSlotSolved(studentState, id, holdIndex);
  });
  return mustPreserve.every((id) =>
    middleEdgePreservedAtHold(after, id, holdIndex),
  );
}
