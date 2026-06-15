import type { CubeState } from './cubeState';
import { wholeCubeMove } from './wholeCube';

/**
 * Lesson student-frame swap (x2). Prefer {@link wholeCubeMove}(state, 'x2') or {@link applyMove}(state, 'x2').
 */
export function wholeCubeX2(state: CubeState): CubeState {
  return wholeCubeMove(state, 'x2');
}
