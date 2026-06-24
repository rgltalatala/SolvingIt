import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createSolvedCubeState,
  faceCentersFromCubeState,
  type Move,
} from '../cube/cubeState';
import { getMoveAnimationSpec } from './moveAnimation';
import { visualCentersAfterWholeCubeTurn } from './visualCentersAfterWholeCubeTurn';

const WHOLE_CUBE_MOVES: Move[] = [
  'x',
  "x'",
  'x2',
  'y',
  "y'",
  'y2',
  'z',
  "z'",
  'z2',
];

describe('whole-cube animation alignment', () => {
  it.each(WHOLE_CUBE_MOVES)(
    'mesh rotation matches applyMove face centers for %s',
    (move) => {
      const solved = createSolvedCubeState();
      const spec = getMoveAnimationSpec(move);
      expect(spec.kind).toBe('whole');
      if (spec.kind !== 'whole') return;

      const visual = visualCentersAfterWholeCubeTurn(
        solved,
        spec.axis,
        spec.angle,
      );
      const applied = faceCentersFromCubeState(applyMove(solved, move));
      expect(visual).toEqual(applied);
    },
  );
});
