import { compressConsecutiveFaceQuarterTurns } from '../../cube/cubeState';
import type { Move } from '../../cube/cubeState';

type StepWithOptionalDemoMoves = {
  demoMoves?: Move[];
};

export function normalizeLessonDemoMovesInStep<
  T extends StepWithOptionalDemoMoves,
>(step: T): T {
  if (!('demoMoves' in step) || !step.demoMoves?.length) return step;
  const raw = step.demoMoves;
  const compressed = compressConsecutiveFaceQuarterTurns(raw);
  return { ...step, demoMoves: compressed.length > 0 ? compressed : raw };
}
