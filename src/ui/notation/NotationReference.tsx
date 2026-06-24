import { NotationGuide } from './NotationGuide';
import { notationGuide as notationGuideCopy } from '../../content/notation';

export function NotationReference() {
  return (
    <details className="mx-auto mt-6 w-full max-w-5xl border-t border-slate-700 px-6 pb-6">
      <summary className="cursor-pointer py-4 text-sm font-semibold text-slate-300 hover:text-slate-100">
        {notationGuideCopy.referenceSummary}
      </summary>
      <div className="pb-4">
        <NotationGuide compact />
      </div>
    </details>
  );
}
