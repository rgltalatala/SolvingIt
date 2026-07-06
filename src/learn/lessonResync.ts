import {
  cubeStateToStudentFrame,
  type CubeState,
} from '../cube/cubeState';
import type { ActiveLessonId } from '../store/cubeStore';
import type {
  LastLayerSession,
  MiddleLayerSession,
  SessionsByLesson,
  WhiteCornersSession,
  WhiteCrossSession,
} from '../store/lessonSessionStore';
import { getWhiteCrossLessonStepAsync } from './layers/bottomLayer/cross';
import type { WhiteCrossLessonStep } from './layers/bottomLayer/cross/types';
import {
  activeCornerId,
  CORNER_ORDER,
  cornerSlotSolved,
  getWhiteCornerLessonStepAsync,
  normalizeHoldToBlue,
  targetHoldIndex,
  WHITE_CORNERS_LESSON_ID,
  type CornerHoldIndex,
  type CornerSlotId,
  type WhiteCornersLessonStep,
} from './layers/bottomLayer/corners';
import { isWhiteCrossComplete } from './layers/bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from './layers/bottomLayer/corners/cornerSlotModel';
import {
  edgeSlotSolved,
  getMiddleLayerEdgeLessonStepAsync,
  isMiddleLayerEdgesComplete,
  MIDDLE_EDGE_SLOTS,
  MIDDLE_LAYER_EDGES_LESSON_ID,
  partnerColorOnU,
  pickActiveUnsolvedEdge,
  targetHoldForMiddleEdgeInsert,
  type MiddleEdgeSlotId,
  type MiddleLayerEdgesLessonStep,
} from './layers/middleLayer/edges';
import {
  getLastLayerLessonStepAsync,
  isCornersFullyPermuted,
  isEdgesFullyPermuted,
  isLastLayerComplete,
  isYellowCrossComplete,
  LAST_LAYER_LESSON_ID,
  type LastLayerLessonStep,
} from './layers/lastLayer';
import { isOrientCornersPhase } from './layers/lastLayer/computeLessonStep';
import type {
  LastLayerLessonStepOptions,
  SeenLastLayerIntros,
} from './layers/lastLayer/types';

export const CURRICULUM_ORDER: readonly ActiveLessonId[] = [
  'white-cross',
  WHITE_CORNERS_LESSON_ID,
  MIDDLE_LAYER_EDGES_LESSON_ID,
  LAST_LAYER_LESSON_ID,
];

export type ResyncLessonStep =
  | WhiteCrossLessonStep
  | WhiteCornersLessonStep
  | MiddleLayerEdgesLessonStep
  | LastLayerLessonStep;

export type LessonResyncResult = {
  lesson: ActiveLessonId;
  previousLesson: ActiveLessonId;
  session: SessionsByLesson[ActiveLessonId];
  step: ResyncLessonStep;
  holdIndex: CornerHoldIndex;
};

function curriculumIndex(lesson: ActiveLessonId): number {
  return CURRICULUM_ORDER.indexOf(lesson);
}

export function isLessonAheadOf(
  inferred: ActiveLessonId,
  previous: ActiveLessonId,
): boolean {
  return curriculumIndex(inferred) > curriculumIndex(previous);
}

export function inferActiveLesson(studentFrame: CubeState): ActiveLessonId {
  if (!isWhiteCrossComplete(studentFrame)) {
    return 'white-cross';
  }
  if (!isWhiteCornersComplete(studentFrame, 0)) {
    return WHITE_CORNERS_LESSON_ID;
  }
  if (!isMiddleLayerEdgesComplete(studentFrame, 0)) {
    return MIDDLE_LAYER_EDGES_LESSON_ID;
  }
  return LAST_LAYER_LESSON_ID;
}

function inferSolvedCornerIds(
  studentFrame: CubeState,
  holdIndex: CornerHoldIndex,
): CornerSlotId[] {
  const normalized = normalizeHoldToBlue(studentFrame, holdIndex);
  return CORNER_ORDER.filter((id) => cornerSlotSolved(normalized, id));
}

function inferSolvedMiddleSlots(
  studentFrame: CubeState,
  holdIndex: CornerHoldIndex,
): MiddleEdgeSlotId[] {
  const normalized = normalizeHoldToBlue(studentFrame, holdIndex);
  return MIDDLE_EDGE_SLOTS.filter((id) => edgeSlotSolved(normalized, id));
}

export function inferCornerHold(studentFrame: CubeState): CornerHoldIndex {
  const cornerId = activeCornerId(studentFrame, 0);
  if (!cornerId) return 0;
  return targetHoldIndex(cornerId);
}

export function inferMiddleLayerHold(studentFrame: CubeState): CornerHoldIndex {
  const active = pickActiveUnsolvedEdge(studentFrame, 0);
  if (!active) return 0;
  const partner = partnerColorOnU(studentFrame, active.colors);
  if (!partner) return 0;
  return targetHoldForMiddleEdgeInsert(active.slotId, partner);
}

function deriveSeenLastLayerIntros(studentFrame: CubeState): SeenLastLayerIntros {
  const seenIntros: SeenLastLayerIntros = {};
  const yellowCross = isYellowCrossComplete(studentFrame);
  const edgesPermuted = isEdgesFullyPermuted(studentFrame);
  const cornersPermuted = isCornersFullyPermuted(studentFrame);
  const llComplete = isLastLayerComplete(studentFrame);

  if (
    isWhiteCrossComplete(studentFrame) &&
    isWhiteCornersComplete(studentFrame, 0) &&
    isMiddleLayerEdgesComplete(studentFrame, 0)
  ) {
    seenIntros.overview = true;
  }
  if (yellowCross || edgesPermuted || cornersPermuted || llComplete) {
    seenIntros['orient-edges'] = true;
  }
  if (edgesPermuted || cornersPermuted || llComplete) {
    seenIntros['permute-edges'] = true;
  }
  if (cornersPermuted || llComplete) {
    seenIntros['permute-corners'] = true;
  }
  if ((cornersPermuted && !llComplete) || llComplete) {
    seenIntros['orient-corners'] = true;
  }
  return seenIntros;
}

function buildLastLayerSession(studentFrame: CubeState): Omit<
  LastLayerSession,
  'sessionUndoStack'
> {
  const seenIntros = deriveSeenLastLayerIntros(studentFrame);
  const baseOptions: LastLayerLessonStepOptions = {
    seenIntros,
    hasAcknowledgedOrientEdgesComplete: isYellowCrossComplete(studentFrame),
    inOrientCornersPhase: false,
    currentHoldIndex: 0,
  };
  return {
    currentHoldIndex: 0,
    seenIntros,
    hasAcknowledgedOrientEdgesComplete: isYellowCrossComplete(studentFrame),
    inOrientCornersPhase: isOrientCornersPhase(studentFrame, baseOptions),
  };
}

function holdFromReorientStep(
  step: { kind: string; returnToInitialHold?: boolean; targetHoldIndex?: number },
  currentHold: CornerHoldIndex,
): CornerHoldIndex {
  if (step.kind !== 'reorient-hold') return currentHold;
  if (step.returnToInitialHold) return 0;
  if (step.targetHoldIndex !== undefined) {
    return step.targetHoldIndex as CornerHoldIndex;
  }
  return currentHold;
}

async function inferLastLayerHold(
  studentFrame: CubeState,
  session: LastLayerLessonStepOptions,
): Promise<CornerHoldIndex> {
  let hold = (session.currentHoldIndex ?? 0) as CornerHoldIndex;
  const step = await getLastLayerLessonStepAsync(studentFrame, {
    ...session,
    currentHoldIndex: hold,
  });
  return holdFromReorientStep(step, hold);
}

function buildWhiteCrossSession(): WhiteCrossSession {
  return { hasSeenStrategyIntro: true };
}

function buildWhiteCornersSession(
  studentFrame: CubeState,
  holdIndex: CornerHoldIndex,
): WhiteCornersSession {
  return {
    currentHoldIndex: holdIndex,
    solvedCornerIds: inferSolvedCornerIds(studentFrame, holdIndex),
    hasSeenStrategyIntro: true,
    sessionUndoStack: [],
  };
}

function buildMiddleLayerSession(
  studentFrame: CubeState,
  holdIndex: CornerHoldIndex,
): MiddleLayerSession {
  return {
    currentHoldIndex: holdIndex,
    solvedMiddleEdgeSlots: inferSolvedMiddleSlots(studentFrame, holdIndex),
    hasSeenStrategyIntro: true,
    sessionUndoStack: [],
  };
}

function buildLastLayerSessionWithHold(
  studentFrame: CubeState,
  holdIndex: CornerHoldIndex,
): LastLayerSession {
  const base = buildLastLayerSession(studentFrame);
  return {
    ...base,
    currentHoldIndex: holdIndex,
    sessionUndoStack: [],
  };
}

async function computeStepForLesson(
  lesson: ActiveLessonId,
  studentFrame: CubeState,
  session: SessionsByLesson[ActiveLessonId],
): Promise<ResyncLessonStep> {
  switch (lesson) {
    case 'white-cross':
      return getWhiteCrossLessonStepAsync(studentFrame, session as WhiteCrossSession);
    case WHITE_CORNERS_LESSON_ID:
      return getWhiteCornerLessonStepAsync(
        studentFrame,
        session as WhiteCornersSession,
      );
    case MIDDLE_LAYER_EDGES_LESSON_ID:
      return getMiddleLayerEdgeLessonStepAsync(
        studentFrame,
        session as MiddleLayerSession,
      );
    case LAST_LAYER_LESSON_ID:
      return getLastLayerLessonStepAsync(
        studentFrame,
        session as LastLayerSession,
      );
    default: {
      const _exhaustive: never = lesson;
      return _exhaustive;
    }
  }
}

async function buildSessionAndStep(
  lesson: ActiveLessonId,
  studentFrame: CubeState,
): Promise<{
  session: SessionsByLesson[ActiveLessonId];
  step: ResyncLessonStep;
  holdIndex: CornerHoldIndex;
}> {
  switch (lesson) {
    case 'white-cross': {
      const session = buildWhiteCrossSession();
      const step = await computeStepForLesson(lesson, studentFrame, session);
      return { session, step, holdIndex: 0 };
    }
    case WHITE_CORNERS_LESSON_ID: {
      const holdIndex = inferCornerHold(studentFrame);
      const session = buildWhiteCornersSession(studentFrame, holdIndex);
      const step = await computeStepForLesson(lesson, studentFrame, session);
      return { session, step, holdIndex };
    }
    case MIDDLE_LAYER_EDGES_LESSON_ID: {
      const holdIndex = inferMiddleLayerHold(studentFrame);
      const session = buildMiddleLayerSession(studentFrame, holdIndex);
      const step = await computeStepForLesson(lesson, studentFrame, session);
      return { session, step, holdIndex };
    }
    case LAST_LAYER_LESSON_ID: {
      const baseSession = buildLastLayerSession(studentFrame);
      const holdIndex = await inferLastLayerHold(studentFrame, baseSession);
      const session = buildLastLayerSessionWithHold(studentFrame, holdIndex);
      const step = await computeStepForLesson(lesson, studentFrame, session);
      return { session, step, holdIndex };
    }
    default: {
      const _exhaustive: never = lesson;
      return _exhaustive;
    }
  }
}

export async function resyncLessonFromScan(
  cubeState: CubeState,
  previousLesson: ActiveLessonId,
): Promise<LessonResyncResult> {
  const studentFrame = cubeStateToStudentFrame(cubeState);
  const lesson = inferActiveLesson(studentFrame);
  const { session, step, holdIndex } = await buildSessionAndStep(
    lesson,
    studentFrame,
  );
  return {
    lesson,
    previousLesson,
    session,
    step,
    holdIndex,
  };
}
