import { useMemo, useTransition } from 'react';
import type { Move } from '../cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  formatColorLabel,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import { LAST_LAYER_SUB_LESSONS } from '../learn/layers/lastLayer';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { useCubeStore } from '../store/cubeStore';
import { useLastLayerLessonStep } from './lessons/lastLayer/useLastLayerLessonStep';
import {
  LessonApplyButton,
  LessonApplyPanel,
} from './lessons/LessonApplyPanel';
import { LessonCubeStage } from './lessons/LessonCubeStage';
import { LessonHeaderActions } from './lessons/LessonHeaderActions';
import { PHYSICAL_CUBE_MATCH_NOTE } from './lessons/lessonCopy';
import { LessonUnavailable } from './lessons/LessonUnavailable';
import { useLessonDemoPipeline } from './lessons/useLessonDemoPipeline';

const ORIENT_EDGES_SUB_LESSON = LAST_LAYER_SUB_LESSONS[0];

export function LearningLastLayerView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const activeLesson = useCubeStore((state) => state.activeLesson);
  const applyLessonDemoMoves = useCubeStore(
    (state) => state.applyLessonDemoMoves,
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
    advanceAfterStep,
  } = useLastLayerLessonStep(studentFrame, { resetKey: activeLesson });

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

  const { visibleDemo } = useLessonDemoPipeline({
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
          kind: 'align-u' as const,
          title: 'Preparing lesson…',
          body: '',
          demoMoves: [] as Move[],
          ollCase: 'l-shape' as const,
        }
      : {
          kind: 'align-u' as const,
          title: 'Last layer',
          body: '',
          demoMoves: [] as Move[],
          ollCase: 'l-shape' as const,
        });

  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== 'complete' &&
    step.kind !== 'prerequisite';

  const handleRestartLessonTips = () => {
    resetLessonSession();
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndoLesson || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
    });
  };

  const handleApplyDemo = () => {
    if (!step || !canApplyDemo) return;
    startLessonTransition(() => {
      if (step.kind === 'align-u' || step.kind === 'orient-edges') {
        advanceAfterStep(step, studentFrame);
        applyLessonDemoMoves(step.demoMoves);
      }
    });
  };

  const trailingActions = canApplyDemo ? (
    <LessonApplyButton
      buttonLabel="Apply example & continue"
      disabled={isStepPending}
      onApply={handleApplyDemo}
    />
  ) : undefined;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson: Last layer</h1>
          <p className="mt-1 text-sm text-violet-300">
            Sub-lesson: Orient edges
          </p>
          <p className="mt-1 text-slate-300">
            Hold your cube with{' '}
            <span className="text-slate-100">white on the bottom</span> and{' '}
            <span className="text-slate-100">yellow on top</span>. Face{' '}
            <span className="text-slate-100">
              {formatColorLabel(lessonHold.F)} toward you
            </span>{' '}
            — that is the <span className="text-slate-100">front (F)</span> face
            in the diagram below.
          </p>
          {!isLessonComplete ? (
            <p className="mt-2 text-sm text-slate-400">
              {PHYSICAL_CUBE_MATCH_NOTE}
            </p>
          ) : null}
          {step &&
          step.kind !== 'complete' &&
          step.kind !== 'prerequisite' ? (
            <p className="mt-2 text-sm text-slate-400">
              Progress: <span className="text-slate-200">{solvedSlots}/4</span>{' '}
              top edges oriented (yellow sticker on U).
            </p>
          ) : null}
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
        completeCanvasKey="last-layer-lesson-complete-cube"
        visibleDemo={visibleDemo}
        showPreparingOverlay={showPreparingOverlay}
        preparingSubtitle="Finding a demo for this last-layer step."
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

        {step?.kind === 'prerequisite' ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              onClick={() => setActiveLesson('white-cross')}
            >
              Go to white cross lesson
            </button>
            <button
              type="button"
              className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
              onClick={() => setActiveLesson('white-corners')}
            >
              Go to white corners lesson
            </button>
            <button
              type="button"
              className="inline-flex rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
              onClick={() => setActiveLesson(MIDDLE_LAYER_EDGES_LESSON_ID)}
            >
              Go to middle layer edges lesson
            </button>
          </div>
        ) : null}

        {step &&
        step.kind !== 'complete' &&
        step.kind !== 'prerequisite' ? (
          <p className="mt-3 text-xs text-slate-500">
            Same hold as the diagram: {formatColorLabel(lessonHold.F)} on F
            (front), {formatColorLabel(lessonHold.U)} on U (top),{' '}
            {formatColorLabel(lessonHold.D)} on D (bottom).
          </p>
        ) : null}

        {canApplyDemo ? (
          <LessonApplyPanel hint="When your physical cube matches the diagram and you have stepped through the example, apply here to update the virtual cube and continue." />
        ) : null}

        {isLessonComplete ? (
          <p className="mt-4 text-sm text-slate-400">
            The yellow cross is complete ({ORIENT_EDGES_SUB_LESSON} finished).
            Use Back to cube overview when you are ready.
          </p>
        ) : null}
      </article>
    </section>
  );
}
