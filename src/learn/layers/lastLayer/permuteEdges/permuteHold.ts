import type { Color, Move } from '../../../../cube/cubeState';
import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState } from '../../../../cube/cubeState';
import {
  faceColorAtHold,
  relativeY,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import { slotPairKey } from '../orientEdges/orientEdgesCases';
import type { ULayerEdgeId } from '../orientEdges/uLayerEdgeModel';
import { permutedEdgeSlots } from './uLayerEdgePermuteModel';

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
  return isPairAtHoldBackRight(slots, 0);
}

export function isPairAtHoldBackRight(
  slots: readonly ULayerEdgeId[],
  holdIndex: CornerHoldIndex,
): boolean {
  const target = backRightULayerSlots(holdIndex);
  const key = slotPairKey(slots[0]!, slots[1]!);
  return key === slotPairKey(target[0], target[1]);
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
  if (isPairAtHoldBackRight(slots, preferredHold)) {
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

/** Pick whole-cube y that places the aligned pair at world back+right (UB+UR). */
export function findReorientToPlacePairAtWorldBackRight(
  state: CubeState,
  currentHoldIndex: CornerHoldIndex,
): { targetHoldIndex: CornerHoldIndex; demoMoves: Move[] } | null {
  const slots = permutedEdgeSlots(state);
  if (slots.length === 2 && isPairAtBackRight(slots)) {
    return { targetHoldIndex: currentHoldIndex, demoMoves: [] };
  }

  for (const targetHold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    const demoMoves = relativeY(currentHoldIndex, targetHold);
    const after = applyMoves(state, demoMoves);
    const afterSlots = permutedEdgeSlots(after);
    if (afterSlots.length === 2 && isPairAtBackRight(afterSlots)) {
      return { targetHoldIndex: targetHold, demoMoves };
    }
  }

  return null;
}

export function holdIndexFromFrontColor(frontColor: Color): CornerHoldIndex {
  for (const hold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    if (faceColorAtHold(hold) === frontColor) return hold;
  }
  return 0;
}

export function holdMatchesFaceColor(
  frontColor: string,
  holdIndex: CornerHoldIndex,
): boolean {
  return frontColor === faceColorAtHold(holdIndex);
}
