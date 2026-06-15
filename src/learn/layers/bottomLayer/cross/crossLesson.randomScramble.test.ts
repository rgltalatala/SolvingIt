import { describe, expect, it } from 'vitest';
import { randomScrambleForEvent } from 'cubing/scramble';
import { applyMoves, createSolvedCubeState } from '../../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import { validateCubeState } from '../../../../cube/cubeValidator';
import { simulateWhiteCrossLessonOnStorageCube } from './index';

describe('white cross lesson vs cubing.js random scrambles', () => {
  it('lesson demos eventually complete the white cross on several random WCA scrambles', async () => {
    const iterations = 8;
    for (let i = 0; i < iterations; i += 1) {
      const alg = await randomScrambleForEvent('333');
      const algStr = alg.toString().replace(/\u2032/g, "'");
      const moves = parseFaceTurnAlgToMoves(algStr);
      const storage = applyMoves(createSolvedCubeState(), moves);
      const v = validateCubeState(storage);
      expect(
        v.valid,
        `cube invalid iter ${i}: ${v.issues.map((x) => x.message).join('; ')}`,
      ).toBe(true);

      const res = simulateWhiteCrossLessonOnStorageCube(storage, 150);
      expect(
        res.stuckNoDemo,
        `stuck without demo iter ${i}, lastKind=${res.lastStepKind} alg=${algStr}`,
      ).toBe(false);
      expect(
        res.crossComplete,
        `cross incomplete iter ${i}, steps=${res.lessonStepsSimulated} alg=${algStr}`,
      ).toBe(true);
    }
  }, 120_000);
});
