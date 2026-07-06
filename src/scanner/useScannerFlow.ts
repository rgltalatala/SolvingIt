import { useMemo } from 'react';
import type { FaceState } from '../cube/cubeState';
import { cubeStateFromScannedFaces, FACE_ORDER } from '../cube/cubeState';
import { validateCubeState } from '../cube/cubeValidator';
import { faceInstructions } from '../content/onboarding';
import { useCubeStore } from '../store/cubeStore';

export function useScannerFlow() {
  const scannedFaces = useCubeStore((state) => state.scannedFaces);
  const setScannedFace = useCubeStore((state) => state.setScannedFace);
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

  const faceInstruction = currentFace
    ? faceInstructions[currentFace]
    : null;

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

      useCubeStore.getState().completeLessonResync(assembled);
      clearValidationResult();
    }
  };

  return {
    currentFace,
    faceInstruction,
    scannedFaces,
    submitFace,
    isComplete,
  };
}
