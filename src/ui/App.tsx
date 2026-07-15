import { BrowserRouter } from 'react-router';
import { AppRouter } from '../router/router';

export function App() {
  return (
    <BrowserRouter>
      {/* RandomScrambleLessonBar is kept for reuse; not shown on scan/correct screens. */}
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
