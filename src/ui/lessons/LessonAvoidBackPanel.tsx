import { formatColorLabel, type Color } from '../../cube/cubeState';
import { lessonAvoidBack } from '../../content/tips';

type LessonAvoidBackPanelProps = {
  frontColor: Color;
  avoidBackMoves: boolean;
  onToggleAvoidBack: () => void;
  rememberAvoidBackDefault: boolean;
  onRememberDefaultChange: (on: boolean) => void;
  showRotationCallout: boolean;
  onMarkCalloutSeen: () => void;
  holdNote?: string;
};

export function LessonAvoidBackPanel({
  frontColor,
  avoidBackMoves,
  onToggleAvoidBack,
  rememberAvoidBackDefault,
  onRememberDefaultChange,
  showRotationCallout,
  onMarkCalloutSeen,
  holdNote,
}: LessonAvoidBackPanelProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-950/40 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            {lessonAvoidBack.heading}
          </p>
          <p className="text-xs text-slate-400">
            {lessonAvoidBack.description(
              formatColorLabel(frontColor),
              holdNote ?? '',
            )}
          </p>
        </div>
        <button
          type="button"
          className={`inline-flex w-fit shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
            avoidBackMoves
              ? 'bg-violet-700 text-white hover:bg-violet-600'
              : 'border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
          }`}
          onClick={onToggleAvoidBack}
        >
          {avoidBackMoves ? lessonAvoidBack.on : lessonAvoidBack.off}
        </button>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          className="rounded border-slate-600"
          checked={rememberAvoidBackDefault}
          onChange={(e) => onRememberDefaultChange(e.target.checked)}
        />
        {lessonAvoidBack.rememberDefault}
      </label>
      {showRotationCallout ? (
        <div className="flex flex-col gap-2 rounded-md border border-amber-700/40 bg-amber-950/30 p-2 text-amber-100">
          <p className="text-xs">
            {lessonAvoidBack.rotationTip(formatColorLabel(frontColor))}
          </p>
          <div>
            <button
              type="button"
              className="text-xs font-semibold text-amber-100 underline hover:text-amber-50"
              onClick={onMarkCalloutSeen}
            >
              {lessonAvoidBack.gotIt}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
