import { useState } from 'react';
import { CubeView } from '../../cube3d/CubeView';
import {
  notationCubeRotations,
  notationFaceNames,
  notationFaceTurns,
  notationGuide as notationGuideCopy,
} from '../../content/notation';
import { NotationMoveCard } from './NotationMoveCard';
import {
  CUBE_ROTATION_MOVES,
  FACE_NAME_LABELS,
  FACE_TURN_MOVES,
  faceTurnDescription,
  rotationDescription,
} from './notationMoves';
import { useNotationCube } from './useNotationCube';
import { usePrefersHover } from './usePrefersHover';

type NotationGuideProps = {
  compact?: boolean;
};

export function NotationGuide({ compact = false }: NotationGuideProps) {
  const [replayAnimations, setReplayAnimations] = useState(false);
  const prefersHover = usePrefersHover();
  const {
    displayState,
    moveAnimation,
    resetOrientation,
    activateMoveCard,
    deactivateMoveCard,
    selectMoveCard,
    isCardActive,
    isCardAnimating,
  } = useNotationCube(replayAnimations);

  const canvasKey = 'notation-guide-cube';

  const cubeFrameClass = compact
    ? 'h-[220px] w-full overflow-hidden rounded-lg border border-slate-600 bg-slate-950'
    : 'h-[320px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 lg:h-[420px] lg:sticky lg:top-6';

  return (
    <div className={compact ? 'flex flex-col gap-4' : 'grid gap-6 lg:grid-cols-2'}>
      <div className="flex flex-col gap-2">
        <CubeView
          cubeState={displayState}
          meshRotation={[0, 0, 0]}
          frameClassName={cubeFrameClass}
          canvasKey={canvasKey}
          moveAnimation={moveAnimation}
          cameraBaselineKey={canvasKey}
          snapCameraOnWholeCubeRotation={false}
          enableOrbitControls={false}
        />
        <button
          type="button"
          className="self-start rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
          onClick={resetOrientation}
        >
          {notationGuideCopy.resetOrientation}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer items-center gap-2 self-start text-sm text-slate-300">
          <input
            type="checkbox"
            className="rounded border-slate-600"
            checked={replayAnimations}
            onChange={(e) => setReplayAnimations(e.target.checked)}
          />
          {notationGuideCopy.replayAnimations}
        </label>

        <article className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {notationFaceNames.heading}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{notationFaceNames.intro}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {FACE_NAME_LABELS.map(({ letter, label }) => (
              <div key={letter} className="flex gap-2 text-sm">
                <dt className="font-mono font-semibold text-slate-100">
                  {letter}
                </dt>
                <dd className="text-slate-400">= {label}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {notationFaceTurns.heading}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{notationFaceTurns.intro}</p>
          <div
            className={`mt-3 overflow-y-auto pr-1 ${compact ? 'max-h-44' : 'max-h-64 sm:max-h-72'}`}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FACE_TURN_MOVES.map((move) => (
                <NotationMoveCard
                  key={move}
                  move={move}
                  kind="face"
                  description={faceTurnDescription(move)}
                  isActive={isCardActive('face', move)}
                  isAnimating={isCardAnimating('face', move)}
                  prefersHover={prefersHover}
                  onActivate={activateMoveCard}
                  onDeactivate={deactivateMoveCard}
                  onSelect={selectMoveCard}
                  variant="face"
                />
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {notationCubeRotations.heading}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {notationCubeRotations.intro}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CUBE_ROTATION_MOVES.map((move) => (
              <NotationMoveCard
                key={move}
                move={move}
                kind="rotation"
                description={rotationDescription(move)}
                isActive={isCardActive('rotation', move)}
                isAnimating={isCardAnimating('rotation', move)}
                prefersHover={prefersHover}
                onActivate={activateMoveCard}
                onDeactivate={deactivateMoveCard}
                onSelect={selectMoveCard}
                variant="rotation"
              />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
