import { CubeEditorView } from './CubeEditorView';
import { LearningCrossView } from './LearningCrossView';
import { LearningCornersView } from './LearningCornersView';
import { LearningMiddleLayerView } from './LearningMiddleLayerView';
import { LearningLastLayerView } from './LearningLastLayerView';
import { LessonResyncView } from './LessonResyncView';
import { LessonTopNav } from './LessonTopNav';
import { NotationIntroPanel } from './NotationIntroPanel';
import { ScanView } from './ScanView';
import { CasesReferenceView } from './lessons/CasesReferenceView';
import { LessonNotationView } from './lessons/LessonNotationView';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { LAST_LAYER_LESSON_ID } from '../learn/layers/lastLayer';
import { useCubeStore } from '../store/cubeStore';
import { useLessonSessionStore } from '../store/lessonSessionStore';

function ActiveLessonView() {
  const activeLesson = useCubeStore((state) => state.activeLesson);

  if (activeLesson === LAST_LAYER_LESSON_ID) {
    return <LearningLastLayerView />;
  }
  if (activeLesson === MIDDLE_LAYER_EDGES_LESSON_ID) {
    return <LearningMiddleLayerView />;
  }
  if (activeLesson === 'white-corners') {
    return <LearningCornersView />;
  }
  return <LearningCrossView />;
}

function LessonTabContent() {
  const appPhase = useCubeStore((state) => state.appPhase);

  if (appPhase === 'notation') {
    return <NotationIntroPanel />;
  }
  if (appPhase === 'scanning' || appPhase === 'correcting') {
    return <ScanView />;
  }
  if (appPhase === 'lessonResync') {
    return <LessonResyncView />;
  }
  if (appPhase === 'learning') {
    return <ActiveLessonView />;
  }
  return <CubeEditorView embedded />;
}

export function ReferenceShell() {
  const appPhase = useCubeStore((state) => state.appPhase);
  const learningSection = useLessonSessionStore((state) => state.learningSection);

  return (
    <div className="flex min-h-screen flex-col">
      <LessonTopNav showEndLesson={appPhase === 'learning'} />
      <div className={learningSection === 'lesson' ? undefined : 'hidden'}>
        <LessonTabContent />
      </div>
      {learningSection === 'notation' ? <LessonNotationView /> : null}
      {learningSection === 'cases' ? <CasesReferenceView /> : null}
    </div>
  );
}
