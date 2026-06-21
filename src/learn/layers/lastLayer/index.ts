export const LAST_LAYER_LESSON_ID = 'last-layer' as const;

export type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  LastLayerStepKind,
  LastLayerSubLesson,
  OrientEdgesOllCase,
  PermuteCornersCaseKind,
  PermuteCornersZeroFlowStep,
  PermuteEdgesCaseKind,
  SimulateLastLayerLessonResult,
} from './types';

export {
  LAST_LAYER_STEP_KINDS,
  LAST_LAYER_SUB_LESSONS,
} from './types';

export {
  countYellowEdgesOnU,
  isYellowCrossComplete,
  U_LAYER_EDGE_SLOTS,
  yellowEdgeSlotsOnU,
  yellowStickerOnU,
} from './orientEdges/uLayerEdgeModel';

export type { ULayerEdgeId } from './orientEdges/uLayerEdgeModel';

export {
  alignMovesForBar,
  alignMovesForLShape,
  algorithmForOrientEdgesCase,
  BAR_ALG,
  DOT_ALG,
  L_SHAPE_ALG,
} from './orientEdges/orientEdgesAlgs';

export {
  isBarAligned,
  isLShapeAligned,
  recognizeOrientEdgesCase,
} from './orientEdges/orientEdgesCases';

export type { OrientEdgesCase } from './orientEdges/orientEdgesCases';

export {
  isLastLayerLessonStateValid,
  isVerifiedAlignUDemo,
  isVerifiedOrientEdgesDemo,
} from './orientEdges/preserveLessonState';

export {
  countPermutedEdges,
  edgePermutedAtSlot,
  findUPrefixToFullyPermute,
  isEdgesFullyPermuted,
  permutedEdgeSlots,
} from './permuteEdges/uLayerEdgePermuteModel';

export {
  recognizePermuteEdgesCase,
  type PermuteEdgesCase,
} from './permuteEdges/permuteEdgesCases';

export { PERMUTE_EDGES_ALG } from './permuteEdges/permuteEdgesAlgs';

export {
  backRightULayerSlots,
  holdIndexWherePairIsBackRight,
  isPairAtBackRight,
  reorientMovesForPermuteSetup,
} from './permuteEdges/permuteHold';

export { isVerifiedPermuteEdgesDemo } from './permuteEdges/preserveLessonState';

export {
  countPermutedCorners,
  countSolvedCorners,
  cornerOrientedAtSlot,
  cornerPermutedAtSlot,
  cornerSolvedAtSlot,
  isCornersFullyPermuted,
  isCornersFullySolved,
  isLastLayerComplete,
  permutedCornerSlots,
  unsolvedCornerSlots,
  U_LAYER_CORNER_SLOTS,
} from './permuteCorners/uLayerCornerPermuteModel';

export {
  recognizePermuteCornersCase,
  type PermuteCornersCase,
} from './permuteCorners/permuteCornersCases';

export { PERMUTE_CORNERS_ALG } from './permuteCorners/permuteCornersAlgs';

export {
  findReorientToPlacePermutedCornerAtWorldUrf,
  holdIndexToBringSlotToWorldUrf,
  reorientMovesForCornerSetup,
  WORLD_URF_SLOT,
  ZERO_FLOW_Y2_TARGET_HOLD,
} from './permuteCorners/permuteHold';

export {
  isVerifiedPermuteCornersDemo,
  isVerifiedPermuteCornersReorientDemo,
} from './permuteCorners/preserveLessonState';

export {
  ORIENT_CORNER_ALG,
  repeatOrientAlg,
} from './orientCorners/orientCornersAlgs';

export {
  orientRepsAtUrf,
  recognizeOrientCornersCase,
  type OrientCornersCase,
} from './orientCorners/orientCornersCases';

export { isVerifiedOrientCornersDemo } from './orientCorners/preserveLessonState';

export {
  computeOrientCornersStep,
  lastLayerCompleteStep,
} from './computeOrientCornersStep';

export {
  computePermuteCornersStep,
  lastLayerCornersPermuteCompleteStep,
} from './computePermuteCornersStep';

export {
  getLastLayerLessonStep,
  getLastLayerLessonStepAsync,
} from './computeLessonStep';

export {
  simulateLastLayerLessonOnStorageCube,
  simulateLastLayerLessonOnStorageCubeAsync,
} from './simulateLesson';

export type { CornerHoldIndex } from '../bottomLayer/corners/cornerHold';
