import type { Face, FaceState } from '../cube/cubeState';
import { FACE_ORDER } from '../cube/cubeState';
import type { DisplayCubeState, DisplayFaceState } from './cubeGeometry';

const UNKNOWN_DISPLAY_FACE: DisplayFaceState = [
  'unknown',
  'unknown',
  'unknown',
  'unknown',
  'unknown',
  'unknown',
  'unknown',
  'unknown',
  'unknown',
];

function emptyDisplayCubeState(): DisplayCubeState {
  const u = [...UNKNOWN_DISPLAY_FACE] as DisplayFaceState;
  return {
    U: [...u],
    D: [...u],
    F: [...u],
    B: [...u],
    R: [...u],
    L: [...u],
  };
}

/**
 * Build a cube state for 3D preview: known faces from scans, unknown elsewhere, optional in-progress override.
 */
export function partialScansToDisplayCubeState(
  scanned: Partial<Record<Face, FaceState>>,
  override?: { face: Face; faceState: FaceState },
): DisplayCubeState {
  const base = emptyDisplayCubeState();
  for (const face of FACE_ORDER) {
    const faceState = scanned[face];
    if (faceState) {
      base[face] = [...faceState] as DisplayFaceState;
    }
  }
  if (override) {
    base[override.face] = [...override.faceState] as DisplayFaceState;
  }
  return base;
}
