import { useMemo, useTransition } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  isWholeCubeRotation,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import { resolveLessonStorageDemo } from '../learn/layers/bottomLayer/corners';
import {
  getRotationText,
  type DemoStep,
  type Instruction,
} from '../learn/studentHold';
import type { YRotationStep } from '../learn/studentHold/types';
import { whiteCornersLesson } from '../content/whiteCorners';
import { applyHints, preparing } from '../content/tips';
import { ui } from '../content/ui';
import { continueToLesson } from '../learn/lessonSessionPersistence';
import { useCubeStore } from '../store/cubeStore';
import { useWhiteCornerLessonStep } from './lessons/bottomLayer/useWhiteCornerLessonStep';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { LessonViewShell } from './lessons/LessonViewShell';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { cornerHoldToStudentHold } from '../learn/layers/bottomLayer/corners';

const CORNER_SLOT_LABELS = ['FRD', 'BDR', 'BLD', 'FDL'];

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

export function LearningCornersView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
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
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    solvedCornerIds,
    sessionUndoStack,
    advanceAfterStep,
    undoCornerSessionStep,
    resetCornerSession,
  } = useWhiteCornerLessonStep(studentFrame);

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

  const storageDemoMoves = useMemo((): Move[] => {
    if (
      isHoldReorientStep ||
      !studentFrame ||
      !step ||
      step.kind !== 'solve-corner' ||
      !demoMoves.length
    ) {
      return demoMoves;
    }
    return (
      resolveLessonStorageDemo(
        studentFrame,
        step.cornerId,
        currentHoldIndex,
        demoMoves,
        solvedCornerIds,
      ) ?? demoMoves
    );
  }, [
    demoMoves,
    studentFrame,
    step,
    isHoldReorientStep,
    currentHoldIndex,
    solvedCornerIds,
  ]);

  const viewDemoMoves = useMemo((): Move[] => {
    if (isHoldReorientStep) return demoMoves;
    if (step?.kind === 'solve-corner' && storageDemoMoves.length > 0) {
      return storageDemoMoves;
    }
    return demoMoves;
  }, [demoMoves, storageDemoMoves, step?.kind, isHoldReorientStep]);

  const stepKey = useMemo(
    () => (step ? `${step.kind}:${viewDemoMoves.join(' ')}` : 'none'),
    [step, viewDemoMoves],
  );

  const demoInitialHold = useMemo(
    () => cornerHoldToStudentHold(currentHoldIndex),
    [currentHoldIndex],
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
    demoMoves: viewDemoMoves,
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
          kind: 'solve-corner' as const,
          title: preparing.lesson,
          body: '',
          cornerId: 'FRD' as const,
        }
      : {
          kind: 'solve-corner' as const,
          title: whiteCornersLesson.defaultStepTitle,
          body: '',
          cornerId: 'FRD' as const,
        });

  const isReorientStep = step?.kind === 'reorient-hold';
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== 'complete' &&
    step.kind !== 'cross-prerequisite' &&
    step.kind !== 'intro';

  const showRotationCallout =
    canApplyDemo &&
    avoidBackMoves &&
    showAvoidBackToggle &&
    !hasSeenAvoidBackCallout &&
    previewMoves.includes('y2');

  const handleRestartLessonTips = () => {
    resetLessonSession();
    setAvoidBackMoves(false);
    recomputeStep();
  };

  const handleResetCornerSession = () => {
    resetCornerSession(studentFrame);
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndo || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
      undoCornerSessionStep();
    });
  };

  const handleContinueIntro = () => {
    if (step?.kind !== 'intro') return;
    startLessonTransition(() => {
      advanceAfterStep(step);
      recomputeStep();
    });
  };

  const handleApplyDemo = () => {
    if (!step || !canApplyDemo) return;
    startLessonTransition(() => {
      if (step.kind === 'reorient-hold') {
        advanceAfterStep(step);
        applyLessonDemoMoves(step.demoMoves);
        return;
      }
      if (step.kind === 'solve-corner') {
        advanceAfterStep(step);
        if (avoidOn) {
          applyLessonStep(storageDemoMoves, { avoidBackMoves: true });
          if (previewMoves.includes('y2') && !hasSeenAvoidBackCallout) {
            markAvoidBackCalloutSeen();
          }
        } else {
          applyLessonDemoMoves(storageDemoMoves);
        }
      }
    });
  };

  const showProgress =
    step &&
    step.kind !== 'complete' &&
    step.kind !== 'cross-prerequisite' &&
    step.kind !== 'intro';

  const workflowAlternateActions =
    step?.kind === 'intro' ? (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={handleContinueIntro}
        disabled={isStepPending}
      >
        {ui.continue}
      </button>
    ) : step?.kind === 'cross-prerequisite' ? (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={() => setActiveLesson('white-cross')}
      >
        {whiteCornersLesson.goToWhiteCross}
      </button>
    ) : isLessonComplete ? (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
        onClick={() => continueToLesson(MIDDLE_LAYER_EDGES_LESSON_ID)}
      >
        {whiteCornersLesson.continueMiddleLayer}
      </button>
    ) : undefined;

  return (
    <LessonViewShell
      header={{
        title: whiteCornersLesson.title,
        subtitle: whiteCornersLesson.subtitle,
        progress: showProgress
          ? {
              solved: solvedSlots,
              total: 4,
              slotLabels: CORNER_SLOT_LABELS,
              ariaLabel: whiteCornersLesson.progress(solvedSlots),
            }
          : undefined,
        sessionNotesSummary: whiteCornersLesson.sessionNotesSummary,
        sessionNotes: whiteCornersLesson.sessionNotes,
        canUndo,
        isStepPending,
        onUndo: handleUndoLessonStep,
        onRescan: startLessonRescan,
        onResetTips: handleRestartLessonTips,
        extraSessionActions: (
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            onClick={handleResetCornerSession}
          >
            {whiteCornersLesson.resetCornerSession}
          </button>
        ),
      }}
      step={{
        title: displayStep.title,
        body: displayStep.body || undefined,
        dimmed: showPreparingOverlay,
        caseChildren: isLessonComplete ? (
          <p className="mt-4 text-sm text-slate-400">
            {whiteCornersLesson.completeBody}
          </p>
        ) : undefined,
      }}
      cube={{
        isComplete: isLessonComplete,
        cubeState: studentFrame,
        completeCanvasKey: 'corners-lesson-complete-cube',
        visibleDemo,
        showPreparingOverlay,
        preparingSubtitle: whiteCornersLesson.preparingSubtitle,
      }}
      demo={{
        canApply: canApplyDemo,
        applyLabel: isReorientStep ? ui.continue : ui.applyExampleContinue,
        applyHint: canApplyDemo
          ? isReorientStep
            ? applyHints.reorient
            : applyHints.solve
          : undefined,
        onApply: handleApplyDemo,
        alternateActions: workflowAlternateActions,
      }}
      secondary={{
        lessonHold,
        showSameHoldNote:
          step !== null &&
          step.kind !== 'complete' &&
          step.kind !== 'cross-prerequisite' &&
          step.kind !== 'intro',
        showReorientNote: isReorientStep,
        avoidBack:
          step && step.kind !== 'complete' && showAvoidBackToggle
            ? {
                frontColor: lessonHold.F,
                avoidBackMoves,
                onToggleAvoidBack: () => setAvoidBackMoves((v) => !v),
                rememberAvoidBackDefault,
                onRememberDefaultChange: setRememberAvoidBackDefault,
                showRotationCallout,
                onMarkCalloutSeen: markAvoidBackCalloutSeen,
              }
            : undefined,
      }}
    />
  );
}
