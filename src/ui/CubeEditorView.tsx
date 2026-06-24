import { useCubeStore } from '../store/cubeStore';
import { CubeView } from '../cube3d/CubeView';
import { cubeStateToFaceletString } from '../cube/cubeStateToFacelets';
import { cubeOverview } from '../content/ui';

import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { LAST_LAYER_LESSON_ID } from '../learn/layers/lastLayer';
import { WHITE_CORNERS_LESSON_ID } from '../learn/layers/bottomLayer/corners';

export function CubeEditorView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const resetLessonSession = useCubeStore((state) => state.resetLessonSession);

  const startLesson = (
    lesson:
      | 'white-cross'
      | typeof WHITE_CORNERS_LESSON_ID
      | typeof MIDDLE_LAYER_EDGES_LESSON_ID
      | typeof LAST_LAYER_LESSON_ID,
  ) => {
    resetLessonSession();
    setActiveLesson(lesson);
    setAppPhase('learning');
  };

  if (!cubeState) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{cubeOverview.notReadyTitle}</h1>
        <p className="text-slate-300">{cubeOverview.notReadyBody}</p>
      </section>
    );
  }

  const facelets = cubeStateToFaceletString(cubeState);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">{cubeOverview.readyTitle}</h1>
      <p className="text-slate-300">{cubeOverview.readyBody}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          onClick={() => startLesson('white-cross')}
        >
          {cubeOverview.startLessonWhiteCross}
        </button>
        <button
          type="button"
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          onClick={() => startLesson(WHITE_CORNERS_LESSON_ID)}
        >
          {cubeOverview.startLessonWhiteCorners}
        </button>
        <button
          type="button"
          className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
          onClick={() => startLesson(MIDDLE_LAYER_EDGES_LESSON_ID)}
        >
          {cubeOverview.startLessonMiddleLayer}
        </button>
        <button
          type="button"
          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
          onClick={() => startLesson(LAST_LAYER_LESSON_ID)}
        >
          {cubeOverview.startLessonLastLayer}
        </button>
      </div>
      <CubeView cubeState={cubeState} />
      <p className="text-xs text-slate-400">
        {cubeOverview.faceletStringLabel}{' '}
        <span className="font-mono text-slate-300">{facelets}</span>
      </p>
      <pre className="overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-3 text-left text-xs text-slate-200">
        {JSON.stringify(cubeState, null, 2)}
      </pre>
    </section>
  );
}
