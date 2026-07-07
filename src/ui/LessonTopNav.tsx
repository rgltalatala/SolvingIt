import { learningNav } from '../content/learningNav';
import { restartFromBeginning } from '../learn/lessonSessionPersistence';
import {
  useLessonSessionStore,
  type LearningSection,
} from '../store/lessonSessionStore';

const SECTIONS: { id: LearningSection; label: string }[] = [
  { id: 'lesson', label: learningNav.lessonTab },
  { id: 'notation', label: learningNav.notationTab },
  { id: 'cases', label: learningNav.casesTab },
];

type LessonTopNavProps = {
  showEndLesson?: boolean;
};

export function LessonTopNav({ showEndLesson = false }: LessonTopNavProps) {
  const learningSection = useLessonSessionStore((state) => state.learningSection);
  const setLearningSection = useLessonSessionStore(
    (state) => state.setLearningSection,
  );

  const handleRestart = () => {
    if (!window.confirm(learningNav.restartConfirm)) return;
    restartFromBeginning();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-slate-800 p-1.5 hover:bg-slate-700"
            aria-label={learningNav.homeLabel}
            title={learningNav.homeLabel}
            onClick={handleRestart}
          >
            <img
              src="/home-cube.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
          </button>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Lesson sections"
          >
            {SECTIONS.map((section) => {
              const isActive = learningSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-950/50 text-emerald-100'
                      : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                  }`}
                  onClick={() => setLearningSection(section.id)}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
        {showEndLesson ? (
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
            onClick={handleRestart}
          >
            {learningNav.endLesson}
          </button>
        ) : null}
      </div>
    </header>
  );
}
