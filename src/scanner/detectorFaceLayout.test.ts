import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createSolvedCubeState,
  FACE_COLOR_CONVENTION,
} from '../cube/cubeState';
import type { Color, Face, FaceState } from '../cube/cubeState';
import { cubeStateToCubeJsString } from '../cube/cubeStateToFacelets';
import { detectorFaceToCubeJsFaceOrder } from './detectorFaceLayout';

const faceOrder: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

/** Inverse of U remap (vertical + horizontal mirror) for tests. */
function cubeJsFaceOrderToDetectorGrid(
  face: Face,
  cubeJsLetters: string[],
): string[] {
  if (face !== 'U') return [...cubeJsLetters];
  const det = [...cubeJsLetters];
  for (let j = 0; j < 9; j += 1) {
    const row = Math.floor(j / 3);
    const col = j % 3;
    const i = (2 - row) * 3 + (2 - col);
    det[i] = cubeJsLetters[j];
  }
  return det;
}

describe('detectorFaceToCubeJsFaceOrder', () => {
  it('recovers cube state faces from inverse detector layout (U face)', () => {
    let state = createSolvedCubeState();
    for (const m of ['R', "U'", 'F2', 'D', 'L2', 'B', "D'", 'R2'] as const) {
      state = applyMove(state, m);
    }
    const good = cubeStateToCubeJsString(state);
    const letterToColor = (ch: string): Color =>
      FACE_COLOR_CONVENTION[ch as Face];

    for (let fi = 0; fi < 6; fi += 1) {
      const face = faceOrder[fi];
      const letters = good.slice(fi * 9, fi * 9 + 9).split('');
      const detLetters = cubeJsFaceOrderToDetectorGrid(face, letters);
      const detColors = detLetters.map(letterToColor) as FaceState;
      const fixed = detectorFaceToCubeJsFaceOrder(face, detColors);
      expect(fixed).toEqual(state[face]);
    }
  });

  it('is identity for non-U faces', () => {
    const face: FaceState = [
      'red',
      'green',
      'blue',
      'white',
      'yellow',
      'orange',
      'green',
      'blue',
      'red',
    ] as FaceState;
    expect(detectorFaceToCubeJsFaceOrder('F', face)).toEqual(face);
    expect(detectorFaceToCubeJsFaceOrder('R', face)).toEqual(face);
  });
});
