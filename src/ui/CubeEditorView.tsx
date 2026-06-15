import { useCubeStore } from '../store/cubeStore';
import { CubeView } from '../cube3d/CubeView';
import { cubeStateToFaceletString } from '../cube/cubeStateToFacelets';

export function CubeEditorView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const resetLessonSession = useCubeStore((state) => state.resetLessonSession);

  const startLesson = (lesson: 'white-cross' | 'white-corners') => {
    resetLessonSession();
    setActiveLesson(lesson);
    setAppPhase('learning');
  };

  if (!cubeState) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Cube Not Ready</h1>
        <p className="text-slate-300">
          Scan and confirm all six faces before the virtual cube can be
          constructed.
        </p>
      </section>
    );
  }

  const facelets = cubeStateToFaceletString(cubeState);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">Cube Ready</h1>
      <p className="text-slate-300">
        Your virtual cube now mirrors the scanned scramble state. Drag to rotate
        and inspect.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          onClick={() => startLesson('white-cross')}
        >
          Start lesson: White cross
        </button>
        <button
          type="button"
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          onClick={() => startLesson('white-corners')}
        >
          Start lesson: White corners
        </button>
      </div>
      <CubeView cubeState={cubeState} />
      <p className="text-xs text-slate-400">
        Facelet string (URFDLB):{' '}
        <span className="font-mono text-slate-300">{facelets}</span>
      </p>
      <pre className="overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-3 text-left text-xs text-slate-200">
        {JSON.stringify(cubeState, null, 2)}
      </pre>
    </section>
  );
}
