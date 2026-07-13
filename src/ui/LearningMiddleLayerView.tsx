import { useMemo, useTransition, type ReactNode } from 'react';
import type { Color } from '../cube/cubeState';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  isWholeCubeRotation,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import {
  getRotationText,
  type DemoStep,
  type Instruction,
} from '../learn/studentHold';
import type { YRotationStep } from '../learn/studentHold/types';
import { middleLayerLesson } from '../content/middleLayer';
import { preparing } from '../content/tips';
import { ui } from '../content/ui';
import { continueToLesson } from '../learn/lessonSessionPersistence';
import { useCubeStore } from '../store/cubeStore';
import { LAST_LAYER_LESSON_ID } from '../learn/layers/lastLayer';
import { useMiddleLayerLessonStep } from './lessons/middleLayer/useMiddleLayerLessonStep';
import { getLessonApplyHint } from './lessons/getLessonApplyHint';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { LessonViewShell } from './lessons/LessonViewShell';
import { middleLayerLessonProgress } from './lessons/lessonProgressBuilders';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';
import { cornerHoldToStudentHold } from '../learn/layers/bottomLayer/corners';

function expandHoldReorientDemo(moves: Move[]): {
  steps: DemoStep[];
  instructions: Instruction[];
} {
  const rotations = moves.filter(isWholeCubeRotation) as YRotationStep[];
  const steps: DemoStep[] = rotations.map((rotation) => ({
    type: 'rotation' as const,
    rotation,
  }));
  const instructions: Instruction[] = rotations.map((rotation) => ({
    type: 'rotation' as const,
    rotation,
    text: getRotationText(rotation),
  }));
  return { steps, instructions };
}

function expandReorientDemoForPipeline(moves: Move[]) {
  const expanded = expandHoldReorientDemo(moves);
  return { ...expanded, previewMoves: moves };
}

function getMiddleLayerAlternateActions(options: {
  stepKind: string | undefined;
  isLessonComplete: boolean;
  isStepPending: boolean;
  onContinueIntro: () => void;
  onGoToWhiteCross: () => void;
  onGoToWhiteCorners: () => void;
  onContinueLastLayer: () => void;
}): ReactNode {
  const {
    stepKind,
    isLessonComplete,
    isStepPending,
    onContinueIntro,
    onGoToWhiteCross,
    onGoToWhiteCorners,
    onContinueLastLayer,
  } = options;

  if (stepKind === 'intro') {
    return (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={onContinueIntro}
        disabled={isStepPending}
      >
        {ui.continue}
      </button>
    );
  }
  if (stepKind === 'cross-corners-prerequisite') {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          onClick={onGoToWhiteCross}
        >
          {middleLayerLesson.goToWhiteCross}
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
          onClick={onGoToWhiteCorners}
        >
          {middleLayerLesson.goToWhiteCorners}
        </button>
      </div>
    );
  }
  if (isLessonComplete) {
    return (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
        onClick={onContinueLastLayer}
      >
        {middleLayerLesson.continueLastLayer}
      </button>
    );
  }
  return undefined;
}

export function LearningMiddleLayerView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const applyLessonDemoMoves = useCubeStore(
    (state) => state.applyLessonDemoMoves,
  );
  const resetLessonSession = useCubeStore((state) => state.resetLessonSession);
  const undoLessonStep = useCubeStore((state) => state.undoLessonStep);
  const canUndoLesson = useCubeStore((state) => state.lessonHistory.length > 0);
  const startLessonRescan = useCubeStore((state) => state.startLessonRescan);

  const [, startLessonTransition] = useTransition();

  const studentFrame = useMemo(
    () => (cubeState ? cubeStateToStudentFrame(cubeState) : null),
    [cubeState],
  );

  const {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    recomputeStep,
    currentHoldIndex,
    solvedMiddleEdgeSlots,
    sessionUndoStack,
    advanceAfterStep,
    undoMiddleSessionStep,
    resetMiddleSession,
  } = useMiddleLayerLessonStep(studentFrame);

  const demoMoves = useMemo((): Move[] => {
    if (
      step &&
      'demoMoves' in step &&
      step.demoMoves &&
      step.demoMoves.length > 0
    ) {
      return step.demoMoves;
    }
    return [];
  }, [step]);

  const isHoldReorientStep = step?.kind === 'reorient-hold';

  const stepKey = useMemo(
    () => (step ? `${step.kind}:${demoMoves.join(' ')}` : 'none'),
    [step, demoMoves],
  );

  const demoInitialHold = useMemo(
    () => cornerHoldToStudentHold(currentHoldIndex),
    [currentHoldIndex],
  );

  const { visibleDemo } = useLessonDemoPipeline({
    demoMoves,
    stepKey,
    isLessonComplete,
    isStepPending,
    stepKind: step?.kind,
    snapshotKeySuffix: `-${currentHoldIndex}`,
    initialHold: demoInitialHold,
    expandDemo: isHoldReorientStep ? expandReorientDemoForPipeline : undefined,
  });

  const lessonHold = useMemo(
    () =>
      studentFrame
        ? faceCentersFromCubeState(studentFrame)
        : studentLessonHoldFaceCenters(),
    [studentFrame],
  );

  const lastSessionEntry =
    sessionUndoStack[sessionUndoStack.length - 1] ?? null;
  const canUndo = lastSessionEntry !== null && canUndoLesson;

  if (!cubeState || !studentFrame) {
    return <LessonUnavailable />;
  }

  const displayStep =
    step ??
    (showPreparingOverlay
      ? {
          kind: 'align-u' as const,
          title: preparing.lesson,
          body: '',
          demoMoves: [] as Move[],
          edgeColors: ['green', 'red'] as [Color, Color],
        }
      : {
          kind: 'align-u' as const,
          title: middleLayerLesson.defaultStepTitle,
          body: '',
          demoMoves: [] as Move[],
          edgeColors: ['green', 'red'] as [Color, Color],
        });

  const isReorientStep = step?.kind === 'reorient-hold';
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== 'complete' &&
    step.kind !== 'cross-corners-prerequisite' &&
    step.kind !== 'intro';

  const handleRestartLessonTips = () => {
    resetLessonSession();
    recomputeStep();
  };

  const handleResetMiddleSession = () => {
    resetMiddleSession(studentFrame);
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndo || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
      undoMiddleSessionStep();
    });
  };

  const handleContinueIntro = () => {
    if (step?.kind !== 'intro') return;
    startLessonTransition(() => {
      advanceAfterStep(step, studentFrame);
      recomputeStep();
    });
  };

  const handleApplyDemo = () => {
    if (!step || !canApplyDemo) return;
    startLessonTransition(() => {
      if (
        step.kind === 'reorient-hold' ||
        step.kind === 'align-u' ||
        step.kind === 'solve-edge'
      ) {
        advanceAfterStep(step, studentFrame);
        applyLessonDemoMoves(step.demoMoves);
      }
    });
  };

  const showProgress =
    step &&
    step.kind !== 'complete' &&
    step.kind !== 'cross-corners-prerequisite' &&
    step.kind !== 'intro';

  const workflowAlternateActions = getMiddleLayerAlternateActions({
    stepKind: step?.kind,
    isLessonComplete,
    isStepPending,
    onContinueIntro: handleContinueIntro,
    onGoToWhiteCross: () => setActiveLesson('white-cross'),
    onGoToWhiteCorners: () => setActiveLesson('white-corners'),
    onContinueLastLayer: () => continueToLesson(LAST_LAYER_LESSON_ID),
  });

  return (
    <LessonViewShell
      header={{
        title: middleLayerLesson.title,
        subtitle: middleLayerLesson.subtitle,
        progress: showProgress
          ? middleLayerLessonProgress(
              studentFrame,
              currentHoldIndex,
              solvedMiddleEdgeSlots,
              middleLayerLesson.progress,
            )
          : undefined,
        sessionNotesSummary: middleLayerLesson.sessionNotesSummary,
        sessionNotes: middleLayerLesson.sessionNotes,
        canUndo,
        isStepPending,
        onUndo: handleUndoLessonStep,
        onRescan: startLessonRescan,
        onResetTips: handleRestartLessonTips,
        extraSessionActions: (
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            onClick={handleResetMiddleSession}
          >
            {middleLayerLesson.resetMiddleSession}
          </button>
        ),
      }}
      step={{
        title: displayStep.title,
        body: displayStep.body || undefined,
        dimmed: showPreparingOverlay,
        caseChildren: isLessonComplete ? (
          <p className="mt-4 text-sm text-slate-400">
            {middleLayerLesson.completeBody}
          </p>
        ) : undefined,
      }}
      cube={{
        isComplete: isLessonComplete,
        cubeState: studentFrame,
        completeCanvasKey: 'middle-layer-lesson-complete-cube',
        visibleDemo,
        showPreparingOverlay,
        preparingSubtitle: middleLayerLesson.preparingSubtitle,
      }}
      demo={{
        canApply: canApplyDemo,
        applyLabel: isReorientStep ? ui.continue : ui.applyExampleContinue,
        applyHint: getLessonApplyHint({
          canApply: canApplyDemo,
          isReorient: isReorientStep,
        }),
        onApply: handleApplyDemo,
        alternateActions: workflowAlternateActions,
      }}
      secondary={{
        lessonHold,
        showSameHoldNote:
          step !== null &&
          step.kind !== 'complete' &&
          step.kind !== 'cross-corners-prerequisite' &&
          step.kind !== 'intro',
        showReorientNote: isReorientStep,
      }}
    />
  );
}
