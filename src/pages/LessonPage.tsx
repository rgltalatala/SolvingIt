import { useEffect, type ComponentType } from 'react';
import { Navigate, useParams } from 'react-router';
import { LAST_LAYER_LESSON_ID } from '../learn/layers/lastLayer';
import {
  getLessonById,
  isLastLayerSubLessonId,
  lessonPath,
} from '../lessons/lessonLoader';
import type { LessonRendererKey } from '../lessons/lessons';
import { LearningCrossView } from '../ui/LearningCrossView';
import { LearningCornersView } from '../ui/LearningCornersView';
import { LearningMiddleLayerView } from '../ui/LearningMiddleLayerView';
import { LearningLastLayerView } from '../ui/LearningLastLayerView';
import { useCubeStore } from '../store/cubeStore';
import type { ActiveLessonId } from '../store/cubeStore';

const LESSON_VIEWS: Record<LessonRendererKey, ComponentType> = {
  'white-cross': LearningCrossView,
  'white-corners': LearningCornersView,
  'middle-layer-edges': LearningMiddleLayerView,
  'last-layer': LearningLastLayerView,
};

type LessonPageProps = {
  /** Fixed lesson id for nested last-layer routes. */
  fixedLessonId?: ActiveLessonId;
};

/**
 * Individual lesson destination. Loads config by route params and renders the
 * matching lesson view. Lesson progress stays in Zustand, not the URL.
 */
export function LessonPage({ fixedLessonId }: LessonPageProps = {}) {
  const { lessonId: lessonIdParam, subLessonId } = useParams<{
    lessonId?: string;
    subLessonId?: string;
  }>();

  const lessonId = fixedLessonId ?? lessonIdParam;
  const lesson = getLessonById(lessonId);

  const appPhase = useCubeStore((state) => state.appPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const activeLesson = useCubeStore((state) => state.activeLesson);

  useEffect(() => {
    if (!lesson || appPhase !== 'learning') return;
    if (activeLesson !== lesson.id) {
      setActiveLesson(lesson.id);
    }
  }, [lesson, appPhase, activeLesson, setActiveLesson]);

  if (appPhase !== 'learning') {
    return <Navigate to="/" replace />;
  }

  if (subLessonId !== undefined && !isLastLayerSubLessonId(subLessonId)) {
    return <Navigate to={lessonPath(LAST_LAYER_LESSON_ID)} replace />;
  }

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  const View = LESSON_VIEWS[lesson.renderer];
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <View />
    </div>
  );
}

/** Nested `/learn/last-layer` and `/learn/last-layer/:subLessonId` entry. */
export function LastLayerLessonPage() {
  return <LessonPage fixedLessonId={LAST_LAYER_LESSON_ID} />;
}
