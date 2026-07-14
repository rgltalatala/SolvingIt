import { learningNav } from '../../content/learningNav';
import { lessonUnavailable, ui } from '../../content/ui';
import { useLessonNavigation } from '../../lessons/useLessonNavigation';

export function LessonUnavailable() {
  const { restartFromBeginning } = useLessonNavigation();

  const handleRestart = () => {
    if (!window.confirm(learningNav.restartConfirm)) return;
    restartFromBeginning();
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">{lessonUnavailable.title}</h1>
      <p className="text-slate-300">{lessonUnavailable.body}</p>
      <button
        type="button"
        className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
        onClick={handleRestart}
      >
        {ui.reset}
      </button>
    </section>
  );
}
