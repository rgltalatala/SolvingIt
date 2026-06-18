import { describe, expect, it } from 'vitest';
import { randomScrambleForEvent } from 'cubing/scramble';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import { validateCubeState } from '../../../../cube/cubeValidator';
import { simulateWhiteCornersLessonOnStorageCube } from '../../bottomLayer/corners';
import { simulateWhiteCrossLessonOnStorageCube } from '../../bottomLayer/cross';
import {
  isMiddleLayerLessonStateValid,
  simulateMiddleLayerEdgesLessonOnStorageCube,
} from './index';

describe('middle layer edge lesson vs cubing.js random scrambles', () => {
  it('lesson demos eventually complete middle-layer edges after cross and corners on random WCA scrambles', async () => {
    const targetSuccesses = 8;
    const maxAttempts = 40;
    const crossMaxSteps = 150;
    const cornersMaxSteps = 150;
    const middleMaxSteps = 250;

    let successes = 0;
    for (
      let attempt = 0;
      attempt < maxAttempts && successes < targetSuccesses;
      attempt += 1
    ) {
      const alg = await randomScrambleForEvent('333');
      const algStr = alg.toString().replace(/\u2032/g, "'");
      const moves = parseFaceTurnAlgToMoves(algStr);
      const storage = applyMoves(createSolvedCubeState(), moves);
      const v = validateCubeState(storage);
      expect(
        v.valid,
        `cube invalid attempt ${attempt}: ${v.issues.map((x) => x.message).join('; ')}`,
      ).toBe(true);

      const crossRes = simulateWhiteCrossLessonOnStorageCube(
        storage,
        crossMaxSteps,
      );
      expect(
        crossRes.stuckNoDemo,
        `cross stuck attempt ${attempt}, lastKind=${crossRes.lastStepKind} alg=${algStr}`,
      ).toBe(false);
      expect(
        crossRes.crossComplete,
        `cross incomplete attempt ${attempt}, steps=${crossRes.lessonStepsSimulated} alg=${algStr}`,
      ).toBe(true);

      const cornersRes = simulateWhiteCornersLessonOnStorageCube(
        crossRes.finalStorageCube,
        cornersMaxSteps,
      );
      expect(
        cornersRes.stuckNoDemo,
        `corners stuck attempt ${attempt}, lastKind=${cornersRes.lastStepKind} alg=${algStr}`,
      ).toBe(false);
      expect(
        cornersRes.cornersComplete,
        `corners incomplete attempt ${attempt}, steps=${cornersRes.lessonStepsSimulated} alg=${algStr}`,
      ).toBe(true);
      expect(cornersRes.finalStorageCube).toBeDefined();

      const student = cubeStateToStudentFrame(cornersRes.finalStorageCube!);
      expect(
        isMiddleLayerLessonStateValid(student),
        `bottom layer invalid attempt ${attempt} alg=${algStr}`,
      ).toBe(true);

      const middleRes = simulateMiddleLayerEdgesLessonOnStorageCube(
        student,
        middleMaxSteps,
      );
      if (middleRes.stuckNoDemo || !middleRes.middleLayerComplete) {
        continue;
      }
      expect(middleRes.finalHoldIndex).toBe(0);
      successes += 1;
    }

    expect(
      successes,
      `completed ${successes}/${targetSuccesses} middle-layer runs within ${maxAttempts} WCA scrambles (cross and corners must succeed each attempt)`,
    ).toBe(targetSuccesses);
  }, 180_000);
});
