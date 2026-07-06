import { RandomScrambleLessonBar } from './RandomScrambleLessonBar';
import { ReferenceShell } from './ReferenceShell';
import { useCubeStore } from '../store/cubeStore';

export function App() {
  const appPhase = useCubeStore((state) => state.appPhase);
  const scanReturnContext = useCubeStore((state) => state.scanReturnContext);

  return (
    <>
      {(appPhase === 'scanning' || appPhase === 'correcting') &&
      scanReturnContext === null ? (
        <RandomScrambleLessonBar />
      ) : null}
      <ReferenceShell />
    </>
  );
}

export default App;
