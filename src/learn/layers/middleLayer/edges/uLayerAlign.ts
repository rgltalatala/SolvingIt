import { applyMoves } from '../../../../cube/cubeState';
import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import { faceStickerIndex } from '../../../../cube3d/cubeGeometry';
import {
  edgeAlignedToSideCenter,
  findEdgeWithColors,
} from '../../bottomLayer/shared/pieceQueries';
import { cubieDefinitions } from '../../../../cube3d/cubeGeometry';

const U_LAYER_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]];

function stickerOnFace(
  state: CubeState,
  colors: [Color, Color],
  face: 'U' | 'D' | 'F' | 'B' | 'L' | 'R',
): Color | null {
  const pos = findEdgeWithColors(state, colors[0], colors[1]);
  if (!pos) return null;
  const definition = cubieDefinitions.find(
    (c) =>
      c.position[0] === pos[0] &&
      c.position[1] === pos[1] &&
      c.position[2] === pos[2],
  );
  if (!definition || !definition.exposedFaces.includes(face)) return null;
  return state[face][faceStickerIndex(face, pos)];
}

export function partnerColorOnU(
  state: CubeState,
  edgeColors: [Color, Color],
): Color | null {
  const pos = findEdgeWithColors(state, edgeColors[0], edgeColors[1]);
  if (!pos || pos[1] !== 1) return null;
  const onU = stickerOnFace(state, edgeColors, 'U');
  if (!onU) return null;
  return edgeColors[0] === onU ? edgeColors[1] : edgeColors[0];
}

export function isPartnerAlignedToCenter(
  state: CubeState,
  edgeColors: [Color, Color],
): boolean {
  const pos = findEdgeWithColors(state, edgeColors[0], edgeColors[1]);
  if (!pos) return false;
  return edgeAlignedToSideCenter(state, pos) !== null;
}

export function alignMovesToPartnerCenter(
  state: CubeState,
  edgeColors: [Color, Color],
): Move[] | null {
  if (!partnerColorOnU(state, edgeColors)) return null;
  if (isPartnerAlignedToCenter(state, edgeColors)) return [];

  for (const prefix of U_LAYER_PREFIXES) {
    const after = applyMoves(state, prefix);
    const pos = findEdgeWithColors(after, edgeColors[0], edgeColors[1]);
    if (!pos || pos[1] !== 1) continue;
    if (edgeAlignedToSideCenter(after, pos) !== null) {
      return prefix;
    }
  }
  return null;
}
