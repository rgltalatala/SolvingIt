import { useState } from 'react';
import { useNavigate } from 'react-router';
import { setNotationIntroCompleted } from '../learn/notationPreferences';
import { notationIntro } from '../content/onboarding';
import { useCubeStore } from '../store/cubeStore';

/** Welcome copy and scan handoff shown on the Lesson tab during first-time notation intro. */
export function NotationIntroPanel() {
  const navigate = useNavigate();
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleContinue = () => {
    if (dontShowAgain) {
      setNotationIntroCompleted(true);
    }
    setAppPhase('scanning');
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{notationIntro.title}</h1>
        <p className="text-slate-300">{notationIntro.subtitle}</p>
      </header>

      <div className="flex justify-center py-6">
        <button
          type="button"
          className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500"
          onClick={() => navigate('/notation')}
        >
          {notationIntro.openNotation}
        </button>
      </div>

      <footer className="flex flex-col gap-4 border-t border-slate-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="rounded border-slate-600"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          {notationIntro.dontShowAgain}
        </label>
        <button
          type="button"
          className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
          onClick={handleContinue}
        >
          {notationIntro.continueToScan}
        </button>
      </footer>
    </section>
  );
}
