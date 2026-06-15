import { ScanView } from './ScanView';
import { CubeEditorView } from './CubeEditorView';
import { LearningCrossView } from './LearningCrossView';
import { LearningCornersView } from './LearningCornersView';
import { RandomScrambleLessonBar } from './RandomScrambleLessonBar';
import { useCubeStore } from '../store/cubeStore';

export function App() {
  const appPhase = useCubeStore((state) => state.appPhase);
  const activeLesson = useCubeStore((state) => state.activeLesson);

  return (
    <>
      {appPhase === 'scanning' || appPhase === 'correcting' ? (
        <RandomScrambleLessonBar />
      ) : null}

      {appPhase === 'learning' ? (
        activeLesson === 'white-corners' ? (
          <LearningCornersView />
        ) : (
          <LearningCrossView />
        )
      ) : appPhase === 'ready' ? (
        <CubeEditorView />
      ) : (
        <ScanView />
      )}
    </>
  );
}

export default App;
