import { COLOR_TO_FACE, FACE_ORDER } from './cubeState';
import type { Color, CubeState, Face, FaceState } from './cubeState';

// Common facelet order expected by many cube tools.
export const FACELET_ORDER: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export function cubeStateToFaceletString(
  cubeState: CubeState,
  order: Face[] = FACELET_ORDER,
): string {
  return order
    .map((face) =>
      cubeState[face].map((color) => COLOR_TO_FACE[color]).join(''),
    )
    .join('');
}

export function cubeStateToCubeJsString(cubeState: CubeState): string {
  return cubeStateToFaceletString(cubeState, FACELET_ORDER);
}

/** Home-face letter (URFDLB) → sticker color; matches cubejs `asString()` alphabet. */
const HOME_LETTER_TO_COLOR: Record<string, Color> = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
};

/** Inverse of {@link cubeStateToCubeJsString} using cubejs face order (URFDLB). */
export function cubeJsStringToCubeState(str: string): CubeState {
  if (str.length !== 54) {
    throw new Error(`Expected 54 facelet letters, got ${str.length}`);
  }
  const state = {} as Record<Face, FaceState>;
  for (let i = 0; i < 6; i++) {
    const face = FACELET_ORDER[i];
    const chunk = str.slice(i * 9, i * 9 + 9);
    state[face] = [...chunk].map((ch) => {
      const c = HOME_LETTER_TO_COLOR[ch];
      if (!c) throw new Error(`Bad facelet letter: ${ch}`);
      return c;
    }) as FaceState;
  }
  return state as CubeState;
}

export function cubeStateToColorString(cubeState: CubeState): string {
  return FACE_ORDER.map((face) => cubeState[face].join(',')).join('|');
}
