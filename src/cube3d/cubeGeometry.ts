import type { Color, CubeState, Face } from '../cube/cubeState';

export type CubiePosition = [number, number, number];

export interface CubieDefinition {
  position: CubiePosition;
  exposedFaces: Face[];
}

export type DisplayColor = Color | 'unknown';
export type DisplayFaceState = [
  DisplayColor,
  DisplayColor,
  DisplayColor,
  DisplayColor,
  DisplayColor,
  DisplayColor,
  DisplayColor,
  DisplayColor,
  DisplayColor,
];
export type DisplayCubeState = Record<Face, DisplayFaceState>;

export const cubiePositions: CubiePosition[] = [];
for (const x of [-1, 0, 1] as const) {
  for (const y of [-1, 0, 1] as const) {
    for (const z of [-1, 0, 1] as const) {
      if (x === 0 && y === 0 && z === 0) continue;
      cubiePositions.push([x, y, z]);
    }
  }
}

function getExposedFaces([x, y, z]: CubiePosition): Face[] {
  const faces: Face[] = [];
  if (y === 1) faces.push('U');
  if (y === -1) faces.push('D');
  if (z === 1) faces.push('F');
  if (z === -1) faces.push('B');
  if (x === 1) faces.push('R');
  if (x === -1) faces.push('L');
  return faces;
}

export const cubieDefinitions: CubieDefinition[] = cubiePositions.map(
  (position) => ({
    position,
    exposedFaces: getExposedFaces(position),
  }),
);

/**
 * Per-face sticker slot 0..8 in the same order as `cubejs` / `cubeStateToCubeJsString` (URFDLB blocks).
 * Each entry is the cubie at (x,y,z) that owns that sticker on that face — must match `cornerFacelet` /
 * `edgeFacelet` in `cubejs/lib/cube.js` so the 3D view and the validator read one consistent layout.
 */
export const cubeJsStickerSlots: Record<Face, CubiePosition[]> = {
  U: [
    [-1, 1, -1],
    [0, 1, -1],
    [1, 1, -1],
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
  ],
  R: [
    [1, 1, 1],
    [1, 1, 0],
    [1, 1, -1],
    [1, 0, 1],
    [1, 0, 0],
    [1, 0, -1],
    [1, -1, 1],
    [1, -1, 0],
    [1, -1, -1],
  ],
  F: [
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
    [-1, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [-1, -1, 1],
    [0, -1, 1],
    [1, -1, 1],
  ],
  D: [
    [-1, -1, 1],
    [0, -1, 1],
    [1, -1, 1],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
    [-1, -1, -1],
    [0, -1, -1],
    [1, -1, -1],
  ],
  L: [
    [-1, 1, -1],
    [-1, 1, 0],
    [-1, 1, 1],
    [-1, 0, -1],
    [-1, 0, 0],
    [-1, 0, 1],
    [-1, -1, -1],
    [-1, -1, 0],
    [-1, -1, 1],
  ],
  B: [
    [1, 1, -1],
    [0, 1, -1],
    [-1, 1, -1],
    [1, 0, -1],
    [0, 0, -1],
    [-1, 0, -1],
    [1, -1, -1],
    [0, -1, -1],
    [-1, -1, -1],
  ],
};

export function faceStickerIndex(face: Face, [x, y, z]: CubiePosition): number {
  const slots = cubeJsStickerSlots[face];
  const idx = slots.findIndex(
    ([sx, sy, sz]) => sx === x && sy === y && sz === z,
  );
  if (idx !== -1) return idx;
  return 4;
}

export function getCubieFaceColors(
  cubeState: CubeState | DisplayCubeState,
  position: CubiePosition,
): Partial<Record<Face, DisplayColor>> {
  const colors: Partial<Record<Face, DisplayColor>> = {};
  const faces = getExposedFaces(position);

  for (const face of faces) {
    colors[face] = cubeState[face][faceStickerIndex(face, position)];
  }

  return colors;
}
