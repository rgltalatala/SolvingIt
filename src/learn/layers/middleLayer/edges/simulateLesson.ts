import {
  applyMoves,
  cloneCubeState,
  type CubeState,
} from '../../../../cube/cubeState';
import {
  normalizeHoldToBlue,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import {
  getMiddleLayerEdgeLessonStep,
  getMiddleLayerEdgeLessonStepAsync,
} from './computeLessonStep';
import {
  edgeSlotSolved,
  isMiddleLayerEdgesComplete,
  slotIdForExpectedEdgeColors,
} from './edgeSlotModel';
import { MIDDLE_EDGE_SLOTS } from './types';
import type {
  MiddleEdgeSlotId,
  MiddleLayerEdgeLessonStepOptions,
  MiddleLayerEdgesLessonStep,
  SimulateMiddleLayerEdgesLessonResult,
} from './types';

function initialSolvedMiddleEdgeSlots(student: CubeState): MiddleEdgeSlotId[] {
  const normalized = normalizeHoldToBlue(student, 0);
  return MIDDLE_EDGE_SLOTS.filter((id) => edgeSlotSolved(normalized, id));
}

function lessonOptions(
  currentHoldIndex: CornerHoldIndex,
  solvedMiddleEdgeSlots: MiddleEdgeSlotId[],
): MiddleLayerEdgeLessonStepOptions {
  return { currentHoldIndex, solvedMiddleEdgeSlots };
}

function isMiddleLayerLessonComplete(
  student: CubeState,
  holdIndex: CornerHoldIndex,
): boolean {
  return isMiddleLayerEdgesComplete(student, holdIndex) && holdIndex === 0;
}

function advanceSessionAfterStep(
  step: MiddleLayerEdgesLessonStep,
  student: CubeState,
  currentHoldIndex: CornerHoldIndex,
  solvedMiddleEdgeSlots: MiddleEdgeSlotId[],
): CornerHoldIndex {
  if (step.kind === 'reorient-hold') {
    if (step.returnToInitialHold) return 0;
    if (step.targetHoldIndex !== undefined) {
      return step.targetHoldIndex as CornerHoldIndex;
    }
    return currentHoldIndex;
  }

  if (step.kind === 'solve-edge' && step.action === 'insert') {
    const slotId = slotIdForExpectedEdgeColors(
      student,
      step.edgeColors,
      currentHoldIndex,
    );
    if (slotId && !solvedMiddleEdgeSlots.includes(slotId)) {
      solvedMiddleEdgeSlots.push(slotId);
    }
  }

  return currentHoldIndex;
}

async function runMiddleLayerEdgesLessonSimulation(
  studentFrame: CubeState,
  maxLessonSteps: number,
  getStep: (
    student: CubeState,
    options: MiddleLayerEdgeLessonStepOptions,
  ) => MiddleLayerEdgesLessonStep | Promise<MiddleLayerEdgesLessonStep>,
): Promise<SimulateMiddleLayerEdgesLessonResult> {
  let currentHoldIndex: CornerHoldIndex = 0;
  let student = cloneCubeState(studentFrame);
  const solvedMiddleEdgeSlots = initialSolvedMiddleEdgeSlots(student);
  let lessonStepsSimulated = 0;
  let lastStepKind: MiddleLayerEdgesLessonStep['kind'] | undefined;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (isMiddleLayerLessonComplete(student, currentHoldIndex)) {
      return {
        lessonStepsSimulated,
        middleLayerComplete: true,
        lastStepKind: 'complete',
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
      };
    }

    const step = await getStep(
      student,
      lessonOptions(currentHoldIndex, solvedMiddleEdgeSlots),
    );
    lastStepKind = step.kind;

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        middleLayerComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
      };
    }

    if (step.kind === 'cross-corners-prerequisite') {
      return {
        lessonStepsSimulated,
        middleLayerComplete: false,
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: currentHoldIndex,
      };
    }

    if (!step.demoMoves?.length) {
      return {
        lessonStepsSimulated,
        middleLayerComplete: isMiddleLayerEdgesComplete(
          student,
          currentHoldIndex,
        ),
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: currentHoldIndex,
      };
    }

    student = applyMoves(student, step.demoMoves);
    currentHoldIndex = advanceSessionAfterStep(
      step,
      student,
      currentHoldIndex,
      solvedMiddleEdgeSlots,
    );
    lessonStepsSimulated += 1;
  }

  const middleLayerComplete = isMiddleLayerLessonComplete(
    student,
    currentHoldIndex,
  );
  return {
    lessonStepsSimulated,
    middleLayerComplete,
    lastStepKind,
    stuckNoDemo: !middleLayerComplete,
    finalHoldIndex: currentHoldIndex,
  };
}

/** Simulates the lesson on a student-frame cube (same frame as getMiddleLayerEdgeLessonStep). */
export function simulateMiddleLayerEdgesLessonOnStorageCube(
  studentFrame: CubeState,
  maxLessonSteps = 120,
): SimulateMiddleLayerEdgesLessonResult {
  return runMiddleLayerEdgesLessonSimulationSync(studentFrame, maxLessonSteps);
}

function runMiddleLayerEdgesLessonSimulationSync(
  studentFrame: CubeState,
  maxLessonSteps: number,
): SimulateMiddleLayerEdgesLessonResult {
  let currentHoldIndex: CornerHoldIndex = 0;
  let student = cloneCubeState(studentFrame);
  const solvedMiddleEdgeSlots = initialSolvedMiddleEdgeSlots(student);
  let lessonStepsSimulated = 0;
  let lastStepKind: MiddleLayerEdgesLessonStep['kind'] | undefined;

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (isMiddleLayerLessonComplete(student, currentHoldIndex)) {
      return {
        lessonStepsSimulated,
        middleLayerComplete: true,
        lastStepKind: 'complete',
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
      };
    }

    const step = getMiddleLayerEdgeLessonStep(
      student,
      lessonOptions(currentHoldIndex, solvedMiddleEdgeSlots),
    );
    lastStepKind = step.kind;

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        middleLayerComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
      };
    }

    if (step.kind === 'cross-corners-prerequisite') {
      return {
        lessonStepsSimulated,
        middleLayerComplete: false,
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: currentHoldIndex,
      };
    }

    if (!step.demoMoves?.length) {
      return {
        lessonStepsSimulated,
        middleLayerComplete: isMiddleLayerEdgesComplete(
          student,
          currentHoldIndex,
        ),
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: currentHoldIndex,
      };
    }

    student = applyMoves(student, step.demoMoves);
    currentHoldIndex = advanceSessionAfterStep(
      step,
      student,
      currentHoldIndex,
      solvedMiddleEdgeSlots,
    );
    lessonStepsSimulated += 1;
  }

  const middleLayerComplete = isMiddleLayerLessonComplete(
    student,
    currentHoldIndex,
  );
  return {
    lessonStepsSimulated,
    middleLayerComplete,
    lastStepKind,
    stuckNoDemo: !middleLayerComplete,
    finalHoldIndex: currentHoldIndex,
  };
}

export async function simulateMiddleLayerEdgesLessonOnStorageCubeAsync(
  studentFrame: CubeState,
  maxLessonSteps = 120,
): Promise<SimulateMiddleLayerEdgesLessonResult> {
  return runMiddleLayerEdgesLessonSimulation(
    studentFrame,
    maxLessonSteps,
    (student, options) => getMiddleLayerEdgeLessonStepAsync(student, options),
  );
}
