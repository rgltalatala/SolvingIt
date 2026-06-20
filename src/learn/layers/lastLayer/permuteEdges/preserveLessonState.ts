import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { isLastLayerLessonStateValid } from '../orientEdges/preserveLessonState';
import { isYellowCrossComplete } from '../orientEdges/uLayerEdgeModel';
import {
  countPermutedEdges,
  isEdgesFullyPermuted,
} from './uLayerEdgePermuteModel';

export function isVerifiedPermuteEdgesDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const beforeCount = countPermutedEdges(studentState);
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    isYellowCrossComplete(after) &&
    (isEdgesFullyPermuted(after) || countPermutedEdges(after) > beforeCount)
  );
}
