import type { Move } from '../cube/cubeState';
import { moveSequenceDemo } from '../content/tips';

/** Status line for the move-sequence demo summary. */
export function getMoveSequenceSummary(options: {
  hasMoves: boolean;
  animating: boolean;
  reverseAnimating: boolean;
  applied: number;
  moves: Move[];
}): string {
  const { hasMoves, animating, reverseAnimating, applied, moves } = options;
  if (!hasMoves) return moveSequenceDemo.noMovesSummary;
  if (animating) {
    if (reverseAnimating) {
      return moveSequenceDemo.undoing(moves[applied - 1]!);
    }
    return moveSequenceDemo.animating(moves[applied]!);
  }
  if (applied === 0) return moveSequenceDemo.startPosition;
  if (applied >= moves.length) {
    return moveSequenceDemo.complete(moves.join(' '));
  }
  return moveSequenceDemo.applied(moves.slice(0, applied).join(' '));
}
