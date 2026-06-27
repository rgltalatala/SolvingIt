import { useCallback, useEffect, useRef, useState } from 'react';
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
  type CornerHoldIndex,
  type PermuteCornersZeroFlowStep,
} from '../../../learn/layers/lastLayer';
import type {
  LastLayerLessonStep,
  SeenLastLayerIntros,
} from '../../../learn/layers/lastLayer/types';
import { markLastLayerIntroSeen } from '../../../learn/layers/lastLayer/introSteps';
import { useCubeStore } from '../../../store/cubeStore';
import { useLessonStep } from '../useLessonStep';

type LastSessionUndoEntry = { kind: 'reorient'; previousHoldIndex: CornerHoldIndex };

type LastSession = {
  currentHoldIndex: CornerHoldIndex;
  permuteCornersZeroFlowStep?: PermuteCornersZeroFlowStep;
  inOrientCornersPhase?: boolean;
  seenIntros: SeenLastLayerIntros;
  hasAcknowledgedOrientEdgesComplete?: boolean;
};

function emptyLastSession(): LastSession {
  return { currentHoldIndex: 0, seenIntros: {} };
}

function advanceZeroFlowAfterStep(
  step: LastLayerLessonStep,
  permuteCornersZeroFlowStep: PermuteCornersZeroFlowStep | undefined,
): PermuteCornersZeroFlowStep | undefined {
  if (step.kind === 'permute-corners') {
    if (step.permuteCase === 'zero-flow-first') return 1;
    if (step.permuteCase === 'zero-flow-second') return undefined;
  }
  if (step.kind === 'reorient-hold' && step.zeroFlowStep === 1) {
    return 2;
  }
  return permuteCornersZeroFlowStep;
}

export function useLastLayerLessonStep(
  studentFrame: CubeState | null,
  options?: { resetKey?: string },
) {
  const [currentHoldIndex, setCurrentHoldIndex] = useState<CornerHoldIndex>(0);
  const [permuteCornersZeroFlowStep, setPermuteCornersZeroFlowStep] = useState<
    PermuteCornersZeroFlowStep | undefined
  >(undefined);
  const [inOrientCornersPhase, setInOrientCornersPhase] = useState(false);
  const [seenIntros, setSeenIntros] = useState<SeenLastLayerIntros>({});
  const [hasAcknowledgedOrientEdgesComplete, setHasAcknowledgedOrientEdgesComplete] =
    useState(false);
  const [sessionUndoStack, setSessionUndoStack] = useState<
    LastSessionUndoEntry[]
  >([]);
  const lastResetKey = useRef<string | null>(null);
  const sessionRef = useRef<LastSession>(emptyLastSession());

  const applyLastSession = useCallback((session: LastSession) => {
    sessionRef.current = session;
    setCurrentHoldIndex(session.currentHoldIndex);
    setPermuteCornersZeroFlowStep(session.permuteCornersZeroFlowStep);
    setInOrientCornersPhase(session.inOrientCornersPhase ?? false);
    setSeenIntros(session.seenIntros);
    setHasAcknowledgedOrientEdgesComplete(
      session.hasAcknowledgedOrientEdgesComplete ?? false,
    );
  }, []);

  const resetLastSession = useCallback(() => {
    applyLastSession(emptyLastSession());
    setSessionUndoStack([]);
  }, [applyLastSession]);

  useEffect(() => {
    if (!studentFrame || options?.resetKey === undefined) return;
    if (lastResetKey.current === options.resetKey) return;
    lastResetKey.current = options.resetKey;
    resetLastSession();
  }, [studentFrame, options?.resetKey, resetLastSession]);

  const sessionKey = `${currentHoldIndex}:${permuteCornersZeroFlowStep ?? 'none'}:${inOrientCornersPhase}:${hasAcknowledgedOrientEdgesComplete}:${JSON.stringify(seenIntros)}`;

  const getStepAsync = useCallback(async (_frame: CubeState) => {
    const cube = useCubeStore.getState().cubeState;
    const frame = cube ? cubeStateToStudentFrame(cube) : _frame;
    return getLastLayerLessonStepAsync(frame, {
      currentHoldIndex: sessionRef.current.currentHoldIndex,
      permuteCornersZeroFlowStep: sessionRef.current.permuteCornersZeroFlowStep,
      inOrientCornersPhase: sessionRef.current.inOrientCornersPhase,
      seenIntros: sessionRef.current.seenIntros,
      hasAcknowledgedOrientEdgesComplete:
        sessionRef.current.hasAcknowledgedOrientEdgesComplete,
    });
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
      const session = sessionRef.current;

      if (appliedStep.kind === 'intro') {
        applyLastSession({
          ...session,
          seenIntros: markLastLayerIntroSeen(
            session.seenIntros,
            appliedStep.introId,
          ),
        });
        return;
      }

      if (appliedStep.kind === 'orient-edges-already-complete') {
        applyLastSession({
          ...session,
          hasAcknowledgedOrientEdgesComplete: true,
        });
        return;
      }

      let nextHold = session.currentHoldIndex;
      let nextZeroFlow = session.permuteCornersZeroFlowStep;

      if (appliedStep.kind === 'reorient-hold') {
        setSessionUndoStack((stack) => [
          ...stack,
          { kind: 'reorient', previousHoldIndex: session.currentHoldIndex },
        ]);
        nextHold = (
          appliedStep.returnToInitialHold
            ? 0
            : appliedStep.targetHoldIndex !== undefined
              ? appliedStep.targetHoldIndex
              : session.currentHoldIndex
        ) as CornerHoldIndex;
      }

      nextZeroFlow = advanceZeroFlowAfterStep(appliedStep, nextZeroFlow);

      const nextInOrient =
        session.inOrientCornersPhase ||
        appliedStep.kind === 'orient-corners' ||
        (appliedStep.kind === 'align-u' &&
          appliedStep.subLesson === 'orient-corners');

      applyLastSession({
        ...session,
        currentHoldIndex: nextHold,
        permuteCornersZeroFlowStep: nextZeroFlow,
        inOrientCornersPhase: nextInOrient,
      });
    },
    [applyLastSession],
  );

  const undoLastSessionStep = useCallback((): 'reorient' | null => {
    const last = sessionUndoStack[sessionUndoStack.length - 1];
    if (!last) return null;
    setSessionUndoStack((stack) => stack.slice(0, -1));
    if (last.kind === 'reorient') {
      applyLastSession({
        ...sessionRef.current,
        currentHoldIndex: last.previousHoldIndex,
      });
      return 'reorient';
    }
    return null;
  }, [sessionUndoStack, applyLastSession]);

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
