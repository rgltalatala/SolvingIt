import { useMemo, useState } from 'react';
import type { FaceState } from '../cube/cubeState';
import { cubeStateFromScannedFaces } from '../cube/cubeState';
import { detectFaceColorsFromImageData } from '../scanner/colorDetector';
import { detectorFaceToCubeJsFaceOrder } from '../scanner/detectorFaceLayout';
import { ScannerOverlay } from '../scanner/scannerOverlay';
import { useScannerFlow } from '../scanner/useScannerFlow';
import { useCamera } from '../scanner/useCamera';
import { CorrectionPanel } from '../correction/CorrectionPanel';
import { scanView as scanCopy } from '../content/ui';
import { useCubeStore } from '../store/cubeStore';
import { CubeView } from '../cube3d/CubeView';
import { partialScansToDisplayCubeState } from '../cube3d/displayCubeState';
import {
  LEARNING_CUBE_FRAME_CLASS,
  LearningSplitLayout,
} from './lessons/LearningSplitLayout';
import { ManualFixView } from './ManualFixView';
import { ValidationIssuesList } from './ValidationIssuesList';

export function ScanView() {
  const { videoRef, isReady, error, captureFrame } = useCamera();
  const { currentFace, faceInstruction, scannedFaces, submitFace } =
    useScannerFlow();
  const [detectedFace, setDetectedFace] = useState<FaceState | null>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const validationIssues = useCubeStore((state) => state.validationIssues);
  const validationSuggestedFace = useCubeStore(
    (state) => state.validationSuggestedFace,
  );
  const clearValidationResult = useCubeStore(
    (state) => state.clearValidationResult,
  );
  const clearScannedFace = useCubeStore((state) => state.clearScannedFace);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);

  const assembledFromScanned = useMemo(
    () => cubeStateFromScannedFaces(scannedFaces),
    [scannedFaces],
  );

  const inManualFix =
    !currentFace &&
    validationIssues.length > 0 &&
    assembledFromScanned !== null;

  const liveCubeState = useMemo(
    () =>
      partialScansToDisplayCubeState(
        scannedFaces,
        isCorrecting && detectedFace && currentFace
          ? {
              face: currentFace,
              // Preview uses cubejs sticker order; confirmation keeps camera/grid order.
              faceState: detectorFaceToCubeJsFaceOrder(
                currentFace,
                detectedFace,
              ),
            }
          : undefined,
      ),
    [currentFace, detectedFace, isCorrecting, scannedFaces],
  );

  if (inManualFix && assembledFromScanned) {
    return <ManualFixView assembledFromScanned={assembledFromScanned} />;
  }

  if (!currentFace) {
    return null;
  }

  const handleCapture = () => {
    clearValidationResult();
    const frame = captureFrame();
    if (!frame) return;
    // Keep camera-view order for the confirmation grid so it matches what the user scanned.
    setDetectedFace(detectFaceColorsFromImageData(frame));
    setIsCorrecting(true);
    setAppPhase('correcting');
  };

  const handleConfirm = (faceState: FaceState) => {
    submitFace(detectorFaceToCubeJsFaceOrder(currentFace, faceState));
    setDetectedFace(null);
    setIsCorrecting(false);
  };

  const sidebar = (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <header className="shrink-0 space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">{scanCopy.title}</h1>
        <p className="text-slate-300">{faceInstruction}</p>
        {validationIssues.length > 0 ? (
          <div className="rounded-lg border border-rose-400/60 bg-rose-950/40 p-3 text-sm text-rose-100">
            <p className="font-semibold">{scanCopy.validationFailed}</p>
            <ValidationIssuesList
              issues={validationIssues}
              listClassName="mt-2 list-disc space-y-1 pl-5"
              suggestedFace={validationSuggestedFace}
              onRescanSuggested={(face) => {
                clearScannedFace(face);
                clearValidationResult();
                setIsCorrecting(false);
                setDetectedFace(null);
                setAppPhase('scanning');
              }}
            />
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!isCorrecting || !detectedFace ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ScannerOverlay
              videoRef={videoRef}
              isReady={isReady}
              error={error}
              onCapture={handleCapture}
            />
          </div>
        ) : (
          <CorrectionPanel
            key={`${currentFace}-${detectedFace.join('-')}`}
            face={currentFace}
            detectedFace={detectedFace}
            onConfirm={handleConfirm}
            onRescan={() => {
              setIsCorrecting(false);
              setAppPhase('scanning');
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4">
      <LearningSplitLayout
        cube={
          <div className="relative flex h-full min-h-0 flex-1 flex-col gap-2">
            <div className="shrink-0 space-y-0.5 lg:space-y-1">
              <h2 className="text-sm font-semibold text-slate-200 sm:text-base">
                {scanCopy.livePreviewHeading}
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                {scanCopy.livePreviewNote}
              </p>
            </div>
            <div className="min-h-0 flex-1">
              <CubeView
                cubeState={liveCubeState}
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
