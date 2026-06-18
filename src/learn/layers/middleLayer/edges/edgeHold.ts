import type { Color, Move } from '../../../../cube/cubeState';
import {
  formatHoldFaceLabel,
  relativeY,
  type CornerHoldIndex,
} from '../../bottomLayer/corners/cornerHold';
import type { MiddleEdgeSlotId } from './types';
import { holdsWhereSlotIsOnFront } from './edgeSlotModel';

const HOLD_INDEX_BY_COLOR: Record<Color, CornerHoldIndex | undefined> = {
  blue: 0,
  red: 1,
  green: 2,
  orange: 3,
  white: undefined,
  yellow: undefined,
};

export function targetHoldForColor(color: Color): CornerHoldIndex {
  const hold = HOLD_INDEX_BY_COLOR[color];
  if (hold === undefined) {
    throw new Error(`No lesson hold maps color ${color} to front`);
  }
  return hold;
}

/** Hold where the target slot is on F and the partner color faces the student when possible. */
export function targetHoldForMiddleEdgeInsert(
  slotId: MiddleEdgeSlotId,
  partnerColor: Color,
): CornerHoldIndex {
  const frontHolds = holdsWhereSlotIsOnFront(slotId);
  if (frontHolds.length === 0) {
    throw new Error(`No lesson hold puts middle slot ${slotId} on front`);
  }
  const partnerHold = targetHoldForColor(partnerColor);
  if (frontHolds.includes(partnerHold)) return partnerHold;
  if (frontHolds.includes(0)) return 0;
  return frontHolds[0]!;
}

export function holdFacingOpposite(currentHold: CornerHoldIndex): CornerHoldIndex {
  return ((currentHold + 2) % 4) as CornerHoldIndex;
}

/** Whole-cube y so the back face (opposite F) faces the student. */
export function reorientMovesToFaceBack(
  currentHold: CornerHoldIndex,
): Move[] {
  return relativeY(currentHold, holdFacingOpposite(currentHold));
}

export { formatHoldFaceLabel, relativeY };

export function formatColorHoldLabel(index: CornerHoldIndex): string {
  return formatHoldFaceLabel(index);
}
