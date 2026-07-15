import { useEffect, useMemo, useState } from 'react';
import type { Color, CubeState, Face } from '../cube/cubeState';
import {
  FACE_COLOR_CONVENTION,
  FACE_ORDER,
  lockFaceCenter,
} from '../cube/cubeState';
import { validateCubeState } from '../cube/cubeValidator';
import { ColorPicker } from '../correction/ColorPicker';
import { FaceGrid } from '../correction/FaceGrid';
import { useCubeStore } from '../store/cubeStore';
import { CubeView } from '../cube3d/CubeView';
import { manualFix as manualFixCopy, scanView as scanCopy, ui } from '../content/ui';
import {
  LEARNING_CUBE_FRAME_CLASS,
  LearningSplitLayout,
} from './lessons/LearningSplitLayout';
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
  /** Narrow layout only: toggle left-column face tabs vs color swatches. */
  const [mobileTool, setMobileTool] = useState<'faces' | 'colors'>('faces');

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

  const sidebar = (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <header className="shrink-0 space-y-1.5">
        <h1 className="text-xl font-bold sm:text-2xl">{manualFixCopy.title}</h1>
        <p className="text-sm text-slate-300">{manualFixCopy.subtitle}</p>
        <div className="rounded-lg border border-amber-400/60 bg-amber-950/40 p-2.5 text-sm text-amber-100">
          <ValidationIssuesList issues={validationIssues} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-3">
        {/* Mobile: hint above the two-column editor. */}
        <p className="shrink-0 text-sm text-slate-300 lg:hidden">
          {manualFixCopy.paintHint}
        </p>

        {/*
          Narrow / mobile: left = Faces|Colors toggle + one 2×3 set, right = centered FaceGrid.
          lg+: stacked faces → hint → colors → grid.
        */}
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-hidden lg:flex lg:flex-col lg:gap-2.5">
          <div className="flex min-h-0 flex-col gap-2 lg:contents">
            <button
              type="button"
              className="shrink-0 rounded-md border border-slate-500 px-2 py-1.5 text-sm font-medium text-slate-100 hover:border-cyan-400 lg:hidden"
              onClick={() =>
                setMobileTool((tool) =>
                  tool === 'faces' ? 'colors' : 'faces',
                )
              }
            >
              {mobileTool === 'faces'
                ? manualFixCopy.showColors
                : manualFixCopy.showFaces}
            </button>

            <div
              className={`shrink-0 grid-cols-2 gap-1.5 lg:order-1 lg:flex lg:flex-wrap lg:gap-2 ${mobileTool === 'faces' ? 'grid' : 'hidden lg:flex'}`}
            >
              {FACE_ORDER.map((face) => (
                <button
                  key={face}
                  type="button"
                  className={`box-border flex h-8 items-center justify-center rounded-md border px-2 text-sm lg:px-3 ${manualFace === face ? 'border-cyan-300 text-cyan-100' : 'border-slate-500 text-slate-200'}`}
                  onClick={() => {
                    setManualFace(face);
                    setManualSelectedIndex(null);
                  }}
                >
                  {face}
                </button>
              ))}
            </div>

            <p className="order-2 hidden shrink-0 text-sm text-slate-300 lg:block">
              {manualFixCopy.paintHint}
            </p>

            <div
              className={`shrink-0 lg:order-3 ${mobileTool === 'colors' ? 'block' : 'hidden lg:block'}`}
            >
              <ColorPicker
                activeColor={manualColor}
                onSelect={setManualColor}
                layout="responsive"
              />
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-col items-center justify-center lg:order-4 lg:flex-1 lg:items-stretch lg:justify-start">
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
          </div>
        </div>

        <p className="shrink-0 text-xs text-slate-400">
          {manualFixCopy.centerLocked(expectedCenter)}
        </p>

        <div className="relative z-10 flex shrink-0 flex-wrap gap-3">
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
            {scanCopy.rescanFace(manualFace)}
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
              useCubeStore.getState().completeLessonResync(workingDraft);
              clearValidationResult();
              setManualDraft(null);
            }}
          >
            {ui.revalidateCube}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4">
      <LearningSplitLayout
        cube={
          <div className="relative flex h-full min-h-0 flex-1 flex-col gap-2">
            <h2 className="shrink-0 text-sm font-semibold text-slate-200 sm:text-base">
              {manualFixCopy.previewHeading}
            </h2>
            <div className="min-h-0 flex-1">
              <CubeView
                cubeState={workingDraft}
                frameClassName={LEARNING_CUBE_FRAME_CLASS}
              />
            </div>
          </div>
        }
        sidebar={sidebar}
      />
    </section>
  );
}
