import { useMemo, useTransition } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  formatColorLabel,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import { whiteCrossLesson } from '../content/whiteCross';
import {
  applyHints,
  lessonAvoidBack,
  PHYSICAL_CUBE_MATCH_NOTE,
  preparing,
  SAME_HOLD_NOTE,
} from '../content/tips';
import { ui } from '../content/ui';
import {
  continueToLesson,
  leaveLessonToOverview,
} from '../learn/lessonSessionPersistence';
import { useCubeStore } from '../store/cubeStore';
import { useWhiteCrossLessonStep } from './lessons/bottomLayer/useWhiteCrossLessonStep';
import { LessonApplyButton, LessonApplyPanel } from './lessons/LessonApplyPanel';
import { LessonAvoidBackPanel } from './lessons/LessonAvoidBackPanel';
import { LessonCubeStage } from './lessons/LessonCubeStage';
import { LessonHeaderActions } from './lessons/LessonHeaderActions';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';

export function LearningCrossView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
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
    advanceAfterStep,
    resetStrategyIntro,
  } = useWhiteCrossLessonStep(studentFrame);

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
    return <LessonUnavailable onBack={leaveLesson} />;
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

  const trailingActions = canApplyDemo ? (
    <LessonApplyButton
      buttonLabel={ui.applyExampleContinue}
      disabled={isStepPending}
      onApply={() => {
        startLessonTransition(() => {
          if (avoidOn) {
            applyLessonStep(demoMoves, { avoidBackMoves: true });
            if (previewMoves.includes('y2') && !hasSeenAvoidBackCallout)
              markAvoidBackCalloutSeen();
          } else {
            applyLessonDemoMoves(demoMoves);
          }
        });
      }}
    />
  ) : undefined;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{whiteCrossLesson.title}</h1>
          <p className="mt-1 text-slate-300">
            Hold your cube with{' '}
            <span className="text-slate-100">white on the bottom</span> and{' '}
            <span className="text-slate-100">yellow on top</span>. Face{' '}
            <span className="text-slate-100">
              {formatColorLabel(lessonHold.F)} toward you
            </span>{' '}
            . That is the <span className="text-slate-100">front (F)</span> face
            in the diagram below (the virtual cube shows{' '}
            {formatColorLabel(lessonHold.F)} on F). Notation: U ={' '}
            {formatColorLabel(lessonHold.U)}, D ={' '}
            {formatColorLabel(lessonHold.D)}, F ={' '}
            {formatColorLabel(lessonHold.F)}.
          </p>
          {!isLessonComplete ? (
            <p className="mt-2 text-sm text-slate-400">
              {PHYSICAL_CUBE_MATCH_NOTE}
            </p>
          ) : null}
          {step && step.kind !== 'complete' && step.kind !== 'intro' && (
            <p className="mt-2 text-sm text-slate-400">
              {whiteCrossLesson.progress(solvedSlots)}
            </p>
          )}
          <details className="mt-3 text-sm text-slate-400">
            <summary className="cursor-pointer text-slate-300 hover:text-slate-100">
              {whiteCrossLesson.sessionNotesSummary}
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              {whiteCrossLesson.sessionNotes.map((note) => (
                <li key={note.text}>
                  {note.label ? (
                    <>
                      <span className="text-slate-300">{note.label}</span>{' '}
                      {note.text}
                    </>
                  ) : (
                    note.text
                  )}
                </li>
              ))}
            </ul>
          </details>
        </div>
        <LessonHeaderActions
          canUndo={canUndoLesson}
          isStepPending={isStepPending}
          onUndo={handleUndoLessonStep}
          onRescan={startLessonRescan}
          onBack={leaveLesson}
          onResetTips={handleRestartLessonTips}
        />
      </header>

      <LessonCubeStage
        isComplete={isLessonComplete}
        cubeState={studentFrame}
        completeCanvasKey="lesson-complete-cube"
        visibleDemo={visibleDemo}
        showPreparingOverlay={showPreparingOverlay}
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
        {step && step.kind !== 'complete' && step.kind !== 'intro' && showAvoidBackToggle ? (
          <LessonAvoidBackPanel
            frontColor={lessonHold.F}
            avoidBackMoves={avoidBackMoves}
            onToggleAvoidBack={() => setAvoidBackMoves((v) => !v)}
            rememberAvoidBackDefault={rememberAvoidBackDefault}
            onRememberDefaultChange={setRememberAvoidBackDefault}
            showRotationCallout={showRotationCallout}
            onMarkCalloutSeen={markAvoidBackCalloutSeen}
            holdNote={lessonAvoidBack.usualLessonHold}
          />
        ) : null}
        {step &&
        step.kind !== 'complete' &&
        step.kind !== 'intro' && (
          <p className="mt-3 text-xs text-slate-500">
            {SAME_HOLD_NOTE(
              formatColorLabel(lessonHold.F),
              formatColorLabel(lessonHold.U),
              formatColorLabel(lessonHold.D),
            )}
          </p>
        )}
        {isLessonComplete ? (
          <>
            <p className="mt-4 text-sm text-slate-400">
              {whiteCrossLesson.completeBody}
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
                onClick={() => continueToLesson('white-corners')}
              >
                {whiteCrossLesson.continueWhiteCorners}
              </button>
            </div>
          </>
        ) : null}
        {canApplyDemo ? (
          <LessonApplyPanel hint={applyHints.default} />
        ) : null}
      </article>
    </section>
  );
}
