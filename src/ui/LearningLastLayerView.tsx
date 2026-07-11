import { useMemo, useTransition } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  isWholeCubeRotation,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import {
  isCornersFullyPermuted,
  isEdgesFullyPermuted,
  isLastLayerComplete,
  isYellowCrossComplete,
} from '../learn/layers/lastLayer';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import {
  getRotationText,
  type DemoStep,
  type Instruction,
} from '../learn/studentHold';
import type { YRotationStep } from '../learn/studentHold/types';
import {
  LAST_LAYER_SUB_LESSON_LABELS,
  lastLayerLesson,
} from '../content/lastLayer';
import { applyHints, preparing } from '../content/tips';
import { ui } from '../content/ui';
import { useCubeStore } from '../store/cubeStore';
import { useLastLayerLessonStep } from './lessons/lastLayer/useLastLayerLessonStep';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { LessonViewShell } from './lessons/LessonViewShell';
import {
  lastLayerLessonProgress,
  type LastLayerProgressPhase,
} from './lessons/lessonProgressBuilders';
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

export function LearningLastLayerView() {
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
    advanceAfterStep,
    currentHoldIndex,
    sessionUndoStack,
    undoLastSessionStep,
    resetLastSession,
    isEdgePermutePhase,
    isCornerPermutePhase,
    isCornerOrientPhase,
    inOrientCornersPhase,
  } = useLastLayerLessonStep(studentFrame);

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
  const canUndo =
    lastSessionEntry !== null &&
    (!lastSessionEntry.withCubeApply || canUndoLesson);

  if (!cubeState || !studentFrame) {
    return <LessonUnavailable />;
  }

  const isOrientEdgesLessonStep =
    step?.kind === 'orient-edges-already-complete' ||
    step?.kind === 'orient-edges' ||
    (step?.kind === 'align-u' && step.subLesson === 'orient-edges') ||
    (step?.kind === 'intro' && step.introId === 'orient-edges');

  const inOrientCornersLesson =
    inOrientCornersPhase ||
    step?.kind === 'orient-corners' ||
    (step?.kind === 'align-u' && step.subLesson === 'orient-corners');

  const edgePermutePhase =
    !inOrientCornersLesson &&
    !isOrientEdgesLessonStep &&
    (isEdgePermutePhase ||
      (studentFrame &&
        isYellowCrossComplete(studentFrame) &&
        !isEdgesFullyPermuted(studentFrame)));

  const cornerPermutePhase =
    !inOrientCornersLesson &&
    (isCornerPermutePhase ||
      (studentFrame &&
        isYellowCrossComplete(studentFrame) &&
        isEdgesFullyPermuted(studentFrame) &&
        !isCornersFullyPermuted(studentFrame)));

  const cornerOrientPhase =
    inOrientCornersLesson ||
    isCornerOrientPhase ||
    (studentFrame &&
      isYellowCrossComplete(studentFrame) &&
      isEdgesFullyPermuted(studentFrame) &&
      isCornersFullyPermuted(studentFrame) &&
      !isLastLayerComplete(studentFrame));

  const displayStep =
    step ??
    (showPreparingOverlay
      ? {
          kind: 'align-u' as const,
          title: preparing.lesson,
          body: '',
          demoMoves: [] as Move[],
          subLesson: 'orient-edges' as const,
          ollCase: 'l-shape' as const,
        }
      : {
          kind: 'align-u' as const,
          title: lastLayerLesson.defaultStepTitle,
          body: '',
          demoMoves: [] as Move[],
          subLesson: 'orient-edges' as const,
          ollCase: 'l-shape' as const,
        });

  const isReorientStep = step?.kind === 'reorient-hold';
  const isHoldSyncStep =
    isReorientStep &&
    demoMoves.length === 0 &&
    step.targetHoldIndex !== undefined &&
    step.targetHoldIndex !== currentHoldIndex;
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    (demoMoves.length > 0 || isHoldSyncStep) &&
    step.kind !== 'complete' &&
    step.kind !== 'prerequisite' &&
    step.kind !== 'intro' &&
    step.kind !== 'orient-edges-already-complete';

  const handleRestartLessonTips = () => {
    resetLessonSession();
    resetLastSession();
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndo || isStepPending) return;
    startLessonTransition(() => {
      const withCubeApply = undoLastSessionStep();
      if (withCubeApply) {
        undoLessonStep();
      }
      recomputeStep();
    });
  };

  const handleContinueIntro = () => {
    if (step?.kind !== 'intro') return;
    startLessonTransition(() => {
      advanceAfterStep(step, studentFrame);
      recomputeStep();
    });
  };

  const handleContinueOrientEdgesComplete = () => {
    if (step?.kind !== 'orient-edges-already-complete') return;
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
        step.kind === 'orient-edges' ||
        step.kind === 'permute-edges' ||
        step.kind === 'permute-corners' ||
        step.kind === 'orient-corners'
      ) {
        advanceAfterStep(step, studentFrame);
        if (step.demoMoves.length > 0) {
          applyLessonDemoMoves(step.demoMoves);
        }
      }
    });
  };

  const subLessonLabel =
    step?.kind === 'intro' && step.introId === 'overview'
      ? lastLayerLesson.defaultStepTitle
      : step?.kind === 'intro' && step.introId !== 'overview'
        ? {
            'orient-edges': LAST_LAYER_SUB_LESSON_LABELS.orientEdges,
            'permute-edges': LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
            'permute-corners': LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
            'orient-corners': LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
          }[step.introId]
        : isOrientEdgesLessonStep
          ? LAST_LAYER_SUB_LESSON_LABELS.orientEdges
          : cornerOrientPhase
            ? LAST_LAYER_SUB_LESSON_LABELS.orientCorners
            : cornerPermutePhase
              ? LAST_LAYER_SUB_LESSON_LABELS.permuteCorners
              : edgePermutePhase
                ? LAST_LAYER_SUB_LESSON_LABELS.permuteEdges
                : LAST_LAYER_SUB_LESSON_LABELS.orientEdges;

  const lastLayerProgressPhase: LastLayerProgressPhase = isOrientEdgesLessonStep
    ? 'orient-edges'
    : cornerOrientPhase
      ? 'orient-corners'
      : cornerPermutePhase
        ? 'permute-corners'
        : edgePermutePhase
          ? 'permute-edges'
          : 'orient-edges';

  const progressLabelForPhase = (solved: number) =>
    lastLayerProgressPhase === 'orient-edges'
      ? lastLayerLesson.progress.orientEdges(solved)
      : lastLayerProgressPhase === 'orient-corners'
        ? lastLayerLesson.progress.orientCorners(solved)
        : lastLayerProgressPhase === 'permute-corners'
          ? lastLayerLesson.progress.permuteCorners(solved)
          : lastLayerLesson.progress.permuteEdges(solved);

  const showProgress =
    !isLessonComplete &&
    step &&
    step.kind !== 'complete' &&
    step.kind !== 'prerequisite' &&
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
    ) : step?.kind === 'orient-edges-already-complete' ? (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={handleContinueOrientEdgesComplete}
        disabled={isStepPending}
      >
        {ui.continue}
      </button>
    ) : step?.kind === 'prerequisite' ? (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          onClick={() => setActiveLesson('white-cross')}
        >
          {lastLayerLesson.goToWhiteCross}
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
          onClick={() => setActiveLesson('white-corners')}
        >
          {lastLayerLesson.goToWhiteCorners}
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          onClick={() => setActiveLesson(MIDDLE_LAYER_EDGES_LESSON_ID)}
        >
          {lastLayerLesson.goToMiddleLayer}
        </button>
      </div>
    ) : undefined;

  return (
    <LessonViewShell
      header={{
        title: isLessonComplete
          ? lastLayerLesson.completeTitle
          : lastLayerLesson.title,
        subtitle: isLessonComplete
          ? undefined
          : lastLayerLesson.subtitle,
        titleClassName: isLessonComplete ? 'text-emerald-100' : undefined,
        progress: showProgress
          ? {
              ...lastLayerLessonProgress(
                studentFrame,
                lastLayerProgressPhase,
                progressLabelForPhase,
                currentHoldIndex,
              ),
              phaseLabel: `${lastLayerLesson.subLessonPrefix} ${subLessonLabel}`,
            }
          : undefined,
        sessionNotesSummary: 'Lesson session & reset',
        sessionNotes: [],
        canUndo,
        isStepPending,
        onUndo: handleUndoLessonStep,
        onRescan: startLessonRescan,
        onResetTips: handleRestartLessonTips,
      }}
      step={{
        title: isLessonComplete
          ? lastLayerLesson.completeTitle
          : displayStep.title,
        body: isLessonComplete
          ? lastLayerLesson.completeBody
          : displayStep.body || undefined,
        dimmed: showPreparingOverlay,
      }}
      cube={{
        isComplete: isLessonComplete,
        cubeState: studentFrame,
        completeCanvasKey: 'last-layer-lesson-complete-cube',
        visibleDemo,
        showPreparingOverlay,
        preparingSubtitle: lastLayerLesson.preparingSubtitle,
        celebrate: isLessonComplete,
      }}
      demo={
        isLessonComplete
          ? undefined
          : {
              canApply: canApplyDemo,
              applyLabel: isReorientStep ? ui.continue : ui.applyExampleContinue,
              applyHint: canApplyDemo ? applyHints.solve : undefined,
              onApply: handleApplyDemo,
              alternateActions: workflowAlternateActions,
            }
      }
      secondary={{
        lessonHold,
        showSameHoldNote:
          step !== null &&
          step.kind !== 'complete' &&
          step.kind !== 'prerequisite' &&
          step.kind !== 'intro' &&
          step.kind !== 'orient-edges-already-complete',
        showReorientNote: isReorientStep,
      }}
    />
  );
}
