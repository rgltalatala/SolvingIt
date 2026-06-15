import { useMemo } from 'react';
import type { Face, FaceState } from '../cube/cubeState';
import { cubeStateFromScannedFaces, FACE_ORDER } from '../cube/cubeState';
import { validateCubeState } from '../cube/cubeValidator';
import { useCubeStore } from '../store/cubeStore';

const mirroredPreviewNote =
  'If you are using a phone camera, swap left and right expectations.';

export const faceInstructions: Record<Face, string> = {
  U: `Scan WHITE face: white toward camera, green on top, blue on bottom, red right, orange left. ${mirroredPreviewNote}`,
  D: `Scan YELLOW face: yellow toward camera, green on top, blue on bottom, orange right, red left. ${mirroredPreviewNote}`,
  F: `Scan GREEN face: green toward camera, white on top, yellow on bottom, orange right, red left. ${mirroredPreviewNote}`,
  B: `Scan BLUE face: blue toward camera, white on top, yellow on bottom, red right, orange left. ${mirroredPreviewNote}`,
  R: `Scan RED face: red toward camera, white on top, yellow on bottom, green right, blue left. ${mirroredPreviewNote}`,
  L: `Scan ORANGE face: orange toward camera, white on top, yellow on bottom, blue right, green left. ${mirroredPreviewNote}`,
};

export function useScannerFlow() {
  const scannedFaces = useCubeStore((state) => state.scannedFaces);
  const setScannedFace = useCubeStore((state) => state.setScannedFace);
  const setCubeState = useCubeStore((state) => state.setCubeState);
  const setValidationResult = useCubeStore(
    (state) => state.setValidationResult,
  );
  const clearValidationResult = useCubeStore(
    (state) => state.clearValidationResult,
  );
  const setAppPhase = useCubeStore((state) => state.setAppPhase);

  const currentFace = useMemo(
    () => FACE_ORDER.find((face) => !scannedFaces[face]) ?? null,
    [scannedFaces],
  );

  const isComplete = currentFace === null;

  const submitFace = (faceState: FaceState) => {
    if (!currentFace) return;
    clearValidationResult();
    setScannedFace(currentFace, faceState);

    const nextFaces = { ...scannedFaces, [currentFace]: faceState };
    const assembled = cubeStateFromScannedFaces(nextFaces);
    if (assembled) {
      const validation = validateCubeState(assembled);
      if (!validation.valid) {
        setValidationResult(validation.issues, validation.suggestedFace);
        setAppPhase('scanning');
        return;
      }

      setCubeState(assembled);
      clearValidationResult();
      setAppPhase('ready');
    }
  };

  return {
    currentFace,
    scannedFaces,
    submitFace,
    isComplete,
  };
}
