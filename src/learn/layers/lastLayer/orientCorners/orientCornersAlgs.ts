import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import type { Move } from '../../../../cube/cubeState';

export const ORIENT_CORNER_ALG: Move[] = parseFaceTurnAlgToMoves("R' D' R D");

export function repeatOrientAlg(reps: 2 | 4): Move[] {
  const out: Move[] = [];
  for (let i = 0; i < reps; i += 1) {
    out.push(...ORIENT_CORNER_ALG);
  }
  return out;
}
