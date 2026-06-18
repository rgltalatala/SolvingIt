import {
  applyMovesInStudentHold,
  cloneCubeState,
  cubeStateToStudentFrame,
  type CubeState,
} from '../../../../cube/cubeState';
import { getLessonExecutionMoves, noneHold } from '../../../studentHold';
import {
  normalizeHoldToBlue,
  targetHoldIndex,
  type CornerHoldIndex,
} from './cornerHold';
import {
  getWhiteCornerLessonStep,
  getWhiteCornerLessonStepAsync,
} from './computeLessonStep';
import { resolveLessonStorageDemo } from './frdViewDemoBuild';
import {
  cornerSlotSolved,
  isWhiteCornersComplete,
} from './cornerSlotModel';
import type {
  CornerSlotId,
  SimulateWhiteCornersLessonResult,
  WhiteCornerLessonStepOptions,
  WhiteCornersLessonStep,
} from './types';
import { CORNER_ORDER } from './types';

function applyStepDemo(
  storage: CubeState,
  demoMoves: readonly string[],
): CubeState {
  const { moves } = getLessonExecutionMoves([...demoMoves], false, noneHold());
  return applyMovesInStudentHold(storage, moves);
}

async function runWhiteCornersLessonSimulation(
  storageCube: CubeState,
  maxLessonSteps: number,
  getStep: (
    student: CubeState,
    options: WhiteCornerLessonStepOptions,
  ) => WhiteCornersLessonStep | Promise<WhiteCornersLessonStep>,
): Promise<SimulateWhiteCornersLessonResult> {
  let currentHoldIndex: CornerHoldIndex = 0;
  let storage = cloneCubeState(storageCube);
  let student = cubeStateToStudentFrame(storage);
  const solvedCornerIds: CornerSlotId[] = CORNER_ORDER.filter((id) =>
    cornerSlotSolved(normalizeHoldToBlue(student, 0), id),
  );
  let lessonStepsSimulated = 0;
  let lastStepKind: WhiteCornersLessonStep['kind'] | undefined;

  const lessonOptions = (): WhiteCornerLessonStepOptions => ({
    currentHoldIndex,
    solvedCornerIds,
  });

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (
      isWhiteCornersComplete(student, currentHoldIndex, solvedCornerIds) &&
      currentHoldIndex === 0
    ) {
      return {
        lessonStepsSimulated,
        cornersComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
        finalStorageCube: storage,
      };
    }

    const step = await getStep(student, lessonOptions());
    lastStepKind = step.kind;

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        cornersComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
        finalStorageCube: storage,
      };
    }

    if (step.kind === 'cross-prerequisite') {
      return {
        lessonStepsSimulated,
        cornersComplete: false,
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: currentHoldIndex,
        finalStorageCube: storage,
      };
    }

    if (step.kind === 'reorient-hold') {
      if (!step.demoMoves.length) {
        return {
          lessonStepsSimulated,
          cornersComplete: isWhiteCornersComplete(
            student,
            currentHoldIndex,
            solvedCornerIds,
          ),
          lastStepKind,
          stuckNoDemo: true,
          finalHoldIndex: currentHoldIndex,
          finalStorageCube: storage,
        };
      }
      storage = applyStepDemo(storage, step.demoMoves);
      student = cubeStateToStudentFrame(storage);
      if (step.returnToInitialHold) {
        currentHoldIndex = 0;
      } else if (step.targetCornerId) {
        currentHoldIndex = targetHoldIndex(step.targetCornerId);
      }
      lessonStepsSimulated += 1;
      continue;
    }

    if (step.kind === 'solve-corner') {
      if (!step.demoMoves?.length) {
        return {
          lessonStepsSimulated,
          cornersComplete: isWhiteCornersComplete(
            student,
            currentHoldIndex,
            solvedCornerIds,
          ),
          lastStepKind,
          stuckNoDemo: true,
          finalHoldIndex: currentHoldIndex,
          finalStorageCube: storage,
        };
      }
      const applyMovesList = resolveLessonStorageDemo(
        student,
        step.cornerId,
        currentHoldIndex,
        [...step.demoMoves],
        solvedCornerIds,
      ) ?? [...step.demoMoves];
      storage = applyStepDemo(storage, applyMovesList);
      student = cubeStateToStudentFrame(storage);
      if (!solvedCornerIds.includes(step.cornerId)) {
        solvedCornerIds.push(step.cornerId);
      }
      lessonStepsSimulated += 1;
      continue;
    }
  }

  return {
    lessonStepsSimulated,
    cornersComplete:
      isWhiteCornersComplete(student, currentHoldIndex, solvedCornerIds) &&
      currentHoldIndex === 0,
    lastStepKind,
    stuckNoDemo: !isWhiteCornersComplete(
      student,
      currentHoldIndex,
      solvedCornerIds,
    ),
    finalHoldIndex: currentHoldIndex,
    finalStorageCube: storage,
  };
}

export function simulateWhiteCornersLessonOnStorageCube(
  storageCube: CubeState,
  maxLessonSteps = 120,
): SimulateWhiteCornersLessonResult {
  return runWhiteCornersLessonSimulationSync(storageCube, maxLessonSteps);
}

function runWhiteCornersLessonSimulationSync(
  storageCube: CubeState,
  maxLessonSteps: number,
): SimulateWhiteCornersLessonResult {
  let currentHoldIndex: CornerHoldIndex = 0;
  let storage = cloneCubeState(storageCube);
  let student = cubeStateToStudentFrame(storage);
  const solvedCornerIds: CornerSlotId[] = CORNER_ORDER.filter((id) =>
    cornerSlotSolved(normalizeHoldToBlue(student, 0), id),
  );
  let lessonStepsSimulated = 0;
  let lastStepKind: WhiteCornersLessonStep['kind'] | undefined;

  const lessonOptions = (): WhiteCornerLessonStepOptions => ({
    currentHoldIndex,
    solvedCornerIds,
  });

  for (let i = 0; i < maxLessonSteps; i += 1) {
    if (
      isWhiteCornersComplete(student, currentHoldIndex, solvedCornerIds) &&
      currentHoldIndex === 0
    ) {
      return {
        lessonStepsSimulated,
        cornersComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
        finalStorageCube: storage,
      };
    }

    const step = getWhiteCornerLessonStep(student, lessonOptions());
    lastStepKind = step.kind;

    if (step.kind === 'complete') {
      return {
        lessonStepsSimulated,
        cornersComplete: true,
        lastStepKind,
        stuckNoDemo: false,
        finalHoldIndex: currentHoldIndex,
        finalStorageCube: storage,
      };
    }

    if (step.kind === 'cross-prerequisite') {
      return {
        lessonStepsSimulated,
        cornersComplete: false,
        lastStepKind,
        stuckNoDemo: true,
        finalHoldIndex: currentHoldIndex,
        finalStorageCube: storage,
      };
    }

    if (step.kind === 'reorient-hold') {
      if (!step.demoMoves.length) {
        return {
          lessonStepsSimulated,
          cornersComplete: isWhiteCornersComplete(
            student,
            currentHoldIndex,
            solvedCornerIds,
          ),
          lastStepKind,
          stuckNoDemo: true,
          finalHoldIndex: currentHoldIndex,
          finalStorageCube: storage,
        };
      }
      storage = applyStepDemo(storage, step.demoMoves);
      student = cubeStateToStudentFrame(storage);
      if (step.returnToInitialHold) {
        currentHoldIndex = 0;
      } else if (step.targetCornerId) {
        currentHoldIndex = targetHoldIndex(step.targetCornerId);
      }
      lessonStepsSimulated += 1;
      continue;
    }

    if (step.kind === 'solve-corner') {
      if (!step.demoMoves?.length) {
        return {
          lessonStepsSimulated,
          cornersComplete: isWhiteCornersComplete(
            student,
            currentHoldIndex,
            solvedCornerIds,
          ),
          lastStepKind,
          stuckNoDemo: true,
          finalHoldIndex: currentHoldIndex,
          finalStorageCube: storage,
        };
      }
      const applyMovesList = resolveLessonStorageDemo(
        student,
        step.cornerId,
        currentHoldIndex,
        [...step.demoMoves],
        solvedCornerIds,
      ) ?? [...step.demoMoves];
      storage = applyStepDemo(storage, applyMovesList);
      student = cubeStateToStudentFrame(storage);
      if (!solvedCornerIds.includes(step.cornerId)) {
        solvedCornerIds.push(step.cornerId);
      }
      lessonStepsSimulated += 1;
      continue;
    }
  }

  return {
    lessonStepsSimulated,
    cornersComplete:
      isWhiteCornersComplete(student, currentHoldIndex, solvedCornerIds) &&
      currentHoldIndex === 0,
    lastStepKind,
    stuckNoDemo: !isWhiteCornersComplete(
      student,
      currentHoldIndex,
      solvedCornerIds,
    ),
    finalHoldIndex: currentHoldIndex,
    finalStorageCube: storage,
  };
}

export async function simulateWhiteCornersLessonOnStorageCubeAsync(
  storageCube: CubeState,
  maxLessonSteps = 120,
): Promise<SimulateWhiteCornersLessonResult> {
  return runWhiteCornersLessonSimulation(
    storageCube,
    maxLessonSteps,
    (student, options) => getWhiteCornerLessonStepAsync(student, options),
  );
}
