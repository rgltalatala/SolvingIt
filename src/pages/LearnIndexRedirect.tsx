import { Navigate } from 'react-router';
import { DEFAULT_LESSON_ID } from '../lessons/lessons';
import { currentLessonPath, lessonPath } from '../lessons/lessonLoader';
import { useCubeStore } from '../store/cubeStore';

/** `/learn` → current lesson when learning, otherwise default lesson path (LessonPage redirects home if not ready). */
export function LearnIndexRedirect() {
  const appPhase = useCubeStore((state) => state.appPhase);

  if (appPhase === 'learning') {
    return <Navigate to={currentLessonPath()} replace />;
  }

  return <Navigate to={lessonPath(DEFAULT_LESSON_ID)} replace />;
}
