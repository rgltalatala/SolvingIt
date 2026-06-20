import type { Move } from '../../../../cube/cubeState';
import {
  faceColorAtHold,
  relativeY,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import { slotPairKey } from '../orientEdges/orientEdgesCases';
import type { ULayerEdgeId } from '../orientEdges/uLayerEdgeModel';

/** World U-edge slots at back+right U for each lesson hold (blue=0, red=1, green=2, orange=3). */
const BACK_RIGHT_BY_HOLD: Record<
  CornerHoldIndex,
  [ULayerEdgeId, ULayerEdgeId]
> = {
  0: ['UB', 'UR'],
  1: ['UL', 'UB'],
  2: ['UF', 'UL'],
  3: ['UR', 'UF'],
};

/** After the cube matches the lesson hold, back+right U is always UB+UR in state slot IDs. */
export function isPairAtBackRight(slots: readonly ULayerEdgeId[]): boolean {
  const set = new Set(slots);
  return set.has('UB') && set.has('UR');
}

export function backRightULayerSlots(
  holdIndex: CornerHoldIndex,
): [ULayerEdgeId, ULayerEdgeId] {
  return BACK_RIGHT_BY_HOLD[holdIndex];
}

export function holdIndexWherePairIsBackRight(
  slots: readonly [ULayerEdgeId, ULayerEdgeId],
  preferredHold: CornerHoldIndex = 0,
): CornerHoldIndex {
  const key = slotPairKey(slots[0], slots[1]);
  if (isPairAtBackRight(slots)) {
    return preferredHold;
  }
  for (const hold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    const target = backRightULayerSlots(hold);
    if (key === slotPairKey(target[0], target[1])) {
      return hold;
    }
  }
  return preferredHold;
}

export function reorientMovesForPermuteSetup(
  fromHold: CornerHoldIndex,
  toHold: CornerHoldIndex,
): Move[] {
  return relativeY(fromHold, toHold);
}

export function holdMatchesFaceColor(
  frontColor: string,
  holdIndex: CornerHoldIndex,
): boolean {
  return frontColor === faceColorAtHold(holdIndex);
}
