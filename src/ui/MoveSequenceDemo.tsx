import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CubeState, Move } from '../cube/cubeState';
import {
  faceCentersFromCubeState,
  formatColorLabel,
  isWholeCubeRotation,
  studentLessonHoldFaceCenters,
} from '../cube/cubeState';
import { applyMoves } from '../cube/cubeState';
import { cubeStateToCubeJsString } from '../cube/cubeStateToFacelets';
import {
  getDemoStepChipLabel,
  type DemoStep,
  type Instruction,
} from '../learn/studentHold';
import { MOVE_ANIMATION_PAUSE_MS } from '../cube3d/moveAnimation';
import type { CubeMoveAnimation } from '../cube3d/CubeView';
import { CubeView } from '../cube3d/CubeView';
import { LessonInstructionDemo } from './LessonInstructionDemo';

export type MoveAnimDirection = 'forward' | 'reverse';

export interface MoveSequenceDemoProps {
  baseCubeState: CubeState;
  moves: Move[];
  /** When set, chip labels reflect rotation purpose (y2 start / return). Length must match `moves`. */
  demoSteps?: DemoStep[];
  /** Full prose instructions (from {@link expandDemoToInstructions}). */
  instructions?: Instruction[];
  meshRotation?: [number, number, number];
  frameClassName?: string;
}

/**
 * Step-by-step preview of a move sequence on a copy of the cube (no store mutation).
 * Face turns and whole-cube rotations animate before advancing sticker state.
 */
export function MoveSequenceDemo({
  baseCubeState,
  moves,
  demoSteps,
  instructions,
  meshRotation = [0, 0, 0],
  frameClassName = 'h-[280px] w-full min-h-[240px] overflow-hidden rounded-lg border border-slate-600 bg-slate-950',
}: MoveSequenceDemoProps) {
  const [applied, setApplied] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animDirection, setAnimDirection] =
    useState<MoveAnimDirection>('forward');
  const [playing, setPlaying] = useState(false);
  const animDirectionRef = useRef<MoveAnimDirection>('forward');

  useEffect(() => {
    animDirectionRef.current = animDirection;
  }, [animDirection]);

  const hasMoves = moves.length > 0;

  /** Stable for the lesson session — do not tie to `applied` or animations (avoids WebGL remount flash). */
  const canvasKey = 'lesson-move-demo';

  const movesSignature = moves.join(' ');
  const baseStateKey = useMemo(
    () => cubeStateToCubeJsString(baseCubeState),
    [baseCubeState],
  );

  useEffect(() => {
    setApplied(0);
    setAnimating(false);
    setAnimDirection('forward');
    setPlaying(false);
  }, [movesSignature, baseStateKey]);

  const displayState = useMemo(() => {
    const stickerAppliedCount =
      animating && animDirection === 'reverse'
        ? Math.max(0, applied - 1)
        : applied;
    return applyMoves(baseCubeState, moves.slice(0, stickerAppliedCount));
  }, [baseCubeState, moves, applied, animating, animDirection]);

  const displayHold = useMemo(
    () => faceCentersFromCubeState(displayState),
    [displayState],
  );

  const reverseAnimating = animating && animDirection === 'reverse';
  const activeMoveIndex = animating
    ? reverseAnimating
      ? applied - 1
      : applied
    : -1;
  const pendingMove =
    animating && activeMoveIndex >= 0 && activeMoveIndex < moves.length
      ? moves[activeMoveIndex]
      : null;

  const handleAnimationComplete = useCallback(() => {
    setAnimating(false);
    if (animDirectionRef.current === 'reverse') {
      setApplied((a) => Math.max(0, a - 1));
    } else {
      setApplied((a) => Math.min(a + 1, moves.length));
    }
  }, [moves.length]);

  useEffect(() => {
    if (!playing || animating) return;
    if (applied >= moves.length) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => {
      setAnimDirection('forward');
      setAnimating(true);
    }, MOVE_ANIMATION_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [playing, animating, applied, moves.length]);

  const handlePlayAll = () => {
    if (!hasMoves) return;
    setApplied(0);
    setAnimating(false);
    setAnimDirection('forward');
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setAnimating(false);
    setAnimDirection('forward');
    setApplied(0);
  };

  const handleNext = () => {
    if (!hasMoves || animating || applied >= moves.length) return;
    setPlaying(false);
    setAnimDirection('forward');
    setAnimating(true);
  };

  const handlePrev = () => {
    if (!hasMoves || animating || applied <= 0) return;
    setPlaying(false);
    setAnimDirection('reverse');
    setAnimating(true);
  };

  const moveAnimation: CubeMoveAnimation | null = pendingMove
    ? {
        move: pendingMove,
        direction: animDirection,
        onComplete: handleAnimationComplete,
      }
    : null;

  const summary = !hasMoves
    ? 'Step through moves when this lesson step includes an example algorithm.'
    : animating
      ? reverseAnimating
        ? `Undoing: ${moves[applied - 1]}`
        : `Animating: ${moves[applied]}`
      : applied === 0
        ? 'Start position'
        : applied >= moves.length
          ? `Complete: ${moves.join(' ')}`
          : `Applied: ${moves.slice(0, applied).join(' ')}`;

  const defaultHold = studentLessonHoldFaceCenters();
  const holdForCopy = hasMoves ? displayHold : defaultHold;
  const instructionIndex =
    animating && reverseAnimating
      ? Math.max(0, applied - 1)
      : Math.min(applied, Math.max(0, (instructions?.length ?? 1) - 1));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">
          {hasMoves ? 'Example move sequence' : 'Interactive preview'}
        </h3>
        <p className="max-w-[min(100%,28rem)] font-mono text-xs leading-snug text-slate-400">
          {summary}
        </p>
      </div>

      <CubeView
        cubeState={displayState}
        meshRotation={meshRotation}
        frameClassName={frameClassName}
        canvasKey={canvasKey}
        cameraBaselineKey={baseStateKey}
        moveAnimation={moveAnimation}
      />

      {instructions && instructions.length > 0 ? (
        <LessonInstructionDemo
          instructions={instructions}
          activeIndex={instructionIndex}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
          onClick={handlePrev}
          disabled={!hasMoves || animating || applied <= 0}
        >
          Previous move
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
          onClick={handleNext}
          disabled={!hasMoves || animating || applied >= moves.length}
        >
          Next move
        </button>
        <button
          type="button"
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
          onClick={handlePlayAll}
          disabled={!hasMoves || animating}
        >
          {playing ? 'Playing…' : 'Play all'}
        </button>
      </div>

      {hasMoves ? (
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
                title={isRotation ? 'Whole-cube rotation' : undefined}
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
      ) : null}

      <p className="text-xs text-slate-500">
        {hasMoves ? (
          applied === 0 && !animating ? (
            <>
              The diagram matches your cube before this example. Face letters
              follow this hold: F = {formatColorLabel(holdForCopy.F)} (front), U
              = {formatColorLabel(holdForCopy.U)}, D ={' '}
              {formatColorLabel(holdForCopy.D)}. Layer turns animate on Next /
              Play all; Previous animates the undo.
            </>
          ) : (
            <>
              Hold labels match the diagram{' '}
              <span className="text-slate-400">
                {animating
                  ? 'during the current turn'
                  : 'after the moves applied so far'}
              </span>
              : F = {formatColorLabel(holdForCopy.F)} (front), U ={' '}
              {formatColorLabel(holdForCopy.U)}, D ={' '}
              {formatColorLabel(holdForCopy.D)}.
            </>
          )
        ) : (
          <>
            This lesson step has no example algorithm yet. The preview matches
            your current cube; Reset / Next / Play all appear on steps that
            include an example.
          </>
        )}
      </p>
    </div>
  );
}
