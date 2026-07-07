import { compressConsecutiveFaceQuarterTurns } from '../../cube/cubeState';
import type { Move } from '../../cube/cubeState';

export function normalizeLessonDemoMovesInStep<T extends object>(
  step: T,
): T {
  if (!('demoMoves' in step)) return step;
  const demoMoves = (step as { demoMoves?: Move[] }).demoMoves;
  if (!demoMoves?.length) return step;
  const compressed = compressConsecutiveFaceQuarterTurns(demoMoves);
  return {
    ...step,
    demoMoves: compressed.length > 0 ? compressed : demoMoves,
  };
}
