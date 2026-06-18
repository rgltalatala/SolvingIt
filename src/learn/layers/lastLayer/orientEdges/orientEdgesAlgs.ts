import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import type { Move } from '../../../../cube/cubeState';
import { slotPairKey } from './orientEdgesCases';
import type { ULayerEdgeId } from './uLayerEdgeModel';

export const L_SHAPE_ALG: Move[] = parseFaceTurnAlgToMoves("F U R U' R' F'");
export const BAR_ALG: Move[] = parseFaceTurnAlgToMoves("F R U R' U' F'");
export const DOT_ALG: Move[] = parseFaceTurnAlgToMoves(
  "F U R U' R' F' U' F R U R' U' F'",
);

const L_SHAPE_TARGET: readonly [ULayerEdgeId, ULayerEdgeId] = ['UB', 'UL'];
const BAR_TARGET: readonly [ULayerEdgeId, ULayerEdgeId] = ['UL', 'UR'];

const L_SHAPE_ALIGN: Record<string, Move[]> = {
  'UB,UL': [],
  'UB,UR': parseFaceTurnAlgToMoves("U'"),
  'UF,UR': parseFaceTurnAlgToMoves('U2'),
  'UF,UL': parseFaceTurnAlgToMoves('U'),
};

const BAR_ALIGN: Record<string, Move[]> = {
  'UL,UR': [],
  'UB,UF': parseFaceTurnAlgToMoves("U'"),
};

export function alignMovesForLShape(
  slots: readonly [ULayerEdgeId, ULayerEdgeId],
): Move[] {
  const key = slotPairKey(slots[0], slots[1]);
  return L_SHAPE_ALIGN[key] ?? [];
}

export function alignMovesForBar(
  slots: readonly [ULayerEdgeId, ULayerEdgeId],
): Move[] {
  const key = slotPairKey(slots[0], slots[1]);
  return BAR_ALIGN[key] ?? parseFaceTurnAlgToMoves("U'");
}

export function algorithmForOrientEdgesCase(
  ollCase: 'dot' | 'l-shape' | 'bar',
): Move[] {
  if (ollCase === 'dot') return [...DOT_ALG];
  if (ollCase === 'l-shape') return [...L_SHAPE_ALG];
  return [...BAR_ALG];
}

export { L_SHAPE_TARGET, BAR_TARGET };
