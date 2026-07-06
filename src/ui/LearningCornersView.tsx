import { useMemo, useTransition } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  formatColorLabel,
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
import {
  applyHints,
  PHYSICAL_CUBE_MATCH_NOTE,
  preparing,
  REORIENT_HOLD_NOTE,
  SAME_HOLD_NOTE,
} from '../content/tips';
import { ui } from '../content/ui';
import {
  continueToLesson,
  leaveLessonToOverview,
} from '../learn/lessonSessionPersistence';
import { useCubeStore } from '../store/cubeStore';
import { useWhiteCornerLessonStep } from './lessons/bottomLayer/useWhiteCornerLessonStep';
import {
  LessonApplyButton,
  LessonApplyPanel,
} from './lessons/LessonApplyPanel';
import { LessonAvoidBackPanel } from './lessons/LessonAvoidBackPanel';
import { LessonCubeStage } from './lessons/LessonCubeStage';
import { LessonHeaderActions } from './lessons/LessonHeaderActions';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
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

export function LearningCornersView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
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

  const leaveLesson = () => {
    leaveLessonToOverview();
  };

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
    return <LessonUnavailable onBack={leaveLesson} />;
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

  const trailingActions = canApplyDemo ? (
    <LessonApplyButton
      buttonLabel={isReorientStep ? ui.continue : ui.applyExampleContinue}
      disabled={isStepPending}
      onApply={handleApplyDemo}
    />
  ) : undefined;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{whiteCornersLesson.title}</h1>
          <p className="mt-1 text-slate-300">
            Hold your cube with{' '}
            <span className="text-slate-100">white on the bottom</span> and{' '}
            <span className="text-slate-100">yellow on top</span>. Face{' '}
            <span className="text-slate-100">
              {formatColorLabel(lessonHold.F)} toward you
            </span>{' '}
            . That is the <span className="text-slate-100">front (F)</span> face
            in the diagram below.
          </p>
          {!isLessonComplete ? (
            <p className="mt-2 text-sm text-slate-400">
              {PHYSICAL_CUBE_MATCH_NOTE}
            </p>
          ) : null}
          {step &&
          step.kind !== 'complete' &&
          step.kind !== 'cross-prerequisite' &&
          step.kind !== 'intro' ? (
            <p className="mt-2 text-sm text-slate-400">
              {whiteCornersLesson.progress(solvedSlots)}
            </p>
          ) : null}
          <details className="mt-3 text-sm text-slate-400">
            <summary className="cursor-pointer text-slate-300 hover:text-slate-100">
              {whiteCornersLesson.sessionNotesSummary}
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              {whiteCornersLesson.sessionNotes.map((note) => (
                <li key={note.text}>
                  <span className="text-slate-300">{note.label}</span> {note.text}
                </li>
              ))}
            </ul>
          </details>
        </div>
        <LessonHeaderActions
          canUndo={canUndo}
          isStepPending={isStepPending}
          onUndo={handleUndoLessonStep}
          onRescan={startLessonRescan}
          onBack={leaveLesson}
          onResetTips={handleRestartLessonTips}
          extraActions={
            <button
              type="button"
              className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              onClick={handleResetCornerSession}
            >
              {whiteCornersLesson.resetCornerSession}
            </button>
          }
        />
      </header>

      <LessonCubeStage
        isComplete={isLessonComplete}
        cubeState={studentFrame}
        completeCanvasKey="corners-lesson-complete-cube"
        visibleDemo={visibleDemo}
        showPreparingOverlay={showPreparingOverlay}
        preparingSubtitle={whiteCornersLesson.preparingSubtitle}
        trailingActions={trailingActions}
      />

      <article
        className={`rounded-xl border border-slate-700 bg-slate-900/80 p-4 ${showPreparingOverlay ? 'opacity-60' : ''}`}
      >
        <h2 className="text-lg font-semibold text-slate-100">
          {displayStep.title}
        </h2>
        {displayStep.body ? (
          <p className="mt-2 whitespace-pre-wrap text-slate-300">
            {displayStep.body}
          </p>
        ) : null}

        {step?.kind === 'intro' ? (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
              onClick={handleContinueIntro}
              disabled={isStepPending}
            >
              {ui.continue}
            </button>
          </div>
        ) : null}

        {step?.kind === 'cross-prerequisite' ? (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
              onClick={() => setActiveLesson('white-cross')}
            >
              {whiteCornersLesson.goToWhiteCross}
            </button>
          </div>
        ) : null}

        {step && step.kind !== 'complete' && showAvoidBackToggle ? (
          <LessonAvoidBackPanel
            frontColor={lessonHold.F}
            avoidBackMoves={avoidBackMoves}
            onToggleAvoidBack={() => setAvoidBackMoves((v) => !v)}
            rememberAvoidBackDefault={rememberAvoidBackDefault}
            onRememberDefaultChange={setRememberAvoidBackDefault}
            showRotationCallout={showRotationCallout}
            onMarkCalloutSeen={markAvoidBackCalloutSeen}
          />
        ) : null}

        {step &&
        step.kind !== 'complete' &&
        step.kind !== 'cross-prerequisite' &&
        step.kind !== 'intro' ? (
          <p className="mt-3 text-xs text-slate-500">
            {SAME_HOLD_NOTE(
              formatColorLabel(lessonHold.F),
              formatColorLabel(lessonHold.U),
              formatColorLabel(lessonHold.D),
            )}
            {isReorientStep ? REORIENT_HOLD_NOTE : null}
          </p>
        ) : null}

        {canApplyDemo ? (
          <LessonApplyPanel
            hint={
              isReorientStep ? applyHints.reorient : applyHints.solve
            }
          />
        ) : null}

        {isLessonComplete ? (
          <>
            <p className="mt-4 text-sm text-slate-400">
              {whiteCornersLesson.completeBody}
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                onClick={() => continueToLesson(MIDDLE_LAYER_EDGES_LESSON_ID)}
              >
                {whiteCornersLesson.continueMiddleLayer}
              </button>
            </div>
          </>
        ) : null}
      </article>
    </section>
  );
}
