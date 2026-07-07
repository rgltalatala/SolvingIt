import type { Move } from '../../cube/cubeState';

export function stepHasDemoMoves(
  step: unknown,
): step is { demoMoves: Move[] } {
  return (
    typeof step === 'object' &&
    step !== null &&
    'demoMoves' in step &&
    Array.isArray((step as { demoMoves: unknown }).demoMoves) &&
    (step as { demoMoves: Move[] }).demoMoves.length > 0
  );
}
