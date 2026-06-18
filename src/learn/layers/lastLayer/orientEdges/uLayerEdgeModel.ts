import type { CubeState } from '../../../../cube/cubeState';
import type { CubiePosition } from '../../../../cube3d/cubeGeometry';

export const U_LAYER_EDGE_SLOTS = ['UB', 'UL', 'UR', 'UF'] as const;

export type ULayerEdgeId = (typeof U_LAYER_EDGE_SLOTS)[number];

export const U_LAYER_EDGE_DEF: Record<
  ULayerEdgeId,
  { pos: CubiePosition; uIndex: number }
> = {
  UB: { pos: [0, 1, -1], uIndex: 1 },
  UL: { pos: [-1, 1, 0], uIndex: 3 },
  UR: { pos: [1, 1, 0], uIndex: 5 },
  UF: { pos: [0, 1, 1], uIndex: 7 },
};

export function yellowStickerOnU(
  state: CubeState,
  slotId: ULayerEdgeId,
): boolean {
  const slot = U_LAYER_EDGE_DEF[slotId];
  return state.U[slot.uIndex] === 'yellow';
}

export function yellowEdgeSlotsOnU(state: CubeState): ULayerEdgeId[] {
  return U_LAYER_EDGE_SLOTS.filter((id) => yellowStickerOnU(state, id));
}

export function countYellowEdgesOnU(state: CubeState): number {
  return yellowEdgeSlotsOnU(state).length;
}

export function isYellowCrossComplete(state: CubeState): boolean {
  return countYellowEdgesOnU(state) === 4;
}
