import { BrowserRouter } from 'react-router';
import { AppRouter } from '../router/router';
import { useCubeStore } from '../store/cubeStore';
import { RandomScrambleLessonBar } from './RandomScrambleLessonBar';

export function App() {
  const appPhase = useCubeStore((state) => state.appPhase);
  const scanReturnContext = useCubeStore((state) => state.scanReturnContext);

  return (
    <BrowserRouter>
      {(appPhase === 'scanning' || appPhase === 'correcting') &&
      scanReturnContext === null ? (
        <RandomScrambleLessonBar />
      ) : null}
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
