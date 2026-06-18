import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import type { Move } from '../../../../cube/cubeState';

export const LEFT_INSERT: Move[] = parseFaceTurnAlgToMoves(
  "U' L' U L U F U' F'",
);

export const RIGHT_INSERT: Move[] = parseFaceTurnAlgToMoves(
  "U R U' R' U' F' U F",
);

export function algorithmForFrontSlot(
  slot: 'FL' | 'FR',
): Move[] {
  return slot === 'FL' ? [...LEFT_INSERT] : [...RIGHT_INSERT];
}
