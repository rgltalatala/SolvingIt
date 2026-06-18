import { useCallback } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import {
  countYellowEdgesOnU,
  getLastLayerLessonStepAsync,
} from '../../../learn/layers/lastLayer';
import type { LastLayerLessonStep } from '../../../learn/layers/lastLayer/types';
import { useLessonStep } from '../useLessonStep';

export function useLastLayerLessonStep(
  studentFrame: CubeState | null,
  options?: { resetKey?: string },
) {
  const getStepAsync = useCallback(
    (frame: CubeState) => getLastLayerLessonStepAsync(frame),
    [],
  );

  const isComplete = useCallback(
    (step: LastLayerLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback(
    (frame: CubeState) => countYellowEdgesOnU(frame),
    [],
  );

  const result = useLessonStep(studentFrame, {
    getStepAsync,
    isComplete,
    countProgress,
    sessionKey: options?.resetKey,
  });

  const advanceAfterStep = useCallback(
    (_appliedStep: LastLayerLessonStep, _frame: CubeState) => {},
    [],
  );

  return {
    ...result,
    advanceAfterStep,
  };
}
