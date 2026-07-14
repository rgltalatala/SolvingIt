import { useNavigate } from 'react-router';
import type { LastLayerSubLesson } from '../learn/layers/lastLayer';
import {
  continueToLesson as continueToLessonInStore,
  prepareFreshLessonStart as prepareFreshLessonStartInStore,
  restartFromBeginning as restartFromBeginningInStore,
} from '../learn/lessonSessionPersistence';
import type { ActiveLessonId } from '../store/cubeStore';
import { useCubeStore } from '../store/cubeStore';
import { currentLessonPath, lessonPath } from './lessonLoader';

/** Navigate to a lesson URL after updating lesson selection in the store. */
export function useLessonNavigation() {
  const navigate = useNavigate();
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);

  return {
    goToLesson: (
      lessonId: ActiveLessonId,
      subLessonId?: LastLayerSubLesson | null,
    ) => {
      setActiveLesson(lessonId);
      navigate(lessonPath(lessonId, subLessonId));
    },
    continueToLesson: (nextLesson: ActiveLessonId) => {
      continueToLessonInStore(nextLesson);
      navigate(lessonPath(nextLesson));
    },
    prepareFreshLessonStart: (lessonId: ActiveLessonId) => {
      prepareFreshLessonStartInStore(lessonId);
      navigate(lessonPath(lessonId));
    },
    restartFromBeginning: () => {
      restartFromBeginningInStore();
      navigate('/');
    },
    /** Path for the Lesson tab when already learning. */
    lessonTabPath: () => {
      const appPhase = useCubeStore.getState().appPhase;
      if (appPhase === 'learning') return currentLessonPath();
      return '/';
    },
  };
}
