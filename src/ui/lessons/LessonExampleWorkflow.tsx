import type { ReactNode } from 'react';
import { isWholeCubeRotation } from '../../cube/cubeState';
import { getDemoStepChipLabel } from '../../learn/studentHold';
import { lessonLayout, moveSequenceDemo } from '../../content/tips';
import {
  useMoveSequenceDemoContext,
} from '../MoveSequenceDemo';
import { LessonApplyButton } from './LessonApplyPanel';

type LessonExampleWorkflowProps = {
  canApply: boolean;
  applyLabel: string;
  applyHint?: string;
  disabled?: boolean;
  onApply: () => void;
  /** When set, replaces demo controls (intro continue, prerequisite links, etc.). */
  alternateActions?: ReactNode;
};

function LessonExampleWorkflowInner({
  canApply,
  applyLabel,
  applyHint,
  disabled,
  onApply,
  alternateActions,
}: LessonExampleWorkflowProps) {
  const {
    hasMoves,
    summary,
    playing,
    animating,
    applied,
    moves,
    demoSteps,
    activeMoveIndex,
    reverseAnimating,
    handleReset,
    handlePrev,
    handleNext,
    handlePlayAll,
  } = useMoveSequenceDemoContext();

  if (alternateActions) {
    return (
      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
        {alternateActions}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">
          {hasMoves
            ? lessonLayout.exampleHeading
            : moveSequenceDemo.interactiveHeading}
        </h3>
        {hasMoves ? (
          <p className="font-mono text-xs text-slate-500">{summary}</p>
        ) : null}
      </div>

      {hasMoves ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
              onClick={handleReset}
            >
              {moveSequenceDemo.reset}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
              onClick={handlePrev}
              disabled={animating || applied <= 0}
            >
              {moveSequenceDemo.previousMove}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
              onClick={handleNext}
              disabled={animating || applied >= moves.length}
            >
              {moveSequenceDemo.nextMove}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
              onClick={handlePlayAll}
              disabled={animating}
            >
              {playing ? moveSequenceDemo.playing : moveSequenceDemo.playAll}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {moves.map((m, i) => {
              const done = reverseAnimating ? i < applied - 1 : i < applied;
              const nextUp = i === activeMoveIndex && animating;
              const isRotation = isWholeCubeRotation(m);
              const step = demoSteps?.[i];
              const label = step ? getDemoStepChipLabel(step) : m;
              return (
                <span
                  key={`${m}-${i}`}
                  title={
                    isRotation
                      ? moveSequenceDemo.wholeCubeRotationTitle
                      : undefined
                  }
                  className={`rounded px-2 py-0.5 font-mono text-xs ${
                    isRotation
                      ? done
                        ? 'bg-violet-900/50 text-violet-200'
                        : nextUp
                          ? 'bg-violet-900/40 text-violet-100 ring-1 ring-violet-600/60'
                          : 'bg-violet-950/60 text-violet-300/80'
                      : done
                        ? 'bg-emerald-900/45 text-emerald-200'
                        : nextUp
                          ? 'bg-amber-900/40 text-amber-100 ring-1 ring-amber-700/60'
                          : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500">
          {moveSequenceDemo.noAlgorithmYet}
        </p>
      )}

      {canApply ? (
        <div className="mt-1 flex flex-col gap-2">
          <LessonApplyButton
            buttonLabel={applyLabel}
            disabled={disabled ?? false}
            onApply={onApply}
            fullWidth
          />
          {applyHint ? (
            <p className="text-center text-xs text-slate-500">{applyHint}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/** Renders inside MoveSequenceDemoProvider (from LessonCubeStage). */
export function LessonExampleWorkflow(props: LessonExampleWorkflowProps) {
  return <LessonExampleWorkflowInner {...props} />;
}