import { describe, expect, it } from 'vitest';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../cube/cubeState';
import {
  cubeJsStickerSlots,
  cubieDefinitions,
  faceStickerIndex,
  getCubieFaceColors,
} from './cubeGeometry';

function assertEdgesDistinctColors(
  label: string,
  s: import('../cube/cubeState').CubeState,
) {
  for (const { position, exposedFaces } of cubieDefinitions) {
    if (exposedFaces.length !== 2) continue;
    const fc = getCubieFaceColors(s, position);
    const a = fc[exposedFaces[0]];
    const b = fc[exposedFaces[1]];
    expect(a, `${label} pos ${position}`).toBeDefined();
    expect(b).toBeDefined();
    expect(a, `${label} duplicate on edge ${position.join(',')}`).not.toBe(b);
  }
}

describe('edge sticker indexing & scrambled cubes', () => {
  it('solved cube after turnX2 has distinct colors on every edge', () => {
    assertEdgesDistinctColors(
      'student solved',
      cubeStateToStudentFrame(createSolvedCubeState()),
    );
  });

  it('every edge slot resolves to a non-center fallback index in cubeJsStickerSlots', () => {
    for (const { position, exposedFaces } of cubieDefinitions) {
      if (exposedFaces.length !== 2) continue;
      for (const face of exposedFaces) {
        const idx = faceStickerIndex(face, position);
        const slots = cubeJsStickerSlots[face];
        const found = slots.some(
          ([sx, sy, sz]) =>
            sx === position[0] && sy === position[1] && sz === position[2],
        );
        expect(
          found,
          `position ${position.join()} must appear on face ${face}`,
        ).toBe(true);
        expect(
          idx,
          `fallback index 4 only for face-center cubie on ${face}`,
        ).not.toBe(4);
      }
    }
  });

  it('single-F scramble (storage frame): each edge shows two different colors', () => {
    const cube = applyMoves(createSolvedCubeState(), ['F']);
    assertEdgesDistinctColors('storage F', cube);
  });

  it('single-F scramble (student frame): each edge shows two different colors', () => {
    const cube = applyMoves(createSolvedCubeState(), ['F']);
    assertEdgesDistinctColors('student F', cubeStateToStudentFrame(cube));
  });
});
