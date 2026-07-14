import { cubeStateToStudentFrame, type CubeState } from '../cube/cubeState';
import {
  isOrientCornersPhase,
  isCornersFullyPermuted,
  isEdgesFullyPermuted,
  isLastLayerComplete,
  isYellowCrossComplete,
  LAST_LAYER_LESSON_ID,
  LAST_LAYER_SUB_LESSONS,
  type LastLayerSubLesson,
} from '../learn/layers/lastLayer';
import type { ActiveLessonId } from '../store/cubeStore';
import { useCubeStore } from '../store/cubeStore';
import {
  useLessonSessionStore,
  type LastLayerSession,
} from '../store/lessonSessionStore';
import {
  DEFAULT_LESSON_ID,
  lessons,
  type LessonConfig,
} from './lessons';

const lessonById = new Map<ActiveLessonId, LessonConfig>(
  lessons.map((lesson) => [lesson.id, lesson]),
);

const lessonIdSet = new Set<string>(lessons.map((lesson) => lesson.id));
const lastLayerSubLessonSet = new Set<string>(LAST_LAYER_SUB_LESSONS);

export function isLessonId(value: string | undefined): value is ActiveLessonId {
  return value !== undefined && lessonIdSet.has(value);
}

export function isLastLayerSubLessonId(
  value: string | undefined,
): value is LastLayerSubLesson {
  return value !== undefined && lastLayerSubLessonSet.has(value);
}

export function getLesson(lessonId: ActiveLessonId): LessonConfig {
  const lesson = lessonById.get(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lesson id: ${lessonId}`);
  }
  return lesson;
}

export function getLessonById(
  lessonId: string | undefined,
): LessonConfig | null {
  if (!isLessonId(lessonId)) return null;
  return getLesson(lessonId);
}

/** Path for a top-level lesson, optionally with a last-layer sub-lesson. */
export function lessonPath(
  lessonId: ActiveLessonId,
  subLessonId?: LastLayerSubLesson | null,
): string {
  if (lessonId === LAST_LAYER_LESSON_ID) {
    if (subLessonId && isLastLayerSubLessonId(subLessonId)) {
      return `/learn/${LAST_LAYER_LESSON_ID}/${subLessonId}`;
    }
    return `/learn/${LAST_LAYER_LESSON_ID}`;
  }
  return `/learn/${lessonId}`;
}

/**
 * Derive which last-layer sub-lesson the cube/session is currently in.
 * Used for URL sync and hydrate redirects — not a source of lesson progress.
 */
export function deriveLastLayerSubLessonId(
  studentFrame: CubeState | null,
  session: LastLayerSession | undefined,
): LastLayerSubLesson {
  if (!studentFrame) return 'orient-edges';

  const options = {
    currentHoldIndex: session?.currentHoldIndex ?? 0,
    inOrientCornersPhase: session?.inOrientCornersPhase,
    seenIntros: session?.seenIntros ?? {},
    hasAcknowledgedOrientEdgesComplete:
      session?.hasAcknowledgedOrientEdgesComplete,
  };

  if (isLastLayerComplete(studentFrame) && options.currentHoldIndex === 0) {
    return 'orient-corners';
  }

  if (isOrientCornersPhase(studentFrame, options)) {
    return 'orient-corners';
  }

  if (!isYellowCrossComplete(studentFrame)) {
    return 'orient-edges';
  }

  if (!options.hasAcknowledgedOrientEdgesComplete) {
    return 'orient-edges';
  }

  if (!isEdgesFullyPermuted(studentFrame)) {
    return 'permute-edges';
  }

  if (!isCornersFullyPermuted(studentFrame)) {
    return 'permute-corners';
  }

  return 'orient-corners';
}

/** Current learn URL from Zustand (for Lesson tab / redirects). */
export function currentLessonPath(): string {
  const { appPhase, activeLesson, cubeState } = useCubeStore.getState();
  if (appPhase !== 'learning') {
    return lessonPath(DEFAULT_LESSON_ID);
  }

  if (activeLesson !== LAST_LAYER_LESSON_ID) {
    return lessonPath(activeLesson);
  }

  const session = useLessonSessionStore
    .getState()
    .getSession(LAST_LAYER_LESSON_ID);
  const studentFrame = cubeState ? cubeStateToStudentFrame(cubeState) : null;
  return lessonPath(
    LAST_LAYER_LESSON_ID,
    deriveLastLayerSubLessonId(studentFrame, session),
  );
}
