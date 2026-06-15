import type { Face, Move } from '../../cube/cubeState';
import type { StudentHold, YHold } from './types';

/** App-frame face → face letter the student turns in the current y-hold. */
export const FACE_MAP: Record<YHold, Record<Face, Face>> = {
  none: { U: 'U', D: 'D', F: 'F', B: 'B', L: 'L', R: 'R' },
  y: { U: 'U', D: 'D', F: 'L', B: 'R', L: 'B', R: 'F' },
  "y'": { U: 'U', D: 'D', F: 'R', B: 'L', L: 'F', R: 'B' },
  y2: { U: 'U', D: 'D', F: 'B', B: 'F', L: 'R', R: 'L' },
};

export function getFaceFromMove(move: Move): Face {
  const c = move[0];
  if (
    c === 'U' ||
    c === 'D' ||
    c === 'F' ||
    c === 'B' ||
    c === 'L' ||
    c === 'R'
  ) {
    return c;
  }
  throw new Error(`Not a face move: ${move}`);
}

export function getModifierFromMove(move: Move): '' | "'" | '2' {
  if (move.endsWith('2')) return '2';
  if (move.endsWith("'")) return "'";
  return '';
}

export function translateMove(move: Move, hold: StudentHold): Move {
  const face = getFaceFromMove(move);
  const modifier = getModifierFromMove(move);
  const mapped = FACE_MAP[hold.y][face];
  if (modifier === '2') return `${mapped}2` as Move;
  if (modifier === "'") return `${mapped}'` as Move;
  return mapped as Move;
}
