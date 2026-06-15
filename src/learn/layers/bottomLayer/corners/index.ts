export const WHITE_CORNERS_LESSON_ID = 'white-corners' as const;

export type {
  CornerSlotId,
  SimulateWhiteCornersLessonResult,
  WhiteCornerLessonStepOptions,
  WhiteCornersLessonStep,
  WhiteCornersStepKind,
} from './types';

export { CORNER_ORDER, WHITE_CORNERS_STEP_KINDS } from './types';

export {
  activeCornerId,
  cornerSlotSolved,
  countSolvedCornerSlots,
  expectedCornerColors,
  formatColor,
  formatCornerLabel,
  isWhiteCornersComplete,
  mustPreserveCornerIds,
} from './cornerSlotModel';

export type {
  CornerCase,
  ULayerCornerId,
  WrongDLayerSlotId,
} from './cornerCases';
export {
  cornerSolvedInFrdView,
  isCornerPieceInSlot,
  recognizeCornerCase,
  recognizeCornerCaseInFrdView,
} from './cornerCases';

export type { CornerHoldIndex } from './cornerHold';
export {
  formatHoldFaceLabel,
  holdIndexToY,
  normalizeHoldToBlue,
  relativeY,
  returnToBlueY,
  targetHoldIndex,
} from './cornerHold';

export {
  cornerPreservedAtLessonHold,
  cornerTargetSolvedAtHold,
  isLessonStateValid,
  isVerifiedCornerSlotDemo,
  preservesLessonStateAfterDemo,
} from './preserveLessonState';

export { resolveLessonStorageDemo } from './frdViewDemoBuild';

export {
  getWhiteCornerLessonStep,
  getWhiteCornerLessonStepAsync,
} from './computeLessonStep';

export {
  simulateWhiteCornersLessonOnStorageCube,
  simulateWhiteCornersLessonOnStorageCubeAsync,
} from './simulateLesson';

// Re-exports used by corner lesson tests (import from submodules in new code).
export {
  alignMovesToUrf,
  FRD_URF_WHITE_ON_F,
  FRD_URF_WHITE_ON_R,
  FRD_URF_WHITE_ON_U,
  insertMovesFromUrf,
} from './uLayerSteps';
export { FRD_WHITE_ON_F, FRD_WHITE_ON_R } from './directSolveSteps';
