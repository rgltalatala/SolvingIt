import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createSolvedCubeState,
  FACE_COLOR_CONVENTION,
} from './cubeState';
import type { Color, CubeState, Face, FaceState, Move } from './cubeState';
import { FACELET_ORDER } from './cubeStateToFacelets';
import { validateCubeState } from './cubeValidator';

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

describe('validateCubeState', () => {
  it('accepts a solved cube (solvability checks do not require cubejs solve.js)', () => {
    const state = createSolvedCubeState();
    const result = validateCubeState(state);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('accepts a cube reached by legal moves from solved (model matches cubejs facelet layout)', () => {
    const moves: Move[] = ['R', "U'", 'F2', 'D', 'L2', 'B', "D'", 'R2'];
    let state = createSolvedCubeState();
    for (const move of moves) {
      state = applyMove(state, move);
    }
    const result = validateCubeState(state);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('fails when a color count is not exactly nine', () => {
    const state = createSolvedCubeState();
    state.U[0] = 'red';

    const result = validateCubeState(state);

    expect(result.valid).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.kind === 'color-count' && issue.color === 'red',
      ),
    ).toBe(true);
  });

  it('fails when a face center does not match face identity', () => {
    const state = createSolvedCubeState();
    state.U[4] = 'yellow';
    state.D[4] = 'white';

    const result = validateCubeState(state);

    expect(result.valid).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.kind === 'center-mismatch' && issue.face === 'U',
      ),
    ).toBe(true);
  });

  it('fails when the cube is unsolvable even with valid counts and centers', () => {
    const state = createSolvedCubeState();
    const frontEdgeSticker = state.F[1];
    state.F[1] = state.R[1];
    state.R[1] = frontEdgeSticker;

    const result = validateCubeState(state);

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.kind === 'unsolvable')).toBe(
      true,
    );
  });

  it('uses the short duplicate-corner message when corner facelets are inconsistent', () => {
    const facelets = 'UULDUFBDRBBRBRLDDLFRRLFLLBRBRFDDLFRBFUDBLFUFUDRUUBUDFL';
    const state = cubeJsFaceletsToState(facelets);
    const result = validateCubeState(state);
    expect(result.valid).toBe(false);
    const msg =
      result.issues.find((i) => i.kind === 'unsolvable')?.message ?? '';
    expect(msg).toBe('Corner pieces do not line up with a real cube.');
  });
});
