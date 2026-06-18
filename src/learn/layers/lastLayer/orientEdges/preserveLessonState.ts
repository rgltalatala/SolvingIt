import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { isWhiteCrossComplete } from '../../bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '../../bottomLayer/corners/cornerSlotModel';
import { isMiddleLayerEdgesComplete } from '../../middleLayer/edges/edgeSlotModel';
import {
  countYellowEdgesOnU,
  isYellowCrossComplete,
} from './uLayerEdgeModel';

export function isLastLayerLessonStateValid(studentState: CubeState): boolean {
  return (
    isWhiteCrossComplete(studentState) &&
    isWhiteCornersComplete(studentState) &&
    isMiddleLayerEdgesComplete(studentState, 0)
  );
}

export function isVerifiedOrientEdgesDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const beforeCount = countYellowEdgesOnU(studentState);
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    (isYellowCrossComplete(after) || countYellowEdgesOnU(after) > beforeCount)
  );
}

export function isVerifiedAlignUDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    demo.every((move) => move === 'U' || move === 'U2' || move === "U'")
  );
}
