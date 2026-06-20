import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { isLastLayerLessonStateValid } from '../orientEdges/preserveLessonState';
import { isYellowCrossComplete } from '../orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from '../permuteEdges/uLayerEdgePermuteModel';
import {
  countPermutedCorners,
  isCornersFullyPermuted,
} from './uLayerCornerPermuteModel';

export function isVerifiedPermuteCornersDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const beforeCount = countPermutedCorners(studentState);
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    isYellowCrossComplete(after) &&
    isEdgesFullyPermuted(after) &&
    (isCornersFullyPermuted(after) || countPermutedCorners(after) > beforeCount)
  );
}

export function isVerifiedPermuteCornersReorientDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    isYellowCrossComplete(after) &&
    isEdgesFullyPermuted(after) &&
    demo.every(
      (move) => move === 'y' || move === 'y2' || move === "y'",
    )
  );
}
