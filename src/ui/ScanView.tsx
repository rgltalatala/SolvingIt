import { useMemo, useState } from 'react';
import type { FaceState } from '../cube/cubeState';
import { cubeStateFromScannedFaces } from '../cube/cubeState';
import { detectFaceColorsFromImageData } from '../scanner/colorDetector';
import { detectorFaceToCubeJsFaceOrder } from '../scanner/detectorFaceLayout';
import { ScannerOverlay } from '../scanner/scannerOverlay';
import { faceInstructions, useScannerFlow } from '../scanner/useScannerFlow';
import { useCamera } from '../scanner/useCamera';
import { CorrectionPanel } from '../correction/CorrectionPanel';
import { useCubeStore } from '../store/cubeStore';
import { CubeView } from '../cube3d/CubeView';
import { partialScansToDisplayCubeState } from '../cube3d/displayCubeState';
import { ManualFixView } from './ManualFixView';
import { ValidationIssuesList } from './ValidationIssuesList';

export function ScanView() {
  const { videoRef, isReady, error, captureFrame } = useCamera();
  const { currentFace, scannedFaces, submitFace } = useScannerFlow();
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
          ? { face: currentFace, faceState: detectedFace }
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
    setDetectedFace(
      detectorFaceToCubeJsFaceOrder(
        currentFace,
        detectFaceColorsFromImageData(frame),
      ),
    );
    setIsCorrecting(true);
    setAppPhase('correcting');
  };

  const handleConfirm = (faceState: FaceState) => {
    submitFace(faceState);
    setDetectedFace(null);
    setIsCorrecting(false);
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Rubik&apos;s Cube Scanner</h1>
        <p className="text-slate-300">{faceInstructions[currentFace]}</p>
        {validationIssues.length > 0 ? (
          <div className="rounded-lg border border-rose-400/60 bg-rose-950/40 p-3 text-sm text-rose-100">
            <p className="font-semibold">Scan validation failed.</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {!isCorrecting || !detectedFace ? (
            <ScannerOverlay
              videoRef={videoRef}
              isReady={isReady}
              error={error}
              onCapture={handleCapture}
            />
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

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Live Virtual Cube Preview</h2>
          <p className="text-sm text-slate-400">
            Gray stickers are not scanned yet. Confirm each face to populate
            this cube in real time.
          </p>
          <CubeView cubeState={liveCubeState} />
        </div>
      </div>
    </section>
  );
}
