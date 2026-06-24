import { lessonUnavailable, ui } from '../../content/ui';

type LessonUnavailableProps = {
  onBack: () => void;
};

export function LessonUnavailable({ onBack }: LessonUnavailableProps) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">{lessonUnavailable.title}</h1>
      <p className="text-slate-300">{lessonUnavailable.body}</p>
      <button
        type="button"
        className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
        onClick={onBack}
      >
        {ui.back}
      </button>
    </section>
  );
}
