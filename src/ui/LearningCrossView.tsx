import { useMemo, useTransition, type ReactNode } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import { whiteCrossLesson } from '../content/whiteCross';
import { applyHints, lessonAvoidBack, preparing } from '../content/tips';
import { ui } from '../content/ui';
import { useLessonNavigation } from '../lessons/useLessonNavigation';
import { useCubeStore } from '../store/cubeStore';
import { useWhiteCrossLessonStep } from './lessons/bottomLayer/useWhiteCrossLessonStep';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { LessonViewShell } from './lessons/LessonViewShell';
import { crossLessonProgress } from './lessons/lessonProgressBuilders';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';

function getCrossAlternateActions(options: {
  stepKind: string | undefined;
  isLessonComplete: boolean;
  isStepPending: boolean;
  onContinueIntro: () => void;
  onContinueWhiteCorners: () => void;
}): ReactNode {
  const {
    stepKind,
    isLessonComplete,
    isStepPending,
    onContinueIntro,
    onContinueWhiteCorners,
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
  if (isLessonComplete) {
    return (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={onContinueWhiteCorners}
      >
        {whiteCrossLesson.continueWhiteCorners}
      </button>
    );
  }
  return undefined;
}

export function LearningCrossView() {
  const { continueToLesson } = useLessonNavigation();
  const cubeState = useCubeStore((state) => state.cubeState);
  const applyLessonDemoMoves = useCubeStore(
    (state) => state.applyLessonDemoMoves,
  );
  const applyLessonStep = useCubeStore((state) => state.applyLessonStep);
  const hasSeenAvoidBackCallout = useCubeStore(
    (state) => state.hasSeenAvoidBackCallout,
  );
  const markAvoidBackCalloutSeen = useCubeStore(
    (state) => state.markAvoidBackCalloutSeen,
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
    advanceAfterStep,
    resetStrategyIntro,
  } = useWhiteCrossLessonStep(studentFrame);

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

  const stepKey = useMemo(
    () => (step ? `${step.kind}:${demoMoves.join(' ')}` : 'none'),
    [step, demoMoves],
  );

  const {
    visibleDemo,
    showAvoidBackToggle,
    avoidBackMoves,
    setAvoidBackMoves,
    rememberAvoidBackDefault,
    setRememberAvoidBackDefault,
    avoidOn,
    previewMoves,
  } = useLessonDemoPipeline({
    demoMoves,
    stepKey,
    isLessonComplete,
    isStepPending,
    stepKind: step?.kind,
  });

  const lessonHold = useMemo(
    () =>
      studentFrame
        ? faceCentersFromCubeState(studentFrame)
        : studentLessonHoldFaceCenters(),
    [studentFrame],
  );

  if (!cubeState || !studentFrame) {
    return <LessonUnavailable />;
  }

  const displayStep =
    step ??
    (showPreparingOverlay
      ? {
          kind: 'solve-edge' as const,
          title: preparing.lesson,
          body: '',
          edgeLabel: '',
          partnerColor: 'white' as const,
        }
      : {
          kind: 'solve-edge' as const,
          title: whiteCrossLesson.defaultStepTitle,
          body: '',
          edgeLabel: '',
          partnerColor: 'white' as const,
        });

  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== 'complete' &&
    step.kind !== 'intro';

  const showRotationCallout =
    canApplyDemo &&
    avoidBackMoves &&
    showAvoidBackToggle &&
    !hasSeenAvoidBackCallout &&
    previewMoves.includes('y2');

  const handleRestartLessonTips = () => {
    resetLessonSession();
    resetStrategyIntro();
    setAvoidBackMoves(false);
    recomputeStep();
  };

  const handleContinueIntro = () => {
    if (step?.kind !== 'intro') return;
    startLessonTransition(() => {
      advanceAfterStep(step);
      recomputeStep();
    });
  };

  const handleUndoLessonStep = () => {
    if (!canUndoLesson || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
      recomputeStep();
    });
  };

  const handleApplyDemo = () => {
    startLessonTransition(() => {
      if (avoidOn) {
        applyLessonStep(demoMoves, { avoidBackMoves: true });
        if (previewMoves.includes('y2') && !hasSeenAvoidBackCallout) {
          markAvoidBackCalloutSeen();
        }
      } else {
        applyLessonDemoMoves(demoMoves);
      }
    });
  };

  const showProgress =
    step && step.kind !== 'complete' && step.kind !== 'intro';

  const workflowAlternateActions = getCrossAlternateActions({
    stepKind: step?.kind,
    isLessonComplete,
    isStepPending,
    onContinueIntro: handleContinueIntro,
    onContinueWhiteCorners: () => continueToLesson('white-corners'),
  });

  return (
    <LessonViewShell
      header={{
        title: whiteCrossLesson.title,
        subtitle: whiteCrossLesson.subtitle,
        progress: showProgress
          ? crossLessonProgress(studentFrame, whiteCrossLesson.progress)
          : undefined,
        sessionNotesSummary: whiteCrossLesson.sessionNotesSummary,
        sessionNotes: whiteCrossLesson.sessionNotes,
        canUndo: canUndoLesson,
        isStepPending,
        onUndo: handleUndoLessonStep,
        onRescan: startLessonRescan,
        onResetTips: handleRestartLessonTips,
      }}
      step={{
        title: displayStep.title,
        body: displayStep.body || undefined,
        practiceGoalSummary: displayStep.practiceGoalSummary,
        dimmed: showPreparingOverlay,
        caseChildren: isLessonComplete ? (
          <p className="mt-4 text-sm text-slate-400">
            {whiteCrossLesson.completeBody}
          </p>
        ) : undefined,
      }}
      cube={{
        isComplete: isLessonComplete,
        cubeState: studentFrame,
        completeCanvasKey: 'lesson-complete-cube',
        visibleDemo,
        showPreparingOverlay,
      }}
      demo={{
        canApply: canApplyDemo,
        applyLabel: ui.applyExampleContinue,
        applyHint: canApplyDemo ? applyHints.default : undefined,
        onApply: handleApplyDemo,
        alternateActions: workflowAlternateActions,
      }}
      secondary={{
        lessonHold,
        showSameHoldNote:
          step !== null && step.kind !== 'complete' && step.kind !== 'intro',
        avoidBack:
          step &&
          step.kind !== 'complete' &&
          step.kind !== 'intro' &&
          showAvoidBackToggle
            ? {
                frontColor: lessonHold.F,
                avoidBackMoves,
                onToggleAvoidBack: () => setAvoidBackMoves((v) => !v),
                rememberAvoidBackDefault,
                onRememberDefaultChange: setRememberAvoidBackDefault,
                showRotationCallout,
                onMarkCalloutSeen: markAvoidBackCalloutSeen,
                holdNote: lessonAvoidBack.usualLessonHold,
              }
            : undefined,
      }}
    />
  );
}
