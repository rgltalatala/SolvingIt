import type { CubeState } from '../../../../cube/cubeState';
import { whiteCrossSteps } from '../../../../content/whiteCross';
import { normalizeLessonDemoMovesInStep } from '../../../lessonCore';
import { isWhiteCrossComplete } from './crossSlotModel';
import {
  planTargetEdgeStep,
  planTargetEdgeStepAsync,
  stuckPartnerStep,
} from './planTargetEdgeStep';
import type { WhiteCrossLessonStep, WhiteCrossLessonStepOptions } from './types';

const WHITE_CROSS_COMPLETE_BODY = whiteCrossSteps.complete.body;

function whiteCrossCompleteStep(): WhiteCrossLessonStep {
  return {
    kind: 'complete',
    title: whiteCrossSteps.complete.title,
    body: WHITE_CROSS_COMPLETE_BODY,
  };
}

function strategyIntroStep(): WhiteCrossLessonStep {
  return {
    kind: 'intro',
    title: whiteCrossSteps.intro.title,
    body: whiteCrossSteps.intro.body,
  };
}

function computeWhiteCrossLessonStepSync(
  studentState: CubeState,
  options?: WhiteCrossLessonStepOptions,
): WhiteCrossLessonStep {
  if (isWhiteCrossComplete(studentState)) {
    return whiteCrossCompleteStep();
  }

  if (!options?.hasSeenStrategyIntro) {
    return strategyIntroStep();
  }

  return planTargetEdgeStep(studentState) ?? stuckPartnerStep(studentState);
}

async function computeWhiteCrossLessonStepAsync(
  studentState: CubeState,
  options?: WhiteCrossLessonStepOptions,
): Promise<WhiteCrossLessonStep> {
  if (isWhiteCrossComplete(studentState)) {
    return whiteCrossCompleteStep();
  }

  if (!options?.hasSeenStrategyIntro) {
    return strategyIntroStep();
  }

  return (
    (await planTargetEdgeStepAsync(studentState)) ??
    stuckPartnerStep(studentState)
  );
}

export function getWhiteCrossLessonStep(
  studentState: CubeState,
  options?: WhiteCrossLessonStepOptions,
): WhiteCrossLessonStep {
  return normalizeLessonDemoMovesInStep(
    computeWhiteCrossLessonStepSync(studentState, options),
  );
}

/** UI path: BFS yields to the main thread so apply/loading stay responsive. */
export async function getWhiteCrossLessonStepAsync(
  studentState: CubeState,
  options?: WhiteCrossLessonStepOptions,
): Promise<WhiteCrossLessonStep> {
  return normalizeLessonDemoMovesInStep(
    await computeWhiteCrossLessonStepAsync(studentState, options),
  );
}
