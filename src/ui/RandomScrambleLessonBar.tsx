import { useState } from 'react';
import { randomScrambleForEvent } from 'cubing/scramble';
import { parseFaceTurnAlgToMoves } from '../cube/parseFaceTurnAlg';
import { useCubeStore } from '../store/cubeStore';

/**
 * Skip scanning: fetch a WCA random 3×3 scramble and jump straight into the white-cross lesson (practice).
 */
export function RandomScrambleLessonBar() {
  const loadScrambledCubeIntoLesson = useCubeStore(
    (s) => s.loadScrambledCubeIntoLesson,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAlg, setLastAlg] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    setBusy(true);
    try {
      const alg = await randomScrambleForEvent('333');
      const algStr = alg.toString().replace(/\u2032/g, "'");
      const moves = parseFaceTurnAlgToMoves(algStr);
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
          {busy ? 'Generating scramble…' : 'Practice: random scramble → lesson'}
        </button>
      </div>
      {lastAlg ? (
        <p
          className="text-center font-mono text-xs text-slate-400 break-all"
          title="Last scramble applied (storage orientation, face-turn only)"
        >
          Last scramble: {lastAlg}
        </p>
      ) : null}
      {error ? (
        <p className="text-center text-sm text-rose-400">{error}</p>
      ) : null}
    </div>
  );
}
