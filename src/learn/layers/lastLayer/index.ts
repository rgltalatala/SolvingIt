export const LAST_LAYER_LESSON_ID = 'last-layer' as const;

export type {
  LastLayerLessonStep,
  LastLayerStepKind,
  LastLayerSubLesson,
  OrientEdgesOllCase,
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
  getLastLayerLessonStep,
  getLastLayerLessonStepAsync,
} from './computeLessonStep';

export {
  simulateLastLayerLessonOnStorageCube,
  simulateLastLayerLessonOnStorageCubeAsync,
} from './simulateLesson';
