import { useCallback, useEffect, useRef, useState } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import { cubeStateToStudentFrame } from '../../../cube/cubeState';
import {
  CORNER_ORDER,
  countSolvedCornerSlots,
  cornerSlotSolved,
  getWhiteCornerLessonStepAsync,
  normalizeHoldToBlue,
  targetHoldIndex,
  type CornerHoldIndex,
  type CornerSlotId,
  type WhiteCornersLessonStep,
} from '../../../learn/layers/bottomLayer/corners';
import { useCubeStore } from '../../../store/cubeStore';
import { useLessonStep } from '../useLessonStep';

type CornerSessionUndoEntry =
  | { kind: 'reorient'; previousHoldIndex: CornerHoldIndex }
  | { kind: 'solve'; previousSolvedCornerIds: CornerSlotId[] };

type CornerSession = {
  currentHoldIndex: CornerHoldIndex;
  solvedCornerIds: CornerSlotId[];
  hasSeenStrategyIntro: boolean;
};

function initialSolvedCornerIds(studentFrame: CubeState): CornerSlotId[] {
  const normalized = normalizeHoldToBlue(studentFrame, 0);
  return CORNER_ORDER.filter((id) => cornerSlotSolved(normalized, id));
}

function emptyCornerSession(): CornerSession {
  return {
    currentHoldIndex: 0,
    solvedCornerIds: [],
    hasSeenStrategyIntro: false,
  };
}

export function useWhiteCornerLessonStep(
  studentFrame: CubeState | null,
  options?: { resetKey?: string },
) {
  const [currentHoldIndex, setCurrentHoldIndex] = useState<CornerHoldIndex>(0);
  const [solvedCornerIds, setSolvedCornerIds] = useState<CornerSlotId[]>([]);
  const [hasSeenStrategyIntro, setHasSeenStrategyIntro] = useState(false);
  const [sessionUndoStack, setSessionUndoStack] = useState<
    CornerSessionUndoEntry[]
  >([]);
  const lastResetKey = useRef<string | null>(null);

  /** Authoritative session for async planning; updated synchronously before cube apply. */
  const sessionRef = useRef<CornerSession>(emptyCornerSession());

  const applyCornerSession = useCallback((session: CornerSession) => {
    sessionRef.current = session;
    setCurrentHoldIndex(session.currentHoldIndex);
    setSolvedCornerIds(session.solvedCornerIds);
    setHasSeenStrategyIntro(session.hasSeenStrategyIntro);
  }, []);

  const resetCornerSession = useCallback(
    (frame: CubeState) => {
      const initial = initialSolvedCornerIds(frame);
      applyCornerSession({
        currentHoldIndex: 0,
        solvedCornerIds: initial,
        hasSeenStrategyIntro: false,
      });
      setSessionUndoStack([]);
    },
    [applyCornerSession],
  );

  useEffect(() => {
    if (!studentFrame || options?.resetKey === undefined) return;
    if (lastResetKey.current === options.resetKey) return;
    lastResetKey.current = options.resetKey;
    resetCornerSession(studentFrame);
  }, [studentFrame, options?.resetKey, resetCornerSession]);

  const sessionKey = `${currentHoldIndex}:${solvedCornerIds.join(',')}:${hasSeenStrategyIntro}`;

  const getStepAsync = useCallback(async (_frame: CubeState) => {
    const cube = useCubeStore.getState().cubeState;
    const frame = cube ? cubeStateToStudentFrame(cube) : _frame;
    const session = sessionRef.current;
    return getWhiteCornerLessonStepAsync(frame, {
      ...session,
    });
  }, []);

  const isComplete = useCallback(
    (step: WhiteCornersLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback(
    (frame: CubeState) =>
      countSolvedCornerSlots(
        frame,
        sessionRef.current.currentHoldIndex,
        sessionRef.current.solvedCornerIds,
      ),
    [],
  );

  const {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
  } = useLessonStep(studentFrame, {
    getStepAsync,
    isComplete,
    countProgress,
    sessionKey,
  });

  const advanceAfterStep = useCallback(
    (appliedStep: WhiteCornersLessonStep) => {
      const session = sessionRef.current;
      if (appliedStep.kind === 'intro') {
        applyCornerSession({
          ...session,
          hasSeenStrategyIntro: true,
        });
        return;
      }

      if (appliedStep.kind === 'reorient-hold') {
        setSessionUndoStack((stack) => [
          ...stack,
          { kind: 'reorient', previousHoldIndex: session.currentHoldIndex },
        ]);
        const nextHold = (
          appliedStep.returnToInitialHold
            ? 0
            : appliedStep.targetCornerId
              ? targetHoldIndex(appliedStep.targetCornerId)
              : session.currentHoldIndex
        ) as CornerHoldIndex;
        applyCornerSession({
          ...session,
          currentHoldIndex: nextHold,
        });
        return;
      }

      if (appliedStep.kind === 'solve-corner') {
        setSessionUndoStack((stack) => [
          ...stack,
          { kind: 'solve', previousSolvedCornerIds: session.solvedCornerIds },
        ]);
        const nextIds = session.solvedCornerIds.includes(appliedStep.cornerId)
          ? session.solvedCornerIds
          : [...session.solvedCornerIds, appliedStep.cornerId];
        applyCornerSession({
          currentHoldIndex: session.currentHoldIndex,
          solvedCornerIds: nextIds,
          hasSeenStrategyIntro: session.hasSeenStrategyIntro,
        });
      }
    },
    [applyCornerSession],
  );

  const undoCornerSessionStep = useCallback((): 'reorient' | 'solve' | null => {
    const last = sessionUndoStack[sessionUndoStack.length - 1];
    if (!last) return null;
    setSessionUndoStack((stack) => stack.slice(0, -1));
    if (last.kind === 'reorient') {
      applyCornerSession({
        ...sessionRef.current,
        currentHoldIndex: last.previousHoldIndex,
      });
      return 'reorient';
    }
    applyCornerSession({
      ...sessionRef.current,
      solvedCornerIds: last.previousSolvedCornerIds,
    });
    return 'solve';
  }, [sessionUndoStack, applyCornerSession]);

  return {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    solvedCornerIds,
    hasSeenStrategyIntro,
    sessionUndoStack,
    advanceAfterStep,
    undoCornerSessionStep,
    resetCornerSession,
  };
}
