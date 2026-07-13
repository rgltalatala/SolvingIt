import { useState } from 'react';
import type { Face } from '../../cube/cubeState';
import type { CubiePieceType, CubeAnatomyHighlight } from '../../cube3d/cubeAnatomy';
import type { CubiePosition } from '../../cube3d/cubeGeometry';
import { CubeView } from '../../cube3d/CubeView';
import {
  notationCubePieces,
  notationCubeRotations,
  notationFaceNames,
  notationFaceTurns,
  notationGuide as notationGuideCopy,
  notationPositionLabels,
} from '../../content/notation';
import type { NotationSectionId } from '../../store/lessonSessionStore';
import { FaceNameCard } from './FaceNameCard';
import { NotationMoveCard } from './NotationMoveCard';
import { PieceTypeCard } from './PieceTypeCard';
import { PositionLabelCard } from './PositionLabelCard';
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
  activeSection?: NotationSectionId;
  onSectionChange?: (section: NotationSectionId) => void;
};

const NOTATION_SECTIONS: { id: NotationSectionId; label: string }[] = [
  { id: 'cubePieces', label: notationCubePieces.heading },
  { id: 'faceNames', label: notationFaceNames.heading },
  { id: 'positionLabels', label: notationPositionLabels.heading },
  { id: 'faceTurns', label: notationFaceTurns.heading },
  { id: 'cubeRotations', label: notationCubeRotations.heading },
];

function getAnatomyHighlight(options: {
  isAnatomySection: boolean;
  activeSection: NotationSectionId;
  highlightedFace: Face | null;
  highlightedCubiePosition: CubiePosition | null;
  highlightedPieceType: CubiePieceType | null;
}): CubeAnatomyHighlight | null {
  const {
    isAnatomySection,
    activeSection,
    highlightedFace,
    highlightedCubiePosition,
    highlightedPieceType,
  } = options;
  if (!isAnatomySection) return null;
  if (activeSection === 'faceNames') {
    return { mode: 'face', face: highlightedFace };
  }
  if (activeSection === 'positionLabels') {
    return { mode: 'cubie', position: highlightedCubiePosition };
  }
  return { mode: 'pieceType', pieceType: highlightedPieceType };
}

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

const POSITION_LABEL_EXAMPLES: {
  label: keyof typeof notationPositionLabels.examples;
  position: CubiePosition;
  kind: 'edge' | 'corner';
}[] = [
  { label: 'UF', position: [0, 1, 1], kind: 'edge' },
  { label: 'DR', position: [1, -1, 0], kind: 'edge' },
  { label: 'URF', position: [1, 1, 1], kind: 'corner' },
  { label: 'FRD', position: [1, -1, 1], kind: 'corner' },
];

export function NotationGuide({
  activeSection: controlledSection,
  onSectionChange,
}: NotationGuideProps = {}) {
  const [internalSection, setInternalSection] =
    useState<NotationSectionId>('cubePieces');
  const activeSection = controlledSection ?? internalSection;
  const setActiveSection = onSectionChange ?? setInternalSection;
  const [highlightedFace, setHighlightedFace] = useState<Face | null>(null);
  const [highlightedPieceType, setHighlightedPieceType] =
    useState<CubiePieceType | null>(null);
  const [highlightedPositionLabel, setHighlightedPositionLabel] = useState<
    string | null
  >(null);
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
    activeSection === 'cubePieces' ||
    activeSection === 'faceNames' ||
    activeSection === 'positionLabels';
  const showReplayCheckbox =
    activeSection === 'faceTurns' || activeSection === 'cubeRotations';

  const handleSectionChange = (sectionId: NotationSectionId) => {
    if (sectionId === activeSection) return;
    deactivateMoveCard();
    resetOrientation();
    setHighlightedFace(null);
    setHighlightedPieceType(null);
    setHighlightedPositionLabel(null);
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

  const handlePositionActivate = (label: string) => {
    setHighlightedPositionLabel(label);
  };

  const handlePositionDeactivate = () => {
    setHighlightedPositionLabel(null);
  };

  const handlePositionSelect = (label: string) => {
    setHighlightedPositionLabel((current) =>
      current === label ? null : label,
    );
  };

  const highlightedCubiePosition =
    POSITION_LABEL_EXAMPLES.find((example) => example.label === highlightedPositionLabel)
      ?.position ?? null;

  const anatomyHighlight = getAnatomyHighlight({
    isAnatomySection,
    activeSection,
    highlightedFace,
    highlightedCubiePosition,
    highlightedPieceType,
  });

  const cubeFrameClass =
    'h-[320px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 lg:h-[420px] lg:sticky lg:top-6';

  const edgeExamples = POSITION_LABEL_EXAMPLES.filter(
    (example) => example.kind === 'edge',
  );
  const cornerExamples = POSITION_LABEL_EXAMPLES.filter(
    (example) => example.kind === 'corner',
  );

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

        {activeSection === 'positionLabels' ? (
          <article
            id="notation-panel-positionLabels"
            role="tabpanel"
            aria-labelledby="notation-tab-positionLabels"
            className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
          >
            <h2 className="text-lg font-semibold text-slate-100">
              {notationPositionLabels.heading}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {notationPositionLabels.intro}
            </p>
            <h3 className="mt-4 text-sm font-semibold text-slate-200">
              {notationPositionLabels.edgesHeading}
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {edgeExamples.map(({ label }) => (
                <PositionLabelCard
                  key={label}
                  label={label}
                  description={notationPositionLabels.examples[label]}
                  isActive={highlightedPositionLabel === label}
                  prefersHover={prefersHover}
                  onActivate={handlePositionActivate}
                  onDeactivate={handlePositionDeactivate}
                  onSelect={handlePositionSelect}
                />
              ))}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-200">
              {notationPositionLabels.cornersHeading}
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {cornerExamples.map(({ label }) => (
                <PositionLabelCard
                  key={label}
                  label={label}
                  description={notationPositionLabels.examples[label]}
                  isActive={highlightedPositionLabel === label}
                  prefersHover={prefersHover}
                  onActivate={handlePositionActivate}
                  onDeactivate={handlePositionDeactivate}
                  onSelect={handlePositionSelect}
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
