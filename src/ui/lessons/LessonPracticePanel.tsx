import { isWholeCubeRotation } from '../../cube/cubeState';
import { getDemoStepChipLabel } from '../../learn/studentHold';
import { lessonLayout, moveSequenceDemo } from '../../content/tips';
import {
  useMoveSequenceDemoContext,
  type PlaybackSpeed,
} from '../MoveSequenceDemo';
import { demoMoveChipClassName } from './demoMoveChipClassName';

const SPEED_CYCLE: PlaybackSpeed[] = [0.5, 1, 2];

function controlButtonClass(disabled?: boolean): string {
  return `min-w-0 flex-1 truncate rounded-lg border border-slate-600 bg-slate-800 px-1.5 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 sm:px-3 ${
    disabled ? 'opacity-40' : ''
  }`;
}

function practiceFocusIndex(
  activeMoveIndex: number,
  applied: number,
  moveCount: number,
): number {
  if (activeMoveIndex >= 0) return activeMoveIndex;
  if (applied >= moveCount) return moveCount - 1;
  return applied;
}

function demoMoveChipText(
  label: string,
  done: boolean,
  highlighted: boolean,
): string {
  if (highlighted) return `► ${label}`;
  if (done) return `✓ ${label}`;
  return label;
}

/**
 * Unified Practice panel: goal summary, playback controls, interactive algorithm,
 * and current-move explanation.
 */
export function LessonPracticePanel({
  practiceGoalSummary,
}: {
  practiceGoalSummary?: string;
}) {
  const {
    hasMoves,
    playing,
    animating,
    applied,
    moves,
    demoSteps,
    instructions,
    instructionIndex,
    activeMoveIndex,
    reverseAnimating,
    playbackSpeed,
    handleReset,
    handlePrev,
    handleNext,
    handlePlayAll,
    handleJumpTo,
    setPlaybackSpeed,
  } = useMoveSequenceDemoContext();

  if (!hasMoves) {
    return (
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-200">
          {lessonLayout.practiceHeading}
        </h3>
        {practiceGoalSummary ? (
          <p className="text-sm leading-snug text-slate-300">
            {practiceGoalSummary}
          </p>
        ) : null}
        <p className="text-xs text-slate-500">{moveSequenceDemo.noAlgorithmYet}</p>
      </section>
    );
  }

  const focusIndex = practiceFocusIndex(activeMoveIndex, applied, moves.length);

  const currentInstruction =
    instructions && instructions.length > 0
      ? instructions[Math.min(instructionIndex, instructions.length - 1)]
      : null;

  const focusLabel = (() => {
    const step = demoSteps?.[focusIndex];
    if (step) return getDemoStepChipLabel(step);
    return moves[focusIndex] ?? '';
  })();

  const cycleSpeed = () => {
    const idx = SPEED_CYCLE.indexOf(playbackSpeed);
    const next = SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length]!;
    setPlaybackSpeed(next);
  };

  return (
    <section className="flex flex-col gap-2.5">
      {practiceGoalSummary ? (
        <p className="text-sm leading-snug text-slate-200">
          {practiceGoalSummary}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-slate-200">
          {lessonLayout.practiceHeading}
        </h3>
        <div
          className="flex flex-nowrap items-center gap-1 sm:gap-1.5"
          role="group"
          aria-label={lessonLayout.practiceHeading}
        >
          <button
            type="button"
            className={controlButtonClass()}
            onClick={handlePlayAll}
          >
            {playing ? lessonLayout.pause : lessonLayout.play}
          </button>
          <button
            type="button"
            className={controlButtonClass(animating || applied <= 0)}
            onClick={handlePrev}
            disabled={animating || applied <= 0}
            aria-label={moveSequenceDemo.previousMove}
          >
            {moveSequenceDemo.previousMoveShort}
          </button>
          <button
            type="button"
            className={controlButtonClass(animating || applied >= moves.length)}
            onClick={handleNext}
            disabled={animating || applied >= moves.length}
            aria-label={moveSequenceDemo.nextMove}
          >
            {moveSequenceDemo.nextMoveShort}
          </button>
          <button
            type="button"
            className={controlButtonClass()}
            onClick={handleReset}
          >
            {moveSequenceDemo.reset}
          </button>
          <button
            type="button"
            className={controlButtonClass()}
            onClick={cycleSpeed}
            aria-label={`Playback speed ${playbackSpeed}x`}
            title={`Playback speed ${playbackSpeed}x`}
          >
            {lessonLayout.speedLabel(String(playbackSpeed))}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {lessonLayout.algorithmHeading}
        </p>
        <div
          className="flex flex-wrap gap-1.5 p-0.5"
          aria-label={lessonLayout.algorithmHeading}
        >
          {moves.map((m, i) => {
            const done = reverseAnimating ? i < applied - 1 : i < applied;
            const nextUp = i === activeMoveIndex && animating;
            const isCurrentIdle = !animating && i === applied && applied < moves.length;
            const highlighted = nextUp || isCurrentIdle;
            const isRotation = isWholeCubeRotation(m);
            const step = demoSteps?.[i];
            const label = step ? getDemoStepChipLabel(step) : m;
            const chipClass = demoMoveChipClassName({
              isRotation,
              done: done && !highlighted,
              nextUp: highlighted,
            });

            return (
              <button
                key={`${m}-${i}`}
                type="button"
                disabled={animating}
                title={
                  isRotation
                    ? moveSequenceDemo.wholeCubeRotationTitle
                    : `Jump to ${label}`
                }
                aria-current={highlighted ? 'step' : undefined}
                aria-label={`${label}${done ? ', done' : ''}${highlighted ? ', current' : ''}`}
                className={`rounded-md px-2.5 py-1.5 font-mono text-sm font-semibold transition-colors disabled:cursor-wait ${chipClass}`}
                onClick={() => handleJumpTo(i)}
              >
                {demoMoveChipText(label, done, highlighted)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-amber-900/30 bg-amber-950/15 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/80">
          {lessonLayout.moveOf(focusIndex + 1, moves.length)}
        </p>
        <p className="mt-1 font-mono text-xl font-bold text-amber-100">
          [{focusLabel}]
        </p>
        {currentInstruction ? (
          <p className="mt-1.5 text-sm leading-snug text-slate-100">
            {currentInstruction.text}
          </p>
        ) : null}
      </div>
    </section>
  );
}
