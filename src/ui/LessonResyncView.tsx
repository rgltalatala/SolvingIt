import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  cubeStateToStudentFrame,
} from '../cube/cubeState';
import { lessonLabels, resyncCopy, ui } from '../content/ui';
import { clearAllLessonDemoCaches } from '../learn/lessonCore';
import { saveLessonSession } from '../learn/lessonSessionPersistence';
import {
  isLessonAheadOf,
  resyncLessonFromScan,
  type LessonResyncResult,
} from '../learn/lessonResync';
import { lessonPath } from '../lessons/lessonLoader';
import { useCubeStore } from '../store/cubeStore';
import { useLessonSessionStore } from '../store/lessonSessionStore';
import { CubeView } from '../cube3d/CubeView';

type ResyncState =
  | { status: 'computing' }
  | { status: 'ready'; result: LessonResyncResult }
  | { status: 'error'; message: string };

export function LessonResyncView() {
  const navigate = useNavigate();
  const cubeState = useCubeStore((state) => state.cubeState);
  const scanReturnContext = useCubeStore((state) => state.scanReturnContext);
  const isInitialScan = scanReturnContext === null;
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const clearScanReturnContext = useCubeStore(
    (state) => state.clearScanReturnContext,
  );
  const resetLessonSession = useCubeStore((state) => state.resetLessonSession);

  const clearAllSessions = useLessonSessionStore(
    (state) => state.clearAllSessions,
  );
  const clearSessionForLesson = useLessonSessionStore(
    (state) => state.clearSessionForLesson,
  );
  const setSession = useLessonSessionStore((state) => state.setSession);

  const [resyncState, setResyncState] = useState<ResyncState>({
    status: 'computing',
  });

  const previousLesson = scanReturnContext?.previousLesson ?? 'white-cross';

  useEffect(() => {
    if (!cubeState) {
      setResyncState({ status: 'error', message: 'No cube state from scan.' });
      return;
    }

    let cancelled = false;
    setResyncState({ status: 'computing' });

    void (async () => {
      try {
        const result = await resyncLessonFromScan(cubeState, previousLesson);
        if (!cancelled) {
          setResyncState({ status: 'ready', result });
        }
      } catch (error) {
        if (!cancelled) {
          setResyncState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Could not sync lesson.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cubeState, previousLesson]);

  const studentFrame = useMemo(
    () => (cubeState ? cubeStateToStudentFrame(cubeState) : null),
    [cubeState],
  );

  const handleResume = () => {
    if (resyncState.status !== 'ready') return;
    const { result } = resyncState;

    if (isInitialScan) {
      clearAllSessions();
    } else if (result.lesson !== result.previousLesson) {
      clearSessionForLesson(result.previousLesson);
    }

    clearAllLessonDemoCaches();
    setSession(result.lesson, result.session);
    setActiveLesson(result.lesson);
    resetLessonSession();
    clearScanReturnContext();
    setAppPhase('learning');
    saveLessonSession();
    navigate(lessonPath(result.lesson), { replace: true });
  };

  const confirmTitle = isInitialScan
    ? resyncCopy.initialConfirmTitle
    : resyncCopy.confirmTitle;
  const confirmBody = isInitialScan
    ? resyncCopy.initialConfirmBody
    : resyncCopy.confirmBody;
  const confirmAction = isInitialScan
    ? resyncCopy.startLesson
    : resyncCopy.resumeLesson;

  const lessonNote = useMemo(() => {
    if (resyncState.status !== 'ready') return null;
    const { lesson, previousLesson: previous } = resyncState.result;
    const nextLabel = lessonLabels[lesson as keyof typeof lessonLabels];
    const previousLabel =
      lessonLabels[previous as keyof typeof lessonLabels];

    if (isInitialScan) {
      if (lesson === 'white-cross') return null;
      return resyncCopy.initialLessonNote(nextLabel);
    }

    if (lesson === previous) return null;

    if (isLessonAheadOf(lesson, previous)) {
      return resyncCopy.lessonChangedNote(previousLabel, nextLabel);
    }
    return resyncCopy.lessonBehindNote(nextLabel);
  }, [isInitialScan, resyncState]);

  if (resyncState.status === 'error') {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{confirmTitle}</h1>
        <p className="text-rose-300">{resyncState.message}</p>
      </section>
    );
  }

  if (resyncState.status === 'computing' || !studentFrame) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{resyncCopy.determiningTitle}</h1>
          <p className="text-slate-300">{resyncCopy.determiningBody}</p>
        </header>
        <div className="h-[420px] w-full animate-pulse overflow-hidden rounded-xl border border-slate-700 bg-slate-900" />
        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-700" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
        </div>
      </section>
    );
  }

  const { result } = resyncState;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{confirmTitle}</h1>
        <p className="text-slate-300">{confirmBody}</p>
        {lessonNote ? (
          <p className="text-sm text-amber-100/90">{lessonNote}</p>
        ) : null}
        <p className="text-xs text-slate-500">{resyncCopy.holdReminder}</p>
      </header>

      <CubeView
        cubeState={studentFrame}
        frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
        canvasKey="lesson-resync-preview"
      />

      <article className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          {result.step.title}
        </h2>
        {'body' in result.step && result.step.body ? (
          <p className="mt-2 whitespace-pre-wrap text-slate-300">
            {result.step.body}
          </p>
        ) : null}
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
            onClick={handleResume}
          >
            {ui.confirm} — {confirmAction}
          </button>
        </div>
      </article>
    </section>
  );
}
