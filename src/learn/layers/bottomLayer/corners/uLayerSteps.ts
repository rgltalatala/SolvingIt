import {
  applyMoves,
  compressConsecutiveFaceQuarterTurns,
} from '../../../../cube/cubeState';
import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import type { CubiePosition } from '../../../../cube3d/cubeGeometry';
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import { faceForWhiteOnCorner } from '../shared/pieceQueries';
import { whiteCornersSteps, formatCornerLabel } from '../../../../content/whiteCorners';
import { recognizeCornerCaseInFrdView, type ULayerCornerId } from './cornerCases';
import { studentHoldView, verifiedFrdDemoAtHold } from './frdViewDemoBuild';
import type { CornerSlotId } from './types';

export const FRD_URF_POS: CubiePosition = [1, 1, 1];

export const FRD_ALIGN_TO_URF: Record<ULayerCornerId, Move[]> = {
  URF: [],
  UBR: parseFaceTurnAlgToMoves('U'),
  ULB: parseFaceTurnAlgToMoves('U2'),
  UFL: parseFaceTurnAlgToMoves("U'"),
};

export const FRD_URF_WHITE_ON_U: Move[] =
  parseFaceTurnAlgToMoves("R U2 R' U' R U R'");
export const FRD_URF_WHITE_ON_R: Move[] = parseFaceTurnAlgToMoves("R U R'");
export const FRD_URF_WHITE_ON_F: Move[] = parseFaceTurnAlgToMoves("U R U' R'");

const U_LAYER_U_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]];

export { U_LAYER_U_PREFIXES };

export function alignMovesToUrf(uPosition: ULayerCornerId): Move[] {
  return FRD_ALIGN_TO_URF[uPosition];
}

export function insertMovesFromUrf(whiteOnFace: Face): Move[] | null {
  if (whiteOnFace === 'U') return FRD_URF_WHITE_ON_U;
  if (whiteOnFace === 'R') return FRD_URF_WHITE_ON_R;
  if (whiteOnFace === 'F') return FRD_URF_WHITE_ON_F;
  return null;
}

const URF_INSERT_WHITE_FACES: Face[] = ['U', 'R', 'F'];

export function urfInsertFacesToTry(preferredWhite: Face | null): Face[] {
  if (!preferredWhite) return URF_INSERT_WHITE_FACES;
  return [
    preferredWhite,
    ...URF_INSERT_WHITE_FACES.filter((face) => face !== preferredWhite),
  ];
}

/** True when align and insert both use U turns that could be merged into fewer moves. */
export function uLayerDemoHasAlignInsertUOverlap(
  demo: readonly Move[],
): boolean {
  if (demo.length < 2) return false;
  return (
    compressConsecutiveFaceQuarterTurns([...demo]).length < demo.length
  );
}

export function uLayerInsertStepBody(
  cornerId: CornerSlotId,
  demo: readonly Move[],
): string {
  const base = whiteCornersSteps.uLayerBase(
    formatCornerLabel(cornerId).toLowerCase(),
  );
  return uLayerDemoHasAlignInsertUOverlap(demo)
    ? `${base}${whiteCornersSteps.uLayerAlignInsertNote}`
    : base;
}

/** Keep align and insert as separate phases when compressing U turns. */
export function compressPedagogicalULayerDemo(
  align: readonly Move[],
  insert: readonly Move[],
): Move[] {
  return [
    ...compressConsecutiveFaceQuarterTurns([...align]),
    ...compressConsecutiveFaceQuarterTurns([...insert]),
  ];
}

export function buildFrdULayerDemo(
  studentState: CubeState,
  _uPosition: ULayerCornerId,
  targetId: CornerSlotId = 'FRD',
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] | null {
  const viewState = studentHoldView(studentState, holdIndex, []);
  const cornerCase = recognizeCornerCaseInFrdView(
    viewState,
    targetId,
    holdIndex,
  );
  if (cornerCase.kind !== 'in-u-layer') return null;

  const align = alignMovesToUrf(cornerCase.uPosition);
  const afterAlign = applyMoves(viewState, align);
  const whiteOnFace = faceForWhiteOnCorner(FRD_URF_POS, afterAlign);
  if (!whiteOnFace) return null;

  const insert = insertMovesFromUrf(whiteOnFace);
  if (!insert?.length) return null;

  const studentDemo = compressPedagogicalULayerDemo(align, insert);
  return verifiedFrdDemoAtHold(
    studentState,
    targetId,
    holdIndex,
    studentDemo,
    solvedCornerIds,
  );
}
