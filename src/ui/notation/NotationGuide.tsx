import { useState } from 'react';
import type { Face } from '../../cube/cubeState';
import type { CubiePieceType } from '../../cube3d/cubeAnatomy';
import { CubeView } from '../../cube3d/CubeView';
import {
  notationCubePieces,
  notationCubeRotations,
  notationFaceNames,
  notationFaceTurns,
  notationGuide as notationGuideCopy,
} from '../../content/notation';
import { FaceNameCard } from './FaceNameCard';
import { NotationMoveCard } from './NotationMoveCard';
import { PieceTypeCard } from './PieceTypeCard';
import {
  CUBE_ROTATION_MOVES,
  FACE_NAME_LABELS,
  FACE_TURN_MOVES,
  faceTurnDescription,
  rotationDescription,
} from './notationMoves';
import { useNotationCube } from './useNotationCube';
import { usePrefersHover } from './usePrefersHover';

type NotationSectionId =
  | 'cubePieces'
  | 'faceNames'
  | 'faceTurns'
  | 'cubeRotations';

const NOTATION_SECTIONS: { id: NotationSectionId; label: string }[] = [
  { id: 'cubePieces', label: notationCubePieces.heading },
  { id: 'faceNames', label: notationFaceNames.heading },
  { id: 'faceTurns', label: notationFaceTurns.heading },
  { id: 'cubeRotations', label: notationCubeRotations.heading },
];

const PIECE_TYPE_CARDS: {
  pieceType: CubiePieceType;
  label: string;
  description: string;
}[] = [
  {
    pieceType: 'center',
    label: notationCubePieces.labels.center,
    description: notationCubePieces.descriptions.center,
  },
  {
    pieceType: 'edge',
    label: notationCubePieces.labels.edge,
    description: notationCubePieces.descriptions.edge,
  },
  {
    pieceType: 'corner',
    label: notationCubePieces.labels.corner,
    description: notationCubePieces.descriptions.corner,
  },
];

export function NotationGuide() {
  const [activeSection, setActiveSection] = useState<NotationSectionId>('cubePieces');
  const [highlightedFace, setHighlightedFace] = useState<Face | null>(null);
  const [highlightedPieceType, setHighlightedPieceType] = useState<CubiePieceType | null>(null);
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
  const isAnatomySection =
    activeSection === 'cubePieces' || activeSection === 'faceNames';
  const showReplayCheckbox =
    activeSection === 'faceTurns' || activeSection === 'cubeRotations';

  const handleSectionChange = (sectionId: NotationSectionId) => {
    if (sectionId === activeSection) return;
    deactivateMoveCard();
    resetOrientation();
    setHighlightedFace(null);
    setHighlightedPieceType(null);
    setActiveSection(sectionId);
  };

  const handleFaceActivate = (face: Face) => {
    setHighlightedFace(face);
  };

  const handleFaceDeactivate = () => {
    setHighlightedFace(null);
  };

  const handleFaceSelect = (face: Face) => {
    setHighlightedFace((current) => (current === face ? null : face));
  };

  const handlePieceActivate = (pieceType: CubiePieceType) => {
    setHighlightedPieceType(pieceType);
  };

  const handlePieceDeactivate = () => {
    setHighlightedPieceType(null);
  };

  const handlePieceSelect = (pieceType: CubiePieceType) => {
    setHighlightedPieceType((current) =>
      current === pieceType ? null : pieceType,
    );
  };

  const anatomyHighlight = isAnatomySection
    ? activeSection === 'faceNames'
      ? { mode: 'face' as const, face: highlightedFace }
      : { mode: 'pieceType' as const, pieceType: highlightedPieceType }
    : null;

  const cubeFrameClass =
    'h-[320px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 lg:h-[420px] lg:sticky lg:top-6';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CubeView
        cubeState={displayState}
        meshRotation={[0, 0, 0]}
        frameClassName={cubeFrameClass}
        canvasKey={canvasKey}
        moveAnimation={isAnatomySection ? null : moveAnimation}
        cameraBaselineKey={canvasKey}
        snapCameraOnWholeCubeRotation={false}
        enableOrbitControls={false}
        anatomyHighlight={anatomyHighlight}
        faceLabels={
          activeSection === 'faceNames' ? { highlightedFace } : undefined
        }
      />

      <div className="flex flex-col gap-4">
        {showReplayCheckbox ? (
          <label className="flex cursor-pointer items-center gap-2 self-start text-sm text-slate-300">
            <input
              type="checkbox"
              className="rounded border-slate-600"
              checked={replayAnimations}
              onChange={(e) => setReplayAnimations(e.target.checked)}
            />
            {notationGuideCopy.replayAnimations}
          </label>
        ) : null}

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Notation topics"
        >
          {NOTATION_SECTIONS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`notation-tab-${id}`}
                aria-selected={isActive}
                aria-controls={`notation-panel-${id}`}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-900/60 text-emerald-100'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`}
                onClick={() => handleSectionChange(id)}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeSection === 'cubePieces' ? (
          <article
            id="notation-panel-cubePieces"
            role="tabpanel"
            aria-labelledby="notation-tab-cubePieces"
            className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
          >
            <h2 className="text-lg font-semibold text-slate-100">
              {notationCubePieces.heading}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {notationCubePieces.intro}
            </p>
            <div className="mt-3 grid gap-3">
              {PIECE_TYPE_CARDS.map(({ pieceType, label, description }) => (
                <PieceTypeCard
                  key={pieceType}
                  pieceType={pieceType}
                  label={label}
                  description={description}
                  isActive={highlightedPieceType === pieceType}
                  prefersHover={prefersHover}
                  onActivate={handlePieceActivate}
                  onDeactivate={handlePieceDeactivate}
                  onSelect={handlePieceSelect}
                />
              ))}
            </div>
          </article>
        ) : null}

        {activeSection === 'faceNames' ? (
          <article
            id="notation-panel-faceNames"
            role="tabpanel"
            aria-labelledby="notation-tab-faceNames"
            className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
          >
            <h2 className="text-lg font-semibold text-slate-100">
              {notationFaceNames.heading}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {notationFaceNames.intro}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FACE_NAME_LABELS.map(({ letter, label }) => (
                <FaceNameCard
                  key={letter}
                  letter={letter}
                  label={label}
                  isActive={highlightedFace === letter}
                  prefersHover={prefersHover}
                  onActivate={handleFaceActivate}
                  onDeactivate={handleFaceDeactivate}
                  onSelect={handleFaceSelect}
                />
              ))}
            </div>
          </article>
        ) : null}

        {activeSection === 'faceTurns' ? (
          <article
            id="notation-panel-faceTurns"
            role="tabpanel"
            aria-labelledby="notation-tab-faceTurns"
            className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
          >
            <h2 className="text-lg font-semibold text-slate-100">
              {notationFaceTurns.heading}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {notationFaceTurns.intro}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          </article>
        ) : null}

        {activeSection === 'cubeRotations' ? (
          <article
            id="notation-panel-cubeRotations"
            role="tabpanel"
            aria-labelledby="notation-tab-cubeRotations"
            className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
          >
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
        ) : null}
      </div>
    </div>
  );
}
