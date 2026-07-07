import { useState } from 'react';
import { parseFaceTurnAlgToMoves } from '../cube/parseFaceTurnAlg';
import { generateRandom333Scramble } from '../cube/random333Scramble';
import { prepareFreshLessonStart } from '../learn/lessonSessionPersistence';
import { practiceBar as practiceBarCopy } from '../content/ui';
import { useCubeStore } from '../store/cubeStore';

/**
 * Skip scanning: apply a random WCA-style 3×3 scramble and jump into the white-cross lesson (practice).
 */
export function RandomScrambleLessonBar() {
  const loadScrambledCubeIntoLesson = useCubeStore(
    (s) => s.loadScrambledCubeIntoLesson,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAlg, setLastAlg] = useState<string | null>(null);

  const run = () => {
    setError(null);
    setBusy(true);
    try {
      const algStr = generateRandom333Scramble();
      const moves = parseFaceTurnAlgToMoves(algStr);
      prepareFreshLessonStart('white-cross');
      loadScrambledCubeIntoLesson(moves);
      setLastAlg(algStr);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-amber-700/60 bg-amber-950/50 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-900/40 disabled:opacity-40"
          disabled={busy}
          onClick={() => run()}
        >
          {busy ? practiceBarCopy.generating : practiceBarCopy.button}
        </button>
      </div>
      {lastAlg ? (
        <p
          className="text-center font-mono text-xs text-slate-400 break-all"
          title={practiceBarCopy.lastScrambleTitle}
        >
          {practiceBarCopy.lastScramble(lastAlg)}
        </p>
      ) : null}
      {error ? (
        <p className="text-center text-sm text-rose-400">{error}</p>
      ) : null}
    </div>
  );
}
