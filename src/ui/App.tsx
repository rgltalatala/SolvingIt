import { ScanView } from './ScanView';
import { CubeEditorView } from './CubeEditorView';
import { LearningCrossView } from './LearningCrossView';
import { LearningCornersView } from './LearningCornersView';
import { LearningMiddleLayerView } from './LearningMiddleLayerView';
import { LearningLastLayerView } from './LearningLastLayerView';
import { RandomScrambleLessonBar } from './RandomScrambleLessonBar';
import { NotationIntroView } from './NotationIntroView';
import { NotationReference } from './notation/NotationReference';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { LAST_LAYER_LESSON_ID } from '../learn/layers/lastLayer';
import { useCubeStore } from '../store/cubeStore';

export function App() {
  const appPhase = useCubeStore((state) => state.appPhase);
  const activeLesson = useCubeStore((state) => state.activeLesson);

  return (
    <>
      {appPhase === 'scanning' || appPhase === 'correcting' ? (
        <RandomScrambleLessonBar />
      ) : null}

      {appPhase === 'notation' ? (
        <NotationIntroView />
      ) : appPhase === 'learning' ? (
        <>
          {activeLesson === LAST_LAYER_LESSON_ID ? (
            <LearningLastLayerView />
          ) : activeLesson === MIDDLE_LAYER_EDGES_LESSON_ID ? (
            <LearningMiddleLayerView />
          ) : activeLesson === 'white-corners' ? (
            <LearningCornersView />
          ) : (
            <LearningCrossView />
          )}
          <NotationReference />
        </>
      ) : appPhase === 'ready' ? (
        <CubeEditorView />
      ) : (
        <ScanView />
      )}
    </>
  );
}

export default App;
