import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import type { Move } from '../../../../cube/cubeState';

export const PERMUTE_CORNERS_ALG: Move[] = parseFaceTurnAlgToMoves(
  "U R U' L' U R' U' L",
);
