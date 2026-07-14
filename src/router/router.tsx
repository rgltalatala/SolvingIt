import { Navigate, Route, Routes } from 'react-router';
import { CasesPage } from '../pages/CasesPage';
import { HomePage } from '../pages/HomePage';
import { LastLayerLessonPage, LessonPage } from '../pages/LessonPage';
import { LearnIndexRedirect } from '../pages/LearnIndexRedirect';
import { NotationPage } from '../pages/NotationPage';
import { AppLayout } from './AppLayout';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnIndexRedirect />} />
        <Route path="learn/last-layer/:subLessonId" element={<LastLayerLessonPage />} />
        <Route path="learn/last-layer" element={<LastLayerLessonPage />} />
        <Route path="learn/:lessonId" element={<LessonPage />} />
        <Route path="notation" element={<NotationPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
