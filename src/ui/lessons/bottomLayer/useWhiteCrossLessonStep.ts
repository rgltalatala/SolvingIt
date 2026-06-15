import { useCallback } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import {
  countSolvedCrossSlots,
  getWhiteCrossLessonStepAsync,
} from '../../../learn/layers/bottomLayer/cross';
import type { WhiteCrossLessonStep } from '../../../learn/layers/bottomLayer/cross/types';
import { useLessonStep } from '../useLessonStep';

export { PREPARING_OVERLAY_DELAY_MS } from '../useLessonStep';

export function useWhiteCrossLessonStep(studentFrame: CubeState | null) {
  const getStepAsync = useCallback(
    (frame: CubeState) => getWhiteCrossLessonStepAsync(frame),
    [],
  );
  const isComplete = useCallback(
    (step: WhiteCrossLessonStep | null) => step?.kind === 'complete',
    [],
  );
  const countProgress = useCallback(
    (frame: CubeState) => countSolvedCrossSlots(frame),
    [],
  );

  const result = useLessonStep(studentFrame, {
    getStepAsync,
    isComplete,
    countProgress,
  });

  return result;
}
