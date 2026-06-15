import { useEffect, useMemo, useState } from 'react';
import type { CubeState } from '../../cube/cubeState';
import { cubeStateToCubeJsString } from '../../cube/cubeStateToFacelets';

/** Only show the preparing overlay if async planning is still running after this long (avoids flash on cache hits). */
export const PREPARING_OVERLAY_DELAY_MS = 200;

export type UseLessonStepOptions<TStep> = {
  getStepAsync: (studentFrame: CubeState) => Promise<TStep>;
  isComplete: (step: TStep | null) => boolean;
  countProgress?: (studentFrame: CubeState) => number;
  /** Invalidates the cached step when session-only state changes (e.g. corner hold index). */
  sessionKey?: string;
};

export function useLessonStep<TStep>(
  studentFrame: CubeState | null,
  options: UseLessonStepOptions<TStep>,
) {
  const frameKey = studentFrame ? cubeStateToCubeJsString(studentFrame) : '';
  const planningKey = options.sessionKey
    ? `${frameKey}|${options.sessionKey}`
    : frameKey;

  const [step, setStep] = useState<TStep | null>(null);
  const [stepReadyKey, setStepReadyKey] = useState('');
  const [stepEpoch, setStepEpoch] = useState(0);
  const [showPreparingOverlay, setShowPreparingOverlay] = useState(false);

  useEffect(() => {
    if (!studentFrame || !planningKey) {
      setStep(null);
      setStepReadyKey('');
      return;
    }

    let cancelled = false;
    setStepReadyKey('');

    void (async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      if (cancelled) return;
      const result = await options.getStepAsync(studentFrame);
      if (!cancelled) {
        setStep(result);
        setStepReadyKey(planningKey);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    studentFrame,
    planningKey,
    stepEpoch,
    options.getStepAsync,
    options.sessionKey,
  ]);

  const isStepPending = !studentFrame || planningKey !== stepReadyKey;
  const isLessonComplete = options.isComplete(step) && !isStepPending;

  useEffect(() => {
    if (!isStepPending) {
      setShowPreparingOverlay(false);
      return;
    }
    const timer = window.setTimeout(
      () => setShowPreparingOverlay(true),
      PREPARING_OVERLAY_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isStepPending]);

  const solvedSlots = useMemo(
    () =>
      studentFrame && options.countProgress
        ? options.countProgress(studentFrame)
        : 0,
    [studentFrame, options.countProgress],
  );

  const recomputeStep = () => setStepEpoch((n) => n + 1);

  return {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
  };
}
