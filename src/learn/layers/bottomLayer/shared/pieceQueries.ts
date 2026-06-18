import type { Color, CubeState, Face } from '../../../../cube/cubeState';
import { cubieDefinitions } from '../../../../cube3d/cubeGeometry';
import type { CubiePosition } from '../../../../cube3d/cubeGeometry';
import { faceStickerIndex } from '../../../../cube3d/cubeGeometry';

function readSticker(
  state: CubeState,
  position: CubiePosition,
  face: Face,
): Color {
  const index = faceStickerIndex(face, position);
  return state[face][index];
}

function edgeCubiePositions(): CubiePosition[] {
  return cubieDefinitions
    .filter((c) => c.exposedFaces.length === 2)
    .map((c) => c.position);
}

function cornerCubiePositions(): CubiePosition[] {
  return cubieDefinitions
    .filter((c) => c.exposedFaces.length === 3)
    .map((c) => c.position);
}

function colorsMatchUnordered(stickers: Color[], target: Color[]): boolean {
  if (stickers.length !== target.length) return false;
  const sortedStickers = [...stickers].sort();
  const sortedTarget = [...target].sort();
  return sortedStickers.every((color, index) => color === sortedTarget[index]);
}

export function findCornerWithColors(
  state: CubeState,
  colorA: Color,
  colorB: Color,
  colorC: Color,
): CubiePosition | null {
  const target = [colorA, colorB, colorC];
  for (const cornerPosition of cornerCubiePositions()) {
    const definition = cubieDefinitions.find(
      (cubie) =>
        cubie.position[0] === cornerPosition[0] &&
        cubie.position[1] === cornerPosition[1] &&
        cubie.position[2] === cornerPosition[2],
    );
    if (!definition || definition.exposedFaces.length !== 3) continue;
    const stickers = definition.exposedFaces.map((face) =>
      readSticker(state, cornerPosition, face),
    );
    if (colorsMatchUnordered(stickers, target)) {
      return cornerPosition;
    }
  }
  return null;
}

export function faceForWhiteOnCorner(
  cornerPosition: CubiePosition,
  state: CubeState,
): Face | null {
  const definition = cubieDefinitions.find(
    (cubie) =>
      cubie.position[0] === cornerPosition[0] &&
      cubie.position[1] === cornerPosition[1] &&
      cubie.position[2] === cornerPosition[2],
  );
  if (!definition || definition.exposedFaces.length !== 3) return null;
  for (const face of definition.exposedFaces) {
    if (readSticker(state, cornerPosition, face) === 'white') return face;
  }
  return null;
}

export function cornerWhiteStickerOnD(
  state: CubeState,
  cornerPosition: CubiePosition,
): boolean {
  return faceForWhiteOnCorner(cornerPosition, state) === 'D';
}

export function findEdgeWithColors(
  state: CubeState,
  colorA: Color,
  colorB: Color,
): CubiePosition | null {
  for (const edgePosition of edgeCubiePositions()) {
    const definition = cubieDefinitions.find(
      (cubie) =>
        cubie.position[0] === edgePosition[0] &&
        cubie.position[1] === edgePosition[1] &&
        cubie.position[2] === edgePosition[2],
    );
    if (!definition || definition.exposedFaces.length !== 2) continue;
    const [faceA, faceB] = definition.exposedFaces;
    const stickerA = readSticker(state, edgePosition, faceA);
    const stickerB = readSticker(state, edgePosition, faceB);
    if (
      (stickerA === colorA && stickerB === colorB) ||
      (stickerA === colorB && stickerB === colorA)
    ) {
      return edgePosition;
    }
  }
  return null;
}

export function faceForWhiteOnEdge(
  edgePosition: CubiePosition,
  state: CubeState,
): Face | null {
  const definition = cubieDefinitions.find(
    (cubie) =>
      cubie.position[0] === edgePosition[0] &&
      cubie.position[1] === edgePosition[1] &&
      cubie.position[2] === edgePosition[2],
  );
  if (!definition || definition.exposedFaces.length !== 2) return null;
  const [faceA, faceB] = definition.exposedFaces;
  if (readSticker(state, edgePosition, faceA) === 'white') return faceA;
  if (readSticker(state, edgePosition, faceB) === 'white') return faceB;
  return null;
}

export function isMiddleLayerEdge(edgePosition: CubiePosition): boolean {
  return (
    edgePosition[1] === 0 && edgePosition[0] !== 0 && edgePosition[2] !== 0
  );
}

export function whiteStickerOnD(
  state: CubeState,
  edgePosition: CubiePosition,
): boolean {
  return faceForWhiteOnEdge(edgePosition, state) === 'D';
}

export function whiteStickerOnU(
  state: CubeState,
  edgePosition: CubiePosition,
): boolean {
  return faceForWhiteOnEdge(edgePosition, state) === 'U';
}

export function faceForColorOnEdge(
  edgePosition: CubiePosition,
  state: CubeState,
  color: Color,
): Face | null {
  const definition = cubieDefinitions.find(
    (cubie) =>
      cubie.position[0] === edgePosition[0] &&
      cubie.position[1] === edgePosition[1] &&
      cubie.position[2] === edgePosition[2],
  );
  if (!definition || definition.exposedFaces.length !== 2) return null;
  for (const face of definition.exposedFaces) {
    if (readSticker(state, edgePosition, face) === color) return face;
  }
  return null;
}

export function colorStickerOnU(
  state: CubeState,
  edgePosition: CubiePosition,
  color: Color,
): boolean {
  return faceForColorOnEdge(edgePosition, state, color) === 'U';
}

/** Non-white sticker matches that face’s center (edge connected to its center). */
export function edgeAlignedToSideCenter(
  state: CubeState,
  edgePosition: CubiePosition,
): Face | null {
  const definition = cubieDefinitions.find(
    (cubie) =>
      cubie.position[0] === edgePosition[0] &&
      cubie.position[1] === edgePosition[1] &&
      cubie.position[2] === edgePosition[2],
  );
  if (!definition || definition.exposedFaces.length !== 2) return null;
  for (const face of definition.exposedFaces) {
    if (face === 'U' || face === 'D') continue;
    const sticker = readSticker(state, edgePosition, face);
    if (sticker === 'white') continue;
    if (sticker === state[face][4]) return face;
  }
  return null;
}
