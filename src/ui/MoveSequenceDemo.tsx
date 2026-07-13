import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
import { moveSequenceDemo } from '../content/tips';
import { getMoveSequenceSummary } from './getMoveSequenceSummary';
import { demoMoveChipClassName } from './lessons/demoMoveChipClassName';
import { LessonInstructionDemo } from './LessonInstructionDemo';

export type MoveAnimDirection = 'forward' | 'reverse';

export interface MoveSequenceDemoProps {
  baseCubeState: CubeState;
  moves: Move[];
  /** When set, chip labels reflect rotation purpose (y2 start / return). Length must match `moves`. */
  demoSteps?: DemoStep[];
  /** Full prose instructions (from {@link expandDemoToInstructions}). */
  instructions?: Instruction[];
  /** Move counts per instruction when one line covers multiple moves (e.g. zero-flow phases). */
  instructionPhaseLengths?: number[];
  meshRotation?: [number, number, number];
  frameClassName?: string;
  /** Rendered at the end of the demo control row (e.g. apply / continue). */
  trailingActions?: ReactNode;
}

type MoveSequenceDemoContextValue = {
  hasMoves: boolean;
  moves: Move[];
  demoSteps?: DemoStep[];
  instructions?: Instruction[];
  summary: string;
  playing: boolean;
  applied: number;
  animating: boolean;
  instructionIndex: number;
  activeMoveIndex: number;
  reverseAnimating: boolean;
  displayState: CubeState;
  meshRotation: [number, number, number];
  frameClassName: string;
  baseStateKey: string;
  holdForCopy: ReturnType<typeof studentLessonHoldFaceCenters>;
  handleReset: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  handlePlayAll: () => void;
  moveAnimation: CubeMoveAnimation | null;
  canvasKey: string;
};

const MoveSequenceDemoContext =
  createContext<MoveSequenceDemoContextValue | null>(null);

export function useMoveSequenceDemoContext() {
  const value = useContext(MoveSequenceDemoContext);
  if (!value) {
    throw new Error(
      'MoveSequenceDemo parts must be rendered inside MoveSequenceDemoProvider',
    );
  }
  return value;
}

function useMoveSequenceDemoState({
  baseCubeState,
  moves,
  demoSteps,
  instructions,
  instructionPhaseLengths,
  meshRotation = [0, 0, 0],
  frameClassName = 'h-[280px] w-full min-h-[240px] overflow-hidden rounded-lg border border-slate-600 bg-slate-950',
}: Omit<MoveSequenceDemoProps, 'trailingActions'>): MoveSequenceDemoContextValue {
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

  const summary = getMoveSequenceSummary({
    hasMoves,
    animating,
    reverseAnimating,
    applied,
    moves,
  });

  const defaultHold = studentLessonHoldFaceCenters();
  const holdForCopy = hasMoves ? displayHold : defaultHold;
  const completedMoves =
    animating && reverseAnimating ? Math.max(0, applied - 1) : applied;

  const instructionIndex = (() => {
    if (!instructions?.length) return 0;
    if (instructionPhaseLengths?.length) {
      let end = 0;
      for (let i = 0; i < instructionPhaseLengths.length; i += 1) {
        end += instructionPhaseLengths[i]!;
        if (completedMoves < end) return i;
      }
      return instructionPhaseLengths.length - 1;
    }
    return Math.min(completedMoves, instructions.length - 1);
  })();

  return {
    hasMoves,
    moves,
    demoSteps,
    instructions,
    summary,
    playing,
    applied,
    animating,
    instructionIndex,
    activeMoveIndex,
    reverseAnimating,
    displayState,
    meshRotation,
    frameClassName,
    baseStateKey,
    holdForCopy,
    handleReset,
    handlePrev,
    handleNext,
    handlePlayAll,
    moveAnimation,
    canvasKey,
  };
}

type MoveSequenceDemoProviderProps = MoveSequenceDemoProps & {
  children: ReactNode;
};

export function MoveSequenceDemoProvider({
  children,
  ...props
}: MoveSequenceDemoProviderProps) {
  const value = useMoveSequenceDemoState(props);

  return (
    <MoveSequenceDemoContext.Provider value={value}>
      {children}
    </MoveSequenceDemoContext.Provider>
  );
}

export function MoveSequenceDemoCube() {
  const {
    displayState,
    meshRotation,
    frameClassName,
    canvasKey,
    baseStateKey,
    moveAnimation,
  } = useMoveSequenceDemoContext();

  return (
    <CubeView
      cubeState={displayState}
      meshRotation={meshRotation}
      frameClassName={frameClassName}
      canvasKey={canvasKey}
      cameraBaselineKey={baseStateKey}
      moveAnimation={moveAnimation}
    />
  );
}

export function MoveSequenceDemoSummary() {
  const { hasMoves, summary } = useMoveSequenceDemoContext();

  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h3 className="text-sm font-semibold text-slate-200">
        {hasMoves
          ? moveSequenceDemo.exampleHeading
          : moveSequenceDemo.interactiveHeading}
      </h3>
      <p className="max-w-[min(100%,28rem)] font-mono text-xs leading-snug text-slate-400">
        {summary}
      </p>
    </div>
  );
}

type MoveSequenceDemoControlsProps = {
  trailingActions?: ReactNode;
  showSummary?: boolean;
};

export function MoveSequenceDemoControls({
  trailingActions,
  showSummary = false,
}: MoveSequenceDemoControlsProps) {
  const {
    hasMoves,
    playing,
    animating,
    applied,
    moves,
    handleReset,
    handlePrev,
    handleNext,
    handlePlayAll,
  } = useMoveSequenceDemoContext();

  return (
    <div className={showSummary ? 'flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4' : undefined}>
      {showSummary ? <MoveSequenceDemoSummary /> : null}

      <div className="flex flex-wrap items-center gap-2">
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
            disabled={!hasMoves || animating || applied <= 0}
          >
            {moveSequenceDemo.previousMove}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
            onClick={handleNext}
            disabled={!hasMoves || animating || applied >= moves.length}
          >
            {moveSequenceDemo.nextMove}
          </button>
          <button
            type="button"
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
            onClick={handlePlayAll}
            disabled={!hasMoves || animating}
          >
            {playing ? moveSequenceDemo.playing : moveSequenceDemo.playAll}
          </button>
        </div>
        {trailingActions ? (
          <div className="ml-auto flex shrink-0 items-center">{trailingActions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function MoveSequenceDemoStepInstructions() {
  const {
    hasMoves,
    moves,
    demoSteps,
    instructions,
    instructionIndex,
    activeMoveIndex,
    reverseAnimating,
    applied,
    animating,
    holdForCopy,
  } = useMoveSequenceDemoContext();

  return (
    <div className="flex flex-col gap-3">
      {instructions && instructions.length > 0 ? (
        <LessonInstructionDemo
          instructions={instructions}
          activeIndex={instructionIndex}
        />
      ) : null}

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
                title={
                  isRotation ? moveSequenceDemo.wholeCubeRotationTitle : undefined
                }
                className={`rounded px-2 py-0.5 font-mono text-xs ${demoMoveChipClassName(
                  { isRotation, done, nextUp },
                )}`}
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
              {moveSequenceDemo.holdBeforeExample(
                formatColorLabel(holdForCopy.F),
                formatColorLabel(holdForCopy.U),
                formatColorLabel(holdForCopy.D),
              )}
            </>
          ) : (
            <>
              {moveSequenceDemo.holdDuringOrAfter(
                animating
                  ? moveSequenceDemo.holdTimingAnimating
                  : moveSequenceDemo.holdTimingAfter,
                formatColorLabel(holdForCopy.F),
                formatColorLabel(holdForCopy.U),
                formatColorLabel(holdForCopy.D),
              )}
            </>
          )
        ) : (
          <>{moveSequenceDemo.noAlgorithmYet}</>
        )}
      </p>
    </div>
  );
}

/**
 * Step-by-step preview of a move sequence on a copy of the cube (no store mutation).
 * Face turns and whole-cube rotations animate before advancing sticker state.
 */
export function MoveSequenceDemo({
  trailingActions,
  ...props
}: MoveSequenceDemoProps) {
  return (
    <MoveSequenceDemoProvider {...props}>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
        <MoveSequenceDemoSummary />
        <MoveSequenceDemoCube />
        <MoveSequenceDemoControls trailingActions={trailingActions} />
        <MoveSequenceDemoStepInstructions />
      </div>
    </MoveSequenceDemoProvider>
  );
}
