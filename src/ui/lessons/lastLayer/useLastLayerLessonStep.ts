import { useCallback, useEffect, useRef } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import { cubeStateToStudentFrame } from '../../../cube/cubeState';
import {
  countPermutedCorners,
  countPermutedEdges,
  countSolvedCorners,
  countYellowEdgesOnU,
  getLastLayerLessonStepAsync,
  isCornersFullyPermuted,
  isEdgesFullyPermuted,
  isLastLayerComplete,
  isYellowCrossComplete,
  LAST_LAYER_LESSON_ID,
  type CornerHoldIndex,
} from '../../../learn/layers/lastLayer';
import type {
  LastLayerLessonStep,
} from '../../../learn/layers/lastLayer/types';
import { markLastLayerIntroSeen } from '../../../learn/layers/lastLayer/introSteps';
import { useCubeStore } from '../../../store/cubeStore';
import {
  useLessonSessionStore,
  type LastLayerSession,
} from '../../../store/lessonSessionStore';
import { useLessonStep } from '../useLessonStep';

function emptyLastSession(): LastLayerSession {
  return { currentHoldIndex: 0, seenIntros: {}, sessionUndoStack: [] };
}

function cloneSessionWithoutUndo(session: LastLayerSession): Omit<
  LastLayerSession,
  'sessionUndoStack'
> {
  return {
    currentHoldIndex: session.currentHoldIndex,
    inOrientCornersPhase: session.inOrientCornersPhase,
    seenIntros: { ...session.seenIntros },
    hasAcknowledgedOrientEdgesComplete: session.hasAcknowledgedOrientEdgesComplete,
  };
}

export function useLastLayerLessonStep(studentFrame: CubeState | null) {
  const storedSession = useLessonSessionStore(
    (state) => state.sessionsByLesson[LAST_LAYER_LESSON_ID],
  );
  const setStoredSession = useLessonSessionStore((state) => state.setSession);
  const initializedRef = useRef(false);
  const sessionRef = useRef<LastLayerSession>(emptyLastSession());

  const applyLastSession = useCallback(
    (session: LastLayerSession) => {
      sessionRef.current = session;
      setStoredSession(LAST_LAYER_LESSON_ID, session);
    },
    [setStoredSession],
  );

  const resetLastSession = useCallback(() => {
    applyLastSession(emptyLastSession());
  }, [applyLastSession]);

  useEffect(() => {
    if (!studentFrame) return;
    const existing = useLessonSessionStore
      .getState()
      .getSession(LAST_LAYER_LESSON_ID);
    if (existing) {
      sessionRef.current = existing;
      initializedRef.current = true;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    resetLastSession();
  }, [studentFrame, resetLastSession]);

  useEffect(() => {
    if (storedSession) {
      sessionRef.current = storedSession;
    }
  }, [storedSession]);

  const session = storedSession ?? sessionRef.current;
  const {
    currentHoldIndex,
    inOrientCornersPhase,
    seenIntros,
    hasAcknowledgedOrientEdgesComplete,
    sessionUndoStack,
  } = session;

  const sessionKey = `${currentHoldIndex}:${inOrientCornersPhase}:${hasAcknowledgedOrientEdgesComplete}:${JSON.stringify(seenIntros)}:${sessionUndoStack.length}`;

  const getStepAsync = useCallback(async (_frame: CubeState) => {
    const cube = useCubeStore.getState().cubeState;
    const frame = cube ? cubeStateToStudentFrame(cube) : _frame;
    const current = sessionRef.current;
    const result = await getLastLayerLessonStepAsync(frame, {
      currentHoldIndex: current.currentHoldIndex,
      inOrientCornersPhase: current.inOrientCornersPhase,
      seenIntros: current.seenIntros,
      hasAcknowledgedOrientEdgesComplete:
        current.hasAcknowledgedOrientEdgesComplete,
    });
    return result;
  }, []);

  const isComplete = useCallback(
    (step: LastLayerLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback((frame: CubeState) => {
    if (isLastLayerComplete(frame)) {
      return 4;
    }
    if (isCornersFullyPermuted(frame)) {
      return countSolvedCorners(frame);
    }
    if (isEdgesFullyPermuted(frame)) {
      return countPermutedCorners(frame);
    }
    if (isYellowCrossComplete(frame)) {
      return countPermutedEdges(frame);
    }
    return countYellowEdgesOnU(frame);
  }, []);

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
    (appliedStep: LastLayerLessonStep, _frame: CubeState) => {
      const current = sessionRef.current;

      if (appliedStep.kind === 'intro') {
        applyLastSession({
          ...current,
          seenIntros: markLastLayerIntroSeen(
            current.seenIntros,
            appliedStep.introId,
          ),
          sessionUndoStack: [
            ...current.sessionUndoStack,
            {
              previousSession: cloneSessionWithoutUndo(current),
              withCubeApply: false,
            },
          ],
        });
        return;
      }

      if (appliedStep.kind === 'orient-edges-already-complete') {
        applyLastSession({
          ...current,
          hasAcknowledgedOrientEdgesComplete: true,
          sessionUndoStack: [
            ...current.sessionUndoStack,
            {
              previousSession: cloneSessionWithoutUndo(current),
              withCubeApply: false,
            },
          ],
        });
        return;
      }

      let nextHold = current.currentHoldIndex;

      if (appliedStep.kind === 'reorient-hold') {
        nextHold = (
          appliedStep.returnToInitialHold
            ? 0
            : appliedStep.targetHoldIndex !== undefined
              ? appliedStep.targetHoldIndex
              : current.currentHoldIndex
        ) as CornerHoldIndex;
      }

      const nextInOrient =
        current.inOrientCornersPhase ||
        appliedStep.kind === 'orient-corners' ||
        (appliedStep.kind === 'align-u' &&
          appliedStep.subLesson === 'orient-corners');

      applyLastSession({
        currentHoldIndex: nextHold,
        inOrientCornersPhase: nextInOrient,
        seenIntros: current.seenIntros,
        hasAcknowledgedOrientEdgesComplete:
          current.hasAcknowledgedOrientEdgesComplete,
        sessionUndoStack: [
          ...current.sessionUndoStack,
          {
            previousSession: cloneSessionWithoutUndo(current),
            withCubeApply: true,
          },
        ],
      });
    },
    [applyLastSession],
  );

  const undoLastSessionStep = useCallback((): boolean => {
    const current = sessionRef.current;
    const last = current.sessionUndoStack[current.sessionUndoStack.length - 1];
    if (!last) return false;
    const nextStack = current.sessionUndoStack.slice(0, -1);
    applyLastSession({
      ...last.previousSession,
      sessionUndoStack: nextStack,
    });
    return last.withCubeApply;
  }, [applyLastSession]);

  const isCornerPermutePhase =
    studentFrame !== null &&
    isYellowCrossComplete(studentFrame) &&
    isEdgesFullyPermuted(studentFrame) &&
    !isCornersFullyPermuted(studentFrame);

  const isCornerOrientPhase =
    studentFrame !== null &&
    isCornersFullyPermuted(studentFrame) &&
    !isLastLayerComplete(studentFrame);

  return {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    sessionUndoStack,
    advanceAfterStep,
    undoLastSessionStep,
    resetLastSession,
    isPermutePhase: studentFrame ? isYellowCrossComplete(studentFrame) : false,
    isEdgePermutePhase:
      studentFrame !== null &&
      isYellowCrossComplete(studentFrame) &&
      !isEdgesFullyPermuted(studentFrame),
    isCornerPermutePhase,
    isCornerOrientPhase,
    isFullyPermuted: studentFrame ? isCornersFullyPermuted(studentFrame) : false,
    isLastLayerComplete: studentFrame ? isLastLayerComplete(studentFrame) : false,
  };
}
