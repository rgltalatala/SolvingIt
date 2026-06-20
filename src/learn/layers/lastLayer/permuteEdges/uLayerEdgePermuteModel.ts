import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { edgeAlignedToSideCenter } from '../../bottomLayer/shared/pieceQueries';
import {
  U_LAYER_EDGE_DEF,
  U_LAYER_EDGE_SLOTS,
  isYellowCrossComplete,
  type ULayerEdgeId,
} from '../orientEdges/uLayerEdgeModel';

const U_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]];

export function edgePermutedAtSlot(
  state: CubeState,
  slotId: ULayerEdgeId,
): boolean {
  if (!isYellowCrossComplete(state)) return false;
  const pos = U_LAYER_EDGE_DEF[slotId].pos;
  return edgeAlignedToSideCenter(state, pos) !== null;
}

export function permutedEdgeSlots(state: CubeState): ULayerEdgeId[] {
  return U_LAYER_EDGE_SLOTS.filter((id) => edgePermutedAtSlot(state, id));
}

export function countPermutedEdges(state: CubeState): number {
  return permutedEdgeSlots(state).length;
}

export function isEdgesFullyPermuted(state: CubeState): boolean {
  return (
    isYellowCrossComplete(state) && countPermutedEdges(state) === 4
  );
}

export function findUPrefixToFullyPermute(state: CubeState): Move[] | null {
  if (!isYellowCrossComplete(state)) return null;
  for (const prefix of U_PREFIXES) {
    const after = applyMoves(state, prefix);
    if (isEdgesFullyPermuted(after)) {
      return prefix;
    }
  }
  return null;
}

export function permutedSlotsAfterBestUScan(
  state: CubeState,
): { slots: [ULayerEdgeId, ULayerEdgeId]; inspectPrefix: Move[] } | null {
  if (!isYellowCrossComplete(state)) return null;

  for (const prefix of U_PREFIXES) {
    const after = applyMoves(state, prefix);
    const permuted = permutedEdgeSlots(after);
    if (permuted.length === 2) {
      return {
        slots: [permuted[0]!, permuted[1]!],
        inspectPrefix: prefix,
      };
    }
  }

  return null;
}
