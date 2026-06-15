import { useEffect, useMemo, useState } from 'react';
import type { Color, CubeState, Face } from '../cube/cubeState';
import {
  FACE_COLOR_CONVENTION,
  FACE_ORDER,
  lockFaceCenter,
} from '../cube/cubeState';
import { validateCubeState } from '../cube/cubeValidator';
import { cubeStateToCubeJsString } from '../cube/cubeStateToFacelets';
import { ColorPicker } from '../correction/ColorPicker';
import { FaceGrid } from '../correction/FaceGrid';
import { useCubeStore } from '../store/cubeStore';
import { CubeView } from '../cube3d/CubeView';
import { ValidationIssuesList } from './ValidationIssuesList';

interface ManualFixViewProps {
  assembledFromScanned: CubeState;
}

export function ManualFixView({ assembledFromScanned }: ManualFixViewProps) {
  const validationIssues = useCubeStore((state) => state.validationIssues);
  const validationSuggestedFace = useCubeStore(
    (state) => state.validationSuggestedFace,
  );
  const clearValidationResult = useCubeStore(
    (state) => state.clearValidationResult,
  );
  const clearScannedFace = useCubeStore((state) => state.clearScannedFace);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setCubeState = useCubeStore((state) => state.setCubeState);
  const setScannedFacesFromCube = useCubeStore(
    (state) => state.setScannedFacesFromCube,
  );
  const setValidationResult = useCubeStore(
    (state) => state.setValidationResult,
  );

  const [manualFace, setManualFace] = useState<Face>('U');
  const [manualDraft, setManualDraft] = useState<CubeState | null>(null);
  const [manualColor, setManualColor] = useState<Color | null>(null);
  const [manualSelectedIndex, setManualSelectedIndex] = useState<number | null>(
    null,
  );

  const workingDraft = manualDraft ?? assembledFromScanned;
  const activeFaceState = workingDraft[manualFace];
  const expectedCenter = FACE_COLOR_CONVENTION[manualFace];

  const validationIssuesKey = useMemo(
    () => validationIssues.map((issue) => issue.message).join('\n'),
    [validationIssues],
  );

  useEffect(() => {
    if (!validationSuggestedFace) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync tab to new validation result without remounting (preserves manualDraft)
    setManualFace(validationSuggestedFace);
  }, [validationIssuesKey, validationSuggestedFace]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Fix Validation Errors</h1>
        <p className="text-slate-300">
          Validation failed. Adjust stickers directly, then re-run validation.
          Centers remain locked.
        </p>
        <div className="rounded-lg border border-amber-400/60 bg-amber-950/40 p-3 text-sm text-amber-100">
          <ValidationIssuesList issues={validationIssues} />
          <p className="pt-2 text-xs text-slate-400">
            Current URFDLB facelet string (what the validator uses):{' '}
            <span className="break-all font-mono text-slate-300">
              {cubeStateToCubeJsString(workingDraft)}
            </span>
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex flex-wrap gap-2">
            {FACE_ORDER.map((face) => (
              <button
                key={face}
                type="button"
                className={`rounded-md border px-3 py-1.5 text-sm ${manualFace === face ? 'border-cyan-300 text-cyan-100' : 'border-slate-500 text-slate-200'}`}
                onClick={() => {
                  setManualFace(face);
                  setManualSelectedIndex(null);
                }}
              >
                {face}
              </button>
            ))}
          </div>

          <FaceGrid
            faceState={activeFaceState}
            selectedIndex={manualSelectedIndex}
            activeColor={manualColor}
            lockedIndexes={[4]}
            onSelectIndex={setManualSelectedIndex}
            onUpdate={(nextFace) => {
              const stabilized = lockFaceCenter(manualFace, nextFace);
              const nextCube = { ...workingDraft, [manualFace]: stabilized };
              setManualDraft(nextCube);
              setScannedFacesFromCube(nextCube);
            }}
          />
          <p className="text-xs text-slate-400">
            Center sticker is locked to {expectedCenter}.
          </p>
          <ColorPicker activeColor={manualColor} onSelect={setManualColor} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="rounded-md border border-slate-400 px-4 py-2 text-slate-100"
              onClick={() => {
                clearScannedFace(manualFace);
                clearValidationResult();
                setManualDraft(null);
                setManualSelectedIndex(null);
                setManualColor(null);
                setAppPhase('scanning');
              }}
            >
              Re-scan {manualFace} face
            </button>
            <button
              type="button"
              className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-950"
              onClick={() => {
                const validation = validateCubeState(workingDraft);
                if (!validation.valid) {
                  setValidationResult(
                    validation.issues,
                    validation.suggestedFace,
                  );
                  if (validation.suggestedFace)
                    setManualFace(validation.suggestedFace);
                  setManualDraft(workingDraft);
                  return;
                }
                setScannedFacesFromCube(workingDraft);
                setCubeState(workingDraft);
                clearValidationResult();
                setManualDraft(null);
                setAppPhase('ready');
              }}
            >
              Re-validate Cube
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Manual Fix Preview</h2>
          <CubeView cubeState={workingDraft} />
        </div>
      </div>
    </section>
  );
}
