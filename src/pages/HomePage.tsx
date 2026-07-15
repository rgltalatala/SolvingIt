import { Navigate } from 'react-router';
import { currentLessonPath } from '../lessons/lessonLoader';
import { NotationIntroPanel } from '../ui/NotationIntroPanel';
import { ScanView } from '../ui/ScanView';
import { LessonResyncView } from '../ui/LessonResyncView';
import { useCubeStore } from '../store/cubeStore';

/** Pre-learning pipeline: notation intro → scan/correct → lessonResync. */
export function HomePage() {
  const appPhase = useCubeStore((state) => state.appPhase);

  if (appPhase === 'learning') {
    return <Navigate to={currentLessonPath()} replace />;
  }

  if (appPhase === 'notation') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotationIntroPanel />
      </div>
    );
  }

  if (appPhase === 'scanning' || appPhase === 'correcting') {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScanView />
      </div>
    );
  }

  if (appPhase === 'lessonResync') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <LessonResyncView />
      </div>
    );
  }

  return null;
}
