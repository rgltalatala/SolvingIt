import { useState } from 'react';
import { FACE_COLOR_CONVENTION, lockFaceCenter } from '../cube/cubeState';
import type { Face, FaceState } from '../cube/cubeState';
import { correction as correctionCopy, ui } from '../content/ui';
import { ColorPicker } from './ColorPicker';
import { FaceGrid } from './FaceGrid';

interface CorrectionPanelProps {
  face: Face;
  detectedFace: FaceState;
  onConfirm: (faceState: FaceState) => void;
  onRescan: () => void;
}

export function CorrectionPanel({
  face,
  detectedFace,
  onConfirm,
  onRescan,
}: CorrectionPanelProps) {
  const expectedCenterColor = FACE_COLOR_CONVENTION[face];
  const initialDraft = lockFaceCenter(face, detectedFace);

  const [draft, setDraft] = useState<FaceState>(initialDraft);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<FaceState[number] | null>(
    null,
  );
  const [centerError, setCenterError] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-xl border border-slate-600 bg-slate-900 p-4">
      <h2 className="shrink-0 text-xl font-semibold">
        {correctionCopy.reviewFace(face)}
      </h2>
      <p className="shrink-0 text-sm text-slate-300">{correctionCopy.tapSticker}</p>
      <div className="shrink-0">
        <ColorPicker activeColor={activeColor} onSelect={setActiveColor} />
      </div>
      <FaceGrid
        faceState={draft}
        selectedIndex={selectedIndex}
        activeColor={activeColor}
        lockedIndexes={[4]}
        onSelectIndex={setSelectedIndex}
        onUpdate={(next) => {
          setDraft(lockFaceCenter(face, next));
          if (centerError) setCenterError(null);
        }}
      />
      <p className="shrink-0 text-xs text-slate-400">
        {correctionCopy.centerLocked(expectedCenterColor)}
      </p>
      {centerError ? (
        <p className="shrink-0 text-sm font-medium text-rose-300">{centerError}</p>
      ) : null}
      <div className="relative z-10 mt-auto flex shrink-0 flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-400 px-4 py-2 text-slate-100"
          onClick={onRescan}
        >
          {ui.rescan}
        </button>
        <button
          type="button"
          className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-950"
          onClick={() => {
            if (draft[4] !== expectedCenterColor) {
              setCenterError(
                correctionCopy.centerMustBe(expectedCenterColor),
              );
              return;
            }
            onConfirm(draft);
          }}
        >
          {ui.confirm}
        </button>
      </div>
    </div>
  );
}
