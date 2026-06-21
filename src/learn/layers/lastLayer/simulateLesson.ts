import {
  applyMoves,
  cloneCubeState,
  type CubeState,
} from '../../../cube/cubeState';
import type { CornerHoldIndex } from '../bottomLayer/corners/cornerHold';
import {
  getLastLayerLessonStep,
  getLastLayerLessonStepAsync,
} from './computeLessonStep';
import { isLastLayerComplete } from './permuteCorners/uLayerCornerPermuteModel';
import type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  PermuteCornersZeroFlowStep,
  SimulateLastLayerLessonResult,
} from './types';

type SimulationSession = {
  currentHoldIndex: CornerHoldIndex;
  permuteCornersZeroFlowStep?: PermuteCornersZeroFlowStep;
  inOrientCornersPhase?: boolean;
};

function markOrientCornersPhase(
  step: LastLayerLessonStep,
  session: SimulationSession,
): void {
  if (
    step.kind === 'orient-corners' ||
    (step.kind === 'align-u' && step.subLesson === 'orient-corners')
  ) {
    session.inOrientCornersPhase = true;
  }
}

function advanceHoldAfterStep(
  step: LastLayerLessonStep,
  currentHoldIndex: CornerHoldIndex,
): CornerHoldIndex {
  if (step.kind === 'reorient-hold') {
    if (step.returnToInitialHold) return 0;
    if (step.targetHoldIndex !== undefined) {
      return step.targetHoldIndex as CornerHoldIndex;
    }
  }
  return currentHoldIndex;
}

function advanceZeroFlowAfterStep(
  step: LastLayerLessonStep,
  permuteCornersZeroFlowStep: PermuteCornersZeroFlowStep | undefined,
): PermuteCornersZeroFlowStep | undefined {
  if (step.kind === 'permute-corners') {
    if (step.permuteCase === 'zero-flow-first') return 1;
    if (step.permuteCase === 'zero-flow-second') return undefined;
  }
  if (step.kind === 'reorient-hold' && step.zeroFlowStep === 1) {
    return 2;
  }
  return permuteCornersZeroFlowStep;
}

function isLastLayerLessonComplete(
  student: CubeState,
  holdIndex: CornerHoldIndex,
): boolean {
  return isLastLayerComplete(student) && holdIndex === 0;
}

function applyStepToSimulation(
  step: LastLayerLessonStep,
  student: CubeState,
  session: SimulationSession,
): { student: CubeState; session: SimulationSession } {
  student = applyMoves(student, step.demoMoves);
  return {
    student,
    session: {
      currentHoldIndex: advanceHoldAfterStep(step, session.currentHoldIndex),
      permuteCornersZeroFlowStep: advanceZeroFlowAfterStep(
        step,
        session.permuteCornersZeroFlowStep,
      ),
      inOrientCornersPhase: session.inOrientCornersPhase,
    },
  };
}

function simulateLoop(
  studentFrame: CubeState,
  maxLessonSteps: number,
  getStep: (
    student: CubeState,
    options: LastLayerLessonStepOptions,
  ) => LastLayerLessonStep,
): SimulateLastLayerLessonResult {
  let session: SimulationSession = { currentHoldIndex: 0 };
  let student = cloneCubeState(studentFrame);
  let lessonStepsSimulated = 0;
  let lastStepKind: LastLayerLessonStep['kind'] | undefined;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (isLastLayerLessonComplete(student, session.currentHoldIndex)) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind: 'complete',
        stuckNoDemo: false,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    const step = getStep(student, session);
    lastStepKind = step.kind;
    markOrientCornersPhase(step, session);

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    if (step.kind === 'prerequisite') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: false,
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    if (!step.demoMoves?.length) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: isLastLayerComplete(student),
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    const applied = applyStepToSimulation(step, student, session);
    student = applied.student;
    session = applied.session;
    lessonStepsSimulated += 1;
  }

  const lastLayerComplete = isLastLayerLessonComplete(
    student,
    session.currentHoldIndex,
  );
  return {
    lessonStepsSimulated,
    lastLayerComplete,
    lastStepKind,
    stuckNoDemo: !lastLayerComplete,
    finalHoldIndex: session.currentHoldIndex,
  };
}

/** Simulates the lesson on a student-frame cube (same frame as getLastLayerLessonStep). */
export function simulateLastLayerLessonOnStorageCube(
  studentFrame: CubeState,
  maxLessonSteps = 48,
): SimulateLastLayerLessonResult {
  return simulateLoop(studentFrame, maxLessonSteps, (student, options) =>
    getLastLayerLessonStep(student, options),
  );
}

export async function simulateLastLayerLessonOnStorageCubeAsync(
  studentFrame: CubeState,
  maxLessonSteps = 48,
): Promise<SimulateLastLayerLessonResult> {
  let session: SimulationSession = { currentHoldIndex: 0 };
  let student = cloneCubeState(studentFrame);
  let lessonStepsSimulated = 0;
  let lastStepKind: LastLayerLessonStep['kind'] | undefined;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (isLastLayerLessonComplete(student, session.currentHoldIndex)) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind: 'complete',
        stuckNoDemo: false,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    const step = await getLastLayerLessonStepAsync(student, session);
    lastStepKind = step.kind;
    markOrientCornersPhase(step, session);

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    if (step.kind === 'prerequisite') {
      return {
        lessonStepsSimulated,
        lastLayerComplete: false,
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    if (!step.demoMoves?.length) {
      return {
        lessonStepsSimulated,
        lastLayerComplete: isLastLayerComplete(student),
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: session.currentHoldIndex,
      };
    }

    const applied = applyStepToSimulation(step, student, session);
    student = applied.student;
    session = applied.session;
    lessonStepsSimulated += 1;
  }

  const lastLayerComplete = isLastLayerLessonComplete(
    student,
    session.currentHoldIndex,
  );
  return {
    lessonStepsSimulated,
    lastLayerComplete,
    lastStepKind,
    stuckNoDemo: !lastLayerComplete,
    finalHoldIndex: session.currentHoldIndex,
  };
}
