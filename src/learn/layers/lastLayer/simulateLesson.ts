import {
  applyMoves,
  cloneCubeState,
  type CubeState,
} from '../../../cube/cubeState';
import type { CornerHoldIndex } from '../bottomLayer/corners/cornerHold';
import {
  getLastLayerLessonStep,
} from './computeLessonStep';
import { markLastLayerIntroSeen } from './introSteps';
import { isLastLayerComplete } from './permuteCorners/uLayerCornerPermuteModel';
import type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  SeenLastLayerIntros,
  SimulateLastLayerLessonResult,
} from './types';

type SimulationSession = LastLayerLessonStepOptions & {
  currentHoldIndex: CornerHoldIndex;
  seenIntros: SeenLastLayerIntros;
};

function markIntroSeen(
  step: LastLayerLessonStep,
  session: SimulationSession,
): SimulationSession {
  if (step.kind !== 'intro') return session;
  return {
    ...session,
    seenIntros: markLastLayerIntroSeen(session.seenIntros, step.introId),
  };
}

function markOrientEdgesAcknowledged(
  session: SimulationSession,
): SimulationSession {
  return { ...session, hasAcknowledgedOrientEdgesComplete: true };
}

function isContinueOnlyStep(step: LastLayerLessonStep): boolean {
  return step.kind === 'intro' || step.kind === 'orient-edges-already-complete';
}

function advanceContinueOnlyStep(
  step: LastLayerLessonStep,
  session: SimulationSession,
): SimulationSession {
  if (step.kind === 'intro') return markIntroSeen(step, session);
  if (step.kind === 'orient-edges-already-complete') {
    return markOrientEdgesAcknowledged(session);
  }
  return session;
}

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
  if (!('demoMoves' in step) || !step.demoMoves?.length) {
    throw new Error(`applyStepToSimulation: step ${step.kind} has no demoMoves`);
  }
  student = applyMoves(student, step.demoMoves);
  return {
    student,
    session: {
      ...session,
      currentHoldIndex: advanceHoldAfterStep(step, session.currentHoldIndex),
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
  let session: SimulationSession = { currentHoldIndex: 0, seenIntros: {} };
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

    if (isContinueOnlyStep(step)) {
      session = advanceContinueOnlyStep(step, session);
      continue;
    }

    if (
      step.kind === 'reorient-hold' &&
      (!('demoMoves' in step) || !step.demoMoves?.length) &&
      step.targetHoldIndex !== undefined &&
      session.currentHoldIndex !== step.targetHoldIndex
    ) {
      session = {
        ...session,
        currentHoldIndex: step.targetHoldIndex as CornerHoldIndex,
      };
      continue;
    }

    if (!('demoMoves' in step) || !step.demoMoves?.length) {
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
