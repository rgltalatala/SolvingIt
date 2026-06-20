import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import type { Move } from '../../../../cube/cubeState';

export const PERMUTE_EDGES_ALG: Move[] = parseFaceTurnAlgToMoves(
  "R U R' U R U2 R' U",
);
