import { useCallback, useEffect, useRef, useState } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import { cubeStateToStudentFrame } from '../../../cube/cubeState';
import {
  MIDDLE_EDGE_SLOTS,
  countSolvedMiddleEdgeSlots,
  edgeSlotSolved,
  getMiddleLayerEdgeLessonStepAsync,
  normalizeHoldToBlue,
  slotIdForExpectedEdgeColors,
  type CornerHoldIndex,
  type MiddleEdgeSlotId,
  type MiddleLayerEdgesLessonStep,
} from '../../../learn/layers/middleLayer/edges';
import { useCubeStore } from '../../../store/cubeStore';
import { useLessonStep } from '../useLessonStep';

type MiddleSessionUndoEntry =
  | { kind: 'reorient'; previousHoldIndex: CornerHoldIndex }
  | { kind: 'solve'; previousSolvedSlots: MiddleEdgeSlotId[] };

type MiddleSession = {
  currentHoldIndex: CornerHoldIndex;
  solvedMiddleEdgeSlots: MiddleEdgeSlotId[];
};

function initialSolvedSlots(studentFrame: CubeState): MiddleEdgeSlotId[] {
  const normalized = normalizeHoldToBlue(studentFrame, 0);
  return MIDDLE_EDGE_SLOTS.filter((id) => edgeSlotSolved(normalized, id));
}

function emptyMiddleSession(): MiddleSession {
  return { currentHoldIndex: 0, solvedMiddleEdgeSlots: [] };
}

export function useMiddleLayerLessonStep(
  studentFrame: CubeState | null,
  options?: { resetKey?: string },
) {
  const [currentHoldIndex, setCurrentHoldIndex] = useState<CornerHoldIndex>(0);
  const [solvedMiddleEdgeSlots, setSolvedMiddleEdgeSlots] = useState<
    MiddleEdgeSlotId[]
  >([]);
  const [sessionUndoStack, setSessionUndoStack] = useState<
    MiddleSessionUndoEntry[]
  >([]);
  const lastResetKey = useRef<string | null>(null);
  const sessionRef = useRef<MiddleSession>(emptyMiddleSession());

  const applyMiddleSession = useCallback((session: MiddleSession) => {
    sessionRef.current = session;
    setCurrentHoldIndex(session.currentHoldIndex);
    setSolvedMiddleEdgeSlots(session.solvedMiddleEdgeSlots);
  }, []);

  const resetMiddleSession = useCallback(
    (frame: CubeState) => {
      const initial = initialSolvedSlots(frame);
      applyMiddleSession({
        currentHoldIndex: 0,
        solvedMiddleEdgeSlots: initial,
      });
      setSessionUndoStack([]);
    },
    [applyMiddleSession],
  );

  useEffect(() => {
    if (!studentFrame || options?.resetKey === undefined) return;
    if (lastResetKey.current === options.resetKey) return;
    lastResetKey.current = options.resetKey;
    resetMiddleSession(studentFrame);
  }, [studentFrame, options?.resetKey, resetMiddleSession]);

  const sessionKey = `${currentHoldIndex}:${solvedMiddleEdgeSlots.join(',')}`;

  const getStepAsync = useCallback(async (_frame: CubeState) => {
    const cube = useCubeStore.getState().cubeState;
    const frame = cube ? cubeStateToStudentFrame(cube) : _frame;
    const session = sessionRef.current;
    return getMiddleLayerEdgeLessonStepAsync(frame, {
      currentHoldIndex: session.currentHoldIndex,
      solvedMiddleEdgeSlots: session.solvedMiddleEdgeSlots,
    });
  }, []);

  const isComplete = useCallback(
    (step: MiddleLayerEdgesLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback(
    (frame: CubeState) =>
      countSolvedMiddleEdgeSlots(
        frame,
        sessionRef.current.currentHoldIndex,
        sessionRef.current.solvedMiddleEdgeSlots,
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
    (appliedStep: MiddleLayerEdgesLessonStep, frame: CubeState) => {
      const session = sessionRef.current;
      if (appliedStep.kind === 'reorient-hold') {
        setSessionUndoStack((stack) => [
          ...stack,
          { kind: 'reorient', previousHoldIndex: session.currentHoldIndex },
        ]);
        const nextHold = (
          appliedStep.returnToInitialHold
            ? 0
            : appliedStep.targetHoldIndex !== undefined
              ? appliedStep.targetHoldIndex
              : session.currentHoldIndex
        ) as CornerHoldIndex;
        applyMiddleSession({
          currentHoldIndex: nextHold,
          solvedMiddleEdgeSlots: session.solvedMiddleEdgeSlots,
        });
        return;
      }

      if (
        appliedStep.kind === 'solve-edge' &&
        appliedStep.action === 'insert'
      ) {
        setSessionUndoStack((stack) => [
          ...stack,
          { kind: 'solve', previousSolvedSlots: session.solvedMiddleEdgeSlots },
        ]);
        const slotId = slotIdForExpectedEdgeColors(
          frame,
          appliedStep.edgeColors,
          session.currentHoldIndex,
        );
        const nextSlots =
          slotId && !session.solvedMiddleEdgeSlots.includes(slotId)
            ? [...session.solvedMiddleEdgeSlots, slotId]
            : session.solvedMiddleEdgeSlots;
        applyMiddleSession({
          currentHoldIndex: session.currentHoldIndex,
          solvedMiddleEdgeSlots: nextSlots,
        });
      }
    },
    [applyMiddleSession],
  );

  const undoMiddleSessionStep = useCallback((): 'reorient' | 'solve' | null => {
    const last = sessionUndoStack[sessionUndoStack.length - 1];
    if (!last) return null;
    setSessionUndoStack((stack) => stack.slice(0, -1));
    if (last.kind === 'reorient') {
      applyMiddleSession({
        ...sessionRef.current,
        currentHoldIndex: last.previousHoldIndex,
      });
      return 'reorient';
    }
    applyMiddleSession({
      ...sessionRef.current,
      solvedMiddleEdgeSlots: last.previousSolvedSlots,
    });
    return 'solve';
  }, [sessionUndoStack, applyMiddleSession]);

  return {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    solvedMiddleEdgeSlots,
    sessionUndoStack,
    advanceAfterStep,
    undoMiddleSessionStep,
    resetMiddleSession,
  };
}
