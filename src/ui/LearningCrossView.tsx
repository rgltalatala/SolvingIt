import { useMemo, useTransition } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  formatColorLabel,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import { useCubeStore } from '../store/cubeStore';
import { useWhiteCrossLessonStep } from './lessons/bottomLayer/useWhiteCrossLessonStep';
import { LessonApplyPanel } from './lessons/LessonApplyPanel';
import { LessonAvoidBackPanel } from './lessons/LessonAvoidBackPanel';
import { LessonCubeStage } from './lessons/LessonCubeStage';
import { LessonHeaderActions } from './lessons/LessonHeaderActions';
import { PHYSICAL_CUBE_MATCH_NOTE } from './lessons/lessonCopy';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';

export function LearningCrossView() {
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
    return <LessonUnavailable onBack={() => setAppPhase('ready')} />;
  }

  const displayStep =
    step ??
    (showPreparingOverlay
      ? {
          kind: 'solve-edge' as const,
          title: 'Preparing lesson…',
          body: '',
          edgeLabel: '',
          partnerColor: 'white' as const,
        }
      : {
          kind: 'solve-edge' as const,
          title: 'White cross',
          body: '',
          edgeLabel: '',
          partnerColor: 'white' as const,
        });
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== 'complete';
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

  const handleUndoLessonStep = () => {
    if (!canUndoLesson || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
      recomputeStep();
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson: White cross</h1>
          <p className="mt-1 text-slate-300">
            Hold your cube with{' '}
            <span className="text-slate-100">white on the bottom</span> and{' '}
            <span className="text-slate-100">yellow on top</span>. Face{' '}
            <span className="text-slate-100">
              {formatColorLabel(lessonHold.F)} toward you
            </span>{' '}
            — that is the <span className="text-slate-100">front (F)</span> face
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
          {step && step.kind !== 'complete' && (
            <p className="mt-2 text-sm text-slate-400">
              Progress: <span className="text-slate-200">{solvedSlots}/4</span>{' '}
              cross edges solved (white on the bottom, side sticker matches its
              center).
            </p>
          )}
          <details className="mt-3 text-sm text-slate-400">
            <summary className="cursor-pointer text-slate-300 hover:text-slate-100">
              Lesson session & reset
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              <li>
                <span className="text-slate-300">Undo last example</span>{' '}
                restores the virtual cube to before your most recent Apply. The
                next step title may differ (for example a permute vs a slotting
                step) even though the cube matches an earlier point in the
                lesson.
              </li>
              <li>
                <span className="text-slate-300">Apply example</span> updates
                your virtual cube and advances the lesson. Orientation from y2
                bookends is stored on the cube; the internal hold flag resets
                each apply.
              </li>
              <li>
                <span className="text-slate-300">Reset lesson tips</span> clears
                the one-time rotation tip and hold flag only — your cube
                scramble is unchanged.
              </li>
              <li>
                <span className="text-slate-300">Start lesson</span> from the
                cube overview runs the same session reset before opening this
                view.
              </li>
              <li>
                Re-opening the lesson without starting fresh does not reset your
                cube or progress on it.
              </li>
            </ul>
          </details>
        </div>
        <LessonHeaderActions
          canUndo={canUndoLesson}
          isStepPending={isStepPending}
          onUndo={handleUndoLessonStep}
          onBack={() => setAppPhase('ready')}
          onResetTips={handleRestartLessonTips}
        />
      </header>

      <LessonCubeStage
        isComplete={isLessonComplete}
        cubeState={studentFrame}
        completeCanvasKey="lesson-complete-cube"
        visibleDemo={visibleDemo}
        showPreparingOverlay={showPreparingOverlay}
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
        {step && step.kind !== 'complete' && showAvoidBackToggle ? (
          <LessonAvoidBackPanel
            frontColor={lessonHold.F}
            avoidBackMoves={avoidBackMoves}
            onToggleAvoidBack={() => setAvoidBackMoves((v) => !v)}
            rememberAvoidBackDefault={rememberAvoidBackDefault}
            onRememberDefaultChange={setRememberAvoidBackDefault}
            showRotationCallout={showRotationCallout}
            onMarkCalloutSeen={markAvoidBackCalloutSeen}
            holdNote=" (usual lesson hold)"
          />
        ) : null}
        {step && step.kind !== 'complete' && (
          <p className="mt-3 text-xs text-slate-500">
            Same hold as the diagram: {formatColorLabel(lessonHold.F)} on F
            (front), {formatColorLabel(lessonHold.U)} on U (top),{' '}
            {formatColorLabel(lessonHold.D)} on D (bottom).
          </p>
        )}
        {isLessonComplete ? (
          <>
            <p className="mt-4 text-sm text-slate-400">
              All four cross edges are in place. Continue to white corners when
              you are ready, or use Back to cube overview.
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
                onClick={() => {
                  resetLessonSession();
                  setActiveLesson('white-corners');
                }}
              >
                Continue: White corners
              </button>
            </div>
          </>
        ) : null}
        {canApplyDemo ? (
          <LessonApplyPanel
            hint="When your physical cube matches the diagram and you have stepped through the example (or reproduced it on your cube), apply here to update the virtual cube and continue the lesson."
            buttonLabel="Apply example & continue"
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
        ) : null}
      </article>
    </section>
  );
}
