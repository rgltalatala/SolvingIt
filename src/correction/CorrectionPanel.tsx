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
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-slate-600 bg-slate-900 p-5">
      <h2 className="text-xl font-semibold">{correctionCopy.reviewFace(face)}</h2>
      <p className="text-sm text-slate-300">{correctionCopy.tapSticker}</p>
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
      <p className="text-xs text-slate-400">
        {correctionCopy.centerLocked(expectedCenterColor)}
      </p>
      <ColorPicker activeColor={activeColor} onSelect={setActiveColor} />
      {centerError ? (
        <p className="text-sm font-medium text-rose-300">{centerError}</p>
      ) : null}
      <div className="mt-2 flex gap-3">
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
