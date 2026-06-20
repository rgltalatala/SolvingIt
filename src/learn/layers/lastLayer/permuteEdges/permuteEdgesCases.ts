import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import type { CornerHoldIndex } from '../../bottomLayer/corners/cornerHold';
import { slotPairKey } from '../orientEdges/orientEdgesCases';
import type { ULayerEdgeId } from '../orientEdges/uLayerEdgeModel';
import { isYellowCrossComplete } from '../orientEdges/uLayerEdgeModel';
import { holdIndexWherePairIsBackRight } from './permuteHold';
import {
  findUPrefixToFullyPermute,
  isEdgesFullyPermuted,
  permutedEdgeSlots,
  permutedSlotsAfterBestUScan,
} from './uLayerEdgePermuteModel';

const OPPOSITE_PAIRS: ReadonlySet<string> = new Set(['UB,UF', 'UL,UR']);

export type PermuteEdgesCase =
  | { kind: 'solved' }
  | { kind: 'u-only'; alignMoves: Move[] }
  | {
      kind: 'adjacent';
      slots: [ULayerEdgeId, ULayerEdgeId];
      targetHoldIndex: CornerHoldIndex;
      inspectPrefix: Move[];
    }
  | {
      kind: 'opposite';
      slots: [ULayerEdgeId, ULayerEdgeId];
      inspectPrefix: Move[];
    };

function isOppositePair(a: ULayerEdgeId, b: ULayerEdgeId): boolean {
  return OPPOSITE_PAIRS.has(slotPairKey(a, b));
}

export function recognizePermuteEdgesCase(
  state: CubeState,
  currentHoldIndex: CornerHoldIndex = 0,
): PermuteEdgesCase {
  if (!isYellowCrossComplete(state)) {
    throw new Error('recognizePermuteEdgesCase requires yellow cross');
  }

  if (isEdgesFullyPermuted(state)) {
    return { kind: 'solved' };
  }

  const uOnlyPrefix = findUPrefixToFullyPermute(state);
  if (uOnlyPrefix !== null) {
    return { kind: 'u-only', alignMoves: uOnlyPrefix };
  }

  const scan = permutedSlotsAfterBestUScan(state);
  if (scan) {
    const { slots, inspectPrefix } = scan;
    if (isOppositePair(slots[0], slots[1])) {
      return { kind: 'opposite', slots, inspectPrefix };
    }
    return {
      kind: 'adjacent',
      slots,
      targetHoldIndex: holdIndexWherePairIsBackRight(slots, currentHoldIndex),
      inspectPrefix,
    };
  }

  const permuted = permutedEdgeSlots(state);
  if (permuted.length === 2) {
    const slots = [permuted[0]!, permuted[1]!] as [ULayerEdgeId, ULayerEdgeId];
    if (isOppositePair(slots[0], slots[1])) {
      return { kind: 'opposite', slots, inspectPrefix: [] };
    }
    return {
      kind: 'adjacent',
      slots,
      targetHoldIndex: holdIndexWherePairIsBackRight(slots, currentHoldIndex),
      inspectPrefix: [],
    };
  }

  return { kind: 'opposite', slots: ['UL', 'UR'], inspectPrefix: [] };
}

/** View state after optional inspect U prefix used during case detection. */
export function stateForPermuteCaseView(
  state: CubeState,
  permuteCase: PermuteEdgesCase,
): CubeState {
  if (permuteCase.kind === 'u-only' || permuteCase.kind === 'solved') {
    return state;
  }
  const prefix = permuteCase.inspectPrefix;
  return prefix.length ? applyMoves(state, prefix) : state;
}
