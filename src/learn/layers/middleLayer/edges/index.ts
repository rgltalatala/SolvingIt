export const MIDDLE_LAYER_EDGES_LESSON_ID = 'middle-layer-edges' as const;

export type {
  MiddleEdgeSlotId,
  MiddleLayerEdgeLessonStepOptions,
  MiddleLayerEdgesLessonStep,
  MiddleLayerEdgesStepKind,
  SimulateMiddleLayerEdgesLessonResult,
} from './types';

export {
  MIDDLE_EDGE_SLOTS,
  MIDDLE_LAYER_EDGES_STEP_KINDS,
} from './types';

export {
  countSolvedMiddleEdgeSlots,
  edgeSlotSolved,
  formatColor,
  isMiddleLayerEdgesComplete,
  isMiddleLayerEdgesScrambleValid,
  middleLayerEdgePairs,
  pickActiveUnsolvedEdge,
  pickBuriedExtractSlot,
  slotIdForExpectedEdgeColors,
  targetFrontSlotBetweenCenters,
} from './edgeSlotModel';

export { normalizeHoldToBlue } from '../../bottomLayer/corners/cornerHold';

export type { CornerHoldIndex } from '../../bottomLayer/corners/cornerHold';
export {
  formatColorHoldLabel,
  holdFacingOpposite,
  relativeY,
  reorientMovesToFaceBack,
  targetHoldForColor,
} from './edgeHold';

export { LEFT_INSERT, RIGHT_INSERT, algorithmForFrontSlot } from './edgeAlgorithms';

export {
  alignMovesToPartnerCenter,
  isPartnerAlignedToCenter,
  partnerColorOnU,
} from './uLayerAlign';

export {
  isMiddleLayerLessonStateValid,
  isVerifiedMiddleEdgeExtractDemo,
  isVerifiedMiddleEdgeInsertDemo,
} from './preserveLessonState';

export {
  getMiddleLayerEdgeLessonStep,
  getMiddleLayerEdgeLessonStepAsync,
} from './computeLessonStep';

export {
  simulateMiddleLayerEdgesLessonOnStorageCube,
  simulateMiddleLayerEdgesLessonOnStorageCubeAsync,
} from './simulateLesson';
