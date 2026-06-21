import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { alignMovesToUrf } from '../../bottomLayer/corners/uLayerSteps';
import type { ULayerCornerId } from '../../bottomLayer/corners/cornerCases';
import { WORLD_URF_SLOT } from '../permuteCorners/permuteHold';
import {
  cornerOrientedAtSlot,
  isCornersFullySolved,
  unsolvedCornerSlots,
} from '../permuteCorners/uLayerCornerPermuteModel';
import { isYellowCrossComplete } from '../orientEdges/uLayerEdgeModel';
import { ORIENT_CORNER_ALG, repeatOrientAlg } from './orientCornersAlgs';

export type OrientCornersCase =
  | { kind: 'solved' }
  | { kind: 'needs-align'; alignMoves: Move[] }
  | { kind: 'orient-at-urf'; reps: 2 | 4 };

function alignCost(moves: Move[]): number {
  return moves.reduce((sum, move) => {
    if (move === 'U2') return sum + 2;
    return sum + 1;
  }, 0);
}

function closestAlignToUrf(
  unsolved: readonly ULayerCornerId[],
): Move[] {
  let best: Move[] | null = null;
  let bestCost = Infinity;
  for (const slotId of unsolved) {
    const moves = alignMovesToUrf(slotId);
    if (moves.length === 0) continue;
    const cost = alignCost(moves);
    if (cost < bestCost) {
      bestCost = cost;
      best = moves;
    }
  }
  return best ?? [];
}

export function orientRepsAtUrf(state: CubeState): 2 | 4 {
  const afterTwo = applyMoves(state, repeatOrientAlg(2));
  if (cornerOrientedAtSlot(afterTwo, WORLD_URF_SLOT)) {
    return 2;
  }
  return 4;
}

export function recognizeOrientCornersCase(
  state: CubeState,
): OrientCornersCase {
  if (!isYellowCrossComplete(state)) {
    throw new Error(
      'recognizeOrientCornersCase requires yellow cross on U',
    );
  }

  if (isCornersFullySolved(state)) {
    return { kind: 'solved' };
  }

  if (!cornerOrientedAtSlot(state, WORLD_URF_SLOT)) {
    return { kind: 'orient-at-urf', reps: orientRepsAtUrf(state) };
  }

  const unsolved = unsolvedCornerSlots(state);
  return {
    kind: 'needs-align',
    alignMoves: closestAlignToUrf(unsolved),
  };
}

export { ORIENT_CORNER_ALG };
