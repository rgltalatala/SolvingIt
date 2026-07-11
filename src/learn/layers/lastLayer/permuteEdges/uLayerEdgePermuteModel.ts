import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { edgeAlignedToSideCenter } from '../../bottomLayer/shared/pieceQueries';
import { findEdgeWithColors } from '../../bottomLayer/shared/pieceQueries';
import {
  expectedULayerEdgePartner,
  U_LAYER_EDGE_DEF,
  U_LAYER_EDGE_SLOTS,
  isYellowCrossComplete,
  type ULayerEdgeId,
} from '../orientEdges/uLayerEdgeModel';

const U_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]];

function samePos(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function edgePermutedAtSlot(
  state: CubeState,
  slotId: ULayerEdgeId,
): boolean {
  if (!isYellowCrossComplete(state)) return false;
  const pos = U_LAYER_EDGE_DEF[slotId].pos;
  return edgeAlignedToSideCenter(state, pos) !== null;
}

/** True when the yellow–{partner} edge for this home slot sits in that slot, aligned. */
export function edgePermutedByIdentity(
  state: CubeState,
  homeSlotId: ULayerEdgeId,
): boolean {
  if (!isYellowCrossComplete(state)) return false;
  const partner = expectedULayerEdgePartner(state, homeSlotId);
  const pos = findEdgeWithColors(state, 'yellow', partner);
  const home = U_LAYER_EDGE_DEF[homeSlotId].pos;
  if (!pos || !samePos(pos, home)) return false;
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
