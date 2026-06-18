import type { CubeState } from '../../../../cube/cubeState';
import type { ULayerEdgeId } from './uLayerEdgeModel';
import {
  countYellowEdgesOnU,
  isYellowCrossComplete,
  yellowEdgeSlotsOnU,
} from './uLayerEdgeModel';

export type OrientEdgesCase =
  | { kind: 'solved' }
  | { kind: 'dot' }
  | { kind: 'l-shape'; slots: [ULayerEdgeId, ULayerEdgeId] }
  | { kind: 'bar'; slots: [ULayerEdgeId, ULayerEdgeId] };

const OPPOSITE_PAIRS: ReadonlySet<string> = new Set(['UB,UF', 'UL,UR']);

function slotPairKey(a: ULayerEdgeId, b: ULayerEdgeId): string {
  return [a, b].sort().join(',');
}

function asSlotPair(slots: ULayerEdgeId[]): [ULayerEdgeId, ULayerEdgeId] {
  return [slots[0]!, slots[1]!];
}

export function recognizeOrientEdgesCase(state: CubeState): OrientEdgesCase {
  if (isYellowCrossComplete(state)) {
    return { kind: 'solved' };
  }

  const count = countYellowEdgesOnU(state);
  if (count === 0) {
    return { kind: 'dot' };
  }

  if (count === 2) {
    const slots = yellowEdgeSlotsOnU(state);
    const pair = asSlotPair(slots);
    const key = slotPairKey(pair[0], pair[1]);
    if (OPPOSITE_PAIRS.has(key)) {
      return { kind: 'bar', slots: pair };
    }
    return { kind: 'l-shape', slots: pair };
  }

  return { kind: 'dot' };
}

export function isLShapeAligned(slots: readonly ULayerEdgeId[]): boolean {
  const set = new Set(slots);
  return set.has('UB') && set.has('UL');
}

export function isBarAligned(slots: readonly ULayerEdgeId[]): boolean {
  const set = new Set(slots);
  return set.has('UL') && set.has('UR');
}

export { slotPairKey };
