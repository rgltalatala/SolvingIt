import {
  applyMovesInStudentHold,
  cloneCubeState,
  cubeStateToStudentFrame,
} from '../../cube/cubeState';
import type { CubeState, Move } from '../../cube/cubeState';
import {
  getLessonExecutionMoves,
  noneHold,
  type StudentHold,
} from '../studentHold';
import { isBackFaceMove } from '../studentHold/backFace';

export type SimulateLessonStep = {
  kind: string;
  demoMoves?: Move[];
};

export type SimulateLessonOnStorageCubeOptions<
  TStep extends SimulateLessonStep,
> = {
  getStep: (student: CubeState) => TStep;
  isComplete: (student: CubeState) => boolean;
  /** When a step has no demo moves, return continue to skip it or stuck to end simulation. */
  onStepWithoutDemo?: (step: TStep) => 'continue' | 'stuck';
  /** When true, expand steps that use B with y2 + translated face turns. */
  avoidBackMoves?: boolean;
  /** When true with avoidBackMoves, only expand steps whose demoMoves include B. */
  avoidBackOnlyOnBSteps?: boolean;
  initialHold?: StudentHold;
};

export type SimulateLessonOnStorageCubeResult<
  TStep extends SimulateLessonStep,
> = {
  lessonStepsSimulated: number;
  complete: boolean;
  lastStepKind?: TStep['kind'];
  stuckNoDemo: boolean;
  finalStudentHold?: StudentHold;
  finalStorageCube: CubeState;
};

export function simulateLessonOnStorageCube<TStep extends SimulateLessonStep>(
  storageCube: CubeState,
  maxLessonSteps: number,
  options: SimulateLessonOnStorageCubeOptions<TStep>,
): SimulateLessonOnStorageCubeResult<TStep> {
  const avoidBackMoves = options.avoidBackMoves ?? false;
  const avoidBackOnlyOnBSteps = options.avoidBackOnlyOnBSteps ?? true;
  let studentHold = options.initialHold ?? noneHold();

  let storage = cloneCubeState(storageCube);
  let student = cubeStateToStudentFrame(storage);
  let lessonStepsSimulated = 0;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (options.isComplete(student)) {
      return {
        lessonStepsSimulated,
        complete: true,
        stuckNoDemo: false,
        finalStudentHold: studentHold,
        finalStorageCube: storage,
      };
    }

    const step = options.getStep(student);

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        complete: true,
        stuckNoDemo: false,
        finalStudentHold: studentHold,
        finalStorageCube: storage,
      };
    }

    const demoMoves =
      'demoMoves' in step && step.demoMoves?.length ? step.demoMoves : null;
    if (!demoMoves) {
      if (options.onStepWithoutDemo?.(step) === 'continue') {
        continue;
      }
      return {
        lessonStepsSimulated,
        complete: options.isComplete(student),
        lastStepKind: step.kind,
        stuckNoDemo: true,
        finalStudentHold: studentHold,
        finalStorageCube: storage,
      };
    }

    const useAvoidBack =
      avoidBackMoves &&
      (!avoidBackOnlyOnBSteps || demoMoves.some(isBackFaceMove));
    const { moves } = getLessonExecutionMoves(
      demoMoves,
      useAvoidBack,
      noneHold(),
    );
    storage = applyMovesInStudentHold(storage, moves);
    studentHold = noneHold();
    student = cubeStateToStudentFrame(storage);
    lessonStepsSimulated += 1;
  }

  student = cubeStateToStudentFrame(storage);
  return {
    lessonStepsSimulated,
    complete: options.isComplete(student),
    stuckNoDemo: !options.isComplete(student),
    finalStudentHold: studentHold,
    finalStorageCube: storage,
  };
}
