import type { CubeState } from '../../../../cube/cubeState';
import { simulateLessonOnStorageCube } from '../../../lessonCore';
import type { StudentHold } from '../../../studentHold';
import { getWhiteCrossLessonStep } from './computeLessonStep';
import { isWhiteCrossComplete } from './crossSlotModel';
import type {
  SimulateWhiteCrossLessonResult,
  WhiteCrossLessonStep,
} from './types';

export type SimulateWhiteCrossLessonOptions = {
  /** When true, expand steps that use B with y2 + translated face turns. */
  avoidBackMoves?: boolean;
  /** When true with avoidBackMoves, only expand steps whose demoMoves include B. */
  avoidBackOnlyOnBSteps?: boolean;
  initialHold?: StudentHold;
};

export function simulateWhiteCrossLessonOnStorageCube(
  storageCube: CubeState,
  maxLessonSteps = 120,
  options: SimulateWhiteCrossLessonOptions = {},
): SimulateWhiteCrossLessonResult {
  const result = simulateLessonOnStorageCube<WhiteCrossLessonStep>(
    storageCube,
    maxLessonSteps,
    {
      getStep: getWhiteCrossLessonStep,
      isComplete: isWhiteCrossComplete,
      avoidBackMoves: options.avoidBackMoves,
      avoidBackOnlyOnBSteps: options.avoidBackOnlyOnBSteps,
      initialHold: options.initialHold,
    },
  );
  return {
    lessonStepsSimulated: result.lessonStepsSimulated,
    crossComplete: result.complete,
    lastStepKind: result.lastStepKind,
    stuckNoDemo: result.stuckNoDemo,
    finalStudentHold: result.finalStudentHold,
    finalStorageCube: result.finalStorageCube,
  };
}
