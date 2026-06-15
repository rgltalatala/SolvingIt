import { applyMoves } from '../../../../cube/cubeState';
import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import type { StudentHold, YHold } from '../../../studentHold';
import type { CornerSlotId } from './types';

export type CornerHoldIndex = 0 | 1 | 2 | 3;

export const CORNER_HOLD_INDEX: Record<CornerSlotId, CornerHoldIndex> = {
  FRD: 0,
  BDR: 1,
  BLD: 2,
  FDL: 3,
};

const DELTA_TO_Y: Move[][] = [[], ['y'], ['y2'], ["y'"]];

const HOLD_FACE_COLORS: Record<CornerHoldIndex, Color> = {
  0: 'blue',
  1: 'red',
  2: 'green',
  3: 'orange',
};

export function targetHoldIndex(cornerId: CornerSlotId): CornerHoldIndex {
  return CORNER_HOLD_INDEX[cornerId];
}

/** Absolute y from blue-front hold (index 0) to the given hold index. */
export function holdIndexToY(index: CornerHoldIndex): Move[] {
  return DELTA_TO_Y[index]!;
}

/** y rotation(s) from one hold index to another (mod 4). */
export function relativeY(fromIndex: number, toIndex: number): Move[] {
  const delta = (((toIndex - fromIndex) % 4) + 4) % 4;
  return DELTA_TO_Y[delta]!;
}

export function returnToBlueY(fromIndex: CornerHoldIndex): Move[] {
  return relativeY(fromIndex, 0);
}

export function faceColorAtHold(index: CornerHoldIndex): Color {
  return HOLD_FACE_COLORS[index];
}

export function normalizeHoldToBlue(
  state: CubeState,
  holdIndex: number,
): CubeState {
  if (holdIndex === 0) return state;
  return applyMoves(state, relativeY(holdIndex, 0));
}

export function formatHoldFaceLabel(index: CornerHoldIndex): string {
  const color = faceColorAtHold(index);
  return color.charAt(0).toUpperCase() + color.slice(1);
}

const HOLD_INDEX_TO_Y_HOLD: YHold[] = ['none', 'y', 'y2', "y'"];

/** Map lesson corner hold index to cumulative student y-hold. */
export function cornerHoldToStudentHold(index: CornerHoldIndex): StudentHold {
  return { y: HOLD_INDEX_TO_Y_HOLD[index]! };
}
