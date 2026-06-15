import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createSolvedCubeState,
  FACE_COLOR_CONVENTION,
} from '../cube/cubeState';
import type {
  Color,
  CubeState,
  Face,
  FaceState,
  Move,
} from '../cube/cubeState';
import {
  FACELET_ORDER,
  cubeStateToCubeJsString,
} from '../cube/cubeStateToFacelets';
import { cubeJsStickerSlots, getCubieFaceColors } from './cubeGeometry';

function cubeJsFaceletsToState(facelets: string): CubeState {
  const letterToColor = (letter: string): Color =>
    FACE_COLOR_CONVENTION[letter as Face];
  let offset = 0;
  const out = {} as CubeState;
  for (const face of FACELET_ORDER) {
    const slice = facelets.slice(offset, offset + 9);
    offset += 9;
    out[face] = [...slice].map((ch) => letterToColor(ch)) as FaceState;
  }
  return out;
}

describe('cubeJsStickerSlots / faceStickerIndex', () => {
  it('matches cubeStateToCubeJsString for every sticker after legal scrambles', () => {
    const moves: Move[] = [
      'R',
      "U'",
      'F2',
      'D',
      'L2',
      'B',
      "D'",
      'R2',
      'x',
      "y'",
      'z2',
      'F',
      'R',
      'U',
    ];
    let state = createSolvedCubeState();
    for (const move of moves) {
      state = applyMove(state, move);
    }

    for (const face of FACELET_ORDER) {
      for (let slot = 0; slot < 9; slot += 1) {
        const pos = cubeJsStickerSlots[face][slot];
        const from3d = getCubieFaceColors(state, pos)[face];
        expect(from3d).toBe(state[face][slot]);
      }
    }

    expect(cubeStateToCubeJsString(state).length).toBe(54);
  });

  it('matches a cubejs-parsable state built from a facelet string', () => {
    const facelets = 'UULDUFBDRBBRBRLDDLFRRLFLLBRBRFDDLFRBFUDBLFUFUDRUUBUDFL';
    const state = cubeJsFaceletsToState(facelets);
    for (const face of FACELET_ORDER) {
      for (let slot = 0; slot < 9; slot += 1) {
        const pos = cubeJsStickerSlots[face][slot];
        expect(getCubieFaceColors(state, pos)[face]).toBe(state[face][slot]);
      }
    }
  });
});
