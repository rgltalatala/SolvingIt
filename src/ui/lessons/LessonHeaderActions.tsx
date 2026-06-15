import type { ReactNode } from 'react';

type LessonHeaderActionsProps = {
  canUndo: boolean;
  isStepPending: boolean;
  onUndo: () => void;
  onBack: () => void;
  onResetTips: () => void;
  extraActions?: ReactNode;
};

export function LessonHeaderActions({
  canUndo,
  isStepPending,
  onUndo,
  onBack,
  onResetTips,
  extraActions,
}: LessonHeaderActionsProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <button
        type="button"
        className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onUndo}
        disabled={!canUndo || isStepPending}
      >
        Undo last example
      </button>
      <button
        type="button"
        className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
        onClick={onBack}
      >
        Back to cube overview
      </button>
      <button
        type="button"
        className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
        onClick={onResetTips}
      >
        Reset lesson tips
      </button>
      {extraActions}
    </div>
  );
}
