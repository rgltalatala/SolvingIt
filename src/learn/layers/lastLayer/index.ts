export const LAST_LAYER_LESSON_ID = 'last-layer' as const;

export type {
  LastLayerIntroId,
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  LastLayerStepKind,
  LastLayerSubLesson,
  OrientEdgesOllCase,
  PermuteCornersCaseKind,
  PermuteEdgesCaseKind,
  SeenLastLayerIntros,
  SimulateLastLayerLessonResult,
} from './types';

export {
  ALL_LAST_LAYER_INTROS_SEEN,
  LAST_LAYER_PAST_ORIENT_EDGES,
  LAST_LAYER_INTRO_IDS,
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
  holdIndexFromFrontColor,
  holdIndexWherePairIsBackRight,
  isPairAtBackRight,
  isPairAtHoldBackRight,
  reorientMovesForPermuteSetup,
} from './permuteEdges/permuteHold';

export { isVerifiedPermuteEdgesDemo } from './permuteEdges/preserveLessonState';

export {
  countPermutedCorners,
  countSolvedCorners,
  cornerOrientedAtSlot,
  cornerOrientedByIdentity,
  countOrientedCornersByIdentity,
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

export {
  PERMUTE_CORNERS_ALG,
  ZERO_FLOW_NONE_PERMUTED_SETUP,
  ZERO_FLOW_PERMUTE_CORNERS_FULL,
  ZERO_FLOW_PERMUTE_PHASES,
} from './permuteCorners/permuteCornersAlgs';

export {
  reorientPermutedCornerToUrfIfNeeded,
  runPermuteCornersUntilFullyPermuted,
} from './permuteCorners/permuteCycle';

export { buildZeroFlowPermuteDemo, zeroFlowCaseDemoMetadata } from './permuteCorners/zeroFlowDemo';

export {
  findReorientToPlacePermutedCornerAtWorldUrf,
  holdIndexToBringSlotToWorldUrf,
  WORLD_URF_SLOT,
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
} from './computePermuteCornersStep';

export {
  getLastLayerLessonStep,
  getLastLayerLessonStepAsync,
} from './computeLessonStep';

export {
  simulateLastLayerLessonOnStorageCube,
} from './simulateLesson';

export type { CornerHoldIndex } from '../bottomLayer/corners/cornerHold';
