import type { ReactNode } from 'react';
import type { Color } from '../../cube/cubeState';
import { formatColorLabel } from '../../cube/cubeState';
import {
  lessonLayout,
  PHYSICAL_CUBE_MATCH_NOTE,
  REORIENT_HOLD_NOTE,
  SAME_HOLD_NOTE,
} from '../../content/tips';
import { LessonAvoidBackPanel } from './LessonAvoidBackPanel';

type FaceCenters = {
  F: Color;
  U: Color;
  D: Color;
};

type LessonSecondaryPanelsProps = {
  lessonHold: FaceCenters;
  showOrientationPanel?: boolean;
  showSameHoldNote?: boolean;
  showReorientNote?: boolean;
  orientationExtra?: ReactNode;
  avoidBack?: {
    frontColor: Color;
    avoidBackMoves: boolean;
    onToggleAvoidBack: () => void;
    rememberAvoidBackDefault: boolean;
    onRememberDefaultChange: (on: boolean) => void;
    showRotationCallout: boolean;
    onMarkCalloutSeen: () => void;
    holdNote?: string;
  };
};

export function LessonSecondaryPanels({
  lessonHold,
  showOrientationPanel = true,
  showSameHoldNote,
  showReorientNote,
  orientationExtra,
  avoidBack,
}: LessonSecondaryPanelsProps) {
  const fLabel = formatColorLabel(lessonHold.F);
  const uLabel = formatColorLabel(lessonHold.U);
  const dLabel = formatColorLabel(lessonHold.D);

  return (
    <div className="flex flex-col gap-2">
      {showOrientationPanel ? (
        <details className="rounded-lg border border-slate-800 bg-slate-950/40 text-sm text-slate-400">
          <summary className="cursor-pointer px-3 py-2 text-slate-400 hover:text-slate-200">
            {lessonLayout.cubeOrientationPanel}
          </summary>
          <div className="space-y-2 border-t border-slate-800 px-3 py-2 text-xs leading-relaxed">
            <p>
              Hold your cube with{' '}
              <span className="text-slate-300">white on the bottom</span> and{' '}
              <span className="text-slate-300">yellow on top</span>. Face{' '}
              <span className="text-slate-300">{fLabel} toward you</span>. That
              is the <span className="text-slate-300">front (F)</span> face in
              the diagram. Notation: U = {uLabel}, D = {dLabel}, F = {fLabel}.
            </p>
            <p>{PHYSICAL_CUBE_MATCH_NOTE}</p>
            {showSameHoldNote ? (
              <p>{SAME_HOLD_NOTE(fLabel, uLabel, dLabel)}</p>
            ) : null}
            {showReorientNote ? (
              <p className="text-slate-500">{REORIENT_HOLD_NOTE}</p>
            ) : null}
            {orientationExtra}
          </div>
        </details>
      ) : null}

      {avoidBack ? (
        <details
          className="rounded-lg border border-slate-800 bg-slate-950/40"
          open={avoidBack.avoidBackMoves}
        >
          <summary className="cursor-pointer px-3 py-2 text-sm text-slate-400 hover:text-slate-200">
            Skip back-face turns
          </summary>
          <div className="border-t border-slate-800 p-3">
            <LessonAvoidBackPanel
              frontColor={avoidBack.frontColor}
              avoidBackMoves={avoidBack.avoidBackMoves}
              onToggleAvoidBack={avoidBack.onToggleAvoidBack}
              rememberAvoidBackDefault={avoidBack.rememberAvoidBackDefault}
              onRememberDefaultChange={avoidBack.onRememberDefaultChange}
              showRotationCallout={avoidBack.showRotationCallout}
              onMarkCalloutSeen={avoidBack.onMarkCalloutSeen}
              holdNote={avoidBack.holdNote}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}
