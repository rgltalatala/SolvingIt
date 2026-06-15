import type { Move } from '../../cube/cubeState';
import { getFaceFromMove, translateMove } from './translateMove';
import type { StudentHold } from './types';

export function isBackFaceMove(move: Move): boolean {
  const face = move[0];
  return face === 'B' && (move === 'B' || move === "B'" || move === 'B2');
}

/** True when the student must turn the physical back face for this app-frame move. */
export function needsReorientForBack(move: Move, hold: StudentHold): boolean {
  if (!isBackFaceMove(move)) return false;
  return getFaceFromMove(translateMove(move, hold)) === 'B';
}
