import type { Color, CubeState, Face } from '../../../../cube/cubeState';
import { faceStickerIndex } from '../../../../cube3d/cubeGeometry';
import type { CubiePosition } from '../../../../cube3d/cubeGeometry';
import {
  U_LAYER_CORNER_POS,
  type ULayerCornerId,
} from '../../bottomLayer/corners/cornerCases';
import { isYellowCrossComplete } from '../orientEdges/uLayerEdgeModel';

export const U_LAYER_CORNER_SLOTS = ['URF', 'UBR', 'ULB', 'UFL'] as const;

const SIDE_FACES: Record<ULayerCornerId, [Face, Face]> = {
  URF: ['F', 'R'],
  UBR: ['B', 'R'],
  ULB: ['B', 'L'],
  UFL: ['F', 'L'],
};

function readSticker(
  state: CubeState,
  position: CubiePosition,
  face: Face,
): Color {
  return state[face][faceStickerIndex(face, position)];
}

function colorsMatchUnordered(stickers: Color[], target: Color[]): boolean {
  if (stickers.length !== target.length) return false;
  const sortedStickers = [...stickers].sort();
  const sortedTarget = [...target].sort();
  return sortedStickers.every((color, index) => color === sortedTarget[index]);
}

export function expectedULayerCornerColors(
  state: CubeState,
  slotId: ULayerCornerId,
): [Color, Color, Color] {
  const [faceA, faceB] = SIDE_FACES[slotId];
  return ['yellow', state[faceA][4], state[faceB][4]];
}

export function cornerSideFacesForSlot(id: ULayerCornerId): [Face, Face] {
  return SIDE_FACES[id];
}

export function cornerPermutedAtSlot(
  state: CubeState,
  slotId: ULayerCornerId,
): boolean {
  if (!isYellowCrossComplete(state)) return false;
  const pos = U_LAYER_CORNER_POS[slotId];
  const [faceA, faceB] = SIDE_FACES[slotId];
  const stickers = [
    readSticker(state, pos, 'U'),
    readSticker(state, pos, faceA),
    readSticker(state, pos, faceB),
  ];
  return colorsMatchUnordered(stickers, [
    ...expectedULayerCornerColors(state, slotId),
  ]);
}

export function cornerOrientedAtSlot(
  state: CubeState,
  slotId: ULayerCornerId,
): boolean {
  const pos = U_LAYER_CORNER_POS[slotId];
  return readSticker(state, pos, 'U') === 'yellow';
}

export function cornerSolvedAtSlot(
  state: CubeState,
  slotId: ULayerCornerId,
): boolean {
  return (
    cornerPermutedAtSlot(state, slotId) &&
    cornerOrientedAtSlot(state, slotId)
  );
}

export function permutedCornerSlots(state: CubeState): ULayerCornerId[] {
  return U_LAYER_CORNER_SLOTS.filter((id) => cornerPermutedAtSlot(state, id));
}

export function countPermutedCorners(state: CubeState): number {
  return permutedCornerSlots(state).length;
}

export function isCornersFullyPermuted(state: CubeState): boolean {
  return (
    isYellowCrossComplete(state) && countPermutedCorners(state) === 4
  );
}

export function unsolvedCornerSlots(state: CubeState): ULayerCornerId[] {
  return U_LAYER_CORNER_SLOTS.filter((id) => !cornerSolvedAtSlot(state, id));
}

export function countSolvedCorners(state: CubeState): number {
  return U_LAYER_CORNER_SLOTS.filter((id) => cornerSolvedAtSlot(state, id))
    .length;
}

export function isCornersFullySolved(state: CubeState): boolean {
  return (
    isCornersFullyPermuted(state) && countSolvedCorners(state) === 4
  );
}

export function isLastLayerComplete(state: CubeState): boolean {
  return isCornersFullySolved(state);
}
