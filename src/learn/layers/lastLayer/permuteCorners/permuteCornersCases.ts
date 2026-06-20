import type { CubeState } from '../../../../cube/cubeState';
import type { CornerHoldIndex } from '../../bottomLayer/corners/cornerHold';
import type { ULayerCornerId } from '../../bottomLayer/corners/cornerCases';
import { isYellowCrossComplete } from '../orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from '../permuteEdges/uLayerEdgePermuteModel';
import { holdIndexToBringSlotToWorldUrf } from './permuteHold';
import {
  countPermutedCorners,
  isCornersFullyPermuted,
  permutedCornerSlots,
} from './uLayerCornerPermuteModel';

export type PermuteCornersCase =
  | { kind: 'solved' }
  | { kind: 'none-permuted' }
  | {
      kind: 'one-permuted';
      slotId: ULayerCornerId;
      targetHoldIndex: CornerHoldIndex;
    };

export function recognizePermuteCornersCase(
  state: CubeState,
  _currentHoldIndex: CornerHoldIndex = 0,
): PermuteCornersCase {
  if (!isYellowCrossComplete(state) || !isEdgesFullyPermuted(state)) {
    throw new Error(
      'recognizePermuteCornersCase requires yellow cross and permuted edges',
    );
  }

  if (isCornersFullyPermuted(state)) {
    return { kind: 'solved' };
  }

  const count = countPermutedCorners(state);
  if (count === 0) {
    return { kind: 'none-permuted' };
  }

  if (count >= 1 && count < 4) {
    const slotId = permutedCornerSlots(state)[0]!;
    return {
      kind: 'one-permuted',
      slotId,
      targetHoldIndex: holdIndexToBringSlotToWorldUrf(slotId),
    };
  }

  if (count === 4) {
    return { kind: 'solved' };
  }

  throw new Error(`unexpected permuted corner count: ${count}`);
}
