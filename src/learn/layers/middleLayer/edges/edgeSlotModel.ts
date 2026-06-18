import type { Color, CubeState, Face } from '../../../../cube/cubeState';
import type { CubiePosition } from '../../../../cube3d/cubeGeometry';
import { faceStickerIndex } from '../../../../cube3d/cubeGeometry';
import {
  normalizeHoldToBlue,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import { holdFacingOpposite } from './edgeHold';
import { findEdgeWithColors } from '../../bottomLayer/shared/pieceQueries';
import { formatColor } from '../../bottomLayer/shared';
import { MIDDLE_EDGE_SLOTS, type MiddleEdgeSlotId } from './types';

export { formatColor };

export const EDGE_SLOT_DEF: Record<
  MiddleEdgeSlotId,
  { pos: CubiePosition; faces: [Face, Face] }
> = {
  FR: { pos: [1, 0, 1], faces: ['F', 'R'] },
  FL: { pos: [-1, 0, 1], faces: ['F', 'L'] },
  BR: { pos: [1, 0, -1], faces: ['B', 'R'] },
  BL: { pos: [-1, 0, -1], faces: ['B', 'L'] },
};

export function expectedEdgeColorsForSlot(
  state: CubeState,
  id: MiddleEdgeSlotId,
  holdIndex = 0,
): [Color, Color] {
  const ref = normalizeHoldToBlue(state, holdIndex);
  const [faceA, faceB] = EDGE_SLOT_DEF[id].faces;
  return [ref[faceA][4], ref[faceB][4]];
}

export function edgeSlotSolved(
  state: CubeState,
  id: MiddleEdgeSlotId,
  holdIndex = 0,
): boolean {
  const ref = normalizeHoldToBlue(state, holdIndex);
  const slot = EDGE_SLOT_DEF[id];
  const [faceA, faceB] = slot.faces;
  const pos = slot.pos;
  const stickerA = ref[faceA][faceStickerIndex(faceA, pos)];
  const stickerB = ref[faceB][faceStickerIndex(faceB, pos)];
  return stickerA === ref[faceA][4] && stickerB === ref[faceB][4];
}

export function isMiddleLayerEdgesComplete(
  state: CubeState,
  holdIndex = 0,
): boolean {
  return MIDDLE_EDGE_SLOTS.every((id) => edgeSlotSolved(state, id, holdIndex));
}

export function countSolvedMiddleEdgeSlots(
  state: CubeState,
  holdIndex = 0,
  solvedSlots?: readonly MiddleEdgeSlotId[],
): number {
  if (solvedSlots) {
    return MIDDLE_EDGE_SLOTS.filter(
      (id) =>
        solvedSlots.includes(id) || edgeSlotSolved(state, id, holdIndex),
    ).length;
  }
  return MIDDLE_EDGE_SLOTS.filter((id) =>
    edgeSlotSolved(state, id, holdIndex),
  ).length;
}

export function middleLayerEdgePairs(
  state: CubeState,
  holdIndex = 0,
): Array<{ slotId: MiddleEdgeSlotId; colors: [Color, Color] }> {
  const ref = normalizeHoldToBlue(state, holdIndex);
  return [
    { slotId: 'FR', colors: [ref.F[4], ref.R[4]] },
    { slotId: 'FL', colors: [ref.F[4], ref.L[4]] },
    { slotId: 'BR', colors: [ref.B[4], ref.R[4]] },
    { slotId: 'BL', colors: [ref.B[4], ref.L[4]] },
  ];
}

export function unsolvedMiddleEdgePairs(
  state: CubeState,
  holdIndex = 0,
): Array<{ slotId: MiddleEdgeSlotId; colors: [Color, Color] }> {
  return middleLayerEdgePairs(state, holdIndex).filter(
    ({ slotId }) => !edgeSlotSolved(state, slotId, holdIndex),
  );
}

export function edgePieceOnULayer(
  state: CubeState,
  colors: [Color, Color],
): boolean {
  const pos = findEdgeWithColors(state, colors[0], colors[1]);
  return pos !== null && pos[1] === 1;
}

function positionsEqual(a: CubiePosition, b: CubiePosition): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function colorsMatchUnordered(
  colorA: Color,
  colorB: Color,
  targetA: Color,
  targetB: Color,
): boolean {
  return (
    (colorA === targetA && colorB === targetB) ||
    (colorA === targetB && colorB === targetA)
  );
}

/** Sticker colors on the cubie currently occupying a middle-layer slot. */
export function actualEdgeStickersAtSlot(
  state: CubeState,
  slotId: MiddleEdgeSlotId,
  holdIndex = 0,
): [Color, Color] {
  const ref = normalizeHoldToBlue(state, holdIndex);
  const slot = EDGE_SLOT_DEF[slotId];
  const [faceA, faceB] = slot.faces;
  const pos = slot.pos;
  return [
    ref[faceA][faceStickerIndex(faceA, pos)],
    ref[faceB][faceStickerIndex(faceB, pos)],
  ];
}

const SIDE_COLORS: readonly Color[] = ['green', 'blue', 'red', 'orange'];

export function isMiddleLayerEdgeCubieColors(
  colorA: Color,
  colorB: Color,
): boolean {
  return (
    SIDE_COLORS.includes(colorA) &&
    SIDE_COLORS.includes(colorB) &&
    colorA !== colorB
  );
}

/** True when every middle-layer slot holds a side–side edge cubie (lesson scope). */
export function isMiddleLayerEdgesScrambleValid(
  state: CubeState,
  holdIndex = 0,
): boolean {
  return MIDDLE_EDGE_SLOTS.every((id) => {
    const [colorA, colorB] = actualEdgeStickersAtSlot(state, id, holdIndex);
    return isMiddleLayerEdgeCubieColors(colorA, colorB);
  });
}

export function expectedCubiePositionForSlot(
  state: CubeState,
  slotId: MiddleEdgeSlotId,
  holdIndex = 0,
): CubiePosition | null {
  const ref = normalizeHoldToBlue(state, holdIndex);
  const expected = expectedEdgeColorsForSlot(state, slotId, holdIndex);
  return findEdgeWithColors(ref, expected[0], expected[1]);
}

/** Unsolved slot with wrong cubie, flipped cubie, or buried cubie — needs extract first. */
export function slotNeedsExtract(
  state: CubeState,
  slotId: MiddleEdgeSlotId,
  holdIndex = 0,
): boolean {
  if (edgeSlotSolved(state, slotId, holdIndex)) return false;

  const actual = actualEdgeStickersAtSlot(state, slotId, holdIndex);
  const expected = expectedEdgeColorsForSlot(state, slotId, holdIndex);
  const slotPos = EDGE_SLOT_DEF[slotId].pos;

  if (!colorsMatchUnordered(actual[0], actual[1], expected[0], expected[1])) {
    return true;
  }

  const expectedPos = expectedCubiePositionForSlot(state, slotId, holdIndex);
  if (expectedPos && positionsEqual(expectedPos, slotPos)) return true;

  return false;
}

export function unsolvedEdgeCubieOnU(
  state: CubeState,
  slotId: MiddleEdgeSlotId,
  holdIndex = 0,
): boolean {
  if (edgeSlotSolved(state, slotId, holdIndex)) return false;
  const expectedPos = expectedCubiePositionForSlot(state, slotId, holdIndex);
  return expectedPos !== null && expectedPos[1] === 1;
}

export function anyUnsolvedMiddleEdgeOnU(
  state: CubeState,
  holdIndex = 0,
): boolean {
  return unsolvedMiddleEdgePairs(state, holdIndex).some(({ slotId }) =>
    unsolvedEdgeCubieOnU(state, slotId, holdIndex),
  );
}

/** Maps expected edge colors (from centers) to their middle-layer slot id. */
export function slotIdForExpectedEdgeColors(
  state: CubeState,
  edgeColors: [Color, Color],
  holdIndex = 0,
): MiddleEdgeSlotId | null {
  const match = middleLayerEdgePairs(state, holdIndex).find(
    ({ colors }) =>
      (colors[0] === edgeColors[0] && colors[1] === edgeColors[1]) ||
      (colors[0] === edgeColors[1] && colors[1] === edgeColors[0]),
  );
  return match?.slotId ?? null;
}

/** World middle-edge slots on the student's front face for each lesson hold. */
export const STUDENT_FRONT_MIDDLE_SLOTS: Record<
  CornerHoldIndex,
  [MiddleEdgeSlotId, MiddleEdgeSlotId]
> = {
  0: ['FL', 'FR'],
  1: ['FR', 'BR'],
  2: ['BR', 'BL'],
  3: ['BL', 'FL'],
};

export function studentFrontMiddleSlots(
  holdIndex: CornerHoldIndex = 0,
): [MiddleEdgeSlotId, MiddleEdgeSlotId] {
  return STUDENT_FRONT_MIDDLE_SLOTS[holdIndex];
}

/** Hold indices where the given world middle-edge slot is on the student's front face. */
export function holdsWhereSlotIsOnFront(
  slotId: MiddleEdgeSlotId,
): CornerHoldIndex[] {
  return (
    Object.entries(STUDENT_FRONT_MIDDLE_SLOTS) as Array<
      [string, [MiddleEdgeSlotId, MiddleEdgeSlotId]]
    >
  )
    .filter(([, slots]) => slots.includes(slotId))
    .map(([hold]) => Number(hold) as CornerHoldIndex);
}

export function isMiddleEdgeSlotOnStudentFront(
  slotId: MiddleEdgeSlotId,
  holdIndex: CornerHoldIndex,
): boolean {
  return studentFrontMiddleSlots(holdIndex).includes(slotId);
}

export function unsolvedStudentFrontMiddleSlots(
  state: CubeState,
  holdIndex: CornerHoldIndex = 0,
  solvedCheckHoldIndex?: CornerHoldIndex,
): MiddleEdgeSlotId[] {
  const checkHold = solvedCheckHoldIndex ?? holdIndex;
  return studentFrontMiddleSlots(holdIndex).filter(
    (id) => !edgeSlotSolved(state, id, checkHold),
  );
}

export function pickActiveUnsolvedEdge(
  state: CubeState,
  holdIndex = 0,
): { slotId: MiddleEdgeSlotId; colors: [Color, Color] } | null {
  const unsolved = unsolvedMiddleEdgePairs(state, holdIndex);
  const needsExtract = unsolved.filter(({ slotId }) =>
    slotNeedsExtract(state, slotId, holdIndex),
  );
  const onU = unsolved.filter(({ slotId }) =>
    unsolvedEdgeCubieOnU(state, slotId, holdIndex),
  );

  if (onU[0]) return onU[0];
  if (needsExtract[0]) return needsExtract[0];
  return unsolved[0] ?? null;
}

/** Target front slot (FL or FR) when partnerColor faces F at the current hold. */
export function targetFrontSlotBetweenCenters(
  state: CubeState,
  partnerColor: Color,
  edgeColors: [Color, Color],
  holdIndex = 0,
): 'FL' | 'FR' {
  const ref = normalizeHoldToBlue(state, holdIndex);
  const otherColor =
    edgeColors[0] === partnerColor ? edgeColors[1] : edgeColors[0];
  if (ref.L[4] === otherColor) return 'FL';
  return 'FR';
}

export function frontSlotForMiddleSlot(
  slotId: MiddleEdgeSlotId,
): 'FL' | 'FR' {
  return slotId === 'FL' || slotId === 'BL' ? 'FL' : 'FR';
}

/** Left/right insert-extract algorithm for a world slot at the current hold. */
export function algSideForStudentFrontSlot(
  holdIndex: CornerHoldIndex,
  worldSlot: MiddleEdgeSlotId,
): 'FL' | 'FR' {
  const [left, right] = studentFrontMiddleSlots(holdIndex);
  if (worldSlot === left) return 'FL';
  if (worldSlot === right) return 'FR';
  return frontSlotForMiddleSlot(worldSlot);
}

export function colorsOfEdgeAtSlot(
  state: CubeState,
  slotId: MiddleEdgeSlotId,
  holdIndex = 0,
): [Color, Color] | null {
  if (EDGE_SLOT_DEF[slotId].pos[1] !== 0) return null;
  return actualEdgeStickersAtSlot(state, slotId, holdIndex);
}

export function pickBuriedExtractSlot(
  state: CubeState,
  holdIndex: CornerHoldIndex = 0,
): {
  worldSlot: MiddleEdgeSlotId;
  algSide: 'FL' | 'FR';
  needsFaceBackReorient: boolean;
} | null {
  const hold = holdIndex as CornerHoldIndex;
  const frontUnsolved = unsolvedStudentFrontMiddleSlots(state, hold, hold);
  if (frontUnsolved.length > 0) {
    const worldSlot = frontUnsolved[0]!;
    return {
      worldSlot,
      algSide: algSideForStudentFrontSlot(hold, worldSlot),
      needsFaceBackReorient: false,
    };
  }
  if (isMiddleLayerEdgesComplete(state, hold)) return null;

  const oppositeHold = holdFacingOpposite(hold);
  const oppositeFrontUnsolved = unsolvedStudentFrontMiddleSlots(
    state,
    oppositeHold,
    hold,
  );
  if (oppositeFrontUnsolved.length === 0) return null;

  return {
    worldSlot: oppositeFrontUnsolved[0]!,
    algSide: algSideForStudentFrontSlot(
      oppositeHold,
      oppositeFrontUnsolved[0]!,
    ),
    needsFaceBackReorient: hold !== oppositeHold,
  };
}
