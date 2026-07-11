import type { Color, CubeState, Face } from '../../../../cube/cubeState';
import type { CubiePosition } from '../../../../cube3d/cubeGeometry';
import { faceStickerIndex } from '../../../../cube3d/cubeGeometry';
import { findEdgeWithColors } from '../../bottomLayer/shared/pieceQueries';

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

/** Side face whose center is the non-yellow sticker for this home slot. */
export const U_EDGE_SIDE_FACE: Record<ULayerEdgeId, Face> = {
  UB: 'B',
  UL: 'L',
  UR: 'R',
  UF: 'F',
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

export function expectedULayerEdgePartner(
  state: CubeState,
  homeSlotId: ULayerEdgeId,
): Color {
  return state[U_EDGE_SIDE_FACE[homeSlotId]][4];
}

/** True when the yellow–{partner} edge cubie for this home slot shows yellow on U. */
export function edgeOrientedByIdentity(
  state: CubeState,
  homeSlotId: ULayerEdgeId,
): boolean {
  const partner = expectedULayerEdgePartner(state, homeSlotId);
  const pos = findEdgeWithColors(state, 'yellow', partner);
  if (!pos || pos[1] !== 1) return false;
  return state.U[faceStickerIndex('U', pos)] === 'yellow';
}
