import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import {
  relativeY,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import type { ULayerCornerId } from '../../bottomLayer/corners/cornerCases';
import { cornerPermutedAtSlot } from './uLayerCornerPermuteModel';

/** World U-corner slot that moves to URF after setup y from blue-front hold. */
const SETUP_SLOT_BY_TARGET_HOLD: Record<CornerHoldIndex, ULayerCornerId> = {
  0: 'URF',
  1: 'UBR',
  2: 'ULB',
  3: 'UFL',
};

export const WORLD_URF_SLOT: ULayerCornerId = 'URF';

/** y2 used in the zero-permuted corner recipe (blue front → green front). */
export const ZERO_FLOW_Y2_TARGET_HOLD = 2 as CornerHoldIndex;

export function holdIndexToBringSlotToWorldUrf(
  slotId: ULayerCornerId,
): CornerHoldIndex {
  for (const hold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    if (SETUP_SLOT_BY_TARGET_HOLD[hold] === slotId) return hold;
  }
  return 0;
}

export function reorientMovesForCornerSetup(
  fromHold: CornerHoldIndex,
  toHold: CornerHoldIndex,
): Move[] {
  return relativeY(fromHold, toHold);
}

/** Pick a whole-cube y reorient that places the permuted corner at world URF. */
export function findReorientToPlacePermutedCornerAtWorldUrf(
  state: CubeState,
  currentHoldIndex: CornerHoldIndex,
): { targetHoldIndex: CornerHoldIndex; demoMoves: Move[] } | null {
  if (cornerPermutedAtSlot(state, WORLD_URF_SLOT)) {
    return { targetHoldIndex: currentHoldIndex, demoMoves: [] };
  }

  for (const targetHold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    const demoMoves = relativeY(currentHoldIndex, targetHold);
    const after = applyMoves(state, demoMoves);
    if (cornerPermutedAtSlot(after, WORLD_URF_SLOT)) {
      return { targetHoldIndex: targetHold, demoMoves };
    }
  }

  return null;
}
