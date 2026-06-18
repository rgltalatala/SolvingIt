import {
  applyMoves,
  cloneCubeState,
  type CubeState,
} from '../../../cube/cubeState';
import {
  getLastLayerLessonStep,
  getLastLayerLessonStepAsync,
} from './computeLessonStep';
import { isYellowCrossComplete } from './orientEdges/uLayerEdgeModel';
import type {
  LastLayerLessonStep,
  SimulateLastLayerLessonResult,
} from './types';

async function runLastLayerLessonSimulation(
  studentFrame: CubeState,
  maxLessonSteps: number,
  getStep: (
    student: CubeState,
  ) => LastLayerLessonStep | Promise<LastLayerLessonStep>,
): Promise<SimulateLastLayerLessonResult> {
  let student = cloneCubeState(studentFrame);
  let lessonStepsSimulated = 0;
  let lastStepKind: LastLayerLessonStep['kind'] | undefined;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (isYellowCrossComplete(student)) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind: 'complete',
        stuckNoDemo: false,
      };
    }

    const step = await getStep(student);
    lastStepKind = step.kind;

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind,
        stuckNoDemo: false,
      };
    }

    if (step.kind === 'prerequisite') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: false,
        lastStepKind,
        stuckNoDemo: true,
      };
    }

    if (!step.demoMoves?.length) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: isYellowCrossComplete(student),
        lastStepKind,
        stuckNoDemo: true,
      };
    }

    student = applyMoves(student, step.demoMoves);
    lessonStepsSimulated += 1;
  }

  const lastLayerComplete = isYellowCrossComplete(student);
  return {
    lessonStepsSimulated,
    lastLayerComplete,
    lastStepKind,
    stuckNoDemo: !lastLayerComplete,
  };
}

export function simulateLastLayerLessonOnStorageCube(
  studentFrame: CubeState,
  maxLessonSteps = 32,
): SimulateLastLayerLessonResult {
  let student = cloneCubeState(studentFrame);
  let lessonStepsSimulated = 0;
  let lastStepKind: LastLayerLessonStep['kind'] | undefined;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (isYellowCrossComplete(student)) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind: 'complete',
        stuckNoDemo: false,
      };
    }

    const step = getLastLayerLessonStep(student);
    lastStepKind = step.kind;

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind,
        stuckNoDemo: false,
      };
    }

    if (step.kind === 'prerequisite') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: false,
        lastStepKind,
        stuckNoDemo: true,
      };
    }

    if (!step.demoMoves?.length) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: isYellowCrossComplete(student),
        lastStepKind,
        stuckNoDemo: true,
      };
    }

    student = applyMoves(student, step.demoMoves);
    lessonStepsSimulated += 1;
  }

  const lastLayerComplete = isYellowCrossComplete(student);
  return {
    lessonStepsSimulated,
    lastLayerComplete,
    stuckNoDemo: !lastLayerComplete,
    lastStepKind,
  };
}

export async function simulateLastLayerLessonOnStorageCubeAsync(
  studentFrame: CubeState,
  maxLessonSteps = 32,
): Promise<SimulateLastLayerLessonResult> {
  return runLastLayerLessonSimulation(
    studentFrame,
    maxLessonSteps,
    (student) => getLastLayerLessonStepAsync(student),
  );
}
