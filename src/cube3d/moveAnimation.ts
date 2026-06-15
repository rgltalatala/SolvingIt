import type { Face, Move } from '../cube/cubeState';
import { isWholeCubeRotation } from '../cube/cubeState';
import {
  getFaceFromMove,
  getModifierFromMove,
} from '../learn/studentHold/translateMove';
import type { CubiePosition } from './cubeGeometry';

const HALF_PI = Math.PI / 2;

/** Visual quarter-turn count: prime = one turn the short way (not three CW quarters). */
function visualQuarterTurns(modifier: '' | "'" | '2'): number {
  if (modifier === '2') return 2;
  if (modifier === "'") return -1;
  return 1;
}

export const MOVE_ANIMATION_MS = 340;
export const MOVE_ANIMATION_PAUSE_MS = 100;

export type MoveAnimationSpec =
  | { kind: 'whole'; axis: 'x' | 'y' | 'z'; angle: number }
  | { kind: 'face'; face: Face; axis: 'x' | 'y' | 'z'; angle: number };

export function cubieOnFaceLayer(
  [x, y, z]: CubiePosition,
  face: Face,
): boolean {
  switch (face) {
    case 'U':
      return y === 1;
    case 'D':
      return y === -1;
    case 'F':
      return z === 1;
    case 'B':
      return z === -1;
    case 'R':
      return x === 1;
    case 'L':
      return x === -1;
    default:
      return false;
  }
}

/** Radians for three.js rotation; tuned to match {@link applyMove} sticker permutations. */
export function getMoveAnimationSpec(move: Move): MoveAnimationSpec {
  if (isWholeCubeRotation(move)) {
    const axis = move[0] as 'x' | 'y' | 'z';
    const modifier: '' | "'" | '2' = move.includes('2')
      ? '2'
      : move.includes("'")
        ? "'"
        : '';
    const quarters = visualQuarterTurns(modifier);
    const sign = axis === 'y' ? -1 : axis === 'x' ? 1 : -1;
    return { kind: 'whole', axis, angle: sign * quarters * HALF_PI };
  }

  const face = getFaceFromMove(move);
  const modifier = getModifierFromMove(move);
  const quarters = visualQuarterTurns(modifier);
  const axis: 'x' | 'y' | 'z' =
    face === 'U' || face === 'D'
      ? 'y'
      : face === 'L' || face === 'R'
        ? 'x'
        : 'z';
  const sign = face === 'R' || face === 'U' || face === 'F' ? -1 : 1;
  return { kind: 'face', face, axis, angle: sign * quarters * HALF_PI };
}

export function axisIndex(axis: 'x' | 'y' | 'z'): 0 | 1 | 2 {
  if (axis === 'x') return 0;
  if (axis === 'y') return 1;
  return 2;
}

/** Ease for layer turns (0..1 progress). */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
