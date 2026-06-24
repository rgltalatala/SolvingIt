import { useCallback, useEffect, useRef, useState } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import {
  countSolvedCrossSlots,
  getWhiteCrossLessonStepAsync,
} from '../../../learn/layers/bottomLayer/cross';
import type { WhiteCrossLessonStep } from '../../../learn/layers/bottomLayer/cross/types';
import { useLessonStep } from '../useLessonStep';

export { PREPARING_OVERLAY_DELAY_MS } from '../useLessonStep';

export function useWhiteCrossLessonStep(
  studentFrame: CubeState | null,
  options?: { resetKey?: string },
) {
  const [hasSeenStrategyIntro, setHasSeenStrategyIntro] = useState(false);
  const hasSeenStrategyIntroRef = useRef(false);
  const lastResetKey = useRef<string | null>(null);

  const resetStrategyIntro = useCallback(() => {
    hasSeenStrategyIntroRef.current = false;
    setHasSeenStrategyIntro(false);
  }, []);

  useEffect(() => {
    if (!studentFrame || options?.resetKey === undefined) return;
    if (lastResetKey.current === options.resetKey) return;
    lastResetKey.current = options.resetKey;
    resetStrategyIntro();
  }, [studentFrame, options?.resetKey, resetStrategyIntro]);

  const sessionKey = String(hasSeenStrategyIntro);

  const getStepAsync = useCallback(async (frame: CubeState) => {
    return getWhiteCrossLessonStepAsync(frame, {
      hasSeenStrategyIntro: hasSeenStrategyIntroRef.current,
    });
  }, []);

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
    sessionKey,
  });

  const advanceAfterStep = useCallback((appliedStep: WhiteCrossLessonStep) => {
    if (appliedStep.kind === 'intro') {
      hasSeenStrategyIntroRef.current = true;
      setHasSeenStrategyIntro(true);
    }
  }, []);

  return {
    ...result,
    hasSeenStrategyIntro,
    advanceAfterStep,
    resetStrategyIntro,
  };
}
